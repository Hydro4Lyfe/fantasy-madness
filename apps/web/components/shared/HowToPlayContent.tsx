import Link from 'next/link';
import {
  Trophy,
  Users,
  Crown,
  Calendar,
  Globe,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  BarChart3,
  Star,
  ChevronRight,
  Lock,
  UserPlus,
  Shuffle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Shared content component for the How to Play page.
// Rendered in both the marketing layout and the authenticated app layout.
//
// Props:
//   variant — "marketing" renders the sign-up CTA; "app" renders a
//             dashboard CTA appropriate for logged-in users.
// ---------------------------------------------------------------------------

export type HowToPlayVariant = 'marketing' | 'app';

interface HowToPlayContentProps {
  variant?: HowToPlayVariant;
}

// ---------------------------------------------------------------------------
// Small reusable primitives (server-only, no state)
// ---------------------------------------------------------------------------
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-mono tracking-widest text-primary uppercase">{children}</span>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-3 text-foreground">
      {children}
    </h2>
  );
}

function Divider() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
      <span className="text-sm text-muted-foreground leading-relaxed">{children}</span>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Main content component
// ---------------------------------------------------------------------------
export function HowToPlayContent({ variant = 'marketing' }: HowToPlayContentProps) {
  return (
    <div className="relative z-10">
      {/* ── Hero ────────────────────────────────────────── */}
      <section className="pt-16 pb-20 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-primary uppercase">
              How to Play
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.03em] leading-none mb-6 font-display uppercase">
            <span className="text-foreground">Everything you</span>
            <br />
            <span className="text-primary">need to know</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Fantasy Madness turns March Madness into a strategy game. Pick bracket slots, earn
            points when underdogs win, and compete across three distinct game modes.
          </p>
        </div>
      </section>

      <Divider />

      {/* ── What is Fantasy Madness ──────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <SectionLabel>Overview</SectionLabel>
            <SectionHeading>What is Fantasy Madness?</SectionHeading>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-card border border-border rounded-lg p-7">
              <p className="text-muted-foreground leading-relaxed">
                Fantasy Madness is a March Madness fantasy game where you don't pick winners of
                individual games — you pick{' '}
                <span className="text-foreground font-medium">bracket slots</span>. A slot
                represents a position in the bracket (e.g. the #12 seed in the East quadrant).
                When that slot's team wins games, you earn points.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-7">
              <p className="text-muted-foreground leading-relaxed">
                The key twist: points are calculated as{' '}
                <span className="text-foreground font-mono bg-secondary px-1.5 py-0.5 rounded text-sm">
                  seed × wins
                </span>
                . This means picking the #16 seed to go far is worth far more than picking the
                #1 seed to do the same — the game{' '}
                <span className="text-foreground font-medium">rewards bold upset picks</span>.
              </p>
            </div>

            {/* Quick facts */}
            <div className="bg-card border border-border rounded-lg p-7 md:col-span-2">
              <h3 className="text-base font-semibold text-foreground mb-5">At a glance</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: <Calendar className="w-4 h-4 text-primary" />,
                    label: 'When it opens',
                    value: 'After Selection Sunday',
                    note: 'When the 64-team bracket is announced',
                  },
                  {
                    icon: <Lock className="w-4 h-4 text-primary" />,
                    label: 'When picks close',
                    value: 'When play-ins end',
                    note: 'Thursday before Round 1 tip-off',
                  },
                  {
                    icon: <Star className="w-4 h-4 text-primary" />,
                    label: 'Play-in games',
                    value: 'Do not count',
                    note: 'Only Round 1 games onward score',
                  },
                ].map(fact => (
                  <div key={fact.label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg border border-border bg-secondary flex items-center justify-center shrink-0">
                      {fact.icon}
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">{fact.label}</div>
                      <div className="text-sm font-medium text-foreground">{fact.value}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{fact.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── Scoring ─────────────────────────────────────── */}
      <section id="scoring" className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <SectionLabel>Scoring</SectionLabel>
            <SectionHeading>Seed times wins</SectionHeading>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              The higher the seed, the more each win is worth. A Cinderella run from a 16-seed
              is the jackpot.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Formula card */}
            <div className="bg-card border border-border rounded-xl p-8 mb-6 text-center">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="flex flex-col items-center px-6 py-4 rounded-xl bg-secondary border border-border">
                  <span className="text-xs text-muted-foreground mb-1">Points</span>
                  <span className="text-3xl font-display font-bold text-foreground">P</span>
                </div>
                <span className="text-2xl text-muted-foreground font-light">=</span>
                <div className="flex flex-col items-center px-6 py-4 rounded-xl bg-primary/10 border border-primary/20">
                  <span className="text-xs text-muted-foreground mb-1">Seed</span>
                  <span className="text-3xl font-display font-bold text-primary">S</span>
                </div>
                <span className="text-2xl text-muted-foreground font-light">×</span>
                <div className="flex flex-col items-center px-6 py-4 rounded-xl bg-primary/10 border border-primary/20">
                  <span className="text-xs text-muted-foreground mb-1">Wins</span>
                  <span className="text-3xl font-display font-bold text-primary">W</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-6 max-w-md mx-auto">
                Play-in games are excluded. Only Round 1 and beyond count toward your score.
              </p>
            </div>

            {/* Examples */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  seed: '16',
                  wins: 1,
                  pts: 16,
                  label: 'Cinderella pick',
                  highlight: true,
                  desc: '16-seed upsets a 1-seed in Round 1',
                },
                {
                  seed: '12',
                  wins: 2,
                  pts: 24,
                  label: 'Sweet run',
                  highlight: false,
                  desc: '#12 beats #5 then makes it to the Sweet 16',
                },
                {
                  seed: '8',
                  wins: 3,
                  pts: 24,
                  label: 'Mid-major run',
                  highlight: false,
                  desc: '#8 seed reaches the Elite Eight',
                },
                {
                  seed: '1',
                  wins: 6,
                  pts: 6,
                  label: 'Champion but boring',
                  highlight: false,
                  desc: '#1 seed wins the whole tournament',
                },
              ].map(ex => (
                <div
                  key={ex.seed + ex.wins}
                  className={cn(
                    'flex flex-col rounded-xl border p-5',
                    ex.highlight
                      ? 'border-primary/30 bg-primary/10'
                      : 'border-border bg-card',
                  )}
                >
                  {ex.highlight && (
                    <span className="text-xs font-mono tracking-widest text-primary uppercase mb-3">
                      Best value
                    </span>
                  )}
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-3xl font-display font-bold text-foreground">
                      {ex.pts}
                    </span>
                    <span className="text-sm text-muted-foreground">pts</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    #{ex.seed} seed · {ex.wins} win{ex.wins !== 1 ? 's' : ''}
                  </div>
                  <div
                    className={cn(
                      'text-xs font-medium mb-1',
                      ex.highlight ? 'text-primary' : 'text-foreground',
                    )}
                  >
                    {ex.label}
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{ex.desc}</div>
                </div>
              ))}
            </div>

            {/* Key takeaway */}
            <div className="bg-card border border-border border-l-2 border-l-primary rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    The strategic implication
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A #1 seed that wins the entire championship earns you only 6 points (1 seed
                    × 6 wins). A #16 seed that wins just one game earns you 16 points. Draft the
                    upsets — safe picks leave points on the table.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── Game Modes ───────────────────────────────────── */}
      <section id="game-modes" className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <SectionLabel>Game Modes</SectionLabel>
            <SectionHeading>Three ways to compete</SectionHeading>
          </div>

          <div className="space-y-6 max-w-5xl mx-auto">
            {/* ── Global Contest ── */}
            <div className="bg-card border border-border border-l-2 border-l-[#3B82F6] rounded-xl overflow-hidden">
              <div className="p-7 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl border border-primary/20 bg-primary/10 flex items-center justify-center shrink-0">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-semibold text-foreground">Global Contest</h3>
                      <span className="text-xs font-mono tracking-widest text-primary border border-primary/30 bg-primary/5 rounded-full px-3 py-1">
                        FREE TO ENTER
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pick any 8 slots you want — no competition for picks
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">How it works</h4>
                    <ul className="space-y-2.5">
                      <CheckItem>
                        After Selection Sunday, browse all 64 bracket slots and choose any 8 you
                        believe will score the highest.
                      </CheckItem>
                      <CheckItem>
                        Unlike Draft mode, everyone picks independently — there's no competition
                        for the same slot.
                      </CheckItem>
                      <CheckItem>
                        Multiple users can hold the same slot. The race is purely about who has
                        the best prediction.
                      </CheckItem>
                      <CheckItem>
                        Picks lock when play-in games conclude. No changes after that.
                      </CheckItem>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Best for</h4>
                    <ul className="space-y-2.5">
                      <CheckItem>Solo players who want to test their bracket knowledge.</CheckItem>
                      <CheckItem>
                        Higher theoretical ceiling than Draft mode — you can load up on the
                        highest-value upset picks without anyone drafting them away.
                      </CheckItem>
                      <CheckItem>
                        Compete on the global leaderboard against every other player.
                      </CheckItem>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Draft Mode ── */}
            <div className="bg-card border border-border border-l-2 border-l-[#10B981] rounded-xl overflow-hidden">
              <div className="p-7 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl border border-border bg-secondary flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-[#10B981]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-semibold text-foreground">Draft Mode</h3>
                      <span className="text-xs font-mono tracking-widest text-[#10B981] border border-[#10B981]/30 bg-[#10B981]/5 rounded-full px-3 py-1">
                        MULTIPLAYER
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Real-time snake draft — 8 players, 64 slots, one chance to pick
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">How it works</h4>
                    <ul className="space-y-2.5">
                      <CheckItem>
                        A host creates a draft room and invites exactly 8 players (configurable
                        down to 2 for testing).
                      </CheckItem>
                      <CheckItem>
                        Once all players join, the host starts the draft. Turn order is set and
                        snake-style reversal kicks in each round.
                      </CheckItem>
                      <CheckItem>
                        On your turn, pick any available bracket slot from the board. Each slot
                        can only be drafted by one player.
                      </CheckItem>
                      <CheckItem>
                        If a pick timer is set and you run out of time, the system auto-picks the
                        highest-value available slot for you.
                      </CheckItem>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Host controls</h4>
                    <ul className="space-y-2.5">
                      <CheckItem>Set an optional per-pick countdown timer.</CheckItem>
                      <CheckItem>
                        Schedule a draft start date and time so everyone knows when to show up.
                      </CheckItem>
                      <CheckItem>
                        Remove participants before the draft starts if needed.
                      </CheckItem>
                      <CheckItem>
                        The draft board updates in real time — everyone sees each pick the moment
                        it's made.
                      </CheckItem>
                    </ul>
                  </div>
                </div>

                {/* Draft flow steps */}
                <div className="border-t border-border pt-6">
                  <h4 className="text-sm font-semibold text-foreground mb-4">Draft flow</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        n: '01',
                        icon: <UserPlus className="w-4 h-4" />,
                        label: 'Create & invite',
                        desc: 'Host creates the room and shares the invite code',
                      },
                      {
                        n: '02',
                        icon: <Users className="w-4 h-4" />,
                        label: 'Lobby fills',
                        desc: 'All 8 players join and wait for the host to start',
                      },
                      {
                        n: '03',
                        icon: <Shuffle className="w-4 h-4" />,
                        label: 'Snake draft',
                        desc: 'Players alternate turns picking bracket slots',
                      },
                      {
                        n: '04',
                        icon: <Trophy className="w-4 h-4" />,
                        label: 'Track scores',
                        desc: 'Watch your points accumulate as games are played',
                      },
                    ].map(step => (
                      <div key={step.n} className="bg-secondary rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-display text-xl font-bold text-[#10B981]/50 tracking-widest">
                            {step.n}
                          </span>
                          <div className="w-7 h-7 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground">
                            {step.icon}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-foreground mb-1">
                          {step.label}
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          {step.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Leagues ── */}
            <div className="bg-card border border-border border-l-2 border-l-[#F59E0B] rounded-xl overflow-hidden">
              <div className="p-7 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl border border-border bg-secondary flex items-center justify-center shrink-0">
                    <Crown className="w-6 h-6 text-[#F59E0B]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-semibold text-foreground">Leagues</h3>
                      <span className="text-xs font-mono tracking-widest text-[#F59E0B] border border-[#F59E0B]/30 bg-[#F59E0B]/5 rounded-full px-3 py-1">
                        PRIVATE OR PUBLIC
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create a private group, everyone picks independently, one leaderboard
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">How it works</h4>
                    <ul className="space-y-2.5">
                      <CheckItem>
                        A host creates a league with a name, visibility (public or private), and
                        a maximum participant count.
                      </CheckItem>
                      <CheckItem>
                        Members join via invite code (private) or by browsing public leagues.
                      </CheckItem>
                      <CheckItem>
                        Each member independently picks 8 bracket slots — the same slot can be
                        picked by multiple members.
                      </CheckItem>
                      <CheckItem>
                        A private per-league leaderboard ranks all members by total score.
                      </CheckItem>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Host controls</h4>
                    <ul className="space-y-2.5">
                      <CheckItem>Kick participants from the league before picks lock.</CheckItem>
                      <CheckItem>
                        Ban participants permanently (with an optional reason recorded for audit).
                      </CheckItem>
                      <CheckItem>Unban previously banned participants.</CheckItem>
                      <CheckItem>
                        Set the league as public (discoverable) or private (invite-only).
                      </CheckItem>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── Pick Window ─────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <SectionLabel>Timing</SectionLabel>
            <SectionHeading>When picks open and close</SectionHeading>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline */}
              <div className="hidden sm:block absolute left-8 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-4">
                {[
                  {
                    day: 'Selection Sunday',
                    label: 'Picks open',
                    icon: <Calendar className="w-4 h-4 text-primary" />,
                    color: 'border-primary/30 bg-primary/10',
                    iconBg: 'bg-primary/10 border-primary/20 text-primary',
                    desc: 'The 64-team bracket is announced. All modes open immediately — you can start making picks right away.',
                  },
                  {
                    day: 'Monday – Wednesday',
                    label: 'Play-in games',
                    icon: <Clock className="w-4 h-4 text-[#F59E0B]" />,
                    color: 'border-border bg-card',
                    iconBg: 'bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]',
                    desc: 'Four play-in games are held. These do not count toward your score. You can still change your picks during this window.',
                  },
                  {
                    day: 'Thursday morning',
                    label: 'Picks lock',
                    icon: <Lock className="w-4 h-4 text-[#F85149]" />,
                    color: 'border-[#F85149]/20 bg-[#F85149]/5',
                    iconBg: 'bg-[#F85149]/10 border-[#F85149]/20 text-[#F85149]',
                    desc: 'All picks lock before Round 1 tip-off. No changes are allowed after this point. Draft rooms must also be completed before this deadline.',
                  },
                  {
                    day: 'Thursday – Sunday',
                    label: 'Round 1 & 2 play',
                    icon: <Trophy className="w-4 h-4 text-[#10B981]" />,
                    color: 'border-border bg-card',
                    iconBg: 'bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]',
                    desc: 'Games begin. Scores update in real time as results come in. Watch your leaderboard position change with every upset.',
                  },
                ].map((event, i) => (
                  <div key={i} className="flex items-start gap-5">
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        'hidden sm:flex w-16 h-16 rounded-xl border items-center justify-center shrink-0 z-10',
                        event.iconBg,
                      )}
                    >
                      {event.icon}
                    </div>

                    <div
                      className={cn(
                        'flex-1 rounded-xl border p-5',
                        event.color,
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'sm:hidden w-8 h-8 rounded-lg border flex items-center justify-center shrink-0',
                            event.iconBg,
                          )}
                        >
                          {event.icon}
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">
                            {event.day}
                          </div>
                          <div className="text-sm font-semibold text-foreground mb-1.5">
                            {event.label}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {event.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── Leaderboards ────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <SectionLabel>Competition</SectionLabel>
            <SectionHeading>Leaderboards</SectionHeading>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Three separate leaderboards track performance across each mode.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              {
                icon: <Globe className="w-5 h-5" />,
                color: 'text-[#3B82F6]',
                borderColor: 'border-l-[#3B82F6]',
                title: 'Global Leaderboard',
                desc: 'Every Global Contest participant ranked by their cumulative score. Updated after every game result.',
                detail: 'Site-wide · All players compete',
              },
              {
                icon: <Users className="w-5 h-5" />,
                color: 'text-[#10B981]',
                borderColor: 'border-l-[#10B981]',
                title: 'Draft Leaderboard',
                desc: 'Scores from all completed drafts aggregated into a single ranking across the entire tournament year.',
                detail: 'Site-wide · Draft participants only',
              },
              {
                icon: <Crown className="w-5 h-5" />,
                color: 'text-[#F59E0B]',
                borderColor: 'border-l-[#F59E0B]',
                title: 'League Leaderboards',
                desc: 'Every league has its own private leaderboard so you can see exactly how you stack up against your group.',
                detail: 'Per-league · Members only',
              },
            ].map(board => (
              <div
                key={board.title}
                className={cn(
                  'bg-card border border-border border-l-2 rounded-xl p-6',
                  board.borderColor,
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl border border-border bg-secondary flex items-center justify-center mb-5',
                    board.color,
                  )}
                >
                  {board.icon}
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{board.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{board.desc}</p>
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{board.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── FAQ ─────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <SectionLabel>FAQ</SectionLabel>
            <SectionHeading>Common questions</SectionHeading>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              {
                q: 'What is a bracket slot?',
                a: 'A bracket slot is a position in the tournament bracket identified by its quadrant and seed number (e.g. #12 seed East). You pick slots rather than teams because the play-in games determine which specific team occupies each slot. This way your pick is valid even before play-in games finish.',
              },
              {
                q: 'Can I participate in multiple modes?',
                a: 'Yes. You can enter the Global Contest, join or create one or more Drafts, and join one or more Leagues — all simultaneously. Each mode tracks its own scoring separately.',
              },
              {
                q: 'What happens if I miss my turn in a draft?',
                a: 'If a pick timer is configured and it expires, the system automatically selects the highest-value available bracket slot for you. If no timer is configured, the draft waits indefinitely for your pick.',
              },
              {
                q: 'Do play-in games count for scoring?',
                a: 'No. Play-in games (the four games on Tuesday and Wednesday before Round 1) are excluded from scoring entirely. Only Round 1 games and beyond count toward your totals.',
              },
              {
                q: 'How do I join a private league?',
                a: "Ask the league host to share the invite code. Visit your Leagues page, click \"Join a League\", and enter the code. You'll be added instantly as long as the league isn't full.",
              },
              {
                q: 'Can I change my picks?',
                a: 'Yes — in Global mode and Leagues, you can update your 8 picks any time while the pick window is open (between Selection Sunday and when play-ins conclude on Thursday). Draft picks are permanent once made.',
              },
            ].map(faq => (
              <div key={faq.q} className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-border bg-card px-8 py-12 sm:px-12 text-center">
            {variant === 'app' ? (
              <>
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-4">
                  Ready to compete?
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                  Head to your dashboard to make picks, join a draft, or create a league.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/dashboard"
                    className={cn(
                      'inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white',
                      'bg-primary hover:bg-primary/90',
                      'shadow-[0_0_0_1px_rgba(59,130,246,0.5),0_4px_12px_rgba(59,130,246,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]',
                      'transition-all duration-200 active:scale-[0.98]',
                    )}
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/global-contest"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Enter Global Contest <ChevronRight className="inline w-3 h-3" />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-4">
                  Ready to play?
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                  Free to enter. Sign up now and be ready to pick the moment Selection Sunday ends.
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
                    Already have an account? Sign in <ChevronRight className="inline w-3 h-3" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
