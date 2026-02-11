import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import {
  Trophy,
  Users,
  Globe,
  Crown,
  Award,
  Star,
  ChevronLeft,
  LogOut,
  BarChart3,
  Settings,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle,
  Menu,
  Archive,
} from 'lucide-react';

interface GlobalContestPageProps {
  onNavigate: (page: string) => void;
}

export function GlobalContestPage({ onNavigate }: GlobalContestPageProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);

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

      {/* Back Arrow - Below Navbar */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-background/60 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 py-3 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-32 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Global Championship</h1>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Open
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">Compete against 50,000+ players worldwide</p>
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-muted-foreground">Total Entries</span>
                </div>
                <p className="text-2xl font-bold text-foreground">50,234</p>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-muted-foreground">Entry Deadline</span>
                </div>
                <p className="text-2xl font-bold text-foreground">Mar 17</p>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-muted-foreground">Tournament Start</span>
                </div>
                <p className="text-2xl font-bold text-foreground">Mar 18</p>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-muted-foreground">Entry Fee</span>
                </div>
                <p className="text-2xl font-bold text-green-400">Free</p>
              </Card>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Contest Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              <Card className="p-6 bg-card border-border">
                <h2 className="text-xl font-bold text-foreground mb-4">About the Global Championship</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    The Global Championship is our flagship bracket competition where everyone competes on a level playing field. 
                    Submit your perfect bracket and climb the global leaderboard as March Madness unfolds.
                  </p>
                  <p>
                    Points are awarded for each correct pick, with bonus points for upsets and later round victories. 
                    Track your progress in real-time and see how you stack up against basketball fans worldwide.
                  </p>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                  <h3 className="font-semibold text-foreground mb-3">Scoring System</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-2 rounded bg-background/50">
                      <span className="text-sm text-muted-foreground">Round of 64</span>
                      <span className="font-bold text-foreground">10 pts</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-background/50">
                      <span className="text-sm text-muted-foreground">Round of 32</span>
                      <span className="font-bold text-foreground">20 pts</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-background/50">
                      <span className="text-sm text-muted-foreground">Sweet 16</span>
                      <span className="font-bold text-foreground">40 pts</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-background/50">
                      <span className="text-sm text-muted-foreground">Elite 8</span>
                      <span className="font-bold text-foreground">80 pts</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-background/50">
                      <span className="text-sm text-muted-foreground">Final Four</span>
                      <span className="font-bold text-foreground">160 pts</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-background/50">
                      <span className="text-sm text-muted-foreground">Championship</span>
                      <span className="font-bold text-orange-400">320 pts</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Leaderboard Preview */}
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Top 10 Leaders</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onNavigate('leaderboards')}
                    className="hover:border-orange-500/50"
                  >
                    View Full Leaderboard
                  </Button>
                </div>

                <div className="space-y-2">
                  {[
                    { rank: 1, name: 'Sarah Chen', points: 2847 },
                    { rank: 2, name: 'Mike Johnson', points: 2756 },
                    { rank: 3, name: 'Alex Rivera', points: 2689 },
                    { rank: 4, name: 'Emily Davis', points: 2634 },
                    { rank: 5, name: 'Chris Taylor', points: 2598 },
                  ].map((player) => (
                    <div
                      key={player.rank}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                        player.rank === 1 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white' :
                        player.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900' :
                        player.rank === 3 ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {player.rank}
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{player.name}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-orange-400" />
                        <span className="font-bold text-orange-400">{player.points.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column - Your Entry */}
            <div className="space-y-6">
              {/* Enter/Edit Bracket Card */}
              <Card className="p-6 bg-gradient-to-br from-orange-500/10 via-card to-card border-orange-500/30">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-lg">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Ready to Compete?</h3>
                    <p className="text-sm text-muted-foreground">
                      Submit your bracket before March 17 to join the competition
                    </p>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg shadow-orange-500/30 h-12">
                    Create My Bracket
                  </Button>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Entry Status</span>
                      <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                        Not Entered
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Your Rank Card (placeholder) */}
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-orange-400" />
                  <h3 className="font-semibold text-foreground">Your Ranking</h3>
                </div>

                <div className="text-center p-6 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-2">Current Rank</p>
                  <p className="text-5xl font-bold text-orange-400 mb-2">-</p>
                  <p className="text-sm text-muted-foreground">Submit your bracket to start competing</p>
                </div>
              </Card>

              {/* Rules Card */}
              <Card className="p-6 bg-card border-border">
                <h3 className="font-semibold text-foreground mb-4">Contest Rules</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">One entry per player</p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">Must be submitted before first game</p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">No bracket changes after submission</p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">Points update in real-time</p>
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