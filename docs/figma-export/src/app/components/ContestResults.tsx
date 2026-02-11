import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/app/components/ui/sheet';
import {
  Trophy,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Target,
  Crown,
  Award,
  Star,
  ChevronLeft,
  BarChart3,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  Minus,
  ArrowRight,
  Flame,
  Menu,
  Layout,
  Globe,
} from 'lucide-react';

interface ContestResultsProps {
  onNavigate: (page: string) => void;
}

export function ContestResults({ onNavigate }: ContestResultsProps) {
  const [selectedTab, setSelectedTab] = useState<'leaderboard' | 'my-bracket' | 'updates'>('leaderboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mock contest data
  const contestDetails = {
    id: 1,
    name: 'College Alumni Tournament',
    type: 'Contest',
    participants: 156,
    maxParticipants: 200,
    status: 'active',
    startDate: 'Mar 15, 2026',
    prizePool: '$5,000',
    entryFee: '$25',
    round: 'Sweet 16',
    gamesCompleted: 48,
    totalGames: 63,
  };

  // Mock leaderboard data
  const leaderboard = [
    { rank: 1, name: 'Sarah Chen', points: 480, correctPicks: 42, possiblePoints: 520, change: 'same', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', prizes: '$2,500' },
    { rank: 2, name: 'Mike Johnson', points: 465, correctPicks: 40, possiblePoints: 505, change: 'up', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', prizes: '$1,500' },
    { rank: 3, name: 'Alex Rivera', points: 458, correctPicks: 39, possiblePoints: 498, change: 'down', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', prizes: '$750' },
    { rank: 4, name: 'Emily Davis', points: 445, correctPicks: 38, possiblePoints: 485, change: 'up', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', prizes: '$250' },
    { rank: 5, name: 'Chris Taylor', points: 442, correctPicks: 38, possiblePoints: 482, change: 'same', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', prizes: '' },
    { rank: 6, name: 'Jordan Lee', points: 438, correctPicks: 37, possiblePoints: 478, change: 'down', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', prizes: '' },
    { rank: 7, name: 'Taylor Swift', points: 435, correctPicks: 37, possiblePoints: 475, change: 'up', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', prizes: '' },
    { rank: 8, name: 'Morgan Lee', points: 430, correctPicks: 36, possiblePoints: 470, change: 'same', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100', prizes: '' },
    { rank: 9, name: 'Casey Wilson', points: 428, correctPicks: 36, possiblePoints: 468, change: 'down', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100', prizes: '' },
    { rank: 10, name: 'Jamie Fox', points: 425, correctPicks: 36, possiblePoints: 465, change: 'up', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100', prizes: '' },
    { rank: 11, name: 'Quinn Davis', points: 420, correctPicks: 35, possiblePoints: 460, change: 'same', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100', prizes: '' },
    { rank: 12, name: 'You', points: 415, correctPicks: 35, possiblePoints: 455, change: 'up', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', prizes: '', isUser: true },
  ];

  // Mock recent updates
  const recentUpdates = [
    {
      id: 1,
      type: 'game_result',
      time: '15 min ago',
      team1: 'Duke',
      team2: 'Kansas',
      winner: 'Duke',
      score: '78-72',
      round: 'Sweet 16',
      pointsEarned: 20,
    },
    {
      id: 2,
      type: 'game_result',
      time: '1 hr ago',
      team1: 'UConn',
      team2: 'Houston',
      winner: 'UConn',
      score: '82-75',
      round: 'Sweet 16',
      pointsEarned: 20,
    },
    {
      id: 3,
      type: 'rank_change',
      time: '1 hr ago',
      message: 'You moved up 3 positions to #12',
      direction: 'up',
    },
    {
      id: 4,
      type: 'game_result',
      time: '3 hrs ago',
      team1: 'Purdue',
      team2: 'Arizona',
      winner: 'Arizona',
      score: '85-80',
      round: 'Sweet 16',
      pointsEarned: 0,
    },
  ];

  // Mock user's bracket picks
  const userBracket = {
    correctPicks: 35,
    incorrectPicks: 13,
    remainingPicks: 15,
    possiblePoints: 455,
    currentPoints: 415,
  };

  const userStats = leaderboard.find(p => p.isUser);

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
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('dashboard')}
                className="text-foreground hover:bg-muted hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>

              {/* Mobile Menu - Only visible on mobile */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden text-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] bg-background border-border">
                  <SheetHeader>
                    <SheetTitle className="text-foreground">Navigation</SheetTitle>
                    <SheetDescription className="sr-only">
                      Navigate to different sections of the app
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col gap-2 mt-6">
                    <Button
                      variant="ghost"
                      className="justify-start text-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => {
                        onNavigate('my-drafts');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Layout className="w-4 h-4 mr-3" />
                      Drafts
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => {
                        onNavigate('my-contests');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Trophy className="w-4 h-4 mr-3" />
                      Contests
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => {
                        onNavigate('global-championship');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Globe className="w-4 h-4 mr-3" />
                      Global
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => {
                        onNavigate('leaderboards');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <BarChart3 className="w-4 h-4 mr-3" />
                      Leaderboards
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Contest Header */}
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">{contestDetails.name}</h1>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{contestDetails.type} • Started {contestDetails.startDate}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                      Live - {contestDetails.round}
                    </Badge>
                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs">
                      {contestDetails.gamesCompleted}/{contestDetails.totalGames} Games Complete
                    </Badge>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 w-full lg:w-auto">
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
                      <span className="text-xs text-muted-foreground">Prize Pool</span>
                    </div>
                    <p className="text-base sm:text-lg font-bold text-orange-400 truncate">{contestDetails.prizePool}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                      <span className="text-xs text-muted-foreground">Players</span>
                    </div>
                    <p className="text-base sm:text-lg font-bold text-foreground">{contestDetails.participants}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                      <span className="text-xs text-muted-foreground">Your Rank</span>
                    </div>
                    <p className="text-base sm:text-lg font-bold text-green-400">#{userStats?.rank}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">Points</span>
                    </div>
                    <p className="text-base sm:text-lg font-bold text-foreground">{userStats?.points}</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-border overflow-x-auto">
                <button
                  onClick={() => setSelectedTab('leaderboard')}
                  className={`px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
                    selectedTab === 'leaderboard'
                      ? 'text-purple-400'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Leaderboard
                  {selectedTab === 'leaderboard' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400" />
                  )}
                </button>
                <button
                  onClick={() => setSelectedTab('my-bracket')}
                  className={`px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
                    selectedTab === 'my-bracket'
                      ? 'text-purple-400'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  My Bracket
                  {selectedTab === 'my-bracket' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400" />
                  )}
                </button>
                <button
                  onClick={() => setSelectedTab('updates')}
                  className={`px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
                    selectedTab === 'updates'
                      ? 'text-purple-400'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Live Updates
                  {selectedTab === 'updates' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {selectedTab === 'leaderboard' && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Leaderboard */}
              <Card className="lg:col-span-2 bg-card border-border">
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">Current Standings</h2>
                    <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                      <Flame className="w-3 h-3 mr-1" />
                      Live
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {leaderboard.map((player) => (
                      <div
                        key={player.rank}
                        className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg transition-all ${
                          player.isUser
                            ? 'bg-gradient-to-r from-purple-500/20 to-transparent border-2 border-purple-500/50'
                            : player.rank <= 3
                            ? 'bg-gradient-to-r from-orange-500/5 to-transparent border border-orange-500/20'
                            : 'bg-muted/30 hover:bg-muted/50 border border-transparent'
                        }`}
                      >
                        {/* Rank Badge */}
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 ${
                          player.rank === 1 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white' :
                          player.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900' :
                          player.rank === 3 ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white' :
                          player.isUser ? 'bg-purple-500/30 text-purple-400' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {player.rank}
                        </div>

                        {/* Player Avatar */}
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 flex-shrink-0 ${
                          player.isUser ? 'border-purple-500' : 'border-border'
                        }`}>
                          <ImageWithFallback
                            src={player.avatar}
                            alt={player.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Player Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`font-semibold text-sm sm:text-base truncate ${
                              player.isUser ? 'text-purple-400' : 'text-foreground'
                            }`}>
                              {player.name}
                            </p>
                            {player.prizes && (
                              <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs whitespace-nowrap">
                                {player.prizes}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {player.correctPicks} correct
                            </span>
                            <span className="text-xs text-muted-foreground hidden sm:inline">
                              • {player.possiblePoints} possible
                            </span>
                          </div>
                        </div>

                        {/* Points */}
                        <div className="text-right flex-shrink-0">
                          <p className={`text-base sm:text-lg font-bold ${
                            player.isUser ? 'text-purple-400' : 'text-foreground'
                          }`}>
                            {player.points}
                          </p>
                          <p className="text-xs text-muted-foreground">pts</p>
                        </div>

                        {/* Change Indicator */}
                        <div className="hidden sm:flex items-center justify-center w-6 flex-shrink-0">
                          {player.change === 'up' ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : player.change === 'down' ? (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          ) : (
                            <Minus className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full mt-4">
                    Load More Players
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>

              {/* Your Performance Card */}
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-purple-500/10 via-card to-card border-purple-500/30">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-purple-400" />
                      <h3 className="font-semibold text-foreground">Your Performance</h3>
                    </div>

                    {/* Rank Display */}
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30">
                      <p className="text-sm text-muted-foreground mb-2">Current Rank</p>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-5xl font-bold text-purple-400">#{userStats?.rank}</span>
                        <span className="text-lg text-muted-foreground">/ {contestDetails.participants}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400">Up 3 spots</span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-background/50 border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <span className="text-xs text-muted-foreground">Correct</span>
                        </div>
                        <p className="text-xl font-bold text-green-400">{userBracket.correctPicks}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-background/50 border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-xs text-muted-foreground">Incorrect</span>
                        </div>
                        <p className="text-xl font-bold text-red-400">{userBracket.incorrectPicks}</p>
                      </div>
                    </div>

                    {/* Points Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Points Progress</span>
                        <span className="text-foreground font-medium">
                          {userBracket.currentPoints} / {userBracket.possiblePoints}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
                          style={{ width: `${(userBracket.currentPoints / userBracket.possiblePoints) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {((userBracket.currentPoints / userBracket.possiblePoints) * 100).toFixed(1)}% of possible points earned
                      </p>
                    </div>

                    <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                      View My Bracket
                      <BarChart3 className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Card>

                {/* Prize Breakdown */}
                <Card className="bg-card border-border">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-orange-400" />
                      <h3 className="font-semibold text-foreground">Prize Breakdown</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/30">
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-foreground">1st Place</span>
                        </div>
                        <span className="font-bold text-yellow-400">$2,500</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-foreground">2nd Place</span>
                        </div>
                        <span className="font-bold text-foreground">$1,500</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-orange-400" />
                          <span className="text-sm text-foreground">3rd Place</span>
                        </div>
                        <span className="font-bold text-foreground">$750</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">4th Place</span>
                        <span className="font-medium text-foreground">$250</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {selectedTab === 'my-bracket' && (
            <Card className="bg-card border-border">
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mx-auto">
                  <Target className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Bracket View</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your complete tournament bracket with pick history and remaining games would be displayed here.
                </p>
                <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                  View Full Bracket
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {selectedTab === 'updates' && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Live Updates Feed */}
              <Card className="lg:col-span-2 bg-card border-border">
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">Live Updates</h2>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2" />
                      Live
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {recentUpdates.map((update) => (
                      <div key={update.id} className="p-4 rounded-lg bg-muted/30 border border-border">
                        {update.type === 'game_result' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                                {update.round}
                              </Badge>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {update.time}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className={`font-semibold ${update.winner === update.team1 ? 'text-green-400' : 'text-muted-foreground'}`}>
                                  {update.team1}
                                </p>
                                <p className={`font-semibold ${update.winner === update.team2 ? 'text-green-400' : 'text-muted-foreground'}`}>
                                  {update.team2}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-foreground">{update.score}</p>
                              </div>
                            </div>

                            {update.pointsEarned > 0 ? (
                              <div className="flex items-center gap-2 text-sm text-green-400">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Correct pick! +{update.pointsEarned} points</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-red-400">
                                <XCircle className="w-4 h-4" />
                                <span>Incorrect pick</span>
                              </div>
                            )}
                          </div>
                        )}

                        {update.type === 'rank_change' && (
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              update.direction === 'up' ? 'bg-green-500/20' : 'bg-red-500/20'
                            }`}>
                              {update.direction === 'up' ? (
                                <TrendingUp className="w-5 h-5 text-green-400" />
                              ) : (
                                <TrendingDown className="w-5 h-5 text-red-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{update.message}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <Clock className="w-3 h-3" />
                                {update.time}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full">
                    Load More Updates
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>

              {/* Upcoming Games */}
              <Card className="bg-card border-border">
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-400" />
                    <h3 className="font-semibold text-foreground">Upcoming Games</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30 mb-2">
                        Elite 8 • Today 7:00 PM
                      </Badge>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">UConn vs Duke</p>
                        <p className="text-xs text-muted-foreground">Your pick: UConn</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30 mb-2">
                        Elite 8 • Today 9:30 PM
                      </Badge>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">Kansas vs Arizona</p>
                        <p className="text-xs text-muted-foreground">Your pick: Kansas</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 mb-2">
                        Elite 8 • Tomorrow 6:00 PM
                      </Badge>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">Purdue vs Houston</p>
                        <p className="text-xs text-muted-foreground">Your pick: Purdue</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}