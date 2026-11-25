import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  AuthError,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/firebase';
import { apiService } from '@/services/apiService';
import { unlockService } from '@/services/unlockService';
import { eventService } from '@/services/eventService';
import { User, LoginCredentials, SignUpCredentials, UserProfile, UserSubscription } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  subscription: UserSubscription | null;
  isPremiumActive: boolean;
  /** @deprecated Use `firebaseUser` instead. Kept for backward compatibility. */
  supabaseUser: FirebaseUser | null;
  firebaseUser: FirebaseUser | null;
  /** @deprecated Firebase does not use session objects. Always null. */
  session: null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<{ confirmationRequired?: boolean }>;
  resetPassword: (email: string) => Promise<{ error: { message: string } | null }>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Maps a Firebase user to the app's User interface.
 */
function mapFirebaseUser(fbUser: FirebaseUser): User {
  return {
    id: fbUser.uid,
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Creator',
    email: fbUser.email || '',
    avatarUrl: fbUser.photoURL || '',
    createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isPremiumActive, setIsPremiumActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      const sub = await apiService.getSubscription();
      setSubscription(sub);
      setIsPremiumActive(Boolean(sub?.isPremiumActive));
      if (sub?.isPremiumActive) {
        unlockService.notifyListeners();
      }
    } catch {
      setSubscription(null);
      setIsPremiumActive(false);
    }
  }, []);

  const fetchProfileAndUserData = useCallback(async (authenticatedUser: User) => {
    setUser(authenticatedUser);

    // 1. Direct ensure & sync in Cloud Firestore (works seamlessly in both local and hosted environments)
    try {
      const userDocRef = doc(db, 'users', authenticatedUser.id);
      const docSnap = await getDoc(userDocRef);
      const now = new Date().toISOString();
      if (!docSnap.exists()) {
        const initialProfile = {
          id: authenticatedUser.id,
          email: (authenticatedUser.email || '').toLowerCase().trim(),
          name: authenticatedUser.name,
          fullName: authenticatedUser.name,
          avatarUrl: authenticatedUser.avatarUrl || '',
          bio: '',
          profileData: {},
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(userDocRef, initialProfile, { merge: true });
        setProfile({
          id: `prof_${authenticatedUser.id}`,
          userId: authenticatedUser.id,
          fullName: authenticatedUser.name,
          avatarUrl: authenticatedUser.avatarUrl || '',
          bio: '',
          profileData: {},
          createdAt: now,
          updatedAt: now,
        });
      } else {
        const d = docSnap.data();
        setProfile({
          id: `prof_${authenticatedUser.id}`,
          userId: authenticatedUser.id,
          fullName: d.fullName || d.name || authenticatedUser.name,
          avatarUrl: d.avatarUrl || authenticatedUser.avatarUrl || '',
          bio: d.bio || '',
          profileData: d.profileData || {},
          createdAt: d.createdAt || now,
          updatedAt: d.updatedAt || now,
        });
      }
    } catch (fsErr) {
      console.warn('[AuthContext] Firestore direct profile sync notice:', fsErr);
    }

    // 2. Also trigger backend API call (server will verify token and ensure user in Admin SDK)
    try {
      const prof = await apiService.getProfile();
      if (prof) setProfile(prof);
    } catch {
      // Backend may be offline or purely static hosting
    }

    await fetchSubscription();
  }, [fetchSubscription]);

  /**
   * Helper: get Firebase ID token and push it to apiService.
   * The backend will verify this token using Firebase Admin SDK.
   */
  const syncFirebaseToken = useCallback(async (fbUser: FirebaseUser) => {
    const idToken = await fbUser.getIdToken();
    apiService.setAuthToken(idToken);
  }, []);

  // ─── Firebase onAuthStateChanged listener ───
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!isMounted) return;

      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
          await syncFirebaseToken(fbUser);
          const appUser = mapFirebaseUser(fbUser);
          await fetchProfileAndUserData(appUser);
          unlockService.loadUserUnlocks(appUser.id).catch(() => {});
        } catch (err) {
          console.warn('[AuthContext] Error syncing Firebase user:', err);
        }
      } else {
        // Signed out
        setFirebaseUser(null);
        setUser(null);
        setProfile(null);
        setSubscription(null);
        setIsPremiumActive(false);
        apiService.setAuthToken(null);
        unlockService.reset();
        eventService.clearUserCache();
      }

      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [fetchProfileAndUserData, syncFirebaseToken]);

  const formatAuthError = (err: AuthError | Error | unknown): string => {
    if (!err) return 'An unexpected error occurred.';
    const code = (err as AuthError)?.code || '';
    const message = (err as Error).message || String(err);

    // Firebase Auth error codes → user-friendly messages
    switch (code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a password with at least 6 characters.';
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return 'Sign-in was cancelled.';
      case 'auth/popup-blocked':
        return 'Sign-in popup was blocked by your browser. Please allow popups and try again.';
      case 'auth/too-many-requests':
        return 'Too many unsuccessful attempts. Please wait a moment and try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      default:
        break;
    }

    // Legacy error message string matching
    if (message.includes('Invalid login credentials') || message.includes('Invalid password')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (message.includes('User already registered') || message.includes('already exists')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (message.includes('Password should be at least')) {
      return 'Password is too weak. Please choose a password with at least 6 characters.';
    }
    if (message.includes('popup closed') || message.includes('cancelled')) {
      return 'Sign-in was cancelled.';
    }
    return message;
  };

  const login = async (credentials: LoginCredentials) => {
    setError(null);
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email.trim(),
        credentials.password || ''
      );
      await syncFirebaseToken(userCredential.user);
      const appUser = mapFirebaseUser(userCredential.user);
      await fetchProfileAndUserData(appUser);
    } catch (err) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncFirebaseToken(result.user);
      const appUser = mapFirebaseUser(result.user);
      await fetchProfileAndUserData(appUser);
    } catch (err) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const signUp = async (credentials: SignUpCredentials) => {
    setError(null);
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email.trim(),
        credentials.password || ''
      );

      // Set display name on the Firebase user
      await updateProfile(userCredential.user, {
        displayName: credentials.name.trim(),
      });

      // Sync token to backend
      await syncFirebaseToken(userCredential.user);

      const appUser: User = {
        id: userCredential.user.uid,
        name: credentials.name.trim(),
        email: userCredential.user.email || credentials.email.trim(),
        avatarUrl: '',
        createdAt: userCredential.user.metadata.creationTime || new Date().toISOString(),
      };
      await fetchProfileAndUserData(appUser);

      // Direct write to Cloud Firestore immediately on signup
      try {
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const now = new Date().toISOString();
        await setDoc(userDocRef, {
          id: userCredential.user.uid,
          email: (userCredential.user.email || credentials.email).toLowerCase().trim(),
          name: credentials.name.trim(),
          fullName: credentials.name.trim(),
          avatarUrl: '',
          bio: '',
          profileData: {},
          createdAt: now,
          updatedAt: now,
        }, { merge: true });
      } catch (fsErr) {
        console.warn('[AuthContext] Signup Firestore direct write:', fsErr);
      }

      return { confirmationRequired: false };
    } catch (err) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (err) {
      const msg = formatAuthError(err);
      setError(msg);
      return { error: { message: msg } };
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      await signOut(auth);
    } catch {
      // ignore
    } finally {
      setUser(null);
      setProfile(null);
      setSubscription(null);
      setIsPremiumActive(false);
      setFirebaseUser(null);
      apiService.setAuthToken(null);
      unlockService.reset();
      eventService.clearUserCache(user?.id);
    }
  };

  const clearError = () => setError(null);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileAndUserData(user);
    }
  };

  const refreshSubscription = async () => {
    await fetchSubscription();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        subscription,
        isPremiumActive,
        supabaseUser: firebaseUser,
        firebaseUser,
        session: null,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        loginWithGoogle,
        signUp,
        resetPassword,
        logout,
        clearError,
        refreshProfile,
        refreshSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
