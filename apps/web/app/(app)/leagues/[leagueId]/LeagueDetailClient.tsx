"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Crown,
  Shield,
  Trophy,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { TeamLogo } from "@/components/team/TeamLogo";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type {
  LeagueRoomStateDTO,
  LeagueLeaderboardDTO,
} from "@/server/dal";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = "picks" | "participants" | "leaderboard";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "picks", label: "My Picks", icon: <Shield className="w-4 h-4" /> },
  {
    key: "participants",
    label: "Participants",
    icon: <Users className="w-4 h-4" />,
  },
  {
    key: "leaderboard",
    label: "Leaderboard",
    icon: <Trophy className="w-4 h-4" />,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function initialsFromName(name: string | null): string {
  if (!name) return "PL";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusToBadge(status: string): "open" | "locked" | "complete" {
  if (status === "OPEN") return "open";
  if (status === "LOCKED") return "locked";
  return "complete";
}

const QUADRANT_NAMES: Record<number, string> = {
  1: "East",
  2: "West",
  3: "South",
  4: "Midwest",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RankBadge({ rank }: { rank: number }) {
  const base =
    "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0";
  if (rank === 1)
    return (
      <div
        className={cn(
          base,
          "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black"
        )}
      >
        1
      </div>
    );
  if (rank === 2)
    return (
      <div
        className={cn(
          base,
          "bg-gradient-to-br from-slate-300 to-slate-400 text-black"
        )}
      >
        2
      </div>
    );
  if (rank === 3)
    return (
      <div
        className={cn(
          base,
          "bg-gradient-to-br from-amber-600 to-amber-700 text-white"
        )}
      >
        3
      </div>
    );
  return (
    <div className={cn(base, "bg-secondary text-muted-foreground")}>{rank}</div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LeagueDetailClientProps {
  roomState: LeagueRoomStateDTO;
  leaderboard: LeagueLeaderboardDTO;
  userId: string;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function LeagueDetailClient({
  roomState,
  leaderboard,
  userId,
}: LeagueDetailClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("picks");
  const [copied, setCopied] = useState(false);
  const tabRefs = useRef<Map<Tab, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const myParticipant = roomState.participants.find(
    (p) => p.oduserId === userId
  );
  const myPicks = myParticipant?.picks ?? [];
  const readyCount = roomState.participants.filter(
    (p) => p.hasCompletedPicks
  ).length;

  // Map slotId → logo team IDs from the full slot list
  const slotLogoMap = useMemo(
    () =>
      new Map(
        roomState.allSlots.map((s) => [s.slotId, s.logoTeamIds])
      ),
    [roomState.allSlots]
  );

  // Sliding indicator position
  const updateIndicator = useCallback(() => {
    const el = tabRefs.current.get(activeTab);
    if (el) {
      const container = el.parentElement;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        setIndicator({
          left: elRect.left - containerRect.left,
          width: elRect.width,
        });
      }
    }
  }, [activeTab]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  const copyInviteCode = () => {
    if (!roomState.inviteCode) return;
    navigator.clipboard.writeText(roomState.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------------------- */}
      {/* Header                                                           */}
      {/* ---------------------------------------------------------------- */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B]" />

        <div className="px-5 sm:px-7 py-5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-1.5">
                <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-foreground truncate">
                  {roomState.name}
                </h1>
                <StatusBadge status={statusToBadge(roomState.status)} />
              </div>
              <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                {roomState.tournamentName} ·{" "}
                {roomState.participants.length}
                {roomState.maxParticipants
                  ? `/${roomState.maxParticipants}`
                  : ""}{" "}
                participants
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Stats */}
              <div className="flex items-center gap-4 mr-2">
                <div className="text-center">
                  <p className="text-lg font-bold font-mono text-foreground leading-none">
                    {readyCount}/{roomState.participants.length}
                  </p>
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mt-0.5">
                    Ready
                  </p>
                </div>
              </div>

              {/* Invite code pill */}
              {roomState.inviteCode && roomState.isHost && (
                <button
                  onClick={copyInviteCode}
                  className={cn(
                    "inline-flex items-center gap-2 h-9 px-3 rounded-lg text-sm border transition-all duration-200",
                    copied
                      ? "border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981]"
                      : "border-border bg-secondary hover:bg-accent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {copied ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <code className="font-mono text-xs">
                    {copied ? "Copied!" : roomState.inviteCode}
                  </code>
                </button>
              )}

              {/* Make/Edit Picks CTA */}
              {roomState.isPicksOpen && (
                <Link
                  href={`/leagues/${roomState.id}/picks`}
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium text-white bg-[#F59E0B] hover:bg-[#F59E0B]/90 transition-colors duration-150 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                >
                  {myPicks.length === 0 ? "Make Picks" : "Edit Picks"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Horizontal Tab Selector                                          */}
      {/* ---------------------------------------------------------------- */}
      <div className="relative">
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1.5 relative">
          {/* Sliding background indicator */}
          <div
            className="absolute top-1.5 h-[calc(100%-12px)] rounded-md bg-[#F59E0B]/15 border border-[#F59E0B]/25 transition-all duration-300 ease-out"
            style={{ left: indicator.left + 6, width: indicator.width }}
          />

          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                ref={(el) => {
                  if (el) tabRefs.current.set(tab.key, el);
                }}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "relative z-10 flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "text-[#F59E0B]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "transition-colors duration-200",
                    isActive ? "text-[#F59E0B]" : "text-muted-foreground"
                  )}
                >
                  {tab.icon}
                </span>
                <span className="font-display uppercase tracking-wide text-xs sm:text-sm">
                  {tab.label}
                </span>
                {/* Count badges */}
                {tab.key === "picks" && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-mono font-bold leading-none transition-colors duration-200",
                      isActive
                        ? "bg-[#F59E0B]/20 text-[#F59E0B]"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {myPicks.length}/8
                  </span>
                )}
                {tab.key === "participants" && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-mono font-bold leading-none transition-colors duration-200",
                      isActive
                        ? "bg-[#F59E0B]/20 text-[#F59E0B]"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {roomState.participants.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Tab Content                                                       */}
      {/* ---------------------------------------------------------------- */}

      {/* MY PICKS */}
      {activeTab === "picks" && (
        <div className="animate-in fade-in duration-200">
          {myPicks.length === 0 ? (
            <div className="bg-card border border-border rounded-lg">
              <div className="py-16 px-8 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center mb-5">
                  <Shield className="w-7 h-7 text-[#F59E0B]" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 font-display uppercase tracking-wide">
                  No picks yet
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm leading-relaxed">
                  Select 8 bracket slots for this league. Higher seeds earn more
                  points per win — reward yourself for picking upsets.
                </p>
                {roomState.isPicksOpen && (
                  <Link
                    href={`/leagues/${roomState.id}/picks`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium bg-[#F59E0B] text-white hover:bg-[#F59E0B]/90 transition-colors shadow-[0_0_16px_rgba(245,158,11,0.25)]"
                  >
                    Make your picks
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pick summary bar */}
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                  {myPicks.length === 8
                    ? "All picks locked in"
                    : `${myPicks.length} of 8 picks made`}
                </p>
                {roomState.isPicksOpen && (
                  <Link
                    href={`/leagues/${roomState.id}/picks`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#F59E0B] hover:text-[#FBBF24] transition-colors"
                  >
                    Edit picks
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {/* Picks grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {myPicks.map((pick, index) => {
                  const leaderboardMe = leaderboard.participants.find(
                    (p) => p.userId === userId
                  );
                  const leaderboardPick = leaderboardMe?.picks.find(
                    (p) => p.slotId === pick.slotId
                  );
                  const wins = leaderboardPick?.wins ?? 0;
                  const pickScore = leaderboardPick?.pickScore ?? 0;
                  const logoTeamIds = slotLogoMap.get(pick.slotId) ?? [];

                  return (
                    <div
                      key={pick.slotId}
                      className={cn(
                        "group relative rounded-lg border overflow-hidden transition-all duration-200",
                        "hover:border-[#F59E0B]/30 hover:shadow-[0_0_12px_rgba(245,158,11,0.06)]",
                        pickScore > 0
                          ? "border-[#F59E0B]/20 bg-[#F59E0B]/[0.03]"
                          : "border-border bg-card"
                      )}
                    >
                      {/* Top accent line */}
                      <div className="h-0.5 bg-gradient-to-r from-transparent via-[#F59E0B]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/25 flex-shrink-0">
                            {pick.seed}
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground/60 tracking-widest">
                            #{index + 1}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 mb-1">
                          <TeamLogo
                            teamId={logoTeamIds[0] ?? null}
                            label={pick.displayName}
                            className="w-9 h-9 flex-shrink-0 rounded-md border border-border bg-secondary/50"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                              {pick.displayName}
                            </p>
                            <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                              {QUADRANT_NAMES[pick.quadrant] ?? `Q${pick.quadrant}`}
                            </p>
                          </div>
                        </div>

                        {/* Score line */}
                        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">
                            {pick.seed} seed &times; {wins} win{wins !== 1 ? "s" : ""}
                          </span>
                          <span
                            className={cn(
                              "text-sm font-bold font-mono",
                              pickScore > 0
                                ? "text-[#F59E0B]"
                                : "text-muted-foreground/40"
                            )}
                          >
                            {pickScore}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total score */}
              {myPicks.length > 0 && (
                <div className="bg-card border border-border rounded-lg px-5 py-4 flex items-center justify-between">
                  <span className="text-sm font-display uppercase tracking-wide text-muted-foreground font-semibold">
                    Total Score
                  </span>
                  <span className="text-2xl font-bold font-mono text-[#F59E0B]">
                    {leaderboard.participants
                      .find((p) => p.userId === userId)
                      ?.totalScore.toLocaleString() ?? "0"}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PARTICIPANTS */}
      {activeTab === "participants" && (
        <div className="animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="divide-y divide-border">
              {roomState.participants.map((participant) => {
                const isMe = participant.oduserId === userId;
                const leaderboardEntry = leaderboard.participants.find(
                  (p) => p.userId === participant.oduserId
                );

                return (
                  <div
                    key={participant.oduserId}
                    className={cn(
                      "flex items-center gap-4 px-5 py-4 transition-colors duration-150",
                      isMe && "bg-[#F59E0B]/[0.04]"
                    )}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-border/70 flex-shrink-0 bg-secondary">
                      {participant.userImage ? (
                        <img
                          src={participant.userImage}
                          alt={participant.userName ?? "Player"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {initialsFromName(participant.userName)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {participant.userName ?? "Unknown Player"}
                        </p>
                        {isMe && (
                          <span className="text-[10px] font-bold tracking-widest uppercase text-[#F59E0B] bg-[#F59E0B]/10 px-1.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                        {participant.isHost && (
                          <Crown className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {participant.picks.length}/8 picks ·{" "}
                        {leaderboardEntry?.totalScore.toLocaleString() ?? "0"}{" "}
                        pts
                      </p>
                    </div>

                    {/* Status badges */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider border",
                          participant.hasCompletedPicks
                            ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/25"
                            : "bg-[#D29922]/10 text-[#D29922] border-[#D29922]/25"
                        )}
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full flex-shrink-0",
                            participant.hasCompletedPicks
                              ? "bg-[#10B981]"
                              : "bg-[#D29922]"
                          )}
                        />
                        {participant.hasCompletedPicks ? "Ready" : "Pending"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* LEADERBOARD */}
      {activeTab === "leaderboard" && (
        <div className="animate-in fade-in duration-200">
          {leaderboard.participants.length === 0 ? (
            <div className="bg-card border border-border rounded-lg">
              <div className="py-16 px-8 flex flex-col items-center text-center">
                <Trophy className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <h3 className="text-base font-semibold text-foreground mb-1">
                  No standings yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Standings will appear once the tournament begins and scores
                  are calculated.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {/* Leaderboard header */}
              <div className="px-5 py-3 border-b border-border bg-secondary/30">
                <div className="flex items-center gap-8 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  <span className="w-8 text-center">#</span>
                  <span className="flex-1">Player</span>
                  <span className="w-16 text-right">Picks</span>
                  <span className="w-20 text-right">Score</span>
                </div>
              </div>

              <div className="divide-y divide-border/50">
                {leaderboard.participants.map((participant) => {
                  const isMe = participant.userId === userId;
                  const isLeader = participant.rank === 1;
                  const leaderScore =
                    leaderboard.participants[0]?.totalScore ?? 0;
                  const delta = leaderScore - participant.totalScore;

                  return (
                    <div
                      key={participant.userId}
                      className={cn(
                        "flex items-center gap-8 px-5 py-3.5 transition-colors duration-150",
                        isMe
                          ? "bg-[#F59E0B]/[0.06]"
                          : isLeader
                            ? "bg-[#F59E0B]/[0.03]"
                            : "hover:bg-accent/50"
                      )}
                    >
                      <RankBadge rank={participant.rank} />

                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-border/70 flex-shrink-0 bg-secondary">
                          {participant.userImage ? (
                            <img
                              src={participant.userImage}
                              alt={participant.userName ?? "Player"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                              {initialsFromName(participant.userName)}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground truncate">
                              {participant.userName ?? "Unknown"}
                            </span>
                            {isMe && (
                              <span className="text-[10px] font-bold tracking-widest uppercase text-[#F59E0B] bg-[#F59E0B]/10 px-1.5 py-0.5 rounded">
                                You
                              </span>
                            )}
                            {participant.isHost && (
                              <Crown className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                            )}
                          </div>
                          {!isLeader && delta > 0 && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              &minus;{delta.toLocaleString()} pts behind
                            </p>
                          )}
                          {isLeader && (
                            <p className="text-[10px] text-[#F59E0B] mt-0.5">
                              Leading
                            </p>
                          )}
                        </div>
                      </div>

                      <span className="w-16 text-right text-xs font-mono text-muted-foreground">
                        {participant.picks.length}/8
                      </span>

                      <span
                        className={cn(
                          "w-20 text-right text-base font-bold font-mono",
                          isLeader
                            ? "text-[#F59E0B]"
                            : "text-foreground"
                        )}
                      >
                        {participant.totalScore.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Your position footer */}
              {myParticipant && (
                <div className="px-5 py-3 border-t border-border bg-[#F59E0B]/[0.05]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Your position:
                      </span>
                      <span className="text-sm font-bold text-[#F59E0B]">
                        #{leaderboard.participants.find(
                          (p) => p.userId === userId
                        )?.rank ?? "—"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        of {leaderboard.participants.length}
                      </span>
                    </div>
                    <span className="text-sm font-bold font-mono text-[#F59E0B]">
                      {leaderboard.participants
                        .find((p) => p.userId === userId)
                        ?.totalScore.toLocaleString() ?? "0"}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        pts
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
