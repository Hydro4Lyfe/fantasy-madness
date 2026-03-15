"use client";

import Link from "next/link";
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
  return <div className={cn(base, "bg-secondary/50 text-muted-foreground")}>{rank}</div>;
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
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1">
          <Globe className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
            Global Contest
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight font-display uppercase tracking-wide text-foreground">
          Global Championship
        </h1>
        <p className="text-sm text-muted-foreground">
          {data.tournamentName} &middot; Compete against players worldwide
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Bento row 1                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">

        {/* Hero card — col-span-4 */}
        <div className="bg-card border border-border rounded-lg md:col-span-4 min-h-[320px]">
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
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground" />
                  </span>
                  <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
                    Locked
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-base leading-relaxed max-w-md mb-8">
              Submit your 8-slot bracket before the tournament starts. You can edit picks any
              time while the contest is open. Points are awarded for each correct pick as the
              tournament progresses.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6 mb-10">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {data.totalEntries.toLocaleString()} Entries
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Closes {entryDeadline}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Starts {tournamentStart}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Free to Enter</span>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-auto">
              {data.isOpen && data.bracketLocked ? (
                <Link
                  href="/global-contest/picks"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-5 py-2.5",
                    "bg-primary hover:bg-primary/90 text-white text-sm font-medium",
                    "active:scale-[0.98] transition-all duration-200",
                  )}
                >
                  {data.hasEntered ? "Edit My Bracket" : "Create My Bracket"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : !data.bracketLocked ? (
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-5 py-2.5",
                    "bg-secondary/50 text-muted-foreground text-sm font-medium cursor-not-allowed",
                    "border border-border",
                  )}
                >
                  Bracket Not Yet Available
                </div>
              ) : (
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-5 py-2.5",
                    "bg-secondary/50 text-muted-foreground text-sm font-medium cursor-not-allowed",
                    "border border-border",
                  )}
                >
                  Contest Locked
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column — col-span-2 */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {/* Entry Status card */}
          <div className="bg-card border border-border rounded-lg flex-1">
            <div className="h-full p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
                  Entry Status
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
                {data.hasEntered ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-1">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Entered</p>
                    <p className="text-xs text-muted-foreground">Your bracket is submitted</p>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-secondary/50 border border-border flex items-center justify-center mb-1">
                      <Trophy className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Not Entered</p>
                    <p className="text-xs text-muted-foreground">Submit a bracket to compete</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Your Rank card */}
          <div className="bg-card border border-border rounded-lg flex-1">
            <div className="h-full p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
                  Your Rank
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <p
                  className={cn(
                    "text-5xl font-semibold mb-1",
                    data.yourRank
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {data.yourRank ? `#${data.yourRank}` : "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.hasEntered
                    ? `${data.yourPoints.toLocaleString()} pts`
                    : "Submit your bracket to start competing"}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <Link
                  href="/leaderboards"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  View full leaderboard &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Full-width leaderboard section                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 sm:p-8 flex flex-col">
          {/* Header row */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Crown className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight font-display uppercase tracking-wide text-foreground">
                  Top 10 Leaders
                </h2>
                <p className="text-xs text-muted-foreground">
                  {data.totalEntries.toLocaleString()} players competing
                </p>
              </div>
            </div>
            <Link
              href="/leaderboards"
              className={cn(
                "inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground",
                "px-3 py-1.5 rounded-lg border border-border hover:border-border/80",
                "bg-secondary/50 hover:bg-accent transition-all duration-200",
              )}
            >
              View all
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Player rows / empty state */}
          {data.topPlayers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <p className="text-sm text-muted-foreground">
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
                        ? "bg-primary/[0.06] border border-primary/10"
                        : "hover:bg-accent border border-transparent",
                    )}
                  >
                    <RankBadge rank={player.rank} />

                    <span className="text-sm text-foreground truncate flex-1">
                      {player.name}
                    </span>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Crown className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm font-mono text-muted-foreground">
                        {player.points.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
