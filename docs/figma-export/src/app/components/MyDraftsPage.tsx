import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import {
  Trophy,
  ChevronLeft,
  Users,
  Lock,
  Globe,
  TrendingUp,
  Search,
  Filter,
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
} from 'lucide-react';

interface MyDraftsPageProps {
  onNavigate: (page: string) => void;
}

export function MyDraftsPage({ onNavigate }: MyDraftsPageProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  // Extended mock data for user's drafts
  const allDrafts = [
    {
      id: 1,
      name: 'Office Champions League',
      type: 'private',
      participants: 12,
      maxParticipants: 16,
      status: 'active',
      draftDate: 'Mar 15, 2026',
      startTime: '7:00 PM EST',
      myRank: 3,
      totalPoints: 847,
      thumbnail: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
    },
    {
      id: 2,
      name: 'Friends & Family Bracket',
      type: 'private',
      participants: 8,
      maxParticipants: 10,
      status: 'draft',
      draftDate: 'Mar 18, 2026',
      startTime: '8:30 PM EST',
      myRank: null,
      totalPoints: 0,
      thumbnail: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400',
    },
    {
      id: 3,
      name: 'Pro League Challenge',
      type: 'public',
      participants: 142,
      maxParticipants: 200,
      status: 'active',
      draftDate: 'Mar 16, 2026',
      startTime: '6:00 PM EST',
      myRank: 24,
      totalPoints: 1203,
      thumbnail: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400',
    },
    {
      id: 4,
      name: 'Weekend Warriors',
      type: 'private',
      participants: 20,
      maxParticipants: 20,
      status: 'active',
      draftDate: 'Mar 14, 2026',
      startTime: '9:00 PM EST',
      myRank: 8,
      totalPoints: 654,
      thumbnail: 'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=400',
    },
    {
      id: 5,
      name: 'College Alumni Tournament',
      type: 'private',
      participants: 15,
      maxParticipants: 25,
      status: 'active',
      draftDate: 'Mar 17, 2026',
      startTime: '5:30 PM EST',
      myRank: 5,
      totalPoints: 921,
      thumbnail: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=400',
    },
    {
      id: 6,
      name: 'Neighborhood Showdown',
      type: 'private',
      participants: 6,
      maxParticipants: 8,
      status: 'draft',
      draftDate: 'Mar 20, 2026',
      startTime: '7:30 PM EST',
      myRank: null,
      totalPoints: 0,
      thumbnail: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400',
    },
    {
      id: 7,
      name: 'March Madness Masters',
      type: 'public',
      participants: 87,
      maxParticipants: 100,
      status: 'active',
      draftDate: 'Mar 15, 2026',
      startTime: '8:00 PM EST',
      myRank: 12,
      totalPoints: 1456,
      thumbnail: 'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?w=400',
    },
    {
      id: 8,
      name: 'Last Year Champions Rematch',
      type: 'private',
      participants: 10,
      maxParticipants: 10,
      status: 'completed',
      draftDate: 'Mar 10, 2025',
      startTime: '6:00 PM EST',
      myRank: 1,
      totalPoints: 2103,
      thumbnail: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'draft':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'completed':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  // Organize drafts by status
  const activeDrafts = allDrafts.filter((d) => d.status === 'active');
  const upcomingDrafts = allDrafts.filter((d) => d.status === 'draft');
  const completedDrafts = allDrafts.filter((d) => d.status === 'completed');

  const stats = {
    total: allDrafts.length,
    active: allDrafts.filter((d) => d.status === 'active').length,
    draft: allDrafts.filter((d) => d.status === 'draft').length,
    completed: allDrafts.filter((d) => d.status === 'completed').length,
  };

  const renderDraftCard = (draft: typeof allDrafts[0]) => (
    <Card
      key={draft.id}
      className="relative p-6 bg-gradient-to-br from-card via-card to-card border-border hover:border-purple-500/50 transition-all duration-300 group cursor-pointer overflow-hidden"
      onClick={() => onNavigate('draft-details')}
    >
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/15 transition-all" />
      
      <div className="relative space-y-5">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-lg text-foreground line-clamp-2 flex-1 group-hover:text-orange-400 transition-colors">{draft.name}</h3>
            <Badge className={`${getStatusColor(draft.status)} flex-shrink-0`}>
              {draft.status === 'active' ? 'Live' : draft.status === 'draft' ? 'Upcoming' : 'Ended'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{draft.draftDate}</span>
            </div>
            <Badge 
              variant="outline" 
              className={draft.type === 'private' 
                ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' 
                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              }
            >
              {draft.type === 'private' ? (
                <><Lock className="w-3 h-3 mr-1" />Private</>
              ) : (
                <><Globe className="w-3 h-3 mr-1" />Public</>
              )}
            </Badge>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-background/50 backdrop-blur-sm border border-border group-hover:border-purple-500/20 transition-all rounded-lg">
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Players</p>
            <p className="text-xl font-bold text-foreground">
              {draft.participants}<span className="text-sm text-muted-foreground font-normal">/{draft.maxParticipants}</span>
            </p>
          </div>
          <div className="space-y-1.5 text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Start Time</p>
            <p className="text-xl font-bold text-orange-400">{draft.startTime}</p>
          </div>
        </div>

        {/* Performance Section - Only for non-draft status */}
        {draft.status !== 'draft' && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground uppercase tracking-wide">Your Rank</span>
                <div className="flex items-center gap-1.5">
                  {draft.myRank && draft.myRank <= 3 && (
                    <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                  )}
                  <span className="text-lg font-bold text-foreground">
                    {draft.myRank ? `#${draft.myRank}` : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground uppercase tracking-wide">Total Points</span>
                <span className="text-lg font-bold text-orange-400">{draft.totalPoints.toLocaleString()}</span>
              </div>
            </div>
          </>
        )}

        {/* Action Section */}
        <div className="pt-2">
          <Button 
            className={`w-full ${
              draft.status === 'active' 
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-[0_0_20px_rgba(34,197,94,0.3)]' 
                : draft.status === 'draft'
                ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white border-0 shadow-[0_0_20px_rgba(249,115,22,0.3)]'
                : 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/30'
            }`}
            variant={draft.status === 'completed' ? 'outline' : 'default'}
          >
            {draft.status === 'active' ? 'Join Live Draft' : draft.status === 'draft' ? 'Prepare Draft' : 'View Results'}
          </Button>
        </div>
      </div>
    </Card>
  );

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
          {/* Back Button */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('dashboard')}
              className="text-muted-foreground hover:text-foreground -ml-2"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="h-5 w-px bg-border" />
            <h1 className="text-xl font-bold text-foreground">My Drafts</h1>
          </div>

          {/* Page Title */}
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-foreground">Drafts</h1>
            <Button
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Draft
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 bg-[#0A0A0F]/60 backdrop-blur-sm border-white/5 hover:border-white/10 transition-all">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Leagues</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </Card>
            <Card className="p-4 bg-[#0A0A0F]/60 backdrop-blur-sm border-green-500/20 hover:border-green-500/40 transition-all shadow-[0_0_15px_rgba(34,197,94,0.1)]">
              <div className="space-y-1">
                <p className="text-xs text-green-400/70 uppercase tracking-wide">Active</p>
                <p className="text-2xl font-bold text-green-400">{stats.active}</p>
              </div>
            </Card>
            <Card className="p-4 bg-[#0A0A0F]/60 backdrop-blur-sm border-yellow-500/20 hover:border-yellow-500/40 transition-all shadow-[0_0_15px_rgba(234,179,8,0.1)]">
              <div className="space-y-1">
                <p className="text-xs text-yellow-400/70 uppercase tracking-wide">Upcoming</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.draft}</p>
              </div>
            </Card>
            <Card className="p-4 bg-[#0A0A0F]/60 backdrop-blur-sm border-white/5 hover:border-white/10 transition-all">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Completed</p>
                <p className="text-2xl font-bold text-muted-foreground">{stats.completed}</p>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Join with Code Card */}
            <Card className="p-4 bg-[#0A0A0F]/60 backdrop-blur-sm border-orange-500/20 hover:border-orange-500/40 transition-all shadow-[0_0_20px_rgba(249,115,22,0.1)]">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-orange-400/80">
                  <KeyRound className="w-4 h-4" />
                  <span className="font-medium uppercase tracking-wide">Join with Code</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter draft code..."
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="bg-[#0A0A0F]/80 border-white/10 focus:border-orange-500/50 text-foreground placeholder:text-muted-foreground"
                  />
                  <Button
                    onClick={() => {
                      // Handle join logic
                      if (joinCode.trim()) {
                        console.log('Joining draft with code:', joinCode);
                        setJoinCode('');
                      }
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] transition-all"
                  >
                    Join
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Live Drafts Section */}
          {activeDrafts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <h2 className="text-lg font-semibold text-foreground">Live Now</h2>
                <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                  {activeDrafts.length}
                </Badge>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeDrafts.map(renderDraftCard)}
              </div>
            </div>
          )}

          {/* Upcoming Drafts Section */}
          {upcomingDrafts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-semibold text-foreground">Scheduled</h2>
                <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                  {upcomingDrafts.length}
                </Badge>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingDrafts.map(renderDraftCard)}
              </div>
            </div>
          )}

          {/* Completed Drafts Section */}
          {completedDrafts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Archive className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">Finished</h2>
                <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/30">
                  {completedDrafts.length}
                </Badge>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedDrafts.map(renderDraftCard)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}