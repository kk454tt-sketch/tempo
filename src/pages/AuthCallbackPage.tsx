import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * AuthCallbackPage — Legacy callback route.
 *
 * With Firebase Auth (popup-based Google sign-in), OAuth callbacks are handled
 * internally by the Firebase SDK, so this page simply waits for the auth state
 * to settle and redirects the user to /templates.
 *
 * Kept as a valid route so that any external redirect URLs
 * or bookmarked /auth/callback links still land gracefully.
 */
export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If auth state is already settled and user is authenticated, redirect immediately
    if (!isLoading && isAuthenticated) {
      navigate('/templates', { replace: true });
      return;
    }

    // If auth state is settled but no user, wait briefly in case of late propagation
    if (!isLoading && !isAuthenticated) {
      const timeout = setTimeout(() => {
        // Still no user after waiting — redirect to login
        setError('No active session found. Redirecting to login...');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1500);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isLoading, isAuthenticated, navigate]);

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
