import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/services/supabase';
import { User, LoginCredentials, SignUpCredentials } from '@/types';
import { mockCurrentUser } from '@/services/mockData';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<{ confirmationRequired?: boolean }>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (sbUser: SupabaseUser) => {
    try {
      if (isSupabaseConfigured) {
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sbUser.id)
          .single();

        if (profile && !profileErr) {
          setUser({
            id: profile.id,
            name: profile.full_name || sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Tempo Creator',
            email: sbUser.email || '',
            avatarUrl: profile.avatar_url || sbUser.user_metadata?.avatar_url || '',
            createdAt: profile.created_at,
          });
          return;
        }
      }

      // Fallback from metadata or defaults
      setUser({
        id: sbUser.id,
        name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Tempo Creator',
        email: sbUser.email || '',
        avatarUrl: sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture || '',
        createdAt: sbUser.created_at,
      });
    } catch {
      setUser({
        id: sbUser.id,
        name: sbUser.email?.split('@')[0] || 'Tempo Creator',
        email: sbUser.email || '',
        createdAt: sbUser.created_at,
      });
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      // In unconfigured development preview, check for local mock session or default to demo user
      const stored = localStorage.getItem('tempo_auth_session');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
        } catch {
          setUser(mockCurrentUser);
        }
      } else {
        setUser(mockCurrentUser);
      }
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user).finally(() => {
          if (isMounted) setIsLoading(false);
        });
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      setSession(session);
      setSupabaseUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const formatAuthError = (err: AuthError | Error | unknown): string => {
    if (!err) return 'An unexpected error occurred.';
    const message = (err as Error).message || String(err);
    if (message.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (message.includes('User already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (message.includes('Password should be at least')) {
      return 'Password is too weak. Please choose a password with at least 6 characters.';
    }
    if (message.includes('Email not confirmed')) {
      return 'Please verify your email address before signing in.';
    }
    if (message.includes('popup closed') || message.includes('cancelled')) {
      return 'Google sign-in was cancelled.';
    }
    return message;
  };

  const login = async (credentials: LoginCredentials) => {
    setError(null);
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        const localUser: User = {
          id: `usr_${Date.now()}`,
          name: credentials.email.split('@')[0] || 'Tempo Creator',
          email: credentials.email,
          createdAt: new Date().toISOString(),
        };
        setUser(localUser);
        localStorage.setItem('tempo_auth_session', JSON.stringify(localUser));
        return;
      }

      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim(),
        password: credentials.password || '',
      });

      if (authErr) throw authErr;
      if (data.user) {
        await fetchProfile(data.user);
      }
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
      if (!isSupabaseConfigured) {
        const localUser: User = {
          id: `usr_google_${Date.now()}`,
          name: 'Google Creator',
          email: 'creator@gmail.com',
          avatarUrl: '',
          createdAt: new Date().toISOString(),
        };
        setUser(localUser);
        localStorage.setItem('tempo_auth_session', JSON.stringify(localUser));
        return;
      }

      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (oauthErr) throw oauthErr;
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
      if (!isSupabaseConfigured) {
        const localUser: User = {
          id: `usr_${Date.now()}`,
          name: credentials.name.trim(),
          email: credentials.email.trim(),
          createdAt: new Date().toISOString(),
        };
        setUser(localUser);
        localStorage.setItem('tempo_auth_session', JSON.stringify(localUser));
        return { confirmationRequired: false };
      }

      const { data, error: signErr } = await supabase.auth.signUp({
        email: credentials.email.trim(),
        password: credentials.password || '',
        options: {
          data: {
            full_name: credentials.name.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signErr) throw signErr;

      if (data.user && !data.session) {
        // Confirmation email required
        return { confirmationRequired: true };
      }

      if (data.user) {
        // Create or ensure profile
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: credentials.name.trim(),
          avatar_url: '',
          updated_at: new Date().toISOString(),
        });
        await fetchProfile(data.user);
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

  const logout = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setSession(null);
      setSupabaseUser(null);
      localStorage.removeItem('tempo_auth_session');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  const refreshProfile = async () => {
    if (supabaseUser) {
      await fetchProfile(supabaseUser);
    }
  };

  const value: AuthContextType = {
    user,
    supabaseUser,
    session,
    isAuthenticated: user !== null,
    isLoading,
    error,
    login,
    loginWithGoogle,
    signUp,
    logout,
    clearError,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
