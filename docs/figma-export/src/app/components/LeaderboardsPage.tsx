import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import {
  Trophy,
  ArrowLeft,
  Crown,
  Medal,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Users,
  Target,
  Globe,
  Zap,
  ChevronRight,
  BarChart3,
  Award,
  Star,
  Settings,
  LogOut,
  Menu,
  Archive,
} from 'lucide-react';

interface LeaderboardsPageProps {
  onNavigate: (page: string) => void;
}

type LeaderboardType = 'global' | 'drafts' | 'contests';

interface LeaderboardEntry {
  rank: number;
  previousRank: number;
  name: string;
  avatar: string;
  points: number;
  correctPicks: number;
  totalPicks: number;
  isYou?: boolean;
}

interface DraftLeaderboard {
  id: number;
  name: string;
  participants: number;
  yourRank: number;
}

export function LeaderboardsPage({ onNavigate }: LeaderboardsPageProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('global');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);

  // Mock global leaderboard data
  const globalLeaderboard: LeaderboardEntry[] = [
    {
      rank: 1,
      previousRank: 3,
      name: 'BasketballPro2026',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      points: 2847,
      correctPicks: 58,
      totalPicks: 63,
      isYou: false,
    },
    {
      rank: 2,
      previousRank: 1,
      name: 'MarchMadnessKing',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      points: 2821,
      correctPicks: 57,
      totalPicks: 63,
      isYou: false,
    },
    {
      rank: 3,
      previousRank: 2,
      name: 'BracketMaster',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      points: 2798,
      correctPicks: 56,
      totalPicks: 63,
      isYou: false,
    },
    {
      rank: 4,
      previousRank: 7,
      name: 'HoopsGuru',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      points: 2756,
      correctPicks: 55,
      totalPicks: 63,
      isYou: false,
    },
    {
      rank: 5,
      previousRank: 4,
      name: 'DukeDevil',
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100',
      points: 2734,
      correctPicks: 55,
      totalPicks: 63,
      isYou: false,
    },
    {
      rank: 842,
      previousRank: 901,
      name: 'You',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      points: 1247,
      correctPicks: 38,
      totalPicks: 63,
      isYou: true,
    },
  ];

  // Add more entries for scrolling
  const extendedGlobalLeaderboard = [
    ...globalLeaderboard.slice(0, 5),
    ...Array.from({ length: 15 }, (_, i) => ({
      rank: i + 6,
      previousRank: i + 6,
      name: `Player${i + 6}`,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      points: 2700 - i * 50,
      correctPicks: 54 - i,
      totalPicks: 63,
      isYou: false,
    })),
    globalLeaderboard[5], // "You" entry
  ];

  // Mock draft leaderboards
  const draftLeaderboards: DraftLeaderboard[] = [
    {
      id: 1,
      name: 'Office Champions League',
      participants: 8,
      yourRank: 3,
    },
    {
      id: 2,
      name: 'Friends & Family Draft',
      participants: 8,
      yourRank: 1,
    },
    {
      id: 3,
      name: 'Weekend Warriors Draft',
      participants: 8,
      yourRank: 5,
    },
  ];

  // Mock contest leaderboards
  const contestLeaderboards: DraftLeaderboard[] = [
    {
      id: 1,
      name: 'College Alumni Tournament',
      participants: 100,
      yourRank: 12,
    },
    {
      id: 2,
      name: 'High Stakes Challenge',
      participants: 200,
      yourRank: 34,
    },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className="w-8 h-8 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-8 h-8 text-gray-400" />;
    if (rank === 3) return <Medal className="w-7 h-7 text-orange-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankChange = (current: number, previous: number) => {
    const change = previous - current;
    if (change > 0) {
      return (
        <div className="flex items-center gap-1 text-green-400">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs font-medium">+{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center gap-1 text-red-400">
          <TrendingDown className="w-4 h-4" />
          <span className="text-xs font-medium">{change}</span>
        </div>
      );
    }
    return <span className="text-xs text-muted-foreground">-</span>;
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

      {/* Header */}
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

      {/* Tab Navigation */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('global')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'global'
                  ? 'text-orange-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Globe className="w-4 h-4 inline mr-2" />
              Global Championship
              {activeTab === 'global' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('drafts')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'drafts'
                  ? 'text-orange-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Target className="w-4 h-4 inline mr-2" />
              My Drafts
              {activeTab === 'drafts' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('contests')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'contests'
                  ? 'text-orange-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Trophy className="w-4 h-4 inline mr-2" />
              My Contests
              {activeTab === 'contests' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-32 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('dashboard')}
              className="text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="h-5 w-px bg-border" />
            <h1 className="text-xl font-bold text-foreground">Leaderboards</h1>
          </div>

          {/* Global Tab */}
          {activeTab === 'global' && (
            <div className="space-y-6">
              {/* Stats Header */}
              <div className="grid sm:grid-cols-3 gap-4">
                <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-card border-orange-500/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Your Rank</p>
                      <p className="text-2xl font-bold text-orange-400">#842</p>
                      <div className="flex items-center gap-1 text-green-400 text-xs mt-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>+59 today</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-card border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Your Points</p>
                      <p className="text-2xl font-bold text-foreground">1,247</p>
                      <p className="text-xs text-muted-foreground mt-1">38/63 correct</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-card border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Players</p>
                      <p className="text-2xl font-bold text-foreground">50,234</p>
                      <p className="text-xs text-muted-foreground mt-1">Competing globally</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Global Leaderboard */}
              <Card className="bg-card border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-bold text-foreground">Global Rankings</h2>
                  <p className="text-sm text-muted-foreground">Live standings • Updated every 5 minutes</p>
                </div>

                <div className="divide-y divide-border">
                  {extendedGlobalLeaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`p-4 hover:bg-muted/50 transition-colors ${
                        entry.isYou ? 'bg-orange-500/5 border-l-4 border-l-orange-500' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="w-12 flex items-center justify-center">
                          {getRankIcon(entry.rank)}
                        </div>

                        {/* Avatar */}
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border">
                            <ImageWithFallback
                              src={entry.avatar}
                              alt={entry.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {entry.rank <= 3 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                              <Star className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Name and Stats */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground truncate">
                              {entry.name}
                            </h3>
                            {entry.isYou && (
                              <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30 text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {entry.correctPicks}/{entry.totalPicks} correct picks • {((entry.correctPicks / entry.totalPicks) * 100).toFixed(1)}% accuracy
                          </p>
                        </div>

                        {/* Points */}
                        <div className="text-right">
                          <p className="text-xl font-bold text-orange-400">{entry.points}</p>
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>

                        {/* Rank Change */}
                        <div className="hidden sm:flex w-16 justify-center">
                          {getRankChange(entry.rank, entry.previousRank)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Drafts Tab */}
          {activeTab === 'drafts' && (
            <div className="space-y-6">
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                    <Target className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">My Draft Leaderboards</h2>
                    <p className="text-sm text-muted-foreground">View standings for each of your drafts</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {draftLeaderboards.map((draft) => (
                    <Card
                      key={draft.id}
                      className="p-6 bg-background border-border hover:border-orange-500/50 transition-all cursor-pointer group"
                      onClick={() => onNavigate('draft-details')}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                              {draft.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="w-4 h-4" />
                              <span>{draft.participants} players</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Your Rank</span>
                            <div className="flex items-center gap-2">
                              {draft.yourRank === 1 && <Crown className="w-4 h-4 text-yellow-400" />}
                              <span className={`text-lg font-bold ${
                                draft.yourRank === 1 ? 'text-yellow-400' : 
                                draft.yourRank <= 3 ? 'text-green-400' : 
                                'text-foreground'
                              }`}>
                                #{draft.yourRank}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button className="w-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/30">
                          View Leaderboard
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Contests Tab */}
          {activeTab === 'contests' && (
            <div className="space-y-6">
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">My Contest Leaderboards</h2>
                    <p className="text-sm text-muted-foreground">Track your performance in bracket contests</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contestLeaderboards.map((contest) => (
                    <Card
                      key={contest.id}
                      className="p-6 bg-background border-border hover:border-purple-500/50 transition-all cursor-pointer group"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                              {contest.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="w-4 h-4" />
                              <span>{contest.participants} participants</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Your Rank</span>
                            <div className="flex items-center gap-2">
                              {contest.yourRank <= 10 && <Award className="w-4 h-4 text-orange-400" />}
                              <span className={`text-lg font-bold ${
                                contest.yourRank <= 10 ? 'text-orange-400' : 'text-foreground'
                              }`}>
                                #{contest.yourRank}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Top {((contest.yourRank / contest.participants) * 100).toFixed(1)}%
                          </div>
                        </div>

                        <Button className="w-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/30">
                          View Leaderboard
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}