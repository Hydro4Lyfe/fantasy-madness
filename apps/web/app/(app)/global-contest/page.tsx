import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUserId } from "@/server/auth/guards";
import { getGlobalContestOverview } from "@/server/dal";
import {
  Calendar,
  CheckCircle,
  Clock,
  Crown,
  Globe,
  Star,
  Trophy,
  Users,
} from "lucide-react";

function formatShortDate(value: string | null): string {
  if (!value) return "TBD";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default async function GlobalContestPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const params = await searchParams;
  const isPreviewEmpty =
    process.env.NODE_ENV !== "production" && params.preview === "empty";
  const userId = await requireUserId();
  const data = isPreviewEmpty ? null : await getGlobalContestOverview({ userId });

  if (!data) {
    return (
      <Card className="p-10 text-center">
        <h1 className="text-2xl font-bold mb-2">Global Championship</h1>
        <p className="text-muted-foreground">
          No global contest is available right now. Check back soon.
        </p>
        {process.env.NODE_ENV !== "production" && (
          <p className="text-xs text-muted-foreground mt-2">
            Preview mode is available at <code>/global-contest?preview=empty</code>
          </p>
        )}
      </Card>
    );
  }

  const entryDeadline = formatShortDate(data.lockAt ?? data.tournamentStartAt);
  const tournamentStart = formatShortDate(data.tournamentStartAt);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl sm:text-4xl font-bold">Global Championship</h1>
              <Badge
                className={
                  data.isOpen
                    ? "bg-green-500/10 text-green-400 border-green-500/30"
                    : "bg-yellow-500/10 text-yellow-300 border-yellow-500/30"
                }
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                {data.isOpen ? "Open" : "Locked"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Compete against players worldwide in {data.tournamentName} {data.seasonYear}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-muted-foreground">Total Entries</span>
            </div>
            <p className="text-2xl font-bold">{data.totalEntries.toLocaleString()}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-muted-foreground">Entry Deadline</span>
            </div>
            <p className="text-2xl font-bold">{entryDeadline}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-muted-foreground">Tournament Start</span>
            </div>
            <p className="text-2xl font-bold">{tournamentStart}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-muted-foreground">Entry Fee</span>
            </div>
            <p className="text-2xl font-bold text-green-400">Free</p>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">About the Global Championship</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Submit your 8-slot bracket before the tournament starts. You can edit
                picks any time while the contest is open.
              </p>
              <p>
                Points are awarded for each correct pick as the tournament progresses.
                Track your ranking in real-time on the global leaderboard.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Top 10 Leaders</h2>
              <Button variant="outline" size="sm" asChild>
                <Link href="/leaderboards">View Full Leaderboard</Link>
              </Button>
            </div>

            {data.topPlayers.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                Leaderboard will appear after players submit picks.
              </div>
            ) : (
              <div className="space-y-2">
                {data.topPlayers.map((player) => (
                  <div
                    key={`${player.rank}-${player.name}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                        player.rank === 1
                          ? "bg-gradient-to-br from-yellow-500 to-yellow-600 text-white"
                          : player.rank === 2
                            ? "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900"
                            : player.rank === 3
                              ? "bg-gradient-to-br from-orange-600 to-orange-700 text-white"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {player.rank}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{player.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-orange-400" />
                      <span className="font-bold text-orange-400">
                        {player.points.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-orange-500/10 via-card to-card border-orange-500/30">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">Ready to Compete?</h3>
                <p className="text-sm text-muted-foreground">
                  {data.isOpen
                    ? `Submit or edit your bracket before ${entryDeadline}`
                    : "Picks are locked for this contest"}
                </p>
              </div>

              {data.isOpen ? (
                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg shadow-orange-500/30 h-12"
                  asChild
                >
                  <Link href="/global-contest/picks">
                    {data.hasEntered ? "Edit My Bracket" : "Create My Bracket"}
                  </Link>
                </Button>
              ) : (
                <Button className="w-full h-12" disabled>
                  Contest Locked
                </Button>
              )}

              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Entry Status</span>
                  <Badge
                    variant="outline"
                    className={
                      data.hasEntered
                        ? "border-green-500/30 text-green-400"
                        : "border-orange-500/30 text-orange-400"
                    }
                  >
                    {data.hasEntered ? "Entered" : "Not Entered"}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-orange-400" />
              <h3 className="font-semibold">Your Ranking</h3>
            </div>

            <div className="text-center p-6 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-2">Current Rank</p>
              <p className="text-5xl font-bold text-orange-400 mb-2">
                {data.yourRank ? `#${data.yourRank}` : "-"}
              </p>
              <p className="text-sm text-muted-foreground">
                {data.hasEntered
                  ? `${data.yourPoints.toLocaleString()} total points`
                  : "Submit your bracket to start competing"}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
