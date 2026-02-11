import { notFound } from "next/navigation";
import { DomainError } from "@fantasy-madness/domain";
import { Crown, Medal, Trophy, Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireUserId } from "@/server/auth/guards";
import { getDraftResults } from "@/server/dal";

function initials(name: string | null): string {
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
  if (status === "DRAFTING") return "Drafting";
  if (status === "LIVE") return "Live";
  if (status === "LOCKED") return "Locked";
  if (status === "COMPLETE") return "Complete";
  return status;
}

function statusBadgeClass(status: string): string {
  if (status === "OPEN") {
    return "bg-blue-500/10 text-blue-300 border-blue-500/30";
  }
  if (status === "DRAFTING") {
    return "bg-orange-500/10 text-orange-400 border-orange-500/30";
  }
  if (status === "LIVE") {
    return "bg-green-500/10 text-green-400 border-green-500/30";
  }
  if (status === "LOCKED") {
    return "bg-yellow-500/10 text-yellow-300 border-yellow-500/30";
  }
  if (status === "COMPLETE") {
    return "bg-slate-500/10 text-slate-300 border-slate-500/30";
  }
  return "bg-slate-500/10 text-slate-300 border-slate-500/30";
}

export default async function DraftResultsPage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;
  const userId = await requireUserId();

  try {
    const results = await getDraftResults({ draftId });

    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-foreground">Draft Results</h1>
              <Badge className={statusBadgeClass(results.status)}>
                {statusLabel(results.status)}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {results.name} • {results.tournamentName} {results.seasonYear}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Card className="px-4 py-3 bg-card/70 border-border text-center min-w-[92px]">
              <p className="text-xs text-muted-foreground">Players</p>
              <p className="text-lg font-bold text-foreground">{results.participants.length}</p>
            </Card>
            <Card className="px-4 py-3 bg-card/70 border-border text-center min-w-[92px]">
              <p className="text-xs text-muted-foreground">Roster</p>
              <p className="text-lg font-bold text-foreground">{results.rosterSize}</p>
            </Card>
            <Card className="px-4 py-3 bg-card/70 border-border text-center min-w-[92px]">
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="text-lg font-bold text-foreground capitalize">
                {results.draftType.toLowerCase()}
              </p>
            </Card>
          </div>
        </div>

        <Card className="p-6 bg-card/70 border-border space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-orange-400" />
            <h2 className="text-xl font-bold text-foreground">Leaderboard</h2>
          </div>

          {results.participants.length === 0 ? (
            <div className="p-8 rounded-lg border border-dashed border-border text-center text-muted-foreground">
              No participants in this draft yet.
            </div>
          ) : (
            <div className="space-y-2">
              {results.participants.map((participant) => (
                <div
                  key={participant.userId}
                  className={`rounded-lg border p-4 flex items-center gap-3 ${
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

                  <Avatar className="w-10 h-10 border border-border/70">
                    <AvatarImage
                      src={participant.userImage ?? undefined}
                      alt={participant.userName ?? "Player"}
                    />
                    <AvatarFallback>{initials(participant.userName)}</AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {participant.userName ?? "Unknown Player"}
                      {participant.userId === userId ? " (You)" : ""}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {participant.isHost && (
                        <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                          <Crown className="w-3 h-3 mr-1" />
                          Host
                        </Badge>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {participant.picks.length}/{results.rosterSize} picks
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-bold text-orange-400">
                    {participant.totalScore.toLocaleString()} pts
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 bg-card/70 border-border space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-400" />
            <h2 className="text-xl font-bold text-foreground">Everyone's Picks</h2>
          </div>

          {results.participants.length === 0 ? (
            <div className="p-8 rounded-lg border border-dashed border-border text-center text-muted-foreground">
              Picks will appear once the draft starts.
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {results.participants.map((participant) => (
                <Card
                  key={participant.userId}
                  className={`p-4 border ${
                    participant.userId === userId
                      ? "border-orange-500/30 bg-orange-500/5"
                      : "border-border bg-background/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {participant.userName ?? "Unknown Player"}
                        {participant.userId === userId ? " (You)" : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Rank #{participant.rank} • {participant.totalScore.toLocaleString()} pts
                      </p>
                    </div>
                    {participant.isHost && (
                      <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                        Host
                      </Badge>
                    )}
                  </div>

                  {participant.picks.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground text-center">
                      No picks made yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {participant.picks.map((pick) => (
                        <div
                          key={`${participant.userId}-${pick.slotId}-${pick.overallPickNo}`}
                          className="rounded-lg border border-border bg-card/60 p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-foreground line-clamp-1">
                                {pick.teamName ?? "TBD"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Seed #{pick.seed} • Q{pick.quadrant} • Overall #{pick.overallPickNo}
                              </p>
                            </div>
                            {pick.isAutoPick && (
                              <Badge className="bg-yellow-500/10 text-yellow-300 border-yellow-500/30">
                                Auto
                              </Badge>
                            )}
                          </div>

                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <Badge variant="outline">Wins: {pick.wins}</Badge>
                            <Badge variant="outline">Score: {pick.pickScore}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  } catch (error) {
    if (error instanceof DomainError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }
}
