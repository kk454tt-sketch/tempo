import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/services/supabase';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (!isSupabaseConfigured) {
          navigate('/dashboard', { replace: true });
          return;
        }

        // Support Supabase PKCE flow with code query param
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        if (code) {
          try {
            await supabase.auth.exchangeCodeForSession(code);
          } catch (e) {
            console.warn('PKCE exchange error, falling back to getSession:', e);
          }
        }

        const { data, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) throw sessionErr;

        if (data.session) {
          // Successfully established session
          navigate('/dashboard', { replace: true });
        } else {
          // If no immediate session, give onAuthStateChange a brief moment
          const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
              if (session) {
                authListener.subscription.unsubscribe();
                navigate('/dashboard', { replace: true });
              }
            }
          );

          setTimeout(() => {
            authListener.subscription.unsubscribe();
            navigate('/dashboard', { replace: true });
          }, 1500);
        }
      } catch (err) {
        console.error('Error handling auth callback:', err);
        setError((err as Error).message || 'Authentication callback failed.');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-space-xl text-center">
      {error ? (
        <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-md max-w-md border border-error/20">
          <span className="material-symbols-outlined text-[48px] text-error mb-space-sm">error</span>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-space-xs">
            Authentication Error
          </h2>
          <p className="font-body-sm text-on-surface-variant mb-space-md">{error}</p>
          <p className="font-caption text-caption text-secondary">Redirecting to login...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-space-md" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">
            Establishing your session...
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Connecting your account to Tempo Atelier.
          </p>
        </div>
      )}
    </div>
  );
};
