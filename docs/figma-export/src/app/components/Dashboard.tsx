import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import {
  Trophy,
  Users,
  TrendingUp,
  Zap,
  Calendar,
  Target,
  Globe,
  Crown,
  Award,
  Star,
  ChevronRight,
  Lock,
  LogOut,
  BarChart3,
  Settings,
  User,
  Plus,
  Search,
  Shield,
  Clock,
  ArrowRight,
  Flame,
  Menu,
  Archive,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);

  // Mock data for leaderboard preview
  const leaderboardPreview = [
    { rank: 1, name: 'Sarah Chen', points: 2847, change: 'up', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
    { rank: 2, name: 'Mike Johnson', points: 2756, change: 'up', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    { rank: 3, name: 'Alex Rivera', points: 2689, change: 'down', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
    { rank: 4, name: 'Emily Davis', points: 2634, change: 'same', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
    { rank: 5, name: 'Chris Taylor', points: 2598, change: 'up', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
  ];

  const userRank = { rank: 47, name: 'You', points: 1247, totalPlayers: 2847 };

  // Mock data for user's drafts
  const myDrafts = [
    {
      id: 1,
      name: 'Office Champions League',
      type: 'private',
      participants: 8,
      maxParticipants: 8,
      status: 'active',
      draftDate: 'Mar 15, 2026',
      myRank: 3,
      myTeams: ['Duke', 'Kansas', 'UConn', 'Houston', 'Purdue', 'Arizona', 'Tennessee', 'Kentucky'],
    },
    {
      id: 2,
      name: 'Friends & Family Draft',
      type: 'private',
      participants: 6,
      maxParticipants: 8,
      status: 'draft',
      draftDate: 'Mar 18, 2026',
      myRank: null,
      myTeams: [],
    },
    {
      id: 3,
      name: 'Weekend Warriors Draft',
      type: 'private',
      participants: 8,
      maxParticipants: 8,
      status: 'active',
      draftDate: 'Mar 16, 2026',
      myRank: 5,
      myTeams: ['Alabama', 'Marquette', 'Creighton', 'Baylor', 'Texas', 'Florida', 'UCLA', 'Illinois'],
    },
  ];

  // Mock data for user's contests
  const myContests = [
    {
      id: 1,
      name: 'College Alumni Tournament',
      type: 'private',
      participants: 45,
      maxParticipants: 100,
      status: 'active',
      startDate: 'Mar 15, 2026',
      myRank: 12,
    },
    {
      id: 2,
      name: 'High Stakes Challenge',
      type: 'public',
      participants: 156,
      maxParticipants: 200,
      status: 'active',
      startDate: 'Mar 16, 2026',
      myRank: 34,
    },
  ];

  // Mock data for open drafts
  const openDrafts = [
    {
      id: 1,
      name: 'Big Bracket Battle',
      type: 'public',
      participants: 150,
      maxParticipants: 200,
      status: 'open',
      startDate: 'Mar 20, 2026',
      difficulty: 'Expert',
    },
    {
      id: 2,
      name: 'Casual March Madness Fun',
      type: 'public',
      participants: 85,
      maxParticipants: 100,
      status: 'open',
      startDate: 'Mar 19, 2026',
      difficulty: 'Beginner',
    },
    {
      id: 3,
      name: 'Elite Championship Series',
      type: 'public',
      participants: 42,
      maxParticipants: 50,
      status: 'open',
      startDate: 'Mar 21, 2026',
      difficulty: 'Expert',
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'Expert':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'draft':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
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
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Welcome back, Player!</h1>
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
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Points</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">1,247</p>
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
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Global Rank</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-400">#47</p>
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
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Entries</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{myDrafts.length + myContests.length}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-purple-300 hidden sm:inline">{myDrafts.length} drafts, {myContests.length} contests</span>
                    <span className="text-xs text-purple-300 sm:hidden">{myDrafts.length}D / {myContests.length}C</span>
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
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Win Rate</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">67%</p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-blue-300 hidden sm:inline">8 of 12 wins</span>
                    <span className="text-xs text-blue-300 sm:hidden">8/12</span>
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
                      <p className="text-sm text-orange-400">Compete against 50,000+ players worldwide</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Submit your official bracket and compete against the best. Everyone plays with the same rules.
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
                    onClick={() => onNavigate('global-picks')}
                    className="w-full lg:w-auto bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg shadow-orange-500/30 h-12 px-8"
                  >
                    Enter Global Picks
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center lg:text-left">No entry fee required</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Join with Code Card */}
            <Card className="p-6 bg-gradient-to-br from-purple-500/10 via-card to-blue-500/10 border-purple-500/30 hover:border-purple-500/60 transition-all relative overflow-hidden group h-full">
              {/* Decorative gradient orbs */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-all" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all" />
              
              <div className="relative h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-xl mb-1">Join Private Draft</h3>
                    <p className="text-sm text-muted-foreground">Enter a friend's invite code</p>
                  </div>
                </div>

                {/* Code Input Section */}
                <div className="space-y-3 mb-6">
                  <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border space-y-3">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      Invite Code
                    </label>
                    <Input
                      placeholder="e.g. MARCH2026"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      className="bg-background border-border text-lg font-mono tracking-wider placeholder:tracking-normal placeholder:font-sans"
                    />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-lg group-hover:shadow-purple-500/25 transition-all h-11">
                    Join Draft
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

                {/* Info Section */}
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

                {/* Spacer to push bottom content down */}
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

                  {/* Create Draft Button */}
                  <Button 
                    variant="outline" 
                    className="w-full border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50 group/create"
                  >
                    <Plus className="w-4 h-4 mr-2 group-hover/create:rotate-90 transition-transform" />
                    Create Your Own Draft
                  </Button>
                </div>
              </div>
            </Card>

            {/* Browse Public Drafts Card */}
            <Card 
              className="p-6 bg-gradient-to-br from-orange-500/10 via-card to-purple-500/10 border-orange-500/30 hover:border-orange-500/60 transition-all cursor-pointer group relative overflow-hidden h-full"
              onClick={() => onNavigate('public-contests')}
            >
              {/* Decorative gradient orbs */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl group-hover:bg-orange-500/30 transition-all" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-all" />
              
              <div className="relative h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Search className="w-6 h-6 text-white" />
                      </div>
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                        24 Open Now
                      </Badge>
                    </div>
                    <h3 className="font-bold text-foreground text-xl mb-1">Browse Public Drafts</h3>
                    <p className="text-sm text-muted-foreground">Discover and join competitions worldwide</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-orange-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                </div>

                {/* Quick Stats */}
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

                {/* Features list */}
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

                {/* Spacer to push CTA button down */}
                <div className="flex-1" />

                {/* CTA */}
                <Button className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white shadow-lg group-hover:shadow-orange-500/25 transition-all">
                  Explore All Drafts
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onNavigate('leaderboards')}
                className="hover:border-orange-500/50"
              >
                View Full Leaderboard
                <ChevronRight className="w-4 h-4 ml-1" />
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
                    {leaderboardPreview.map((player, idx) => (
                      <div
                        key={player.rank}
                        className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                          idx < 3 
                            ? 'bg-gradient-to-r from-orange-500/5 to-transparent border border-orange-500/20' 
                            : 'bg-muted/30 hover:bg-muted/50'
                        }`}
                      >
                        {/* Rank Badge */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          player.rank === 1 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white' :
                          player.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900' :
                          player.rank === 3 ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {player.rank}
                        </div>

                        {/* Player Avatar */}
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-border">
                          <ImageWithFallback
                            src={player.avatar}
                            alt={player.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Player Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{player.name}</p>
                          <div className="flex items-center gap-2">
                            <Crown className="w-3 h-3 text-orange-400" />
                            <span className="text-sm text-orange-400 font-medium">
                              {player.points.toLocaleString()} pts
                            </span>
                          </div>
                        </div>

                        {/* Change Indicator */}
                        <div className="flex items-center gap-1">
                          {player.change === 'up' ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : player.change === 'down' ? (
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
                    {/* Rank Display */}
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30">
                      <p className="text-sm text-muted-foreground mb-2">Current Rank</p>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-5xl font-bold text-orange-400">#{userRank.rank}</span>
                        <span className="text-lg text-muted-foreground">/ {userRank.totalPlayers.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Total Points</span>
                        <span className="font-bold text-foreground">{userRank.points.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Percentile</span>
                        <span className="font-bold text-green-400">
                          Top {Math.round((userRank.rank / userRank.totalPlayers) * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button 
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => onNavigate('leaderboards')}
                    >
                      View Detailed Stats
                      <BarChart3 className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}