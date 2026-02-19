"use client";

import Link from "next/link";
import { useRef, useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { formatShortDate } from "@/lib/date";
import type { GlobalContestOverviewDTO } from "@/server/dal/queries/globalContests.getOverview";
import {
  Calendar,
  CheckCircle,
  Clock,
  Crown,
  Globe,
  Star,
  Trophy,
  Users,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// SpotlightCard — mouse-tracking radial gradient on card surface
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
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.06]",
        "bg-gradient-to-b from-white/[0.08] to-white/[0.02]",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)]",
        "transition-shadow duration-300",
        "hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.08)]",
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(300px circle at ${position.x}px ${position.y}px, rgba(94,106,210,0.12), transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RankBadge
// ---------------------------------------------------------------------------
function RankBadge({ rank }: { rank: number }) {
  const base =
    "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0";
  if (rank === 1)
    return (
      <div className={cn(base, "bg-gradient-to-br from-yellow-400 to-yellow-600 text-[#050506]")}>
        1
      </div>
    );
  if (rank === 2)
    return (
      <div className={cn(base, "bg-gradient-to-br from-slate-300 to-slate-400 text-[#050506]")}>
        2
      </div>
    );
  if (rank === 3)
    return (
      <div className={cn(base, "bg-gradient-to-br from-amber-600 to-amber-700 text-white")}>
        3
      </div>
    );
  return <div className={cn(base, "bg-white/[0.06] text-[#8A8F98]")}>{rank}</div>;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function GlobalContestClient({ data }: { data: GlobalContestOverviewDTO }) {
  const entryDeadline = formatShortDate(data.lockAt ?? data.tournamentStartAt);
  const tournamentStart = formatShortDate(data.tournamentStartAt);

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Page header                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#5E6AD2]/40 bg-[#5E6AD2]/10 px-3 py-1">
          <Globe className="w-3.5 h-3.5 text-[#5E6AD2]" />
          <span className="text-xs font-mono tracking-widest uppercase text-[#8A8F98]">
            Global Contest
          </span>
        </div>
        <h1
          className={cn(
            "text-3xl sm:text-4xl font-semibold tracking-tight",
            "bg-gradient-to-b from-[#EDEDEF] to-[#EDEDEF]/70 bg-clip-text text-transparent",
          )}
        >
          Global Championship
        </h1>
        <p className="text-sm text-[#8A8F98]">
          {data.tournamentName} {data.seasonYear} &middot; Compete against players worldwide
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Bento row 1                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">

        {/* Hero card — col-span-4 */}
        <SpotlightCard className="md:col-span-4 min-h-[320px]">
          {/* Ambient blobs */}
          <div
            className="pointer-events-none absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(94,106,210,0.22) 0%, transparent 70%)",
              filter: "blur(120px)",
            }}
          />
          <div
            className="pointer-events-none absolute -bottom-16 -right-16 w-[320px] h-[320px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
              filter: "blur(100px)",
            }}
          />

          <div className="relative h-full flex flex-col p-6 sm:p-8">
            {/* Status pill */}
            <div className="mb-6">
              {data.isOpen ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span className="text-xs font-mono tracking-widest uppercase text-emerald-400">
                    Open
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8A8F98]" />
                  </span>
                  <span className="text-xs font-mono tracking-widest uppercase text-[#8A8F98]">
                    Locked
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-[#8A8F98] text-base leading-relaxed max-w-md mb-8">
              Submit your 8-slot bracket before the tournament starts. You can edit picks any
              time while the contest is open. Points are awarded for each correct pick as the
              tournament progresses.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6 mb-10">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#5E6AD2]" />
                <span className="text-sm text-[#8A8F98]">
                  {data.totalEntries.toLocaleString()} Entries
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#5E6AD2]" />
                <span className="text-sm text-[#8A8F98]">Closes {entryDeadline}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#5E6AD2]" />
                <span className="text-sm text-[#8A8F98]">Starts {tournamentStart}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#5E6AD2]" />
                <span className="text-sm text-[#8A8F98]">Free to Enter</span>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-auto">
              {data.isOpen ? (
                <Link
                  href="/global-contest/picks"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-5 py-2.5",
                    "bg-[#5E6AD2] hover:bg-[#6872D9] text-white text-sm font-medium",
                    "shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]",
                    "active:scale-[0.98] transition-all duration-200",
                  )}
                >
                  {data.hasEntered ? "Edit My Bracket" : "Create My Bracket"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-5 py-2.5",
                    "bg-white/[0.04] text-[#8A8F98] text-sm font-medium cursor-not-allowed",
                    "border border-white/[0.06]",
                  )}
                >
                  Contest Locked
                </div>
              )}
            </div>
          </div>
        </SpotlightCard>

        {/* Right column — col-span-2 */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {/* Entry Status card */}
          <SpotlightCard className="flex-1">
            <div className="h-full p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-[#5E6AD2]" />
                <span className="text-xs font-mono tracking-widest uppercase text-[#8A8F98]">
                  Entry Status
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
                {data.hasEntered ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-1">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-sm font-semibold text-[#EDEDEF]">Entered</p>
                    <p className="text-xs text-[#8A8F98]">Your bracket is submitted</p>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.10] flex items-center justify-center mb-1">
                      <Trophy className="w-5 h-5 text-[#8A8F98]" />
                    </div>
                    <p className="text-sm font-semibold text-[#EDEDEF]">Not Entered</p>
                    <p className="text-xs text-[#8A8F98]">Submit a bracket to compete</p>
                  </>
                )}
              </div>
            </div>
          </SpotlightCard>

          {/* Your Rank card */}
          <SpotlightCard className="flex-1">
            <div className="h-full p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-4 h-4 text-[#5E6AD2]" />
                <span className="text-xs font-mono tracking-widest uppercase text-[#8A8F98]">
                  Your Rank
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <p
                  className={cn(
                    "text-5xl font-semibold mb-1",
                    data.yourRank
                      ? "bg-gradient-to-b from-[#EDEDEF] to-[#EDEDEF]/70 bg-clip-text text-transparent"
                      : "text-[#8A8F98]",
                  )}
                >
                  {data.yourRank ? `#${data.yourRank}` : "—"}
                </p>
                <p className="text-xs text-[#8A8F98]">
                  {data.hasEntered
                    ? `${data.yourPoints.toLocaleString()} pts`
                    : "Submit your bracket to start competing"}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <Link
                  href="/leaderboards"
                  className="text-xs text-[#8A8F98] hover:text-[#EDEDEF] transition-colors duration-200"
                >
                  View full leaderboard &rarr;
                </Link>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Full-width leaderboard section                                       */}
      {/* ------------------------------------------------------------------ */}
      <SpotlightCard>
        <div className="p-6 sm:p-8 flex flex-col">
          {/* Header row */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 flex items-center justify-center flex-shrink-0">
                <Crown className="w-4 h-4 text-[#5E6AD2]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-[#EDEDEF]">
                  Top 10 Leaders
                </h2>
                <p className="text-xs text-[#8A8F98]">
                  {data.totalEntries.toLocaleString()} players competing
                </p>
              </div>
            </div>
            <Link
              href="/leaderboards"
              className={cn(
                "inline-flex items-center gap-1 text-xs text-[#8A8F98] hover:text-[#EDEDEF]",
                "px-3 py-1.5 rounded-lg border border-white/[0.06] hover:border-white/[0.10]",
                "bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200",
              )}
            >
              View all
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Player rows / empty state */}
          {data.topPlayers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/[0.10] p-10 text-center">
              <p className="text-sm text-[#8A8F98]">
                Leaderboard will appear after players submit picks.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.topPlayers.map((player) => {
                const isTop3 = player.rank <= 3;
                return (
                  <div
                    key={`${player.rank}-${player.name}`}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                      isTop3
                        ? "bg-[#5E6AD2]/[0.06] border border-[#5E6AD2]/10"
                        : "hover:bg-white/[0.04] border border-transparent",
                    )}
                  >
                    <RankBadge rank={player.rank} />

                    <span className="text-sm text-[#EDEDEF] truncate flex-1">
                      {player.name}
                    </span>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Crown className="w-3.5 h-3.5 text-[#5E6AD2]" />
                      <span className="text-sm font-mono text-[#8A8F98]">
                        {player.points.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SpotlightCard>
    </div>
  );
}
