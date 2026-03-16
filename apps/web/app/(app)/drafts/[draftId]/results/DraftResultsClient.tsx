"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Crown, Users, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { TeamLogo } from "@/components/team/TeamLogo";
import type { DraftResultsDTO, DraftPickResultDTO } from "@/server/dal";

// ---------------------------------------------------------------------------
// Quadrant label map
// ---------------------------------------------------------------------------

const QUADRANT_NAMES: Record<number, string> = {
  1: "East",
  2: "West",
  3: "South",
  4: "Midwest",
};

function quadrantLabel(q: number): string {
  return QUADRANT_NAMES[q] ?? `Region ${q}`;
}

// ---------------------------------------------------------------------------
// initials helper
// ---------------------------------------------------------------------------

function initials(name: string | null): string {
  if (!name) return "PL";
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ---------------------------------------------------------------------------
// RankBadge — gold / silver / bronze / muted
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
// StatusPill
// ---------------------------------------------------------------------------

function StatusPill({ status }: { status: string }) {
  if (status === "DRAFTING") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-mono tracking-widest uppercase text-muted-foreground">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
        </span>
        Drafting
      </span>
    );
  }
  if (status === "COMPLETE") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-mono tracking-widest uppercase text-muted-foreground">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
        Complete
      </span>
    );
  }
  if (status === "LOCKED" || status === "LIVE") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono tracking-widest uppercase text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        {status === "LIVE" ? "Live" : "Locked"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-mono tracking-widest uppercase text-yellow-400">
      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

// ---------------------------------------------------------------------------
// SeedBadge
// ---------------------------------------------------------------------------

function SeedBadge({ seed }: { seed: number }) {
  const base = "w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center border flex-shrink-0";
  if (seed <= 4) {
    return (
      <div className={cn(base, "bg-primary/20 text-primary border-primary/30")}>{seed}</div>
    );
  }
  if (seed >= 13) {
    return (
      <div className={cn(base, "bg-amber-500/20 text-amber-400 border-amber-500/30")}>{seed}</div>
    );
  }
  return (
    <div className={cn(base, "bg-secondary/50 text-muted-foreground border-border")}>{seed}</div>
  );
}

// ---------------------------------------------------------------------------
// PickCard
// ---------------------------------------------------------------------------

function PickCard({ pick }: { pick: DraftPickResultDTO }) {
  const hasScore = pick.pickScore > 0;
  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors duration-200",
        "hover:border-border/80 hover:bg-accent",
        hasScore
          ? "border-primary/15 bg-primary/[0.03]"
          : "border-border bg-card",
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <SeedBadge seed={pick.seed} />
        <span className="text-xs font-mono text-muted-foreground/60">#{pick.overallPickNo}</span>
      </div>

      <div className="flex items-center gap-2.5 mb-3">
        <TeamLogo
          teamId={pick.teamId}
          label={pick.teamName ?? "TBD"}
          className="w-8 h-8 flex-shrink-0 border border-border bg-secondary/50"
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {pick.teamName ?? "TBD"}
          </p>
          <p className="text-xs text-muted-foreground">{quadrantLabel(pick.quadrant)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {pick.seed} seed &times; {pick.wins} wins
        </span>
        {hasScore ? (
          <span className="text-sm font-semibold font-mono text-primary">
            {pick.pickScore}
          </span>
        ) : (
          <span className="text-sm font-mono text-muted-foreground/50">0</span>
        )}
      </div>

      {pick.isAutoPick && (
        <div className="mt-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
              "bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-xs",
            )}
          >
            <Zap className="w-3 h-3" />
            Auto
          </span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Avatar helper
// ---------------------------------------------------------------------------

function PlayerAvatar({
  image,
  name,
  size = "md",
  className,
}: {
  image: string | null;
  name: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-5 h-5 text-[10px]",
    md: "w-9 h-9 text-xs",
    lg: "w-14 h-14 text-sm",
    xl: "w-20 h-20 text-lg",
  };

  return (
    <div className={cn("rounded-full overflow-hidden border border-border flex-shrink-0", sizeClasses[size], className)}>
      {image ? (
        <ImageWithFallback
          src={image}
          alt={name ?? "Player"}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-primary/10 flex items-center justify-center font-bold text-primary">
          {initials(name)}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DraftResultsClientProps {
  results: DraftResultsDTO;
  currentUserId: string;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DraftResultsClient({ results, currentUserId }: DraftResultsClientProps) {
  const { participants } = results;

  const winner = participants[0] ?? null;
  const leaderScore = winner?.totalScore ?? 0;

  const [activePlayer, setActivePlayer] = useState(participants[0]?.userId ?? "");

  const activeParticipant = participants.find((p) => p.userId === activePlayer) ?? participants[0];

  const podiumFirst = participants[0];
  const podiumSecond = participants[1];
  const podiumThird = participants[2];
  const showPodium = participants.length >= 3;

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/drafts/${results.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <div className="w-px h-5 bg-border" />

          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight truncate font-display uppercase tracking-wide text-foreground">
            {results.name}
          </h2>

          <div className="hidden sm:block">
            <StatusPill status={results.status} />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <div className="sm:hidden">
            <StatusPill status={results.status} />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground font-mono">
            <Users className="w-3.5 h-3.5" />
            {participants.length} players
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground font-mono">
            {results.tournamentName}
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Winner Hero                                                         */}
      {/* ------------------------------------------------------------------ */}
      {winner && (
        <div className="bg-card border border-border rounded-lg p-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 relative">
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <Crown className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
              <PlayerAvatar
                image={winner.userImage}
                name={winner.userName}
                size="xl"
                className="border-2 border-yellow-500/30 shadow-[0_0_0_4px_rgba(234,179,8,0.1)]"
              />
            </div>

            <div className="flex-1 min-w-0 text-center sm:text-left">
              <p className="text-xs font-mono tracking-widest uppercase text-yellow-400/80 mb-1 font-display">
                Champion
              </p>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {winner.userName ?? "Unknown Player"}
                {winner.userId === currentUserId && (
                  <span className="text-primary"> — that&apos;s you!</span>
                )}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {winner.picks.length}/{results.rosterSize} picks drafted
              </p>
            </div>

            <div className="flex flex-col items-center sm:items-end flex-shrink-0">
              <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-1 font-display">
                Final Score
              </p>
              <span className="text-5xl font-bold font-mono bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent">
                {winner.totalScore.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground mt-1">pts</span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Podium                                                              */}
      {/* ------------------------------------------------------------------ */}
      {showPodium && (
        <div className="grid grid-cols-3 gap-3 items-end">
          {/* 2nd place */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="relative">
                <PlayerAvatar image={podiumSecond.userImage} name={podiumSecond.userName} size="lg" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-[10px] font-bold text-[#050506]">
                  2
                </div>
              </div>
              <p className="text-sm font-medium text-foreground truncate w-full">
                {podiumSecond.userName ?? "Player"}
              </p>
              <p className="text-lg font-bold font-mono text-foreground">
                {podiumSecond.totalScore.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                &minus;{(leaderScore - podiumSecond.totalScore).toLocaleString()} pts
              </p>
            </div>
          </div>

          {/* 1st place */}
          <div className="bg-card border border-yellow-500/20 rounded-lg p-6 relative overflow-hidden">
            <div className="flex flex-col items-center gap-2 text-center relative">
              <Crown className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]" />
              <div className="relative">
                <PlayerAvatar
                  image={podiumFirst.userImage}
                  name={podiumFirst.userName}
                  size="lg"
                  className="w-16 h-16 border-2 border-yellow-500/40 shadow-[0_0_0_4px_rgba(234,179,8,0.08)]"
                />
              </div>
              <p className="text-xs font-mono tracking-widest uppercase text-yellow-400/80 font-display">
                Champion
              </p>
              <p className="text-sm font-semibold text-foreground truncate w-full">
                {podiumFirst.userName ?? "Player"}
              </p>
              <p className="text-2xl font-bold font-mono bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent">
                {podiumFirst.totalScore.toLocaleString()}
              </p>
            </div>
          </div>

          {/* 3rd place */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="relative">
                <PlayerAvatar image={podiumThird.userImage} name={podiumThird.userName} size="lg" className="w-12 h-12" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-[10px] font-bold text-white">
                  3
                </div>
              </div>
              <p className="text-sm font-medium text-foreground truncate w-full">
                {podiumThird.userName ?? "Player"}
              </p>
              <p className="text-base font-bold font-mono text-foreground">
                {podiumThird.totalScore.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                &minus;{(leaderScore - podiumThird.totalScore).toLocaleString()} pts
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Full Standings                                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-foreground font-display uppercase tracking-wide">
            Final Standings
          </h3>
        </div>

        {participants.length === 0 ? (
          <div className="py-12 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No participants in this draft yet.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {participants.map((participant) => {
              const isLeader = participant.rank === 1;
              const isYou = participant.userId === currentUserId;
              const delta = leaderScore - participant.totalScore;

              return (
                <div
                  key={participant.userId}
                  className={cn(
                    "flex items-center gap-4 rounded-xl px-4 py-3",
                    "transition-colors duration-200",
                    isLeader
                      ? "bg-primary/[0.06] border border-primary/10"
                      : isYou
                        ? "bg-primary/[0.04] border border-primary/[0.08]"
                        : "hover:bg-accent border border-transparent",
                  )}
                >
                  <RankBadge rank={participant.rank} />

                  <PlayerAvatar image={participant.userImage} name={participant.userName} size="md" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-foreground truncate">
                        {participant.userName ?? "Unknown Player"}
                      </span>
                      {isYou && (
                        <span className="text-xs rounded-full border border-primary/30 bg-primary/10 text-primary px-2 py-0.5">
                          You
                        </span>
                      )}
                      {participant.isHost && (
                        <Crown className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {participant.picks.length} picks drafted
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span
                      className={cn(
                        "text-xl font-semibold font-mono",
                        isLeader ? "text-primary" : "text-foreground",
                      )}
                    >
                      {participant.totalScore.toLocaleString()}
                    </span>
                    <p className="text-xs mt-0.5">
                      {isLeader ? (
                        <span className="text-primary">Leading</span>
                      ) : (
                        <span className="text-muted-foreground">
                          &minus;{delta.toLocaleString()} pts
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Pick Breakdown                                                       */}
      {/* ------------------------------------------------------------------ */}
      {participants.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground font-display uppercase tracking-wide">
              Pick Breakdown
            </h3>
          </div>

          {/* Player tab strip */}
          <div className="flex flex-wrap gap-2 mb-6">
            {participants.map((participant) => {
              const isActive = participant.userId === activePlayer;
              const isYou = participant.userId === currentUserId;
              return (
                <button
                  key={participant.userId}
                  onClick={() => setActivePlayer(participant.userId)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 border border-border text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  <PlayerAvatar
                    image={participant.userImage}
                    name={participant.userName}
                    size="sm"
                    className={cn(
                      isActive ? "border-primary-foreground/20" : "border-border",
                    )}
                  />
                  <span>{isYou ? "You" : (participant.userName ?? "Player")}</span>
                  <span
                    className={cn(
                      "font-mono text-xs",
                      isActive ? "text-primary-foreground/70" : "text-muted-foreground/70",
                    )}
                  >
                    {participant.totalScore.toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Picks grid */}
          {activeParticipant && (
            <>
              {activeParticipant.picks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                  <p className="text-sm text-muted-foreground">No picks made yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {activeParticipant.picks.map((pick) => (
                    <PickCard
                      key={`${activeParticipant.userId}-${pick.slotId}-${pick.overallPickNo}`}
                      pick={pick}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
