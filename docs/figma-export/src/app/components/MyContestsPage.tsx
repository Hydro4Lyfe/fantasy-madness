import React, { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import {
  Trophy,
  ChevronLeft,
  Users,
  Lock,
  Globe,
  TrendingUp,
  Search,
  Calendar,
  Target,
  Crown,
  Settings,
  LogOut,
  Menu,
  BarChart3,
  Archive,
  Plus,
  KeyRound,
} from "lucide-react";

interface MyContestsPageProps {
  onNavigate: (page: string) => void;
}

export function MyContestsPage({
  onNavigate,
}: MyContestsPageProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  // Extended mock data for user's contests
  const allContests = [
    {
      id: 1,
      name: "College Alumni Tournament",
      type: "private",
      participants: 45,
      maxParticipants: 100,
      status: "active",
      startDate: "Mar 15, 2026",
      prizePool: "$1,000",
      myRank: 12,
      totalPoints: 1456,
    },
    {
      id: 2,
      name: "High Stakes Challenge",
      type: "public",
      participants: 156,
      maxParticipants: 200,
      status: "active",
      startDate: "Mar 16, 2026",
      prizePool: "$5,000",
      myRank: 34,
      totalPoints: 1203,
    },
    {
      id: 3,
      name: "Weekend Bracket Bonanza",
      type: "private",
      participants: 67,
      maxParticipants: 75,
      status: "active",
      startDate: "Mar 14, 2026",
      prizePool: "$750",
      myRank: 8,
      totalPoints: 1689,
    },
    {
      id: 4,
      name: "Neighborhood Championship",
      type: "private",
      participants: 23,
      maxParticipants: 50,
      status: "upcoming",
      startDate: "Mar 20, 2026",
      prizePool: "$250",
      myRank: null,
      totalPoints: 0,
    },
    {
      id: 5,
      name: "Pro Circuit Finals",
      type: "public",
      participants: 189,
      maxParticipants: 200,
      status: "active",
      startDate: "Mar 15, 2026",
      prizePool: "$10,000",
      myRank: 45,
      totalPoints: 1124,
    },
    {
      id: 6,
      name: "Last Season Champions",
      type: "private",
      participants: 32,
      maxParticipants: 32,
      status: "completed",
      startDate: "Mar 10, 2025",
      prizePool: "$500",
      myRank: 2,
      totalPoints: 2341,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "upcoming":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "completed":
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  const stats = {
    total: allContests.length,
    active: allContests.filter((c) => c.status === "active")
      .length,
    upcoming: allContests.filter((c) => c.status === "upcoming")
      .length,
    completed: allContests.filter(
      (c) => c.status === "completed",
    ).length,
  };

  return (
    <div className="min-h-screen bg-background dark">
      {/* Fixed background */}
      <div className="fixed inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1920"
          alt="Basketball court background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/90 to-black/95" />
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header/Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Hamburger Menu - Mobile Only */}
            <div className="relative md:hidden">
              <button
                onClick={() => setShowNavMenu(!showNavMenu)}
                className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Navigation Dropdown */}
              {showNavMenu && (
                <>
                  {/* Backdrop to close menu */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNavMenu(false)}
                  />

                  <Card className="absolute left-0 top-12 w-56 p-1.5 bg-card border-border z-50 shadow-xl">
                    <button
                      onClick={() => {
                        setShowNavMenu(false);
                        onNavigate("dashboard");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-1 text-sm text-foreground hover:bg-muted rounded transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      Dashboard
                    </button>

                    <button
                      onClick={() => {
                        setShowNavMenu(false);
                        onNavigate("global-contest");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-1 text-sm text-foreground hover:bg-muted rounded transition-colors"
                    >
                      <Trophy className="w-4 h-4" />
                      Global Contest
                    </button>

                    <button
                      onClick={() => {
                        setShowNavMenu(false);
                        onNavigate("my-drafts");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-1 text-sm text-foreground hover:bg-muted rounded transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      Drafts
                    </button>

                    <button
                      onClick={() => {
                        setShowNavMenu(false);
                        onNavigate("my-contests");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-1 text-sm text-foreground hover:bg-muted rounded transition-colors"
                    >
                      <Target className="w-4 h-4" />
                      Contests
                    </button>

                    <button
                      onClick={() => {
                        setShowNavMenu(false);
                        onNavigate("leaderboards");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-1 text-sm text-foreground hover:bg-muted rounded transition-colors"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Leaderboards
                    </button>

                    <button
                      onClick={() => {
                        setShowNavMenu(false);
                        onNavigate('history');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-1 text-sm text-foreground hover:bg-muted rounded transition-colors"
                    >
                      <Archive className="w-4 h-4" />
                      History
                    </button>
                  </Card>
                </>
              )}
            </div>

            {/* Centered Title on Mobile, Left-aligned on Desktop */}
            <div className="absolute left-1/2 transform -translate-x-1/2 md:relative md:left-0 md:transform-none">
              <span className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent tracking-tight">
                FantasyMadness
              </span>
            </div>

            {/* Desktop Navigation - Hidden on Mobile */}
            <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("dashboard")}
                className="text-muted-foreground hover:text-foreground"
              >
                <Globe className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("global-contest")}
                className="text-muted-foreground hover:text-foreground"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Global Contest
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("my-drafts")}
                className="text-muted-foreground hover:text-foreground"
              >
                <Users className="w-4 h-4 mr-2" />
                Drafts
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("my-contests")}
                className="text-muted-foreground hover:text-foreground"
              >
                <Target className="w-4 h-4 mr-2" />
                Contests
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("leaderboards")}
                className="text-muted-foreground hover:text-foreground"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Leaderboards
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('history')}
                className="text-muted-foreground hover:text-foreground"
              >
                <Archive className="w-4 h-4 mr-2" />
                History
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                <Crown className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-orange-400 font-medium">
                  1,247 pts
                </span>
              </div>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-500/50 hover:border-orange-500 transition-all"
                >
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
                    alt="User profile"
                    className="w-full h-full object-cover"
                  />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    {/* Backdrop to close menu */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />

                    <Card className="absolute right-0 top-12 w-56 p-2 bg-card border-border z-50 shadow-xl">
                      <div className="px-3 py-2 border-b border-border mb-2">
                        <p className="font-semibold text-foreground">
                          Player
                        </p>
                        <p className="text-xs text-muted-foreground">
                          player@example.com
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate("settings");
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted rounded transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate("landing");
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Back Button */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("dashboard")}
              className="text-muted-foreground hover:text-foreground -ml-2"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="h-5 w-px bg-border" />
            <h1 className="text-xl font-bold text-foreground">
              My Contests
            </h1>
          </div>

          {/* Page Title with Create Button */}
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-foreground">
              Contests
            </h1>
            <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white border-0">
              <Plus className="w-4 h-4 mr-2" />
              Create Contest
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 bg-[#0A0A0F]/60 backdrop-blur-sm border-white/5 hover:border-white/10 transition-all">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Total Contests
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.total}
                </p>
              </div>
            </Card>
            <Card className="p-4 bg-[#0A0A0F]/60 backdrop-blur-sm border-green-500/20 hover:border-green-500/40 transition-all shadow-[0_0_15px_rgba(34,197,94,0.1)]">
              <div className="space-y-1">
                <p className="text-xs text-green-400/70 uppercase tracking-wide">
                  Active
                </p>
                <p className="text-2xl font-bold text-green-400">
                  {stats.active}
                </p>
              </div>
            </Card>
            <Card className="p-4 bg-[#0A0A0F]/60 backdrop-blur-sm border-yellow-500/20 hover:border-yellow-500/40 transition-all shadow-[0_0_15px_rgba(234,179,8,0.1)]">
              <div className="space-y-1">
                <p className="text-xs text-yellow-400/70 uppercase tracking-wide">
                  Upcoming
                </p>
                <p className="text-2xl font-bold text-yellow-400">
                  {stats.upcoming}
                </p>
              </div>
            </Card>
            <Card className="p-4 bg-[#0A0A0F]/60 backdrop-blur-sm border-white/5 hover:border-white/10 transition-all">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Completed
                </p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {stats.completed}
                </p>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Join with Code Card */}
            <Card className="p-4 bg-[#0A0A0F]/60 backdrop-blur-sm border-purple-500/20 hover:border-purple-500/40 transition-all shadow-[0_0_20px_rgba(168,85,247,0.1)]">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-purple-400/80">
                  <KeyRound className="w-4 h-4" />
                  <span className="font-medium uppercase tracking-wide">
                    Join with Code
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter contest code..."
                    value={joinCode}
                    onChange={(e) =>
                      setJoinCode(e.target.value)
                    }
                    className="bg-[#0A0A0F]/80 border-white/10 focus:border-purple-500/50 text-foreground placeholder:text-muted-foreground"
                  />
                  <Button
                    onClick={() => {
                      // Handle join logic
                      if (joinCode.trim()) {
                        console.log(
                          "Joining contest with code:",
                          joinCode,
                        );
                        setJoinCode("");
                      }
                    }}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all"
                  >
                    Join
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Contests Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allContests.map((contest) => (
              <Card
                key={contest.id}
                className="relative p-6 bg-gradient-to-br from-card via-card to-card border-border hover:border-purple-500/50 transition-all duration-300 group cursor-pointer overflow-hidden"
              >
                {/* Decorative gradient orbs */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/15 transition-all" />

                <div className="relative space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge
                          className={`${getStatusColor(contest.status)}`}
                        >
                          {contest.status === "active"
                            ? "Live"
                            : contest.status === "upcoming"
                              ? "Upcoming"
                              : "Ended"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {contest.type === "private" ? (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Globe className="w-4 h-4 text-blue-400" />
                        )}
                        <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-purple-400 transition-colors">
                          {contest.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{contest.startDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-background/50 backdrop-blur-sm border border-border group-hover:border-purple-500/20 transition-all">
                      <p className="text-xs text-muted-foreground mb-1">
                        Players
                      </p>
                      <p className="font-medium text-foreground">
                        {contest.participants}/
                        {contest.maxParticipants}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50 backdrop-blur-sm border border-border group-hover:border-purple-500/20 transition-all">
                      <p className="text-xs text-muted-foreground mb-1">
                        Prize
                      </p>
                      <p className="font-medium text-orange-400">
                        {contest.prizePool}
                      </p>
                    </div>
                  </div>

                  {contest.status !== "upcoming" && (
                    <>
                      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground mb-1">
                            Your Rank
                          </span>
                          <div className="flex items-center gap-1.5">
                            {contest.myRank &&
                              contest.myRank <= 10 && (
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                              )}
                            <span className="font-bold text-foreground">
                              {contest.myRank
                                ? `#${contest.myRank}`
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-xs text-muted-foreground mb-1">
                            Your Points
                          </span>
                          <span className="font-bold text-orange-400">
                            {contest.totalPoints}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  <Button
                    className="w-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:border-purple-500/50"
                    variant="outline"
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {allContests.length === 0 && (
            <Card className="p-12 bg-card border-border text-center">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No contests found
              </h3>
              <p className="text-muted-foreground mb-6">
                Get started by joining a contest
              </p>
              <Button className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700">
                Browse Public Contests
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}