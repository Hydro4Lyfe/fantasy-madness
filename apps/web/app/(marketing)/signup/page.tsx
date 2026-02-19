'use client';

import React, { useState, useRef, type MouseEvent } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Trophy, Users, Crown, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { signUpWithEmailPassword, signInWithGoogle } from '@/server/actions/auth';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// SpotlightCard
// ---------------------------------------------------------------------------
function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/[0.06]',
        'bg-gradient-to-b from-white/[0.08] to-white/[0.03]',
        'shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_4px_40px_rgba(0,0,0,0.5),0_0_60px_rgba(0,0,0,0.3)]',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(300px circle at ${position.x}px ${position.y}px, rgba(94,106,210,0.12), transparent 70%)`,
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Google icon SVG
// ---------------------------------------------------------------------------
function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Signup page
// ---------------------------------------------------------------------------
export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errs = { name: '', username: '', email: '', password: '', confirmPassword: '' };

    if (!formData.name.trim()) {
      errs.name = 'Name is required';
    } else if (formData.name.trim().length > 100) {
      errs.name = 'Name must be 100 characters or less';
    }

    if (!formData.username.trim()) {
      errs.username = 'Username is required';
    } else if (!/^[A-Za-z0-9][A-Za-z0-9_]{4,19}$/.test(formData.username.trim())) {
      errs.username =
        'Username must be 5-20 chars, start with a letter/number, and use only letters, numbers, or underscores';
    }

    if (!formData.email) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errs);
    return !Object.values(errs).some(e => e !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!validateForm()) return;
    if (!acceptTerms) {
      setError('You must accept the terms and conditions');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUpWithEmailPassword(
        formData.email,
        formData.password,
        formData.name.trim(),
        formData.username.trim(),
      );
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccessMessage(result.message ?? 'Account created! Check your email to confirm.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const result = await signInWithGoogle('/dashboard');
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const highlights = [
    { icon: <Globe className="w-4 h-4" />, text: 'Enter the free Global Contest' },
    { icon: <Users className="w-4 h-4" />, text: 'Live snake drafts with friends' },
    { icon: <Crown className="w-4 h-4" />, text: 'Create and manage private leagues' },
    { icon: <Trophy className="w-4 h-4" />, text: 'Real-time leaderboards & scoring' },
  ];

  return (
    <div className="min-h-screen bg-[#050506] text-[#EDEDEF] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0a0a0f_0%,#050506_50%,#020203_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='a'%3E%3CfeTurbulence baseFrequency='.75' stitchTiles='stitch' type='fractalNoise'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Cpath d='M0 0h300v300H0z' filter='url(%23a)' opacity='.05'/%3E%3C/svg%3E")`,
          }}
        />
        <div
          className="absolute top-[-20%] right-[10%] w-[700px] h-[600px] rounded-full opacity-20 blur-[150px]"
          style={{
            background: 'radial-gradient(circle, #5E6AD2, transparent 70%)',
            animation: 'blob-float 10s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-[-10%] left-[5%] w-[500px] h-[400px] rounded-full opacity-[0.1] blur-[120px]"
          style={{
            background: 'radial-gradient(circle, #7c3aed, transparent 70%)',
            animation: 'blob-float 12s ease-in-out infinite reverse',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#8A8F98] hover:text-[#EDEDEF] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left panel — visible on desktop */}
          <div className="hidden lg:flex flex-col justify-center gap-10 py-4">
            <div>
              <img
                src="/FantasyMadness_Variant1_Full.svg"
                alt="Fantasy Madness"
                className="h-8 w-auto mb-8"
              />
              <h1 className="text-4xl font-semibold tracking-tight bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent mb-4 leading-tight">
                The only March Madness game where upsets pay off
              </h1>
              <p className="text-[#8A8F98] text-lg leading-relaxed">
                Draft bracket slots before the tournament. Earn points equal to{' '}
                <span className="text-[#EDEDEF] font-medium">seed × wins</span> — bold picks win.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-3">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center text-[#5E6AD2] shrink-0">
                    {h.icon}
                  </div>
                  <span className="text-sm text-[#8A8F98]">{h.text}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-8">
              {[
                { v: '50K+', l: 'Players' },
                { v: '64', l: 'Slots' },
                { v: '16×', l: 'Max upset' },
              ].map(s => (
                <div key={s.l}>
                  <div className="text-2xl font-semibold text-[#EDEDEF]">{s.v}</div>
                  <div className="text-xs text-[#8A8F98] mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel — form */}
          <SpotlightCard className="p-8">
            {/* Mobile logo */}
            <div className="lg:hidden flex justify-center mb-6">
              <img
                src="/FantasyMadness_Variant2_Icon.svg"
                alt="Fantasy Madness"
                className="h-10 w-auto"
              />
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
                Create your account
              </h2>
              <p className="text-sm text-[#8A8F98] mt-1">Get started in under 2 minutes</p>
            </div>

            {/* Google sign-up */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className={cn(
                'w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium',
                'bg-white/[0.06] hover:bg-white/[0.10] text-[#EDEDEF]',
                'border border-white/[0.08] hover:border-white/[0.14]',
                'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
                'transition-all duration-200 active:scale-[0.98]',
                'disabled:opacity-60 disabled:cursor-not-allowed',
              )}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.06]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-transparent px-3 text-[#8A8F98]">or sign up with email</span>
              </div>
            </div>

            {/* Error / success */}
            {error && (
              <div className="mb-5 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-5 flex items-start gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name + Username side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium text-[#EDEDEF]">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-[#0F0F12] border-white/10 text-[#EDEDEF] placeholder:text-[#8A8F98] focus-visible:border-[#5E6AD2] focus-visible:ring-[#5E6AD2]/30"
                    required
                    disabled={isLoading}
                  />
                  {fieldErrors.name && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-sm font-medium text-[#EDEDEF]">
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="jane_doe"
                    value={formData.username}
                    onChange={handleChange}
                    className="bg-[#0F0F12] border-white/10 text-[#EDEDEF] placeholder:text-[#8A8F98] focus-visible:border-[#5E6AD2] focus-visible:ring-[#5E6AD2]/30"
                    required
                    disabled={isLoading}
                  />
                  {fieldErrors.username ? (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {fieldErrors.username}
                    </p>
                  ) : (
                    <p className="text-xs text-[#8A8F98]">5-20 chars, letters/numbers/_</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-[#EDEDEF]">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-[#0F0F12] border-white/10 text-[#EDEDEF] placeholder:text-[#8A8F98] focus-visible:border-[#5E6AD2] focus-visible:ring-[#5E6AD2]/30"
                  required
                  disabled={isLoading}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium text-[#EDEDEF]">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-[#0F0F12] border-white/10 text-[#EDEDEF] placeholder:text-[#8A8F98] focus-visible:border-[#5E6AD2] focus-visible:ring-[#5E6AD2]/30"
                    required
                    disabled={isLoading}
                  />
                  {fieldErrors.password ? (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {fieldErrors.password}
                    </p>
                  ) : (
                    <p className="text-xs text-[#8A8F98]">Min. 8 characters</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-[#EDEDEF]">
                    Confirm
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="bg-[#0F0F12] border-white/10 text-[#EDEDEF] placeholder:text-[#8A8F98] focus-visible:border-[#5E6AD2] focus-visible:ring-[#5E6AD2]/30"
                    required
                    disabled={isLoading}
                  />
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2.5 pt-1">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={v => setAcceptTerms(v as boolean)}
                  required
                  disabled={isLoading}
                  className="mt-0.5"
                />
                <label htmlFor="terms" className="text-sm text-[#8A8F98] cursor-pointer leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-[#5E6AD2] hover:text-[#6872D9] transition-colors">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-[#5E6AD2] hover:text-[#6872D9] transition-colors">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white',
                  'bg-[#5E6AD2] hover:bg-[#6872D9]',
                  'shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]',
                  'transition-all duration-200 active:scale-[0.98]',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-[#8A8F98] mt-6">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-[#5E6AD2] hover:text-[#6872D9] font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
}
