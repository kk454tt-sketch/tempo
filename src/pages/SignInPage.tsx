import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { useAuth } from '@/context/AuthContext';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, signUp, error, clearError } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ title: string; body: string } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    clearError();
    setLocalError(null);
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setFeedback(null);
    clearError();

    if (mode === 'signup') {
      if (!name.trim()) {
        setLocalError('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match. Please verify both fields.');
        return;
      }
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters long.');
        return;
      }
      if (!acceptTerms) {
        setLocalError('Please accept the creator license terms.');
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await signUp({ name: name.trim(), email: email.trim(), password });
        if (res.confirmationRequired) {
          setFeedback({
            title: 'Account created successfully',
            body: 'A verification link has been dispatched to your email.',
          });
        } else {
          setFeedback({
            title: 'Account created successfully',
            body: 'Preparing your curated studio workspace...',
          });
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 900);
        }
      } catch (err: unknown) {
        setLocalError((err as Error).message || 'Failed to create studio account.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Sign in mode
      setIsSubmitting(true);
      try {
        await login({ email: email.trim(), password });
        setFeedback({
          title: 'Credentials verified',
          body: 'Redirecting to your curated template dashboard...',
        });
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 900);
      } catch (err: unknown) {
        setLocalError((err as Error).message || 'Invalid email or password.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleGoogleAuth = async () => {
    setLocalError(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      setFeedback({
        title: 'Google authentication successful',
        body: 'Redirecting to your creator studio...',
      });
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 900);
    } catch (err: unknown) {
      setLocalError((err as Error).message || 'Google sign in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col antialiased">
      <Navbar />

      <main className="w-full pt-28 bg-surface flex-1">
        <div className="flex flex-col w-full">
          <div className="max-w-[1440px] w-full mx-auto px-margin-sm md:px-margin lg:px-margin-lg py-space-md lg:py-space-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-stretch">
              {/* ================================================================= */}
              {/* Left: Editorial Showcase (Curator Wall / Moodboard Reference)     */}
              {/* ================================================================= */}
              <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between rounded-xl bg-surface-container-low p-space-xl relative overflow-hidden shadow-sm border border-surface-container-high/60">
                <div className="absolute inset-0 pointer-events-none opacity-30 bg-gradient-to-br from-surface-container-high/40 via-surface-container/20 to-transparent"></div>
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-secondary-fixed/30 blur-3xl pointer-events-none"></div>

                {/* Header Info Cluster */}
                <div className="relative z-10 space-y-space-md">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface shadow-sm border border-surface-container-high/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></span>
                    <span className="font-label-sm text-label-sm tracking-wider uppercase font-semibold">
                      Curated Release Archive
                    </span>
                    <span className="text-on-surface-variant font-label-sm text-label-sm">·</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                      240+ Bespoke Artifacts
                    </span>
                  </div>
                  <h2 className="font-headline-xl text-headline-xl text-on-surface tracking-tight max-w-lg leading-tight font-medium">
                    Architectural discipline. Zero superfluous chrome.
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                    Discover templates crafted with museum-grade proportion, strict 8-point baseline rhythm, and pure typographic clarity for high-intent founders.
                  </p>
                </div>

                {/* Curated Moodboard Composition Area */}
                <div className="relative z-10 my-space-lg w-full">
                  <div className="relative mx-auto w-full aspect-[16/11] rounded-lg overflow-hidden bg-surface-container-lowest shadow-md border border-surface-container-high group">
                    <img
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                      alt="Editorial studio moodboard showcasing architectural minimalist design"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8dlUPlGGPnsx5wEuYia7N1ZoU0ChQni3kRowSmDJCPkHZ0eOUd9A6d2xa5cuZFqakNTaElsmmZuFWOerOI88BL0I8KXZdiVc2aSQimmd5QfGBPjciaOr1zld4Caa-tHJTuGpANTMfymrl6OjEoZ7G7z_PWUzwyYrG_xZpSRJ_X-KhrT00e5DTf81kzQARpEcn4W26e8GkzO2RNtoT8bILXVpmUwP86LjeSJvBJ5sgKRAxdi9oT48"
                    />
                    {/* Architectural Tag Overlay */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
                      <span className="px-2.5 py-1 rounded bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm shadow-sm tracking-wide font-medium">
                        STUDIO SPECIMEN NO. 14
                      </span>
                      <span className="px-2.5 py-1 rounded bg-surface-container-lowest/80 backdrop-blur-sm text-on-surface-variant font-body-sm text-body-sm shadow-sm">
                        Series: Forma & Space
                      </span>
                    </div>
                    {/* Floating Micro Card */}
                    <div className="absolute bottom-4 right-4 bg-surface-container-lowest/95 backdrop-blur-md p-space-sm rounded-lg shadow-md max-w-xs space-y-1 border border-surface-container-high">
                      <div className="flex items-center justify-between text-on-surface">
                        <span className="font-headline-sm text-headline-sm font-semibold">Atelier & Co.</span>
                        <span className="font-label-sm text-label-sm text-on-tertiary-container bg-tertiary-fixed/20 px-1.5 py-0.5 rounded font-medium">
                          Active Vault
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                        "Pure layout geometry designed for creative direction agencies and monograph archives."
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Feature Attributes & Tags */}
                <div className="relative z-10 pt-space-md flex flex-wrap items-center justify-between gap-space-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm border border-surface-container-high/60">
                      Semantic HTML
                    </span>
                    <span className="px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm border border-surface-container-high/60">
                      Tailwind CSS
                    </span>
                    <span className="px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm border border-surface-container-high/60">
                      Figma Design System
                    </span>
                    <span className="px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm border border-surface-container-high/60">
                      Zero Dependencies
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[16px] text-on-tertiary-container">
                      verified_user
                    </span>
                    <span>Verified Studio Builds</span>
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* Right: Pure Form Area                                             */}
              {/* ================================================================= */}
              <div className="col-span-1 lg:col-span-6 xl:col-span-5 flex flex-col justify-center py-space-sm md:py-space-md lg:px-space-md">
                {/* Top Back Navigation */}
                <div className="flex items-center justify-between mb-space-lg">
                  <Link
                    to="/templates"
                    className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors group"
                  >
                    <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
                      arrow_back
                    </span>
                    <span>Back to archive</span>
                  </Link>
                  <div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm">
                    <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
                    <span>Studio Session v2.4</span>
                  </div>
                </div>

                {/* Main Card Surface */}
                <div className="bg-surface-container-lowest rounded-xl p-space-lg md:p-space-xl shadow-sm border border-surface-container-high space-y-space-lg relative">
                  {/* Title & Subtitle */}
                  <div className="space-y-space-xs">
                    <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-semibold">
                      {mode === 'signin' ? 'Welcome to tempo.' : 'Create your Studio account'}
                    </h1>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      {mode === 'signin'
                        ? 'Sign in to access your downloaded templates, license keys, and creator purchases.'
                        : 'Join an exclusive community of designers, architectural studios, and indie makers.'}
                    </p>
                  </div>

                  {/* Segmented Tab Switcher */}
                  <div className="p-1 bg-surface-container-low rounded-lg flex items-center gap-1 border border-surface-container-high/60">
                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className={`flex-1 py-2 text-center rounded font-label-md text-label-md transition-all cursor-pointer ${
                        mode === 'signin'
                          ? 'shadow-sm bg-primary text-on-primary font-medium'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className={`flex-1 py-2 text-center rounded font-label-md text-label-md transition-all cursor-pointer ${
                        mode === 'signup'
                          ? 'shadow-sm bg-primary text-on-primary font-medium'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Create Account
                    </button>
                  </div>

                  {/* Google OAuth Button */}
                  <div>
                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      disabled={isSubmitting}
                      className="w-full h-11 px-4 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md text-label-md rounded-lg shadow-sm border border-surface-container-high flex items-center justify-center gap-3 transition-colors group cursor-pointer disabled:opacity-50"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center">
                    <div className="w-full bg-surface-container-high h-[1px]"></div>
                    <span className="absolute px-3 bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm tracking-wide uppercase">
                      or continue with email
                    </span>
                  </div>

                  {/* Dynamic Form */}
                  <form onSubmit={handleSubmit} className="space-y-space-md">
                    {/* Full Name field on Sign Up */}
                    {mode === 'signup' && (
                      <div className="space-y-1.5 animate-in fade-in duration-200">
                        <label className="block font-label-md text-label-md text-on-surface" htmlFor="input-name">
                          Full Name
                        </label>
                        <input
                          id="input-name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Evelyn Thorne"
                          className="w-full h-11 px-3.5 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 font-body-md text-body-md rounded-lg shadow-sm border border-surface-container-high focus:outline-none focus:border-on-surface focus:bg-surface-container-low transition-colors"
                        />
                      </div>
                    )}

                    {/* Email Field */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block font-label-md text-label-md text-on-surface" htmlFor="input-email">
                          Email Address
                        </label>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          Personal or studio
                        </span>
                      </div>
                      <input
                        id="input-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@studio.design"
                        className="w-full h-11 px-3.5 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 font-body-md text-body-md rounded-lg shadow-sm border border-surface-container-high focus:outline-none focus:border-on-surface focus:bg-surface-container-low transition-colors"
                      />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block font-label-md text-label-md text-on-surface" htmlFor="input-password">
                          Password
                        </label>
                        {mode === 'signin' && (
                          <Link to="/forgot-password" className="font-label-md text-label-md text-on-surface hover:underline transition-all">
                            Forgot password?
                          </Link>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <input
                          id="input-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full h-11 pl-3.5 pr-11 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 font-body-md text-body-md rounded-lg shadow-sm border border-surface-container-high focus:outline-none focus:border-on-surface focus:bg-surface-container-low transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label="Toggle password visibility"
                          className="absolute right-2.5 p-1.5 text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password on Sign Up */}
                    {mode === 'signup' && (
                      <div className="space-y-1.5 animate-in fade-in duration-200">
                        <label className="block font-label-md text-label-md text-on-surface" htmlFor="input-confirm">
                          Confirm Password
                        </label>
                        <div className="relative flex items-center">
                          <input
                            id="input-confirm"
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full h-11 pl-3.5 pr-11 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 font-body-md text-body-md rounded-lg shadow-sm border border-surface-container-high focus:outline-none focus:border-on-surface focus:bg-surface-container-low transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label="Toggle confirm password visibility"
                            className="absolute right-2.5 p-1.5 text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {showConfirmPassword ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Checkbox Row */}
                    <div className="flex items-start gap-2.5 pt-1">
                      <input
                        id="auth-checkbox"
                        type="checkbox"
                        checked={mode === 'signin' ? rememberMe : acceptTerms}
                        onChange={(e) => mode === 'signin' ? setRememberMe(e.target.checked) : setAcceptTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded text-primary accent-primary bg-surface-container-low cursor-pointer"
                      />
                      <label htmlFor="auth-checkbox" className="font-body-sm text-body-sm text-on-surface-variant select-none cursor-pointer">
                        {mode === 'signin' ? (
                          'Stay signed in on this browser for 30 days'
                        ) : (
                          <span>
                            I accept the{' '}
                            <Link to="/terms" className="underline text-on-surface">
                              Creator Terms
                            </Link>{' '}
                            and confirm standard license usage
                          </span>
                        )}
                      </label>
                    </div>

                    {/* Feedback Alert State */}
                    {feedback && (
                      <div className="p-3 rounded-lg bg-surface-container-low text-on-surface flex items-start gap-2.5 shadow-sm border border-surface-container-high animate-in fade-in duration-200">
                        <span className="material-symbols-outlined text-[18px] text-tertiary-fixed-dim shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                        <div className="space-y-0.5">
                          <p className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                            {feedback.title}
                          </p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            {feedback.body}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Error Banner */}
                    {(localError || error) && (
                      <div className="p-3 rounded-lg bg-error-container text-on-error-container flex items-start gap-2.5 shadow-sm animate-in fade-in duration-200">
                        <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                          error
                        </span>
                        <p className="font-body-sm text-body-sm">
                          {localError || error}
                        </p>
                      </div>
                    )}

                    {/* Main Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer font-medium disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                          <span>Authenticating...</span>
                        </>
                      ) : (
                        <>
                          <span>{mode === 'signin' ? 'Sign In to Studio' : 'Create Studio Account'}</span>
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Alternative Mode Toggle Link */}
                  <div className="pt-2 text-center">
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {mode === 'signin' ? (
                        <>
                          Don't have an account yet?{' '}
                          <button
                            type="button"
                            onClick={() => switchMode('signup')}
                            className="text-on-surface font-label-md text-label-md hover:underline cursor-pointer ml-1 font-semibold"
                          >
                            Create an account
                          </button>
                        </>
                      ) : (
                        <>
                          Already have a studio account?{' '}
                          <button
                            type="button"
                            onClick={() => switchMode('signin')}
                            className="text-on-surface font-label-md text-label-md hover:underline cursor-pointer ml-1 font-semibold"
                          >
                            Sign in here
                          </button>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Trust & Licensing Footer */}
                  <div className="pt-space-sm border-t border-surface-container-high/60 flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px]">lock</span>
                      <span>256-bit encrypted</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link to="/privacy" className="hover:text-on-surface transition-colors">Privacy</Link>
                      <span>·</span>
                      <Link to="/terms" className="hover:text-on-surface transition-colors">Terms of Use</Link>
                      <span>·</span>
                      <Link to="/privacy" className="hover:text-on-surface transition-colors">Licensing</Link>
                    </div>
                  </div>
                </div>

                {/* Instant Mode Quick Switcher Helper */}
                <div className="mt-space-md p-space-sm rounded-lg bg-surface-container flex items-center justify-between text-on-surface-variant border border-surface-container-high/60">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">sync_alt</span>
                    <span className="font-body-sm text-body-sm">Testing views? Switch instant mode:</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className={`px-2.5 py-1 rounded font-label-sm text-label-sm shadow-sm transition-all cursor-pointer ${
                        mode === 'signin' ? 'bg-primary text-on-primary font-medium' : 'bg-surface-container-lowest text-on-surface'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className={`px-2.5 py-1 rounded font-label-sm text-label-sm shadow-sm transition-all cursor-pointer ${
                        mode === 'signup' ? 'bg-primary text-on-primary font-medium' : 'bg-surface-container-lowest text-on-surface'
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
