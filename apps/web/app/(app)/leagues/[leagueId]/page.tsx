import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DomainError } from "@fantasy-madness/domain";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Crown,
  Shield,
  Trophy,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { requireUserId } from "@/server/auth/guards";
import { getLeagueLeaderboard, getLeagueRoomState } from "@/server/dal";
import { cn } from "@/lib/utils";
import { SportCard } from "@/components/shared/SportCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StatBlock } from "@/components/shared/StatBlock";

function initialsFromName(name: string | null): string {
  if (!name) return "PL";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function RankBadge({ rank }: { rank: number }) {
  const base =
    "w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0";
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
  return <div className={cn(base, "bg-secondary text-muted-foreground")}>{rank}</div>;
}

function statusToBadge(status: string): "open" | "locked" | "complete" {
  if (status === "OPEN") return "open";
  if (status === "LOCKED") return "locked";
  return "complete";
}

export default async function LeagueDetailsPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  const userId = await requireUserId();

  try {
    const [roomState, leaderboard] = await Promise.all([
      getLeagueRoomState({ leagueId, userId }),
      getLeagueLeaderboard({ leagueId }),
    ]);

    const myParticipant = roomState.participants.find(
      (p) => p.oduserId === userId
    );
    const myPicks = myParticipant?.picks ?? [];
    const readyCount = roomState.participants.filter(
      (p) => p.hasCompletedPicks
    ).length;

    return (
      <div className="space-y-6">
        {/* Back link */}
        <Link
          href="/leagues"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Leagues
        </Link>

        {/* Header strip */}
        <div className="bg-card border border-border rounded-lg px-5 sm:px-7 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-foreground">
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

            <div className="flex items-center gap-5 sm:gap-8">
              <StatBlock
                value={`${readyCount}/${roomState.participants.length}`}
                label="Ready"
              />
              <div className="w-px h-8 bg-border" />
              <StatBlock
                value={roomState.participants.length.toString()}
                label="Players"
              />
              {roomState.status === "OPEN" && (
                <>
                  <div className="w-px h-8 bg-border" />
                  <Link
                    href={`/leagues/${leagueId}/picks`}
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium text-white bg-[#F59E0B] hover:bg-[#F59E0B]/90 transition-colors duration-150"
                  >
                    {myPicks.length === 0 ? "Make Picks" : "Edit Picks"}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Participants */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <Users className="w-4 h-4 text-[#F59E0B]" />
                <h2 className="text-sm font-semibold text-foreground font-display uppercase tracking-wide">
                  League Participants
                </h2>
                <span className="bg-secondary/50 text-muted-foreground rounded-full px-2 py-0.5 text-xs font-mono">
                  {roomState.participants.length}
                </span>
              </div>

              <div className="bg-card border border-border rounded-lg">
                <div className="divide-y divide-border">
                  {roomState.participants.map((participant) => {
                    const isMe = participant.oduserId === userId;

                    return (
                      <div
                        key={participant.oduserId}
                        className={cn(
                          "flex items-center gap-3 px-5 py-3.5 transition-colors",
                          isMe && "bg-[#F59E0B]/5"
                        )}
                      >
                        <Avatar className="w-9 h-9 border border-border/70 flex-shrink-0">
                          <AvatarImage
                            src={participant.userImage ?? undefined}
                            alt={participant.userName ?? "Player"}
                          />
                          <AvatarFallback className="text-xs">
                            {initialsFromName(participant.userName)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {participant.userName ?? "Unknown Player"}
                            {isMe && (
                              <span className="text-muted-foreground font-normal">
                                {" "}
                                (You)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {participant.picks.length}/8 picks made
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {participant.isHost && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30">
                              <Crown className="w-3 h-3" />
                              Host
                            </span>
                          )}
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border",
                              participant.hasCompletedPicks
                                ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
                                : "bg-[#D29922]/15 text-[#D29922] border-[#D29922]/30"
                            )}
                          >
                            {participant.hasCompletedPicks
                              ? "Ready"
                              : "Pending"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* My Picks */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-[#F59E0B]" />
                  <h2 className="text-sm font-semibold text-foreground font-display uppercase tracking-wide">
                    My Picks
                  </h2>
                </div>
                {myPicks.length > 0 && roomState.status === "OPEN" && (
                  <Link
                    href={`/leagues/${leagueId}/picks`}
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border bg-secondary hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-200"
                  >
                    Edit picks
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {myPicks.length === 0 ? (
                <SportCard accent="amber">
                  <div className="p-10 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center mb-4">
                      <Shield className="w-6 h-6 text-[#F59E0B]" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-2">
                      No picks yet
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
                      Select 8 bracket slots for this league.
                    </p>
                    {roomState.status === "OPEN" && (
                      <Link
                        href={`/leagues/${leagueId}/picks`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-[#F59E0B] text-white hover:bg-[#F59E0B]/90 transition-colors"
                      >
                        Make your picks
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </SportCard>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {myPicks.map((pick, index) => (
                    <div
                      key={pick.slotId}
                      className="relative overflow-hidden rounded-lg border border-l-2 border-l-[#F59E0B] border-t-border border-r-border border-b-border bg-card"
                    >
                      <div className="p-3 flex flex-col h-full min-h-[100px]">
                        <div className="flex items-start justify-between mb-2">
                          <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 flex-shrink-0">
                            {pick.seed}
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground tracking-widest">
                            #{index + 1}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                          {pick.displayName}
                        </p>
                        <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mt-1">
                          Q{pick.quadrant}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar: Leaderboard */}
          <div>
            <SportCard>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
                      Leaderboard
                    </span>
                  </div>
                </div>

                {leaderboard.participants.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    No standings yet
                  </p>
                ) : (
                  <div className="space-y-1">
                    {leaderboard.participants.map((participant) => {
                      const isMe = participant.userId === userId;

                      return (
                        <div
                          key={participant.userId}
                          className={cn(
                            "flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors",
                            isMe
                              ? "bg-[#F59E0B]/10 border border-[#F59E0B]/20"
                              : participant.rank <= 3
                                ? "bg-primary/5 border border-primary/10"
                                : "hover:bg-accent border border-transparent"
                          )}
                        >
                          <RankBadge rank={participant.rank} />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-foreground truncate block">
                              {participant.userName ?? "Unknown"}
                              {isMe && " (You)"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {participant.hasCompletedPicks
                                ? "8/8 picks"
                                : `${participant.picks.length}/8 picks`}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
                            {participant.totalScore.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Your position highlight */}
                {myParticipant && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md bg-[#F59E0B]/10 border border-[#F59E0B]/20">
                      <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 flex-shrink-0">
                        {leaderboard.participants.find(
                          (p) => p.userId === userId
                        )?.rank ?? "—"}
                      </div>
                      <span className="text-sm text-foreground flex-1">
                        You
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {leaderboard.participants
                          .find((p) => p.userId === userId)
                          ?.totalScore.toLocaleString() ?? "0"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </SportCard>

            {/* Invite code card */}
            {roomState.inviteCode && roomState.isHost && (
              <SportCard className="mt-4">
                <div className="p-4">
                  <span className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
                    Invite Code
                  </span>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 rounded-md bg-secondary border border-border text-sm font-mono text-foreground">
                      {roomState.inviteCode}
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Share this code to invite players to your league.
                  </p>
                </div>
              </SportCard>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof DomainError && error.code === "NOT_FOUND") {
      notFound();
    }

    if (error instanceof DomainError && error.code === "UNAUTHORIZED") {
      redirect("/leagues");
    }

    throw error;
  }
}
