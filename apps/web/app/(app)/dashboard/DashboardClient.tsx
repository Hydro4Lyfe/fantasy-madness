"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import {
  Trophy,
  TrendingUp,
  Zap,
  Globe,
  Crown,
  Target,
  Award,
  Star,
  ChevronRight,
  BarChart3,
  Plus,
  ArrowRight,
  Flame,
  Clock,
  Users,
  Lock,
  Shield,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { joinDraftByInviteAction } from "@/server/actions/drafts";

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  change: "up" | "down" | "same";
  avatar: string;
}

interface Draft {
  id: string;
  name: string;
  type: "private" | "public";
  participants: number;
  maxParticipants: number;
  status: "active" | "draft" | "completed";
  draftDate: string;
  myRank: number | null;
}

interface Contest {
  id: string;
  name: string;
  type: "private" | "public";
  participants: number;
  maxParticipants: number;
  status: "active" | "draft" | "completed";
  startDate: string;
  myRank: number;
}

interface DashboardClientProps {
  user: {
    name: string;
    totalPoints: number;
    rank: number;
    totalPlayers: number;
    activeDrafts: number;
    activeContests: number;
    winRate: number;
    wins: number;
    total: number;
  };
  leaderboard: LeaderboardEntry[];
  drafts: Draft[];
  contests: Contest[];
}

export function DashboardClient({
  user,
  leaderboard,
  drafts,
  contests,
}: DashboardClientProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleJoinWithCode = () => {
    if (!inviteCode.trim()) {
      toast.error("Please enter an invite code");
      return;
    }

    startTransition(async () => {
      const result = await joinDraftByInviteAction(inviteCode.trim());

      if (result.success && result.draftId) {
        setInviteCode("");
        if (result.alreadyJoined) {
          toast.info("You're already a member of this draft");
        } else {
          toast.success("Successfully joined the draft!");
        }
        router.push(`/drafts/${result.draftId}`);
      } else {
        toast.error(result.error ?? "Failed to join draft");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Welcome back, {user.name}!
          </h1>
          <Flame className="w-6 h-6 text-orange-400" />
        </div>
        <p className="text-muted-foreground">Ready to dominate March Madness 2026?</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="relative p-4 sm:p-6 bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-card border-orange-500/40 hover:border-orange-500/60 transition-all group overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/30 rounded-full blur-3xl group-hover:bg-orange-500/40 transition-all" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-orange-400/20 rounded-full blur-2xl" />
          <div className="relative flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Points
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {user.totalPoints.toLocaleString()}
              </p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400 font-medium">+12.5%</span>
              </div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/50 group-hover:scale-110 group-hover:shadow-orange-500/70 transition-all">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="relative p-4 sm:p-6 bg-gradient-to-br from-green-500/20 via-green-500/10 to-card border-green-500/40 hover:border-green-500/60 transition-all group overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/30 rounded-full blur-3xl group-hover:bg-green-500/40 transition-all" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-green-400/20 rounded-full blur-2xl" />
          <div className="relative flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Global Rank
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-green-400">
                #{user.rank}
              </p>
              <div className="flex items-center gap-1">
                <span className="text-xs text-green-300">Top 2%</span>
              </div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/50 group-hover:scale-110 group-hover:shadow-green-500/70 transition-all">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="relative p-4 sm:p-6 bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-card border-purple-500/40 hover:border-purple-500/60 transition-all group overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/30 rounded-full blur-3xl group-hover:bg-purple-500/40 transition-all" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-400/20 rounded-full blur-2xl" />
          <div className="relative flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Active Entries
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {user.activeDrafts + user.activeContests}
              </p>
              <div className="flex items-center gap-1">
                <span className="text-xs text-purple-300 hidden sm:inline">
                  {user.activeDrafts} drafts, {user.activeContests} contests
                </span>
                <span className="text-xs text-purple-300 sm:hidden">
                  {user.activeDrafts}D / {user.activeContests}C
                </span>
              </div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/50 group-hover:scale-110 group-hover:shadow-purple-500/70 transition-all">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="relative p-4 sm:p-6 bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-card border-blue-500/40 hover:border-blue-500/60 transition-all group overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/30 rounded-full blur-3xl group-hover:bg-blue-500/40 transition-all" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-blue-400/20 rounded-full blur-2xl" />
          <div className="relative flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Win Rate
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {user.winRate}%
              </p>
              <div className="flex items-center gap-1">
                <span className="text-xs text-blue-300 hidden sm:inline">
                  {user.wins} of {user.total} wins
                </span>
                <span className="text-xs text-blue-300 sm:hidden">
                  {user.wins}/{user.total}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/50 group-hover:scale-110 group-hover:shadow-blue-500/70 transition-all">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Global Competition Section */}
      <Card className="relative overflow-hidden border-2 border-orange-500/50 bg-gradient-to-br from-orange-500/10 via-card to-card">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent" />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start lg:items-center justify-between">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Global Championship</h2>
                  <p className="text-sm text-orange-400">
                    Compete against 50,000+ players worldwide
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground">
                Submit your official bracket and compete against the best. Everyone plays with the
                same rules.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-400" />
                  <span className="text-foreground">50,234 Entries</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="text-foreground">Closes Mar 17</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-orange-400" />
                  <span className="text-foreground">Free to Enter</span>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-auto">
              <Button
                size="lg"
                asChild
                className="w-full lg:w-auto bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg shadow-orange-500/30 h-12 px-8"
              >
                <Link href="/global-contest/picks">
                  Enter Global Picks
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center lg:text-left">
                No entry fee required
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Join with Code Card */}
        <Card className="p-6 bg-gradient-to-br from-purple-500/10 via-card to-blue-500/10 border-purple-500/30 hover:border-purple-500/60 transition-all relative overflow-hidden group h-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-all" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all" />

          <div className="relative h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground text-xl mb-1">Join Private Draft</h3>
                <p className="text-sm text-muted-foreground">Enter a friend's invite code</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border space-y-3">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  Invite Code
                </label>
                <Input
                  placeholder="e.g. MARCH2026"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="bg-background border-border text-lg font-mono tracking-wider placeholder:tracking-normal placeholder:font-sans"
                />
              </div>
              <Button
                onClick={handleJoinWithCode}
                disabled={isPending}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-lg group-hover:shadow-purple-500/25 transition-all h-11"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    Join Draft
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>Instant access to exclusive drafts</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>Compete with friends and colleagues</span>
              </div>
            </div>

            <div className="flex-1" />

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-3 text-muted-foreground">Don't have a code?</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50 group/create"
                asChild
              >
                <Link href="/drafts/new">
                  <Plus className="w-4 h-4 mr-2 group-hover/create:rotate-90 transition-transform" />
                  Create Your Own Draft
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Browse Public Drafts Card */}
        <Card className="p-6 bg-gradient-to-br from-orange-500/10 via-card to-purple-500/10 border-orange-500/30 hover:border-orange-500/60 transition-all cursor-pointer group relative overflow-hidden h-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl group-hover:bg-orange-500/30 transition-all" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-all" />

          <Link href="/drafts/public" className="relative h-full flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                    24 Open Now
                  </Badge>
                </div>
                <h3 className="font-bold text-foreground text-xl mb-1">Browse Public Drafts</h3>
                <p className="text-sm text-muted-foreground">
                  Discover and join competitions worldwide
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-orange-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-background/50 backdrop-blur-sm border border-border group-hover:border-orange-500/30 transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-muted-foreground">Free Entry</span>
                </div>
                <p className="text-lg font-bold text-foreground">12 Drafts</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 backdrop-blur-sm border border-border group-hover:border-orange-500/30 transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-muted-foreground">Filling Fast</span>
                </div>
                <p className="text-lg font-bold text-orange-400">8 Drafts</p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span>Filter by entry fee, difficulty & prize pool</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span>Join beginner-friendly or expert competitions</span>
              </div>
            </div>

            <div className="flex-1" />

            <Button className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white shadow-lg group-hover:shadow-orange-500/25 transition-all">
              Explore All Drafts
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </Card>
      </div>

      {/* Leaderboard Preview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Global Leaderboard</h2>
              <p className="text-sm text-muted-foreground">Top players this season</p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="hover:border-orange-500/50">
            <Link href="/leaderboards">
              View Full Leaderboard
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Top 5 Players */}
          <Card className="lg:col-span-2 bg-card border-border">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">Top Players</h3>
                <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                  Live
                </Badge>
              </div>

              <div className="space-y-3">
                {leaderboard.map((player, idx) => (
                  <div
                    key={player.rank}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                      idx < 3
                        ? "bg-gradient-to-r from-orange-500/5 to-transparent border border-orange-500/20"
                        : "bg-muted/30 hover:bg-muted/50"
                    }`}
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

                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-border">
                      <ImageWithFallback
                        src={player.avatar}
                        alt={player.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{player.name}</p>
                      <div className="flex items-center gap-2">
                        <Crown className="w-3 h-3 text-orange-400" />
                        <span className="text-sm text-orange-400 font-medium">
                          {player.points.toLocaleString()} pts
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {player.change === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : player.change === "down" ? (
                        <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
                      ) : (
                        <div className="w-4 h-0.5 bg-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Your Rank Card */}
          <Card className="bg-gradient-to-br from-orange-500/10 via-card to-card border-orange-500/30">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-orange-400" />
                <h3 className="font-semibold text-foreground">Your Standing</h3>
              </div>

              <div className="space-y-6">
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30">
                  <p className="text-sm text-muted-foreground mb-2">Current Rank</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-orange-400">#{user.rank}</span>
                    <span className="text-lg text-muted-foreground">
                      / {user.totalPlayers.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground">Total Points</span>
                    <span className="font-bold text-foreground">
                      {user.totalPoints.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground">Percentile</span>
                    <span className="font-bold text-green-400">
                      Top {Math.round((user.rank / user.totalPlayers) * 100)}%
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  asChild
                >
                  <Link href="/leaderboards">
                    View Detailed Stats
                    <BarChart3 className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
