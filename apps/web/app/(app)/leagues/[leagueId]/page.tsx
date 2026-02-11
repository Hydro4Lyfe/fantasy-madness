import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DomainError } from "@fantasy-madness/domain";
import { Crown, Medal, Trophy, Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUserId } from "@/server/auth/guards";
import { getLeagueLeaderboard, getLeagueRoomState } from "@/server/dal";

function initialsFromName(name: string | null): string {
  if (!name) return "PL";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusLabel(status: string): string {
  if (status === "OPEN") return "Open";
  if (status === "LOCKED") return "Locked";
  if (status === "COMPLETE") return "Complete";
  return status;
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

    const myParticipant = roomState.participants.find((p) => p.oduserId === userId);
    const myPicks = myParticipant?.picks ?? [];

    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{roomState.name}</h1>
              <Badge
                className={
                  roomState.status === "OPEN"
                    ? "bg-green-500/10 text-green-400 border-green-500/30"
                    : roomState.status === "LOCKED"
                      ? "bg-yellow-500/10 text-yellow-300 border-yellow-500/30"
                      : "bg-slate-500/10 text-slate-300 border-slate-500/30"
                }
              >
                {statusLabel(roomState.status)}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {roomState.tournamentName} • {roomState.participants.length}
              {roomState.maxParticipants ? `/${roomState.maxParticipants}` : ""} participants
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/leagues">Back to Leagues</Link>
            </Button>
            <Button
              asChild
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Link href={`/leagues/${leagueId}/picks`}>
                {myPicks.length === 0 ? "Make My Picks" : "Edit My Picks"}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="p-6 xl:col-span-2 bg-card/70 border-border space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl font-bold text-foreground">League Participants</h2>
            </div>

            <div className="space-y-3">
              {roomState.participants.map((participant) => (
                <div
                  key={participant.oduserId}
                  className={`flex items-center justify-between gap-4 rounded-lg border p-4 ${
                    participant.oduserId === userId
                      ? "border-orange-500/30 bg-orange-500/5"
                      : "border-border bg-background/40"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-10 h-10 border border-border/70">
                      <AvatarImage src={participant.userImage ?? undefined} alt={participant.userName ?? "Player"} />
                      <AvatarFallback>
                        {initialsFromName(participant.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {participant.userName ?? "Unknown Player"}
                        {participant.oduserId === userId ? " (You)" : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {participant.picks.length}/8 picks made
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {participant.isHost && (
                      <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                        <Crown className="w-3 h-3 mr-1" />
                        Host
                      </Badge>
                    )}
                    <Badge
                      className={
                        participant.hasCompletedPicks
                          ? "bg-green-500/10 text-green-400 border-green-500/30"
                          : "bg-yellow-500/10 text-yellow-300 border-yellow-500/30"
                      }
                    >
                      {participant.hasCompletedPicks ? "Ready" : "Pending Picks"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-card/70 border-border space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl font-bold text-foreground">Leaderboard</h2>
            </div>

            {leaderboard.participants.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No standings yet.
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.participants.map((participant) => (
                  <div
                    key={participant.userId}
                    className={`flex items-center gap-3 rounded-lg border p-3 ${
                      participant.userId === userId
                        ? "border-orange-500/30 bg-orange-500/5"
                        : "border-border bg-background/40"
                    }`}
                  >
                    <div className="w-8 text-center">
                      {participant.rank <= 3 ? (
                        <Medal
                          className={`w-5 h-5 mx-auto ${
                            participant.rank === 1
                              ? "text-yellow-400"
                              : participant.rank === 2
                                ? "text-slate-300"
                                : "text-amber-600"
                          }`}
                        />
                      ) : (
                        <span className="text-sm font-semibold text-muted-foreground">
                          {participant.rank}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {participant.userName ?? "Unknown Player"}
                        {participant.userId === userId ? " (You)" : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {participant.hasCompletedPicks ? "8/8 picks" : `${participant.picks.length}/8 picks`}
                      </p>
                    </div>

                    <p className="text-sm font-bold text-orange-400">
                      {participant.totalScore.toLocaleString()} pts
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="p-6 bg-card/70 border-border space-y-4">
          <h2 className="text-xl font-bold text-foreground">My Picks</h2>

          {myPicks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-orange-500/30 bg-orange-500/5 p-8 text-center space-y-4">
              <p className="text-muted-foreground">You have not selected picks for this league yet.</p>
              <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
                <Link href={`/leagues/${leagueId}/picks`}>Make My Picks</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {myPicks.map((pick) => (
                  <div
                    key={pick.slotId}
                    className="rounded-lg border border-border bg-background/40 p-3"
                  >
                    <p className="text-xs text-muted-foreground mb-1">Pick #{pick.pickNo}</p>
                    <p className="text-sm font-semibold text-foreground line-clamp-2">
                      {pick.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Seed #{pick.seed} • Q{pick.quadrant}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button asChild variant="outline">
                  <Link href={`/leagues/${leagueId}/picks`}>Edit Picks</Link>
                </Button>
              </div>
            </>
          )}
        </Card>
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
