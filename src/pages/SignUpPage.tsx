import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { BrandLogo } from '@/components/common/BrandLogo';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, loginWithGoogle, isAuthenticated, isLoading: authLoading, error: contextError, clearError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [confirmationNotice, setConfirmationNotice] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    setIsSubmitting(true);

    try {
      const result = await signUp({ name, email, password });
      if (result.confirmationRequired) {
        setConfirmationNotice(true);
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setLocalError((err as Error).message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLocalError(null);
    clearError();
    try {
      await loginWithGoogle();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setLocalError((err as Error).message || 'Google sign-up failed.');
    }
  };

  const displayError = localError || contextError;

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface min-h-screen flex flex-col justify-between selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(44,44,40,0.03)] border-b border-surface-container">
        <div className="h-[72px] w-full max-w-[1280px] mx-auto px-margin lg:px-margin-desktop flex items-center justify-between">
          <BrandLogo />
          <div className="flex items-center gap-space-md">
            <Link to="/login" className="font-label-md text-on-surface-variant hover:text-on-surface">
              Log in
            </Link>
          </div>
        </div>
      </header>

      {/* Main Form */}
      <main className="w-full pt-[72px] flex-1 bg-surface flex items-center justify-center p-margin">
        <div className="w-full max-w-[460px] bg-surface-container-lowest p-space-xl rounded-2xl shadow-lg border border-surface-container my-space-xl">
          {confirmationNotice ? (
            <div className="text-center py-space-md flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto mb-space-md shadow-sm">
                <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs font-normal">
                Verify your email
              </h2>
              <p className="font-body-md text-on-surface-variant mb-space-lg">
                We have sent a verification link to <strong className="text-on-surface">{email}</strong>. Please check your inbox to activate your Tempo account.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center font-label-md bg-primary text-on-primary px-space-xl py-space-sm rounded-xl shadow-sm hover:bg-primary-container transition-colors"
              >
                Go to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-space-xs mb-space-lg">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm tracking-widest text-primary font-semibold uppercase">
                    New Creator
                  </span>
                  <span className="text-outline-variant text-[10px]">•</span>
                  <span className="font-caption text-caption text-secondary">Tempo ID</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface font-normal">
                  Create your account
                </h1>
                <p className="font-body-md text-body-md text-secondary">
                  Begin crafting digital keepsakes for your milestones.
                </p>
              </div>

              {/* Error Banner */}
              {displayError && (
                <div className="mb-space-md p-space-md rounded-xl bg-error-container/40 border border-error/30 text-error flex items-start gap-2 animate-fade-in">
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                  <span className="font-body-sm text-[13px]">{displayError}</span>
                </div>
              )}

              {/* Google Sign Up */}
              <button
                onClick={handleGoogleSignUp}
                className="group w-full h-12 px-space-md rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-space-md hover:bg-surface-container-low border border-outline-variant/40 cursor-pointer mb-space-md"
                type="button"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="font-label-md text-label-md text-on-surface font-semibold group-hover:text-primary transition-colors">
                  Sign up with Google
                </span>
              </button>

              <div className="relative my-space-md flex items-center justify-center">
                <div className="w-full h-[1px] bg-surface-container-highest" />
                <span className="absolute px-space-md bg-surface-container-lowest font-caption text-caption text-secondary tracking-wide">
                  or sign up with email
                </span>
              </div>

              <form className="flex flex-col gap-space-md" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-space-xs">
                  <label className="font-body-sm font-semibold text-on-surface" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    className="w-full h-11 px-space-md rounded-lg bg-surface-container-low text-on-surface focus:bg-surface focus:outline-none ring-1 ring-outline/20 focus:ring-2 focus:ring-primary transition-colors border border-outline-variant/30"
                    placeholder="Maya Chen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-space-xs">
                  <label className="font-body-sm font-semibold text-on-surface" htmlFor="signup-email">
                    Email Address
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    required
                    className="w-full h-11 px-space-md rounded-lg bg-surface-container-low text-on-surface focus:bg-surface focus:outline-none ring-1 ring-outline/20 focus:ring-2 focus:ring-primary transition-colors border border-outline-variant/30"
                    placeholder="maya@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-space-xs">
                  <label className="font-body-sm font-semibold text-on-surface" htmlFor="signup-password">
                    Create Password
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    required
                    minLength={6}
                    className="w-full h-11 px-space-md rounded-lg bg-surface-container-low text-on-surface focus:bg-surface focus:outline-none ring-1 ring-outline/20 focus:ring-2 focus:ring-primary transition-colors border border-outline-variant/30"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  className="w-full h-11 mt-space-xs rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary-container shadow transition-all flex items-center justify-center gap-space-sm cursor-pointer disabled:opacity-50"
                  type="submit"
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </form>

              <div className="mt-space-lg text-center">
                <p className="font-body-sm text-on-surface-variant">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-primary underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="w-full bg-surface-container-low py-space-md text-center text-caption text-on-surface-variant/70 border-t border-surface-container">
        © 2026 Tempo Keepsake Atelier. All rights reserved.
      </footer>
    </div>
  );
};
