'use client';

import { useState, useRef, type MouseEvent } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Users,
  Crown,
  Calendar,
  Target,
  ArrowRight,
  Menu,
  X,
  Globe,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// SpotlightCard
// ---------------------------------------------------------------------------
function SpotlightCard({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
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
      id={id}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/[0.06]',
        'bg-gradient-to-b from-white/[0.08] to-white/[0.02]',
        'shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)]',
        'transition-shadow duration-300',
        'hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)]',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(300px circle at ${position.x}px ${position.y}px, rgba(94,106,210,0.15), transparent 70%)`,
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ambient background (shared across sections)
// ---------------------------------------------------------------------------
function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0a0a0f_0%,#050506_50%,#020203_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='a'%3E%3CfeTurbulence baseFrequency='.75' stitchTiles='stitch' type='fractalNoise'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Cpath d='M0 0h300v300H0z' filter='url(%23a)' opacity='.05'/%3E%3C/svg%3E")`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      {/* Blobs */}
      <div
        className="absolute top-[-10%] left-[20%] w-[900px] h-[700px] rounded-full opacity-25 blur-[150px]"
        style={{
          background: 'radial-gradient(circle, #5E6AD2, transparent 70%)',
          animation: 'blob-float 10s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-[30%] left-[-10%] w-[600px] h-[500px] rounded-full opacity-[0.12] blur-[120px]"
        style={{
          background: 'radial-gradient(circle, #7c3aed, transparent 70%)',
          animation: 'blob-float 8s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute bottom-[10%] right-[-5%] w-[500px] h-[400px] rounded-full opacity-[0.1] blur-[100px]"
        style={{
          background: 'radial-gradient(circle, #4338ca, transparent 70%)',
          animation: 'blob-float 12s ease-in-out infinite 2s',
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Landing page
// ---------------------------------------------------------------------------
export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '#modes', label: 'Game Modes' },
    { href: '#scoring', label: 'Scoring' },
    { href: '#how-it-works', label: 'How It Works' },
  ];

  const steps = [
    {
      n: '01',
      icon: <Target className="w-5 h-5" />,
      title: 'Create your account',
      desc: 'Sign up free in seconds.',
    },
    {
      n: '02',
      icon: <Calendar className="w-5 h-5" />,
      title: 'Wait for Selection Sunday',
      desc: 'The 64-team bracket is revealed. Drafts and picks open immediately after.',
    },
    {
      n: '03',
      icon: <Users className="w-5 h-5" />,
      title: 'Draft or pick your slots',
      desc: 'Compete in a live snake draft, or make your picks freely in Global mode.',
    },
    {
      n: '04',
      icon: <Trophy className="w-5 h-5" />,
      title: 'Watch your score climb',
      desc: 'Points accumulate live. Upset picks are worth the most.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#050506] text-[#EDEDEF] overflow-x-hidden">
      <AmbientBackground />

      <div className="relative z-10">
        {/* ── Nav ─────────────────────────────────────────── */}
        <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-[#050506]/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-1.5">
              <img
                src="/FantasyMadness_Variant2_Icon.svg"
                alt=""
                className="h-10 w-auto"
              />
              <div className="flex items-baseline gap-0.5">
                <span className="text-[#EDEDEF] font-semibold text-lg tracking-tight leading-none">
                  Fantasy
                </span>
                <span className="text-[#5E6AD2] font-semibold text-lg tracking-tight leading-none">
                  Madness
                </span>
              </div>
            </Link>

              <div className="hidden md:flex items-center gap-8">
                {navLinks.map(link => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm text-[#8A8F98] hover:text-[#EDEDEF] transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm text-[#8A8F98] hover:text-[#EDEDEF] transition-colors duration-200 px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white',
                    'bg-[#5E6AD2] hover:bg-[#6872D9]',
                    'shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]',
                    'transition-all duration-200 active:scale-[0.98]',
                  )}
                >
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <button
                onClick={() => setMobileOpen(o => !o)}
                className="md:hidden p-2 text-[#8A8F98] hover:text-[#EDEDEF] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="md:hidden border-t border-white/[0.06] bg-[#050506]/95 backdrop-blur-xl">
              <div className="px-4 py-4 space-y-1">
                {navLinks.map(link => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.05] transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-3 border-t border-white/[0.06] space-y-2">
                  <Link
                    href="/login"
                    className="block px-3 py-2.5 rounded-lg text-sm text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.05] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-[#5E6AD2] hover:bg-[#6872D9] transition-colors"
                  >
                    Get Started Free
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* ── Hero ────────────────────────────────────────── */}
        <section className="pt-36 pb-24 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#5E6AD2]/30 bg-[#5E6AD2]/10 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-[#5E6AD2] animate-pulse" />
              <span className="text-xs font-mono tracking-widest text-[#5E6AD2] uppercase">
                March Madness 2026
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-8xl font-semibold tracking-[-0.03em] leading-none mb-6">
              <span className="bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent">
                Fantasy
              </span>
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(to right, #5E6AD2, #818cf8, #5E6AD2)',
                  backgroundSize: '200% auto',
                  animation: 'shimmer 4s linear infinite',
                }}
              >
                Madness
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[#8A8F98] leading-relaxed max-w-2xl mx-auto mb-10">
              Draft bracket slots, compete in leagues, and rack up points every time an underdog
              wins. The scoring formula rewards upsets — a 16-seed win is worth{' '}
              <span className="text-[#EDEDEF] font-medium">16× more</span> than a 1-seed win.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
              <Link
                href="/signup"
                className={cn(
                  'inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white',
                  'bg-[#5E6AD2] hover:bg-[#6872D9]',
                  'shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]',
                  'hover:shadow-[0_0_0_1px_rgba(104,114,217,0.6),0_4px_20px_rgba(94,106,210,0.4),inset_0_1px_0_0_rgba(255,255,255,0.2)]',
                  'transition-all duration-200 active:scale-[0.98]',
                )}
              >
                <Trophy className="w-4 h-4" />
                Enter Global Contest
              </Link>
              <Link
                href="/signup"
                className={cn(
                  'inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium',
                  'bg-white/[0.05] hover:bg-white/[0.08] text-[#EDEDEF]',
                  'border border-white/[0.08] hover:border-white/[0.14]',
                  'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
                  'transition-all duration-200',
                )}
              >
                Create a Draft
                <ChevronRight className="w-4 h-4 text-[#8A8F98]" />
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 sm:gap-16">
              {[
                { value: '50K+', label: 'Active Players' },
                { value: '64', label: 'Bracket Slots' },
                { value: '16×', label: 'Max Upset Bonus' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#EDEDEF]">
                    {stat.value}
                  </div>
                  <div className="text-sm text-[#8A8F98] mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* ── Game Modes ───────────────────────────────────── */}
        <section id="modes" className="py-24 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 text-center">
              <span className="text-xs font-mono tracking-widest text-[#5E6AD2] uppercase">
                Game Modes
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-3 bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                Three ways to play
              </h2>
            </div>

            {/* Asymmetric bento grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Global Contest — hero card, spans 2 cols */}
              <SpotlightCard className="lg:col-span-2 p-8">
                <div className="flex flex-col h-full min-h-[220px]">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl border border-[#5E6AD2]/20 bg-[#5E6AD2]/10 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-[#5E6AD2]" />
                    </div>
                    <span className="text-xs font-mono tracking-widest text-[#5E6AD2] border border-[#5E6AD2]/30 bg-[#5E6AD2]/5 rounded-full px-3 py-1">
                      FREE
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight text-[#EDEDEF] mb-3">
                    Global Contest
                  </h3>
                  <p className="text-[#8A8F98] leading-relaxed mb-6 flex-1">
                    Pick 8 bracket slots you think will score the highest — no drafting against
                    others. Everyone sees the same bracket; only the sharpest picks win. Opens after
                    Selection Sunday, closes when play-in games end.
                  </p>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5E6AD2] hover:text-[#6872D9] transition-colors"
                  >
                    Enter contest <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </SpotlightCard>

              {/* Draft Mode */}
              <SpotlightCard className="p-6">
                <div className="flex flex-col h-full min-h-[220px]">
                  <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.05] flex items-center justify-center mb-5">
                    <Users className="w-5 h-5 text-[#8A8F98]" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-[#EDEDEF] mb-2">
                    Draft Mode
                  </h3>
                  <p className="text-sm text-[#8A8F98] leading-relaxed flex-1">
                    Live snake draft with up to 8 players. Pick timer, auto-pick, real-time board
                    updates.
                  </p>
                  <Link
                    href="/signup"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#5E6AD2] hover:text-[#6872D9] transition-colors"
                  >
                    Create draft <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </SpotlightCard>

              {/* Leagues */}
              <SpotlightCard className="p-6">
                <div className="flex flex-col h-full min-h-[160px]">
                  <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.05] flex items-center justify-center mb-5">
                    <Crown className="w-5 h-5 text-[#8A8F98]" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-[#EDEDEF] mb-2">
                    Leagues
                  </h3>
                  <p className="text-sm text-[#8A8F98] leading-relaxed flex-1">
                    Private leagues with invite codes. Host controls, custom participant limits, and
                    per-league leaderboards.
                  </p>
                  <Link
                    href="/signup"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#5E6AD2] hover:text-[#6872D9] transition-colors"
                  >
                    Create league <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </SpotlightCard>

              {/* Scoring preview — spans 2 cols */}
              <SpotlightCard className="md:col-span-2 p-6" id="scoring">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-[#5E6AD2]/10 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-[#5E6AD2]" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#EDEDEF]">
                        Upset-weighted scoring
                      </h3>
                    </div>
                    <p className="text-sm text-[#8A8F98] leading-relaxed max-w-md">
                      Points ={' '}
                      <span className="text-[#EDEDEF] font-mono bg-white/[0.06] px-1.5 py-0.5 rounded">
                        seed × wins
                      </span>
                      . A 16-seed that wins once earns you 16 points — 16× more than a 1-seed win.
                      Draft upsets to score big; play it safe and you'll fall behind.
                    </p>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    {[
                      { seed: '16', wins: '1', pts: '16', hot: true },
                      { seed: '8', wins: '2', pts: '16', hot: false },
                      { seed: '1', wins: '4', pts: '4', hot: false },
                    ].map(ex => (
                      <div
                        key={ex.seed}
                        className={cn(
                          'flex flex-col items-center px-4 py-3 rounded-xl border',
                          ex.hot
                            ? 'border-[#5E6AD2]/30 bg-[#5E6AD2]/10'
                            : 'border-white/[0.06] bg-white/[0.03]',
                        )}
                      >
                        <span className="text-xs text-[#8A8F98]">#{ex.seed} seed</span>
                        <span className="text-xl font-semibold text-[#EDEDEF] my-1">
                          {ex.pts}pts
                        </span>
                        <span className="text-xs text-[#8A8F98]">
                          {ex.wins} win{ex.wins !== '1' ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </SpotlightCard>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* ── How It Works ─────────────────────────────────── */}
        <section id="how-it-works" className="py-24 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 text-center">
              <span className="text-xs font-mono tracking-widest text-[#5E6AD2] uppercase">
                Process
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-3 bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                Get started in 4 steps
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map(step => (
                <SpotlightCard key={step.n} className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-xs font-mono text-[#5E6AD2]/60 tracking-widest">
                      {step.n}
                    </span>
                    <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.05] flex items-center justify-center text-[#8A8F98]">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-[#EDEDEF] mb-2">{step.title}</h3>
                  <p className="text-sm text-[#8A8F98] leading-relaxed">{step.desc}</p>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────── */}
        <section className="py-24 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div
              className="relative overflow-hidden rounded-2xl p-px"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(94,106,210,0.4), rgba(94,106,210,0.08))',
              }}
            >
              <div className="relative rounded-2xl bg-gradient-to-b from-[#0a0a0f] to-[#050506] px-8 py-12 sm:px-12 text-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-[#5E6AD2]/50 to-transparent" />
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 opacity-20 blur-[60px]"
                  style={{ background: 'radial-gradient(circle, #5E6AD2, transparent 70%)' }}
                />
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent mb-4">
                  Ready for the madness?
                </h2>
                <p className="text-[#8A8F98] text-lg mb-8 max-w-xl mx-auto">
                  Free to enter. Opens after Selection Sunday. Sign up now and be ready when the
                  bracket drops.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/signup"
                    className={cn(
                      'inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white',
                      'bg-[#5E6AD2] hover:bg-[#6872D9]',
                      'shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]',
                      'transition-all duration-200 active:scale-[0.98]',
                    )}
                  >
                    Create Free Account
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="text-sm text-[#8A8F98] hover:text-[#EDEDEF] transition-colors"
                  >
                    Already have an account? Sign in →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────── */}
        <footer className="border-t border-white/[0.06] py-10 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <img
              src="/FantasyMadness_Variant1_Full.svg"
              alt="Fantasy Madness"
              className="h-6 w-auto opacity-60"
            />
            <div className="flex items-center gap-6 text-xs text-[#8A8F98]">
              <a href="#" className="hover:text-[#EDEDEF] transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-[#EDEDEF] transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-[#EDEDEF] transition-colors">
                Contact
              </a>
              <span>© 2026 Fantasy Madness</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
