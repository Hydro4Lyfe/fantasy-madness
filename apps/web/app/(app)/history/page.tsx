import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Users,
  Target,
  Globe,
  Crown,
  Award,
  ChevronRight,
  Archive,
  Calendar,
  TrendingUp,
  Star,
} from "lucide-react";

export default function HistoryPage() {
  // TODO: Fetch historical data from DAL

  const mockHistoricalDrafts = [
    {
      id: "1",
      name: "Office Champions League",
      year: 2025,
      participants: 8,
      yourScore: 2456,
      winner: "Mike Johnson",
      winnerScore: 2891,
      yourRank: 2,
    },
    {
      id: "2",
      name: "Friends & Family Draft",
      year: 2025,
      participants: 8,
      yourScore: 2678,
      winner: "You",
      winnerScore: 2678,
      yourRank: 1,
    },
    {
      id: "3",
      name: "Weekend Warriors Draft",
      year: 2025,
      participants: 8,
      yourScore: 2234,
      winner: "Sarah Chen",
      winnerScore: 2567,
      yourRank: 4,
    },
  ];

  const mockHistoricalContests = [
    {
      id: "1",
      name: "College Alumni Tournament",
      year: 2025,
      participants: 100,
      yourScore: 2345,
      winner: "BracketKing2025",
      winnerScore: 2789,
      yourRank: 15,
    },
    {
      id: "2",
      name: "High Stakes Challenge",
      year: 2025,
      participants: 200,
      yourScore: 2123,
      winner: "MarchMadnessGuru",
      winnerScore: 2901,
      yourRank: 45,
    },
  ];

  const mockGlobalChampionship = {
    year: 2025,
    yourScore: 2347,
    yourRank: 1247,
    totalPlayers: 45892,
    champion: "UltimateBracketMaster",
    championScore: 3012,
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
          <Crown className="w-3 h-3 mr-1" />
          1st Place
        </Badge>
      );
    } else if (rank === 2) {
      return (
        <Badge className="bg-gray-400/10 text-gray-400 border-gray-400/30">
          <Award className="w-3 h-3 mr-1" />
          2nd Place
        </Badge>
      );
    } else if (rank === 3) {
      return (
        <Badge className="bg-orange-600/10 text-orange-600 border-orange-600/30">
          <Award className="w-3 h-3 mr-1" />
          3rd Place
        </Badge>
      );
    } else if (rank <= 10) {
      return (
        <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">
          Top 10
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-muted text-muted-foreground border-border">
          #{rank}
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
            <Archive className="w-5 h-5 text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold">History</h1>
        </div>
        <p className="text-muted-foreground">
          View your past performance and achievements
        </p>
      </div>

      {/* Global Championship Section */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-orange-400" />
          Global Championship 2025
        </h2>
        <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-card border-orange-500/30">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Rank</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-orange-400">
                  #{mockGlobalChampionship.yourRank}
                </p>
                <p className="text-sm text-muted-foreground">
                  of {mockGlobalChampionship.totalPlayers.toLocaleString()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Score</p>
              <p className="text-3xl font-bold">
                {mockGlobalChampionship.yourScore}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                2025 Champion
              </p>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <p className="text-lg font-semibold truncate">
                  {mockGlobalChampionship.champion}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Winning Score
              </p>
              <p className="text-3xl font-bold text-yellow-400">
                {mockGlobalChampionship.championScore}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Top{" "}
                {(
                  (mockGlobalChampionship.yourRank /
                    mockGlobalChampionship.totalPlayers) *
                  100
                ).toFixed(1)}
                % of all players
              </p>
              <div className="flex items-center gap-1 text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Great performance!</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Historical Drafts Section */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-orange-400" />
          Drafts - 2025 Season
        </h2>
        <div className="grid gap-4">
          {mockHistoricalDrafts.map((draft) => (
            <Card
              key={draft.id}
              className="p-6 hover:border-orange-500/50 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">{draft.name}</h3>
                    {getRankBadge(draft.yourRank)}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{draft.participants} players</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{draft.year}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Your Score</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {draft.yourScore}
                    </p>
                  </div>

                  <div className="h-12 w-px bg-border" />

                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Winner</p>
                    <p className="text-lg font-semibold">{draft.winner}</p>
                    <p className="text-sm text-yellow-400">
                      {draft.winnerScore} pts
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Historical Contests Section */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-orange-400" />
          Contests - 2025 Season
        </h2>
        <div className="grid gap-4">
          {mockHistoricalContests.map((contest) => (
            <Card
              key={contest.id}
              className="p-6 hover:border-orange-500/50 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">{contest.name}</h3>
                    {getRankBadge(contest.yourRank)}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{contest.participants} participants</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{contest.year}</span>
                    </div>
                    <span>
                      Top{" "}
                      {((contest.yourRank / contest.participants) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Your Score</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {contest.yourScore}
                    </p>
                  </div>

                  <div className="h-12 w-px bg-border" />

                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Winner</p>
                    <p className="text-lg font-semibold">{contest.winner}</p>
                    <p className="text-sm text-yellow-400">
                      {contest.winnerScore} pts
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Empty State for users with no history */}
      {mockHistoricalDrafts.length === 0 &&
        mockHistoricalContests.length === 0 && (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Archive className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No History Yet</h3>
            <p className="text-muted-foreground mb-6">
              Your past seasons and achievements will appear here
            </p>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              asChild
            >
              <Link href="/dashboard">
                Go to Dashboard
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </Card>
        )}
    </div>
  );
}
