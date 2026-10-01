import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/services/supabase';
import { User, LoginCredentials, SignUpCredentials } from '@/types';

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
  resetPassword: (email: string) => Promise<{ error: { message: string } | null }>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

const LOCAL_STORAGE_USER_KEY = 'tempo_local_user';

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
          const loadedUser: User = {
            id: profile.id,
            name: profile.full_name || sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Studio Director',
            email: sbUser.email || '',
            avatarUrl: profile.avatar_url || sbUser.user_metadata?.avatar_url || '',
            createdAt: profile.created_at,
          };
          setUser(loadedUser);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(loadedUser));
          return;
        }
      }

      // Fallback from metadata or defaults
      const fallbackUser: User = {
        id: sbUser.id,
        name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Studio Director',
        email: sbUser.email || '',
        avatarUrl: sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture || '',
        createdAt: sbUser.created_at,
      };
      setUser(fallbackUser);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(fallbackUser));
    } catch {
      const basicUser: User = {
        id: sbUser.id,
        name: sbUser.email?.split('@')[0] || 'Studio Director',
        email: sbUser.email || '',
        createdAt: sbUser.created_at,
      };
      setUser(basicUser);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(basicUser));
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      // Check for local storage saved session
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        if (saved) {
          setUser(JSON.parse(saved));
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
      setIsLoading(false);
      return;
    }

    // Get initial Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user).finally(() => {
          if (isMounted) setIsLoading(false);
        });
      } else {
        // Check local storage fallback
        try {
          const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
          if (saved) {
            setUser(JSON.parse(saved));
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
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
        try {
          const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
          if (saved) {
            setUser(JSON.parse(saved));
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
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
      if (isSupabaseConfigured) {
        const { data, error: authErr } = await supabase.auth.signInWithPassword({
          email: credentials.email.trim(),
          password: credentials.password || '',
        });

        if (!authErr && data.user) {
          await fetchProfile(data.user);
          return;
        }
        if (authErr && !authErr.message.includes('fetch')) {
          throw authErr;
        }
      }

      // Local / Offline fallback mode
      const localUser: User = {
        id: `usr_${Date.now()}`,
        name: credentials.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email: credentials.email.trim(),
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANGvaAMrRAnWw-YPDmAqKMxuNfFSyEDshnSeopzgA206M0pg1sYYvGwihZOWIU3lKEp1P8YxR3pcnu0Q5kGKOqCKbVp3b55d3ZK5BqO5xE6N3zk96RCImZzGTSZuMiF-zoskIRlI-NQf0egkWGER78dHT3GkzzUvAlYaJr-NnDElbqz87pHywBkwZ9eZQGxi3EwuyHUIFH3bhlQLDBvvrUmeDbUb-4Gp4qLvQaalcFvCQt9O3onSA',
        createdAt: new Date().toISOString(),
      };
      setUser(localUser);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(localUser));
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
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });

        if (oauthErr) throw oauthErr;
        return;
      }

      // Demo Google login
      const googleUser: User = {
        id: `goog_${Date.now()}`,
        name: 'Evelyn Thorne',
        email: 'evelyn.thorne@studio.design',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANGvaAMrRAnWw-YPDmAqKMxuNfFSyEDshnSeopzgA206M0pg1sYYvGwihZOWIU3lKEp1P8YxR3pcnu0Q5kGKOqCKbVp3b55d3ZK5BqO5xE6N3zk96RCImZzGTSZuMiF-zoskIRlI-NQf0egkWGER78dHT3GkzzUvAlYaJr-NnDElbqz87pHywBkwZ9eZQGxi3EwuyHUIFH3bhlQLDBvvrUmeDbUb-4Gp4qLvQaalcFvCQt9O3onSA',
        createdAt: new Date().toISOString(),
      };
      setUser(googleUser);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(googleUser));
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
      if (isSupabaseConfigured) {
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

        if (!signErr && data.user) {
          if (!data.session) {
            return { confirmationRequired: true };
          }
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: credentials.name.trim(),
            avatar_url: '',
            updated_at: new Date().toISOString(),
          });
          await fetchProfile(data.user);
          return { confirmationRequired: false };
        }
        if (signErr && !signErr.message.includes('fetch')) {
          throw signErr;
        }
      }

      // Local / Offline fallback mode
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: credentials.name.trim() || credentials.email.split('@')[0],
        email: credentials.email.trim(),
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANGvaAMrRAnWw-YPDmAqKMxuNfFSyEDshnSeopzgA206M0pg1sYYvGwihZOWIU3lKEp1P8YxR3pcnu0Q5kGKOqCKbVp3b55d3ZK5BqO5xE6N3zk96RCImZzGTSZuMiF-zoskIRlI-NQf0egkWGER78dHT3GkzzUvAlYaJr-NnDElbqz87pHywBkwZ9eZQGxi3EwuyHUIFH3bhlQLDBvvrUmeDbUb-4Gp4qLvQaalcFvCQt9O3onSA',
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser));
      return { confirmationRequired: false };
    } catch (err) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ error: { message: string } | null }> => {
    try {
      if (isSupabaseConfigured) {
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (resetErr) return { error: { message: resetErr.message } };
      }
      return { error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reset password failed';
      return { error: { message: msg } };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      setUser(null);
      setSession(null);
      setSupabaseUser(null);
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
    resetPassword,
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
