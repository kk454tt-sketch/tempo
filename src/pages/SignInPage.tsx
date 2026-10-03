import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { BrandLogo } from '@/components/common/BrandLogo';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, isAuthenticated, isLoading: authLoading, error: contextError, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const fromPath = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate(fromPath, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, fromPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    setIsSubmitting(true);

    try {
      await login({ email, password, rememberMe });
      navigate(fromPath, { replace: true });
    } catch (err) {
      setLocalError((err as Error).message || 'Failed to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError(null);
    clearError();
    try {
      await loginWithGoogle();
      navigate(fromPath, { replace: true });
    } catch (err) {
      setLocalError((err as Error).message || 'Google sign-in failed.');
    }
  };

  const displayError = localError || contextError;

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface min-h-screen flex flex-col justify-between selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(44,44,40,0.03)] border-b border-surface-container">
        <div className="h-[72px] w-full max-w-[1280px] mx-auto px-margin lg:px-margin-desktop flex items-center justify-between">
          <BrandLogo />
          <div className="flex items-center gap-space-lg">
            <nav className="hidden sm:flex items-center gap-space-lg">
              <a
                className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
                href="#help"
              >
                Assistance
              </a>
              <a
                className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
                href="#ethos"
              >
                Our Ethos
              </a>
            </nav>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full pt-[72px] flex-1 bg-surface flex flex-col">
        <div className="w-full min-h-[calc(100vh-4.5rem)] flex flex-col lg:flex-row items-stretch">
          {/* Left Editorial Visual Column */}
          <div className="relative w-full lg:w-[48%] min-h-[420px] lg:min-h-[calc(100vh-4.5rem)] flex flex-col justify-between overflow-hidden bg-inverse-surface">
            <img
              alt="Intimate candlelit celebratory dinner with friends laughing in an outdoor stone courtyard"
              className="absolute inset-0 w-full h-full object-cover object-center scale-[1.02] transition-transform duration-1000 ease-out hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBskNdrT5Ejc7HOBf4rti2vg1nFmxIOKUCUtGwJ3bmntJzlNDLlmkgLLE5TwzfcyRb8FLyXC9DmPxNrtR667rjLicdUFcdejHsbWiTaUJGkkwQJUKeWhOfx4PUi3bWwjAv6V7jXKhVk2aMebCJPD5veLQKmmc3o23qsdgvQI7tRfgRso2yy97wenR8GsfQBWSFrBYXwp_B0aDycc_RaK20BCd3LqUu1FhnViOujVHGAe7-UG1dxKqiomQ"
            />
            {/* Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/95 via-inverse-surface/30 to-transparent" />
            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply pointer-events-none" />

            {/* Top Curated Tag */}
            <div className="relative z-10 p-margin lg:p-margin-desktop">
              <div className="inline-flex items-center gap-space-xs px-3 py-1.5 rounded-full bg-surface/15 backdrop-blur-md shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed" />
                <span className="font-label-sm text-label-sm text-surface tracking-widest uppercase">
                  Archive • Vol. 04
                </span>
              </div>
            </div>

            {/* Bottom Editorial Quote Overlay */}
            <div className="relative z-10 p-margin lg:p-margin-desktop pt-16 flex flex-col gap-space-sm max-w-xl">
              <p className="font-display-lg text-display-lg-mobile lg:text-display-lg text-surface font-light leading-snug tracking-tight">
                “A digital home for the moments you hold closest.”
              </p>
              <div className="flex items-center gap-space-sm pt-space-xs">
                <span className="w-6 h-[1px] bg-outline-variant" />
                <p className="font-caption text-caption text-surface-container-low tracking-wider uppercase font-medium">
                  Tempo Keepsakes Atelier
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Elevated Editorial Sign In Panel */}
          <div className="w-full lg:w-[52%] bg-surface flex flex-col justify-center px-margin sm:px-12 lg:px-margin-desktop py-space-xl lg:py-16">
            <div className="w-full max-w-[460px] mx-auto flex flex-col">
              {/* Header & Eyebrow */}
              <div className="flex flex-col gap-space-xs mb-space-lg">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm tracking-widest text-primary font-semibold uppercase">
                    Creator Access
                  </span>
                  <span className="text-outline-variant text-[10px]">•</span>
                  <span className="font-caption text-caption text-secondary">Tempo ID</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface font-normal">
                  Welcome back
                </h1>
                <p className="font-body-md text-body-md text-secondary">
                  Continue creating something worth sharing.
                </p>
              </div>

              {/* Error Message Display */}
              {displayError && (
                <div className="mb-space-md p-space-md rounded-xl bg-error-container/40 border border-error/30 text-error flex items-start gap-2 animate-fade-in">
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                  <span className="font-body-sm text-[13px]">{displayError}</span>
                </div>
              )}

              {/* Google Single Sign-On Button */}
              <button
                onClick={handleGoogleLogin}
                className="group w-full h-12 px-space-md rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-space-md hover:bg-surface-container-low border border-outline-variant/40 cursor-pointer"
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
                  Continue with Google
                </span>
              </button>

              {/* Divider */}
              <div className="relative my-space-lg flex items-center justify-center">
                <div className="w-full h-[1px] bg-surface-container-highest" />
                <span className="absolute px-space-md bg-surface font-caption text-caption text-secondary tracking-wide">
                  or continue with email
                </span>
              </div>

              {/* Credentials Form */}
              <form className="flex flex-col gap-space-md" onSubmit={handleSubmit}>
                {/* Email Input */}
                <div className="flex flex-col gap-space-xs">
                  <label className="font-body-sm text-body-sm font-semibold text-on-surface" htmlFor="email">
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      autoComplete="email"
                      className="w-full h-11 px-space-md rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline/60 font-body-md text-body-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-outline-variant/40"
                      id="email"
                      placeholder="you@example.com"
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute right-3 top-2.5 text-outline/70 text-[20px] pointer-events-none">
                      mail
                    </span>
                  </div>
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-body-sm text-body-sm font-semibold text-on-surface" htmlFor="password">
                      Password
                    </label>
                    <Link
                      className="font-caption text-caption text-primary hover:text-primary-container transition-colors"
                      to="/forgot-password"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      autoComplete="current-password"
                      className="w-full h-11 pl-space-md pr-11 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline/60 font-body-md text-body-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-outline-variant/40"
                      id="password"
                      placeholder="••••••••"
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      aria-label="Toggle password visibility"
                      className="absolute right-2 top-2 h-7 w-7 flex items-center justify-center text-outline hover:text-on-surface transition-colors cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[19px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-space-sm cursor-pointer select-none">
                    <input
                      className="sr-only peer"
                      id="remember"
                      name="remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <div className="w-4 h-4 rounded-sm bg-surface-container-highest peer-checked:bg-primary flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-[14px] text-on-primary scale-0 peer-checked:scale-100 transition-transform">
                        check
                      </span>
                    </div>
                    <span className="font-caption text-caption text-on-surface-variant font-normal">
                      Remember this device for 30 days
                    </span>
                  </label>
                </div>

                {/* Primary Sign In Action */}
                <button
                  className="group w-full h-11 mt-space-xs rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-space-sm cursor-pointer disabled:opacity-50"
                  type="submit"
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
                  <span className="material-symbols-outlined text-[18px] transform group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </form>

              {/* Secondary Create Account prompt */}
              <div className="mt-space-lg text-center">
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Don’t have an account?{' '}
                  <Link
                    className="font-semibold text-primary hover:text-primary-container ml-1 transition-colors underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
                    to="/signup"
                  >
                    Create one
                  </Link>
                </p>
              </div>

              {/* Reassurance Footer Note */}
              <div className="mt-space-xl p-space-md rounded-xl bg-surface-container-low shadow-sm flex flex-col gap-1 border border-surface-container">
                <div className="flex items-start gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">info</span>
                  <p className="font-caption text-caption text-secondary leading-relaxed">
                    By signing in, you agree to Tempo’s{' '}
                    <a className="underline hover:text-on-surface" href="#terms">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a className="underline hover:text-on-surface" href="#privacy">
                      Privacy Policy
                    </a>
                    .
                  </p>
                </div>
                <p className="font-caption text-caption text-on-surface-variant pl-6 leading-relaxed">
                  Guests RSVPing to invitations or contributing memories do not need an account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low shadow-[0_-1px_8px_rgba(44,44,40,0.02)]">
        <div className="max-w-[1280px] mx-auto px-margin lg:px-margin-desktop py-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm text-on-surface-variant font-caption text-caption">
            <span className="font-display-lg text-primary text-body-sm leading-none">¶</span>
            <span>© 2026 Tempo Keepsake Atelier. All rights reserved.</span>
          </div>
          <nav className="flex items-center gap-space-lg font-caption text-caption">
            <a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#help">
              Help &amp; Inquiry
            </a>
            <span className="text-outline-variant text-[10px]">•</span>
            <a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#privacy">
              Privacy Statement
            </a>
            <span className="text-outline-variant text-[10px]">•</span>
            <a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#terms">
              Terms of Service
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
};
