'use client';

import { useState } from 'react';
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
// Landing page
// ---------------------------------------------------------------------------
export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '#modes', label: 'Game Modes' },
    { href: '#scoring', label: 'Scoring' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '/how-to-play', label: 'How to Play' },
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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="relative z-10">
        {/* ── Nav ─────────────────────────────────────────── */}
        <nav className="fixed top-0 inset-x-0 z-50 border-b border-border bg-[#0d1117]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-1.5">
              <img
                src="/FantasyMadness_Variant2_Icon.svg"
                alt=""
                className="h-10 w-auto"
              />
              <div className="flex items-baseline gap-0.5">
                <span className="text-foreground font-semibold text-lg tracking-tight leading-none">
                  Fantasy
                </span>
                <span className="text-primary font-semibold text-lg tracking-tight leading-none">
                  Madness
                </span>
              </div>
            </Link>

              <div className="hidden md:flex items-center gap-8">
                {navLinks.map(link => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white',
                    'bg-primary hover:bg-primary/90',
                    'shadow-[0_0_0_1px_rgba(59,130,246,0.5),0_4px_12px_rgba(59,130,246,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]',
                    'transition-all duration-200 active:scale-[0.98]',
                  )}
                >
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <button
                onClick={() => setMobileOpen(o => !o)}
                className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="md:hidden border-t border-border bg-[#0d1117]">
              <div className="px-4 py-4 space-y-1">
                {navLinks.map(link => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-3 border-t border-border space-y-2">
                  <Link
                    href="/login"
                    className="block px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono tracking-widest text-primary uppercase">
                March Madness 2026
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-[-0.03em] leading-none mb-6">
              <span className="font-display uppercase text-foreground">
                Fantasy
              </span>
              <br />
              <span className="font-display uppercase text-primary">
                Madness
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
              Draft bracket slots, compete in leagues, and rack up points every time an underdog
              wins. The scoring formula rewards upsets — a 16-seed win is worth{' '}
              <span className="text-foreground font-medium">16× more</span> than a 1-seed win.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
              <Link
                href="/signup"
                className={cn(
                  'inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white',
                  'bg-primary hover:bg-primary/90',
                  'shadow-[0_0_0_1px_rgba(59,130,246,0.5),0_4px_12px_rgba(59,130,246,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]',
                  'hover:shadow-[0_0_0_1px_rgba(59,130,246,0.6),0_4px_20px_rgba(59,130,246,0.4),inset_0_1px_0_0_rgba(255,255,255,0.2)]',
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
                  'bg-secondary hover:bg-secondary/80 text-foreground',
                  'border border-border hover:border-border/80',
                  'transition-all duration-200',
                )}
              >
                Create a Draft
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
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
                  <div className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
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
              <span className="text-xs font-mono tracking-widest text-primary uppercase">
                Game Modes
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-3 text-foreground">
                Three ways to play
              </h2>
            </div>

            {/* Asymmetric bento grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Global Contest — hero card, spans 2 cols */}
              <div className="bg-card border border-border border-l-2 border-l-[#3B82F6] rounded-lg lg:col-span-2 p-8">
                <div className="flex flex-col h-full min-h-[220px]">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl border border-primary/20 bg-primary/10 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-mono tracking-widest text-primary border border-primary/30 bg-primary/5 rounded-full px-3 py-1">
                      FREE
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground mb-3">
                    Global Contest
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                    Pick 8 bracket slots you think will score the highest — no drafting against
                    others. Everyone sees the same bracket; only the sharpest picks win. Opens after
                    Selection Sunday, closes when play-in games end.
                  </p>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Enter contest <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Draft Mode */}
              <div className="bg-card border border-border border-l-2 border-l-[#10B981] rounded-lg p-6">
                <div className="flex flex-col h-full min-h-[220px]">
                  <div className="w-10 h-10 rounded-xl border border-border bg-secondary flex items-center justify-center mb-5">
                    <Users className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground mb-2">
                    Draft Mode
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    Live snake draft with up to 8 players. Pick timer, auto-pick, real-time board
                    updates.
                  </p>
                  <Link
                    href="/signup"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Create draft <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Leagues */}
              <div className="bg-card border border-border border-l-2 border-l-[#F59E0B] rounded-lg p-6">
                <div className="flex flex-col h-full min-h-[160px]">
                  <div className="w-10 h-10 rounded-xl border border-border bg-secondary flex items-center justify-center mb-5">
                    <Crown className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground mb-2">
                    Leagues
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    Private leagues with invite codes. Host controls, custom participant limits, and
                    per-league leaderboards.
                  </p>
                  <Link
                    href="/signup"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Create league <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Scoring preview — spans 2 cols */}
              <div className="bg-card border border-border rounded-lg md:col-span-2 p-6" id="scoring">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Upset-weighted scoring
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                      Points ={' '}
                      <span className="text-foreground font-mono bg-secondary px-1.5 py-0.5 rounded">
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
                            ? 'border-primary/30 bg-primary/10'
                            : 'border-border bg-secondary',
                        )}
                      >
                        <span className="text-xs text-muted-foreground">#{ex.seed} seed</span>
                        <span className="text-xl font-semibold text-foreground my-1">
                          {ex.pts}pts
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {ex.wins} win{ex.wins !== '1' ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
              <span className="text-xs font-mono tracking-widest text-primary uppercase">
                Process
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-3 text-foreground">
                Get started in 4 steps
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map(step => (
                <div key={step.n} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="font-display text-2xl font-bold text-primary/60 tracking-widest">
                      {step.n}
                    </span>
                    <div className="w-8 h-8 rounded-lg border border-border bg-secondary flex items-center justify-center text-muted-foreground">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────── */}
        <section className="py-24 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-border bg-card px-8 py-12 sm:px-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-4">
                Ready for the madness?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                Free to enter. Opens after Selection Sunday. Sign up now and be ready when the
                bracket drops.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/signup"
                  className={cn(
                    'inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white',
                    'bg-primary hover:bg-primary/90',
                    'shadow-[0_0_0_1px_rgba(59,130,246,0.5),0_4px_12px_rgba(59,130,246,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]',
                    'transition-all duration-200 active:scale-[0.98]',
                  )}
                >
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Already have an account? Sign in →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────── */}
        <footer className="border-t border-border py-10 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <img
              src="/FantasyMadness_Variant1_Full.svg"
              alt="Fantasy Madness"
              className="h-6 w-auto opacity-60"
            />
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <Link href="/how-to-play" className="hover:text-foreground transition-colors">
                How to Play
              </Link>
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
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
