import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/services/supabase';
import { apiService } from '@/services/apiService';
import { unlockService } from '@/services/unlockService';
import { User, LoginCredentials, SignUpCredentials, UserProfile, UserSubscription } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  subscription: UserSubscription | null;
  isPremiumActive: boolean;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
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
    try {
      const prof = await apiService.getProfile();
      setProfile(prof);
    } catch {
      // profile fallback to user
      setProfile(null);
    }
    await fetchSubscription();
  }, [fetchSubscription]);

  // Initial session restoration on startup (Phase 10)
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      setIsLoading(true);
      try {
        // 1. Check database session token
        const existingToken = apiService.getAuthToken();
        if (existingToken) {
          const verifiedUser = await apiService.getMe();
          if (verifiedUser && isMounted) {
            await fetchProfileAndUserData(verifiedUser);
            setIsLoading(false);
            return;
          }
        }

        // 2. Check Supabase session if configured
        if (isSupabaseConfigured) {
          const { data: { session: sbSession } } = await supabase.auth.getSession();
          if (sbSession?.user && isMounted) {
            setSession(sbSession);
            setSupabaseUser(sbSession.user);
            apiService.setAuthToken(sbSession.access_token);

            const verifiedUser: User = {
              id: sbSession.user.id,
              name: sbSession.user.user_metadata?.full_name || sbSession.user.email?.split('@')[0] || 'Creator',
              email: sbSession.user.email || '',
              avatarUrl: sbSession.user.user_metadata?.avatar_url || '',
              createdAt: sbSession.user.created_at,
            };
            await fetchProfileAndUserData(verifiedUser);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Session restore note:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    // Listen to Supabase auth changes if configured
    let sbSubscription: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        if (!isMounted) return;
        setSession(newSession);
        setSupabaseUser(newSession?.user ?? null);
        if (newSession?.user) {
          apiService.setAuthToken(newSession.access_token);
          const sbUser: User = {
            id: newSession.user.id,
            name: newSession.user.user_metadata?.full_name || newSession.user.email?.split('@')[0] || 'Creator',
            email: newSession.user.email || '',
            avatarUrl: newSession.user.user_metadata?.avatar_url || '',
            createdAt: newSession.user.created_at,
          };
          await fetchProfileAndUserData(sbUser);
        } else {
          setUser(null);
          setProfile(null);
          setSubscription(null);
          setIsPremiumActive(false);
          unlockService.reset();
        }
      });
      sbSubscription = data.subscription;
    }

    return () => {
      isMounted = false;
      if (sbSubscription) sbSubscription.unsubscribe();
    };
  }, [fetchProfileAndUserData]);

  const formatAuthError = (err: AuthError | Error | unknown): string => {
    if (!err) return 'An unexpected error occurred.';
    const message = (err as Error).message || String(err);
    if (message.includes('Invalid login credentials') || message.includes('Invalid password')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (message.includes('User already registered') || message.includes('already exists')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (message.includes('Password should be at least')) {
      return 'Password is too weak. Please choose a password with at least 6 characters.';
    }
    if (message.includes('Email not confirmed')) {
      return 'Please verify your email address before signing in.';
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
      // 1. Authenticate with backend API
      const result = await apiService.login({
        email: credentials.email.trim(),
        password: credentials.password || '',
      });

      if (result.user && result.token) {
        await fetchProfileAndUserData(result.user);
        return;
      }

      // 2. Supabase fallback if configured
      if (isSupabaseConfigured) {
        const { data, error: authErr } = await supabase.auth.signInWithPassword({
          email: credentials.email.trim(),
          password: credentials.password || '',
        });
        if (authErr) throw authErr;
        if (data.user) {
          const u: User = {
            id: data.user.id,
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Creator',
            email: data.user.email || '',
            createdAt: data.user.created_at,
          };
          await fetchProfileAndUserData(u);
          return;
        }
      }

      throw new Error('Could not authenticate. Please verify your credentials.');
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
      if (isSupabaseConfigured) {
        const redirectUrl = `${window.location.origin}/auth/callback`;
        const { error: oauthErr } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
          },
        });
        if (oauthErr) throw oauthErr;
      } else {
        throw new Error('OAuth provider is unavailable.');
      }
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
      // 1. Register with backend API
      const result = await apiService.register({
        name: credentials.name.trim(),
        email: credentials.email.trim(),
        password: credentials.password || '',
      });

      if (result.user && result.token) {
        await fetchProfileAndUserData(result.user);
        return { confirmationRequired: false };
      }

      // 2. Supabase signup if configured
      if (isSupabaseConfigured) {
        const { data, error: signErr } = await supabase.auth.signUp({
          email: credentials.email.trim(),
          password: credentials.password || '',
          options: {
            data: { full_name: credentials.name.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (signErr) throw signErr;
        if (data.user) {
          if (!data.session) return { confirmationRequired: true };
          const u: User = {
            id: data.user.id,
            name: credentials.name.trim(),
            email: credentials.email.trim(),
            createdAt: data.user.created_at,
          };
          await fetchProfileAndUserData(u);
          return { confirmationRequired: false };
        }
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
      if (isSupabaseConfigured) {
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (resetErr) throw resetErr;
        return { error: null };
      }
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
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch {
      // ignore
    } finally {
      setUser(null);
      setProfile(null);
      setSubscription(null);
      setIsPremiumActive(false);
      setSession(null);
      setSupabaseUser(null);
      unlockService.reset();
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
        supabaseUser,
        session,
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
