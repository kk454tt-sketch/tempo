import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface min-h-screen flex flex-col justify-between selection:bg-primary-fixed selection:text-on-primary-fixed">
      <header className="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(44,44,40,0.03)] border-b border-surface-container">
        <div className="h-16 w-full max-w-[1280px] mx-auto px-margin lg:px-margin-desktop flex items-center justify-between">
          <Link to="/" className="flex items-center gap-space-sm group transition-opacity hover:opacity-80">
            <img
              alt="Brand logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1XgpzItnCi2t0SyBWVv-3MixwuKm4mVAru1ZH7irZpcn_aKo1bAKc6O9RBKcHS63Xw1mdx-rwHy_M776Kon78UHRAT3QfJpmcqA5NVvZX8N4_yVwVQCAmRO2ASjsUC64s4KOEupjffK5II8lSuPAYsyLysqn66J6qXVtc7gklpGBBTWOBqTocdNd2OqO-dTZC3iHsiM8Ma-gUSsk-taJdY8Pm2jAvCPIHBlQfdgHdVt3K0MCy8_2jOPraM"
            />
            <span className="font-headline-md text-headline-md text-primary tracking-tight">Tempo</span>
          </Link>
          <Link to="/login" className="font-label-md text-on-surface-variant hover:text-on-surface">
            Back to Sign In
          </Link>
        </div>
      </header>

      <main className="w-full pt-16 flex-1 bg-surface flex items-center justify-center p-margin">
        <div className="w-full max-w-[460px] bg-surface-container-lowest p-space-xl rounded-xl shadow-lg border border-surface-container my-space-xl">
          {!isSubmitted ? (
            <>
              <div className="flex flex-col gap-space-xs mb-space-lg">
                <span className="font-label-sm text-label-sm tracking-widest text-primary font-semibold uppercase">
                  Account Recovery
                </span>
                <h1 className="font-headline-lg text-headline-lg text-on-surface font-normal">
                  Reset password
                </h1>
                <p className="font-body-md text-body-md text-secondary">
                  Enter your email and we’ll send a link to reset your password.
                </p>
              </div>

              <form className="flex flex-col gap-space-md" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-space-xs">
                  <label className="font-body-sm font-semibold text-on-surface" htmlFor="reset-email">
                    Email address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    className="w-full h-11 px-space-md rounded bg-surface-container-low text-on-surface focus:bg-surface focus:outline-none ring-1 ring-outline/20 focus:ring-2 focus:ring-primary transition-colors"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  className="w-full h-11 mt-space-xs rounded bg-primary text-on-primary font-label-md hover:bg-primary-container shadow transition-all flex items-center justify-center gap-space-sm cursor-pointer"
                  type="submit"
                >
                  <span>Send Reset Link</span>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-space-md">
              <span className="material-symbols-outlined text-[48px] text-primary mb-space-xs">mark_email_read</span>
              <h2 className="font-headline-md text-on-surface mb-space-xs">Check your inbox</h2>
              <p className="font-body-md text-on-surface-variant mb-space-lg">
                We've dispatched recovery instructions to <strong>{email}</strong>.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center font-label-md bg-primary text-on-primary px-space-lg py-space-sm rounded-lg"
              >
                Return to Login
              </Link>
            </div>
          )}
        </div>
      </main>

      <footer className="w-full bg-surface-container-low py-space-md text-center text-caption text-on-surface-variant/70 border-t border-surface-container">
        © 2026 Tempo Keepsake Atelier. All rights reserved.
      </footer>
    </div>
  );
};
