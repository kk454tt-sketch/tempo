import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useAuth } from '@/context/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError(null);
    try {
      const { error: resetErr } = await resetPassword(email);
      if (resetErr) {
        setError(resetErr.message || 'Unable to process reset request.');
      } else {
        setIsSubmitted(true);
      }
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface min-h-screen flex flex-col justify-between">
      <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-surface-container">
        <div className="h-16 w-full max-w-[1280px] mx-auto px-margin lg:px-margin-desktop flex items-center justify-between">
          <BrandLogo />
          <Link to="/login" className="font-label-md text-on-surface-variant hover:text-on-surface transition-colors">
            Back to Sign In
          </Link>
        </div>
      </header>

      <main className="w-full pt-20 flex-1 bg-surface flex items-center justify-center p-margin">
        <div className="w-full max-w-[440px] bg-surface-container-lowest p-8 md:p-10 rounded-2xl shadow-sm border border-surface-container-high my-space-xl">
          {!isSubmitted ? (
            <>
              <div className="flex flex-col gap-2 mb-8">
                <span className="font-label-sm text-[11px] tracking-widest text-on-surface-variant uppercase font-semibold">
                  Account Recovery
                </span>
                <h1 className="font-headline-lg text-2xl md:text-3xl text-on-surface font-medium tracking-tight">
                  Reset password
                </h1>
                <p className="font-body-sm text-on-surface-variant">
                  Enter your email address and we'll transmit a secure link to restore your atelier access.
                </p>
              </div>

              {error && (
                <div className="p-3.5 mb-6 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 text-red-700 text-body-sm">
                  {error}
                </div>
              )}

              <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface font-medium" htmlFor="reset-email">
                    Email address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    className="w-full h-11 px-3.5 rounded-lg bg-surface border border-surface-container-high text-on-surface focus:outline-none focus:border-primary transition-colors text-body-sm"
                    placeholder="architect@canvas.studio"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  className="w-full h-11 rounded-lg bg-primary text-on-primary font-label-md font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  type="submit"
                  disabled={isLoading}
                >
                  <span>{isLoading ? 'Transmitting...' : 'Send Reset Link'}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-4 text-on-surface">
                <span className="material-symbols-outlined text-[24px]">mark_email_read</span>
              </div>
              <h2 className="font-headline-md text-xl text-on-surface font-medium mb-2">Check your inbox</h2>
              <p className="font-body-sm text-on-surface-variant mb-6 leading-relaxed">
                We've dispatched recovery instructions to <strong className="text-on-surface">{email}</strong>. Follow the link in the message to set a new password.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center font-label-md font-medium bg-primary text-on-primary px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Return to Login
              </Link>
            </div>
          )}
        </div>
      </main>

      <footer className="w-full bg-surface-container-lowest py-4 text-center text-caption text-on-surface-variant/70 border-t border-surface-container">
        © 2026 tempo. Curated Canvas Marketplace.
      </footer>
    </div>
  );
};
