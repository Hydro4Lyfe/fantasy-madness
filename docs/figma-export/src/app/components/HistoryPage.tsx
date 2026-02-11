import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import {
  Trophy,
  Users,
  Target,
  Globe,
  Crown,
  Award,
  ChevronRight,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Archive,
  Calendar,
  TrendingUp,
  Star,
} from 'lucide-react';

interface HistoryPageProps {
  onNavigate: (page: string) => void;
}

interface HistoricalDraft {
  id: number;
  name: string;
  year: number;
  participants: number;
  yourScore: number;
  winner: string;
  winnerScore: number;
  yourRank: number;
}

interface HistoricalContest {
  id: number;
  name: string;
  year: number;
  participants: number;
  yourScore: number;
  winner: string;
  winnerScore: number;
  yourRank: number;
}

interface GlobalChampionship {
  year: number;
  yourScore: number;
  yourRank: number;
  totalPlayers: number;
  champion: string;
  championScore: number;
}

export function HistoryPage({ onNavigate }: HistoryPageProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);

  // Mock historical data for previous year's drafts
  const historicalDrafts: HistoricalDraft[] = [
    {
      id: 1,
      name: 'Office Champions League',
      year: 2025,
      participants: 8,
      yourScore: 2456,
      winner: 'Mike Johnson',
      winnerScore: 2891,
      yourRank: 2,
    },
    {
      id: 2,
      name: 'Friends & Family Draft',
      year: 2025,
      participants: 8,
      yourScore: 2678,
      winner: 'You',
      winnerScore: 2678,
      yourRank: 1,
    },
    {
      id: 3,
      name: 'Weekend Warriors Draft',
      year: 2025,
      participants: 8,
      yourScore: 2234,
      winner: 'Sarah Chen',
      winnerScore: 2567,
      yourRank: 4,
    },
  ];

  // Mock historical data for previous year's contests
  const historicalContests: HistoricalContest[] = [
    {
      id: 1,
      name: 'College Alumni Tournament',
      year: 2025,
      participants: 100,
      yourScore: 2345,
      winner: 'BracketKing2025',
      winnerScore: 2789,
      yourRank: 15,
    },
    {
      id: 2,
      name: 'High Stakes Challenge',
      year: 2025,
      participants: 200,
      yourScore: 2123,
      winner: 'MarchMadnessGuru',
      winnerScore: 2901,
      yourRank: 45,
    },
  ];

  // Mock global championship data
  const globalChampionship: GlobalChampionship = {
    year: 2025,
    yourScore: 2347,
    yourRank: 1247,
    totalPlayers: 45892,
    champion: 'UltimateBracketMaster',
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
                        onNavigate('dashboard');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-1 text-sm text-foreground hover:bg-muted rounded transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      Dashboard
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowNavMenu(false);
                        onNavigate('global-contest');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-1 text-sm text-foreground hover:bg-muted rounded transition-colors"
                    >
                      <Trophy className="w-4 h-4" />
                      Global Contest
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowNavMenu(false);
                        onNavigate('my-drafts');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-1 text-sm text-foreground hover:bg-muted rounded transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      Drafts
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowNavMenu(false);
                        onNavigate('my-contests');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-1 text-sm text-foreground hover:bg-muted rounded transition-colors"
                    >
                      <Target className="w-4 h-4" />
                      Contests
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowNavMenu(false);
                        onNavigate('leaderboards');
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
                onClick={() => onNavigate('dashboard')}
                className="text-muted-foreground hover:text-foreground"
              >
                <Globe className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('global-contest')}
                className="text-muted-foreground hover:text-foreground"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Global Contest
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('my-drafts')}
                className="text-muted-foreground hover:text-foreground"
              >
                <Users className="w-4 h-4 mr-2" />
                Drafts
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('my-contests')}
                className="text-muted-foreground hover:text-foreground"
              >
                <Target className="w-4 h-4 mr-2" />
                Contests
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('leaderboards')}
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
                <span className="text-sm text-orange-400 font-medium">1,247 pts</span>
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
                        <p className="font-semibold text-foreground">Player</p>
                        <p className="text-xs text-muted-foreground">player@example.com</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate('settings');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted rounded transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate('landing');
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
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                <Archive className="w-5 h-5 text-orange-400" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">History</h1>
            </div>
            <p className="text-muted-foreground">View your past performance and achievements</p>
          </div>

          {/* Global Championship Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-orange-400" />
              Global Championship 2025
            </h2>
            <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-card border-orange-500/30">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Your Rank</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-orange-400">#{globalChampionship.yourRank}</p>
                    <p className="text-sm text-muted-foreground">of {globalChampionship.totalPlayers.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Your Score</p>
                  <p className="text-3xl font-bold text-foreground">{globalChampionship.yourScore}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">2025 Champion</p>
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    <p className="text-lg font-semibold text-foreground truncate">{globalChampionship.champion}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Winning Score</p>
                  <p className="text-3xl font-bold text-yellow-400">{globalChampionship.championScore}</p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Top {((globalChampionship.yourRank / globalChampionship.totalPlayers) * 100).toFixed(1)}% of all players
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
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-400" />
              Drafts - 2025 Season
            </h2>
            <div className="grid gap-4">
              {historicalDrafts.map((draft) => (
                <Card key={draft.id} className="p-6 bg-card border-border hover:border-orange-500/50 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-foreground">{draft.name}</h3>
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
                        <p className="text-2xl font-bold text-orange-400">{draft.yourScore}</p>
                      </div>
                      
                      <div className="h-12 w-px bg-border" />
                      
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Winner</p>
                        <p className="text-lg font-semibold text-foreground">{draft.winner}</p>
                        <p className="text-sm text-yellow-400">{draft.winnerScore} pts</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Historical Contests Section */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-400" />
              Contests - 2025 Season
            </h2>
            <div className="grid gap-4">
              {historicalContests.map((contest) => (
                <Card key={contest.id} className="p-6 bg-card border-border hover:border-orange-500/50 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-foreground">{contest.name}</h3>
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
                        <span>Top {((contest.yourRank / contest.participants) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Your Score</p>
                        <p className="text-2xl font-bold text-orange-400">{contest.yourScore}</p>
                      </div>
                      
                      <div className="h-12 w-px bg-border" />
                      
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Winner</p>
                        <p className="text-lg font-semibold text-foreground">{contest.winner}</p>
                        <p className="text-sm text-yellow-400">{contest.winnerScore} pts</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Empty State for users with no history */}
          {historicalDrafts.length === 0 && historicalContests.length === 0 && (
            <Card className="p-12 bg-card border-border text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Archive className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No History Yet</h3>
              <p className="text-muted-foreground mb-6">
                Your past seasons and achievements will appear here
              </p>
              <Button
                onClick={() => onNavigate('dashboard')}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Go to Dashboard
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}