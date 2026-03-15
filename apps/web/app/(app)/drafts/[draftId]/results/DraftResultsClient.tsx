"use client";

import { useState, useRef, type MouseEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Crown, Users, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
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
// SpotlightCard — mouse-tracking radial gradient
// ---------------------------------------------------------------------------

function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
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
      onMouseMove={onMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(300px circle at ${pos.x}px ${pos.y}px, rgba(94,106,210,0.12), transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
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
  return <div className={cn(base, "bg-white/[0.06] text-[#8A8F98]")}>{rank}</div>;
}

// ---------------------------------------------------------------------------
// StatusPill — derived from the result status string
// ---------------------------------------------------------------------------

function StatusPill({ status }: { status: string }) {
  if (status === "DRAFTING") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5E6AD2]/40 bg-[#5E6AD2]/10 px-3 py-1 text-xs font-mono tracking-widest uppercase text-[#8A8F98]">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5E6AD2] opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#5E6AD2]" />
        </span>
        Drafting
      </span>
    );
  }
  if (status === "COMPLETE") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-xs font-mono tracking-widest uppercase text-[#8A8F98]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8A8F98]" />
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
// SeedBadge — coloured by tier
// ---------------------------------------------------------------------------

function SeedBadge({ seed }: { seed: number }) {
  const base = "w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center border flex-shrink-0";
  if (seed <= 4) {
    return (
      <div className={cn(base, "bg-[#5E6AD2]/20 text-[#5E6AD2] border-[#5E6AD2]/30")}>{seed}</div>
    );
  }
  if (seed >= 13) {
    return (
      <div className={cn(base, "bg-amber-500/20 text-amber-400 border-amber-500/30")}>{seed}</div>
    );
  }
  return (
    <div className={cn(base, "bg-white/[0.06] text-[#8A8F98] border-white/[0.06]")}>{seed}</div>
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
        "hover:border-white/[0.1] hover:bg-white/[0.05]",
        hasScore
          ? "border-[#5E6AD2]/[0.15] bg-[#5E6AD2]/[0.03]"
          : "border-white/[0.06] bg-white/[0.03]",
      )}
    >
      {/* Top row: seed badge + pick number */}
      <div className="flex items-center justify-between mb-2">
        <SeedBadge seed={pick.seed} />
        <span className="text-xs font-mono text-[#8A8F98]/60">#{pick.overallPickNo}</span>
      </div>

      {/* Team name */}
      <p className="text-sm font-medium text-[#EDEDEF] truncate mb-0.5">
        {pick.teamName ?? "TBD"}
      </p>

      {/* Region */}
      <p className="text-xs text-[#8A8F98] mb-3">{quadrantLabel(pick.quadrant)}</p>

      {/* Score row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#8A8F98]">
          {pick.seed} seed &times; {pick.wins} wins
        </span>
        {hasScore ? (
          <span
            className={cn(
              "text-sm font-semibold font-mono",
              "bg-gradient-to-r from-[#5E6AD2] to-indigo-400 bg-clip-text text-transparent",
            )}
          >
            {pick.pickScore}
          </span>
        ) : (
          <span className="text-sm font-mono text-[#8A8F98]/50">0</span>
        )}
      </div>

      {/* Auto-pick pill */}
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

  // Podium players
  const podiumFirst = participants[0];
  const podiumSecond = participants[1];
  const podiumThird = participants[2];
  const showPodium = participants.length >= 3;

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: back + title + status */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/drafts/${results.id}`}
            className={cn(
              "inline-flex items-center gap-1.5 text-sm text-[#8A8F98] hover:text-[#EDEDEF]",
              "transition-colors duration-200",
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <div className="w-px h-5 bg-white/[0.06]" />

          <h2
            className={cn(
              "text-2xl sm:text-3xl font-semibold tracking-tight truncate",
              "bg-gradient-to-b from-[#EDEDEF] to-[#EDEDEF]/70 bg-clip-text text-transparent",
            )}
          >
            {results.name}
          </h2>

          <div className="hidden sm:block">
            <StatusPill status={results.status} />
          </div>
        </div>

        {/* Right: meta chips */}
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <div className="sm:hidden">
            <StatusPill status={results.status} />
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-white/[0.06]",
              "bg-white/[0.04] px-3 py-1 text-xs text-[#8A8F98]",
            )}
          >
            <Users className="w-3.5 h-3.5" />
            {participants.length} players
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-white/[0.06]",
              "bg-white/[0.04] px-3 py-1 text-xs text-[#8A8F98]",
            )}
          >
            {results.tournamentName}
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Winner Hero                                                          */}
      {/* ------------------------------------------------------------------ */}
      {winner && (
        <SpotlightCard className="p-8">
          {/* Ambient blob */}
          <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#5E6AD2]/15 blur-[100px]" />

          <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <Crown className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
              <div
                className={cn(
                  "w-20 h-20 rounded-full overflow-hidden",
                  "border-2 border-yellow-500/30",
                  "shadow-[0_0_0_4px_rgba(234,179,8,0.1)]",
                )}
              >
                {winner.userImage ? (
                  <ImageWithFallback
                    src={winner.userImage}
                    alt={winner.userName ?? "Champion"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#5E6AD2]/20 flex items-center justify-center text-lg font-bold text-[#5E6AD2]">
                    {initials(winner.userName)}
                  </div>
                )}
              </div>
            </div>

            {/* Name + subtitle */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <p className="text-xs font-mono tracking-widest uppercase text-yellow-400/80 mb-1">
                Champion
              </p>
              <p
                className={cn(
                  "text-2xl sm:text-3xl font-bold tracking-tight",
                  "bg-gradient-to-b from-[#EDEDEF] to-[#EDEDEF]/70 bg-clip-text text-transparent",
                )}
              >
                {winner.userName ?? "Unknown Player"}
                {winner.userId === currentUserId && (
                  <span className="text-[#5E6AD2]"> — that's you!</span>
                )}
              </p>
              <p className="text-sm text-[#8A8F98] mt-1">
                {winner.picks.length}/{results.rosterSize} picks drafted
              </p>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center sm:items-end flex-shrink-0">
              <p className="text-xs font-mono tracking-widest uppercase text-[#8A8F98] mb-1">
                Final Score
              </p>
              <span
                className={cn(
                  "text-5xl font-bold font-mono",
                  "bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent",
                )}
              >
                {winner.totalScore.toLocaleString()}
              </span>
              <span className="text-xs text-[#8A8F98] mt-1">pts</span>
            </div>
          </div>
        </SpotlightCard>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Podium                                                               */}
      {/* ------------------------------------------------------------------ */}
      {showPodium && (
        <div className="grid grid-cols-3 gap-3 items-end">
          {/* 2nd place */}
          <SpotlightCard className="p-5">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="relative">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-white/[0.10]">
                  {podiumSecond.userImage ? (
                    <ImageWithFallback
                      src={podiumSecond.userImage}
                      alt={podiumSecond.userName ?? "Player"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/[0.06] flex items-center justify-center text-sm font-bold text-[#8A8F98]">
                      {initials(podiumSecond.userName)}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-[10px] font-bold text-[#050506]">
                  2
                </div>
              </div>
              <p className="text-sm font-medium text-[#EDEDEF] truncate w-full">
                {podiumSecond.userName ?? "Player"}
              </p>
              <p className="text-lg font-bold font-mono text-[#EDEDEF]">
                {podiumSecond.totalScore.toLocaleString()}
              </p>
              <p className="text-xs text-[#8A8F98]">
                &minus;{(leaderScore - podiumSecond.totalScore).toLocaleString()} pts
              </p>
            </div>
          </SpotlightCard>

          {/* 1st place */}
          <SpotlightCard className="p-6 border-yellow-500/[0.15]">
            {/* Ambient yellow blob */}
            <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-yellow-500/10 blur-[60px]" />
            <div className="relative flex flex-col items-center gap-2 text-center">
              <Crown className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]" />
              <div className="relative">
                <div
                  className={cn(
                    "w-16 h-16 rounded-full overflow-hidden",
                    "border-2 border-yellow-500/40",
                    "shadow-[0_0_0_4px_rgba(234,179,8,0.08)]",
                  )}
                >
                  {podiumFirst.userImage ? (
                    <ImageWithFallback
                      src={podiumFirst.userImage}
                      alt={podiumFirst.userName ?? "Champion"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-yellow-500/10 flex items-center justify-center text-sm font-bold text-yellow-400">
                      {initials(podiumFirst.userName)}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs font-mono tracking-widest uppercase text-yellow-400/80">
                Champion
              </p>
              <p className="text-sm font-semibold text-[#EDEDEF] truncate w-full">
                {podiumFirst.userName ?? "Player"}
              </p>
              <p
                className={cn(
                  "text-2xl font-bold font-mono",
                  "bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent",
                )}
              >
                {podiumFirst.totalScore.toLocaleString()}
              </p>
            </div>
          </SpotlightCard>

          {/* 3rd place */}
          <SpotlightCard className="p-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/[0.10]">
                  {podiumThird.userImage ? (
                    <ImageWithFallback
                      src={podiumThird.userImage}
                      alt={podiumThird.userName ?? "Player"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/[0.06] flex items-center justify-center text-sm font-bold text-[#8A8F98]">
                      {initials(podiumThird.userName)}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-[10px] font-bold text-white">
                  3
                </div>
              </div>
              <p className="text-sm font-medium text-[#EDEDEF] truncate w-full">
                {podiumThird.userName ?? "Player"}
              </p>
              <p className="text-base font-bold font-mono text-[#EDEDEF]">
                {podiumThird.totalScore.toLocaleString()}
              </p>
              <p className="text-xs text-[#8A8F98]">
                &minus;{(leaderScore - podiumThird.totalScore).toLocaleString()} pts
              </p>
            </div>
          </SpotlightCard>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Full Standings                                                        */}
      {/* ------------------------------------------------------------------ */}
      <SpotlightCard className="p-6">
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute -top-16 -left-16 w-64 h-64 rounded-full bg-[#5E6AD2]/10 blur-[80px]" />
        <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-indigo-500/[0.06] blur-[80px]" />

        <div className="relative">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-4 h-4 text-[#5E6AD2]" />
            </div>
            <h3
              className={cn(
                "text-lg font-semibold tracking-tight",
                "bg-gradient-to-b from-[#EDEDEF] to-[#EDEDEF]/70 bg-clip-text text-transparent",
              )}
            >
              Final Standings
            </h3>
          </div>

          {participants.length === 0 ? (
            <div className="py-12 text-center">
              <Trophy className="w-12 h-12 text-[#8A8F98]/30 mx-auto mb-3" />
              <p className="text-sm text-[#8A8F98]">No participants in this draft yet.</p>
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
                        ? "bg-[#5E6AD2]/[0.06] border border-[#5E6AD2]/10"
                        : isYou
                          ? "bg-[#5E6AD2]/[0.04] border border-[#5E6AD2]/[0.08]"
                          : "hover:bg-white/[0.04] border border-transparent",
                    )}
                  >
                    <RankBadge rank={participant.rank} />

                    <div className="w-9 h-9 rounded-full overflow-hidden border border-white/[0.10] flex-shrink-0">
                      {participant.userImage ? (
                        <ImageWithFallback
                          src={participant.userImage}
                          alt={participant.userName ?? "Player"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/[0.06] flex items-center justify-center text-xs font-bold text-[#8A8F98]">
                          {initials(participant.userName)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-[#EDEDEF] truncate">
                          {participant.userName ?? "Unknown Player"}
                        </span>
                        {isYou && (
                          <span className="text-xs rounded-full border border-[#5E6AD2]/30 bg-[#5E6AD2]/10 text-[#5E6AD2] px-2 py-0.5">
                            You
                          </span>
                        )}
                        {participant.isHost && (
                          <Crown className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[#8A8F98] mt-0.5">
                        {participant.picks.length} picks drafted
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      {isLeader ? (
                        <span
                          className={cn(
                            "text-xl font-semibold font-mono",
                            "bg-gradient-to-r from-[#5E6AD2] to-indigo-400 bg-clip-text text-transparent",
                          )}
                        >
                          {participant.totalScore.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-xl font-semibold font-mono text-[#EDEDEF]">
                          {participant.totalScore.toLocaleString()}
                        </span>
                      )}
                      <p className="text-xs mt-0.5">
                        {isLeader ? (
                          <span className="text-[#5E6AD2]">Leading</span>
                        ) : (
                          <span className="text-[#8A8F98]">
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
      </SpotlightCard>

      {/* ------------------------------------------------------------------ */}
      {/* Pick Breakdown                                                        */}
      {/* ------------------------------------------------------------------ */}
      {participants.length > 0 && (
        <SpotlightCard className="p-6">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-[#5E6AD2]" />
            </div>
            <h3
              className={cn(
                "text-lg font-semibold tracking-tight",
                "bg-gradient-to-b from-[#EDEDEF] to-[#EDEDEF]/70 bg-clip-text text-transparent",
              )}
            >
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
                      ? "bg-[#5E6AD2] text-white shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3)]"
                      : "bg-white/[0.04] border border-white/[0.06] text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.08]",
                  )}
                >
                  <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                    {participant.userImage ? (
                      <ImageWithFallback
                        src={participant.userImage}
                        alt={participant.userName ?? "Player"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={cn(
                          "w-full h-full flex items-center justify-center text-[10px] font-bold",
                          isActive ? "bg-white/20 text-white" : "bg-white/[0.06] text-[#8A8F98]",
                        )}
                      >
                        {initials(participant.userName)}
                      </div>
                    )}
                  </div>
                  <span>{isYou ? "You" : (participant.userName ?? "Player")}</span>
                  <span
                    className={cn(
                      "font-mono text-xs",
                      isActive ? "text-white/70" : "text-[#8A8F98]/70",
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
                <div
                  className={cn(
                    "rounded-2xl border border-dashed border-white/[0.06]",
                    "p-12 text-center",
                  )}
                >
                  <p className="text-sm text-[#8A8F98]">No picks made yet.</p>
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
        </SpotlightCard>
      )}
    </div>
  );
}
