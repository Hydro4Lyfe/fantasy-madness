import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
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
  Search,
  X,
  AlertCircle,
  Filter,
} from 'lucide-react';

interface GlobalPicksPageProps {
  onNavigate: (page: string) => void;
}

// All 68 teams in March Madness
const ALL_TEAMS = [
  // #1 Seeds
  { id: 1, name: 'UConn', seed: 1, region: 'East', record: '28-3', rank: 1 },
  { id: 2, name: 'Houston', seed: 1, region: 'South', record: '27-4', rank: 2 },
  { id: 3, name: 'Purdue', seed: 1, region: 'Midwest', record: '26-5', rank: 3 },
  { id: 4, name: 'North Carolina', seed: 1, region: 'West', record: '25-6', rank: 4 },
  
  // #2 Seeds
  { id: 5, name: 'Tennessee', seed: 2, region: 'East', record: '24-7', rank: 5 },
  { id: 6, name: 'Marquette', seed: 2, region: 'South', record: '23-8', rank: 6 },
  { id: 7, name: 'Arizona', seed: 2, region: 'Midwest', record: '24-7', rank: 7 },
  { id: 8, name: 'Iowa State', seed: 2, region: 'West', record: '23-8', rank: 8 },
  
  // #3 Seeds
  { id: 9, name: 'Kentucky', seed: 3, region: 'East', record: '23-8', rank: 9 },
  { id: 10, name: 'Creighton', seed: 3, region: 'South', record: '22-9', rank: 10 },
  { id: 11, name: 'Baylor', seed: 3, region: 'Midwest', record: '22-9', rank: 11 },
  { id: 12, name: 'Illinois', seed: 3, region: 'West', record: '21-10', rank: 12 },
  
  // #4 Seeds
  { id: 13, name: 'Duke', seed: 4, region: 'East', record: '22-9', rank: 13 },
  { id: 14, name: 'Alabama', seed: 4, region: 'South', record: '21-10', rank: 14 },
  { id: 15, name: 'Kansas', seed: 4, region: 'Midwest', record: '21-10', rank: 15 },
  { id: 16, name: 'Auburn', seed: 4, region: 'West', record: '20-11', rank: 16 },
  
  // #5 Seeds
  { id: 17, name: 'Wisconsin', seed: 5, region: 'East', record: '20-11', rank: 17 },
  { id: 18, name: 'San Diego State', seed: 5, region: 'South', record: '20-11', rank: 18 },
  { id: 19, name: 'Saint Mary\'s', seed: 5, region: 'Midwest', record: '24-7', rank: 19 },
  { id: 20, name: 'Gonzaga', seed: 5, region: 'West', record: '23-8', rank: 20 },
  
  // #6 Seeds
  { id: 21, name: 'BYU', seed: 6, region: 'East', record: '22-9', rank: 21 },
  { id: 22, name: 'Clemson', seed: 6, region: 'South', record: '20-11', rank: 22 },
  { id: 23, name: 'Texas', seed: 6, region: 'Midwest', record: '19-12', rank: 23 },
  { id: 24, name: 'Dayton', seed: 6, region: 'West', record: '23-8', rank: 24 },
  
  // #7 Seeds
  { id: 25, name: 'Florida', seed: 7, region: 'East', record: '19-12', rank: 25 },
  { id: 26, name: 'Texas A&M', seed: 7, region: 'South', record: '19-12', rank: 26 },
  { id: 27, name: 'Washington State', seed: 7, region: 'Midwest', record: '22-9', rank: 27 },
  { id: 28, name: 'Northwestern', seed: 7, region: 'West', record: '20-11', rank: 28 },
  
  // #8 Seeds
  { id: 29, name: 'Nebraska', seed: 8, region: 'East', record: '21-10', rank: 29 },
  { id: 30, name: 'Michigan State', seed: 8, region: 'South', record: '18-13', rank: 30 },
  { id: 31, name: 'Utah State', seed: 8, region: 'Midwest', record: '26-5', rank: 31 },
  { id: 32, name: 'Mississippi State', seed: 8, region: 'West', record: '20-11', rank: 32 },
  
  // #9 Seeds
  { id: 33, name: 'Texas Tech', seed: 9, region: 'East', record: '19-12', rank: 33 },
  { id: 34, name: 'TCU', seed: 9, region: 'South', record: '19-12', rank: 34 },
  { id: 35, name: 'Florida Atlantic', seed: 9, region: 'Midwest', record: '23-8', rank: 35 },
  { id: 36, name: 'Nevada', seed: 9, region: 'West', record: '23-8', rank: 36 },
  
  // #10 Seeds
  { id: 37, name: 'Colorado', seed: 10, region: 'East', record: '20-11', rank: 37 },
  { id: 38, name: 'USC', seed: 10, region: 'South', record: '20-11', rank: 38 },
  { id: 39, name: 'Drake', seed: 10, region: 'Midwest', record: '26-6', rank: 39 },
  { id: 40, name: 'Colorado State', seed: 10, region: 'West', record: '23-8', rank: 40 },
  
  // #11 Seeds
  { id: 41, name: 'NC State', seed: 11, region: 'East', record: '19-12', rank: 41 },
  { id: 42, name: 'Oregon', seed: 11, region: 'South', record: '20-11', rank: 42 },
  { id: 43, name: 'New Mexico', seed: 11, region: 'Midwest', record: '24-7', rank: 43 },
  { id: 44, name: 'VCU', seed: 11, region: 'West', record: '23-10', rank: 44 },
  
  // #12 Seeds
  { id: 45, name: 'James Madison', seed: 12, region: 'East', record: '27-4', rank: 45 },
  { id: 46, name: 'McNeese State', seed: 12, region: 'South', record: '28-3', rank: 46 },
  { id: 47, name: 'Grand Canyon', seed: 12, region: 'Midwest', record: '28-4', rank: 47 },
  { id: 48, name: 'UAB', seed: 12, region: 'West', record: '24-7', rank: 48 },
  
  // #13 Seeds
  { id: 49, name: 'Yale', seed: 13, region: 'East', record: '22-9', rank: 49 },
  { id: 50, name: 'Samford', seed: 13, region: 'South', record: '27-5', rank: 50 },
  { id: 51, name: 'Akron', seed: 13, region: 'Midwest', record: '24-9', rank: 51 },
  { id: 52, name: 'Vermont', seed: 13, region: 'West', record: '25-6', rank: 52 },
  
  // #14 Seeds
  { id: 53, name: 'Morehead State', seed: 14, region: 'East', record: '26-7', rank: 53 },
  { id: 54, name: 'Colgate', seed: 14, region: 'South', record: '25-8', rank: 54 },
  { id: 55, name: 'Longwood', seed: 14, region: 'Midwest', record: '24-9', rank: 55 },
  { id: 56, name: 'Oakland', seed: 14, region: 'West', record: '23-10', rank: 56 },
  
  // #15 Seeds
  { id: 57, name: 'Wagner', seed: 15, region: 'East', record: '23-10', rank: 57 },
  { id: 58, name: 'South Dakota State', seed: 15, region: 'South', record: '22-11', rank: 58 },
  { id: 59, name: 'Stetson', seed: 15, region: 'Midwest', record: '22-11', rank: 59 },
  { id: 60, name: 'Western Kentucky', seed: 15, region: 'West', record: '21-12', rank: 60 },
  
  // #16 Seeds
  { id: 61, name: 'Montana State', seed: 16, region: 'East', record: '24-9', rank: 61 },
  { id: 62, name: 'Grambling', seed: 16, region: 'South', record: '21-12', rank: 62 },
  { id: 63, name: 'Howard', seed: 16, region: 'Midwest', record: '20-13', rank: 63 },
  { id: 64, name: 'NCCU', seed: 16, region: 'West', record: '19-14', rank: 64 },
  
  // Play-in teams
  { id: 65, name: 'Virginia', seed: 11, region: 'East', record: '19-12', rank: 65 },
  { id: 66, name: 'Mississippi', seed: 11, region: 'South', record: '19-12', rank: 66 },
  { id: 67, name: 'Prairie View A&M', seed: 16, region: 'Midwest', record: '18-15', rank: 67 },
  { id: 68, name: 'Southern', seed: 16, region: 'West', record: '17-16', rank: 68 },
];

export function GlobalPicksPage({ onNavigate }: GlobalPicksPageProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedSeed, setSelectedSeed] = useState<string>('all');

  const toggleTeamSelection = (teamId: number) => {
    if (selectedTeams.includes(teamId)) {
      setSelectedTeams(selectedTeams.filter(id => id !== teamId));
    } else {
      if (selectedTeams.length < 8) {
        setSelectedTeams([...selectedTeams, teamId]);
      }
    }
  };

  const clearAllSelections = () => {
    setSelectedTeams([]);
  };

  const handleSubmit = () => {
    if (selectedTeams.length === 8) {
      // Submit picks logic here
      alert('Picks submitted successfully!');
      onNavigate('global-contest');
    }
  };

  // Filter teams based on search and filters
  const filteredTeams = ALL_TEAMS.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || team.region === selectedRegion;
    const matchesSeed = selectedSeed === 'all' || team.seed.toString() === selectedSeed;
    return matchesSearch && matchesRegion && matchesSeed;
  });

  const selectedTeamObjects = ALL_TEAMS.filter(team => selectedTeams.includes(team.id));

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

                {showUserMenu && (
                  <>
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
          {/* Back Button */}
          <div className="pt-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('global-contest')}
              className="text-muted-foreground hover:text-foreground -ml-2"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Global Contest
            </Button>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Pick Your 8 Teams</h1>
            <p className="text-muted-foreground">Select 8 teams from the field of 68 to compete in the Global Championship</p>
          </div>

          {/* Selected Teams Bar - Sticky */}
          <div className="sticky top-20 z-30 mb-6">
            <Card className="p-4 bg-card/95 backdrop-blur-md border-orange-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-orange-400" />
                  <span className="font-semibold text-foreground">Your Picks ({selectedTeams.length}/8)</span>
                </div>
                {selectedTeams.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllSelections}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              {selectedTeams.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No teams selected yet. Choose 8 teams below.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedTeamObjects.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/30"
                    >
                      <Badge variant="outline" className="text-xs">#{team.seed}</Badge>
                      <span className="text-sm font-medium text-foreground">{team.name}</span>
                      <button
                        onClick={() => toggleTeamSelection(team.id)}
                        className="ml-1 text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {selectedTeams.length === 8 && (
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg shadow-orange-500/30"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit My 8 Picks
                </Button>
              )}

              {selectedTeams.length > 0 && selectedTeams.length < 8 && (
                <div className="text-sm text-center text-muted-foreground">
                  Select {8 - selectedTeams.length} more team{8 - selectedTeams.length !== 1 ? 's' : ''} to submit
                </div>
              )}
            </Card>
          </div>

          {/* Filters and Search */}
          <div className="mb-6">
            <Card className="p-4 bg-card border-border">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search teams..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background border-border"
                  />
                </div>

                {/* Region Filter */}
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <option value="all">All Regions</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                  <option value="South">South</option>
                  <option value="Midwest">Midwest</option>
                </select>

                {/* Seed Filter */}
                <select
                  value={selectedSeed}
                  onChange={(e) => setSelectedSeed(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <option value="all">All Seeds</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(seed => (
                    <option key={seed} value={seed.toString()}>#{seed} Seed</option>
                  ))}
                </select>
              </div>
            </Card>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTeams.map((team) => {
              const isSelected = selectedTeams.includes(team.id);
              const canSelect = selectedTeams.length < 8 || isSelected;

              return (
                <Card
                  key={team.id}
                  onClick={() => canSelect && toggleTeamSelection(team.id)}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-orange-500/20 border-orange-500 ring-2 ring-orange-500 shadow-lg shadow-orange-500/20'
                      : canSelect
                      ? 'bg-background border-border hover:border-orange-500/50 hover:bg-orange-500/5'
                      : 'bg-background/50 border-border opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`${
                          team.seed <= 4 
                            ? 'border-green-500/50 text-green-400' 
                            : team.seed <= 8
                            ? 'border-blue-500/50 text-blue-400'
                            : 'border-border text-muted-foreground'
                        }`}
                      >
                        #{team.seed}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {team.region}
                      </Badge>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-foreground text-lg mb-1">{team.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">Record: {team.record}</p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Rank #{team.rank}</span>
                    {!isSelected && canSelect && (
                      <span className="text-orange-400">Click to select</span>
                    )}
                    {!canSelect && !isSelected && (
                      <span className="text-red-400">Max reached</span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredTeams.length === 0 && (
            <Card className="p-12 bg-card border-border text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold text-foreground mb-2">No teams found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}