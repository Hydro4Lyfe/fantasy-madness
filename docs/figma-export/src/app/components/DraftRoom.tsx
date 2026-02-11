import React, { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import {
  Trophy,
  ArrowLeft,
  Users,
  Clock,
  Search,
  Filter,
  Star,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  List,
  X,
  Check,
  Zap,
  AlertCircle,
} from 'lucide-react';

interface DraftRoomProps {
  onNavigate: (page: string) => void;
}

interface Team {
  id: number;
  name: string;
  seed: number;
  conference: string;
  record: string;
  rank: number;
  logo: string;
}

interface Player {
  id: number;
  name: string;
  avatar: string;
  picks: number[];
  isYou: boolean;
}

interface Pick {
  round: number;
  pickNumber: number;
  playerId: number;
  teamId: number | null;
}

export function DraftRoom({ onNavigate }: DraftRoomProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [conferenceFilter, setConferenceFilter] = useState<'all' | 'ACC' | 'Big 12' | 'Big Ten' | 'SEC' | 'Other'>('all');
  const [showMyPicks, setShowMyPicks] = useState(true);
  const [showQueue, setShowQueue] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(90);
  const [currentPickIndex, setCurrentPickIndex] = useState(5); // Simulating we're on pick 6
  const [draftQueue, setDraftQueue] = useState<number[]>([]); // Team IDs in order of preference

  // Mock NCAA tournament teams
  const allTeams: Team[] = [
    { id: 1, name: 'Houston', seed: 1, conference: 'Big 12', record: '30-3', rank: 1, logo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100' },
    { id: 2, name: 'Alabama', seed: 1, conference: 'SEC', record: '29-5', rank: 2, logo: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=100' },
    { id: 3, name: 'Purdue', seed: 1, conference: 'Big Ten', record: '29-5', rank: 3, logo: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=100' },
    { id: 4, name: 'Duke', seed: 1, conference: 'ACC', record: '27-7', rank: 4, logo: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=100' },
    { id: 5, name: 'UConn', seed: 2, conference: 'Big East', record: '28-6', rank: 5, logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=100' },
    { id: 6, name: 'Arizona', seed: 2, conference: 'Pac-12', record: '27-7', rank: 6, logo: 'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?w=100' },
    { id: 7, name: 'Kansas', seed: 2, conference: 'Big 12', record: '26-8', rank: 7, logo: 'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=100' },
    { id: 8, name: 'Tennessee', seed: 2, conference: 'SEC', record: '26-8', rank: 8, logo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100' },
    { id: 9, name: 'North Carolina', seed: 3, conference: 'ACC', record: '25-9', rank: 9, logo: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=100' },
    { id: 10, name: 'Marquette', seed: 3, conference: 'Big East', record: '25-9', rank: 10, logo: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=100' },
    { id: 11, name: 'Creighton', seed: 3, conference: 'Big East', record: '24-10', rank: 11, logo: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=100' },
    { id: 12, name: 'Baylor', seed: 3, conference: 'Big 12', record: '24-10', rank: 12, logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=100' },
    { id: 13, name: 'Illinois', seed: 4, conference: 'Big Ten', record: '23-11', rank: 13, logo: 'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?w=100' },
    { id: 14, name: 'Auburn', seed: 4, conference: 'SEC', record: '23-11', rank: 14, logo: 'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=100' },
    { id: 15, name: 'Wisconsin', seed: 4, conference: 'Big Ten', record: '22-12', rank: 15, logo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100' },
    { id: 16, name: 'Kentucky', seed: 4, conference: 'SEC', record: '22-12', rank: 16, logo: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=100' },
    { id: 17, name: 'Texas', seed: 5, conference: 'Big 12', record: '21-13', rank: 17, logo: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=100' },
    { id: 18, name: 'Florida', seed: 5, conference: 'SEC', record: '21-13', rank: 18, logo: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=100' },
    { id: 19, name: 'San Diego State', seed: 5, conference: 'Mountain West', record: '24-10', rank: 19, logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=100' },
    { id: 20, name: 'Clemson', seed: 6, conference: 'ACC', record: '20-14', rank: 20, logo: 'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?w=100' },
  ];

  // Mock players
  const players: Player[] = [
    { id: 1, name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', picks: [1, 16], isYou: false },
    { id: 2, name: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', picks: [2, 15], isYou: false },
    { id: 3, name: 'You', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100', picks: [3], isYou: true },
    { id: 4, name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', picks: [4, 13], isYou: false },
    { id: 5, name: 'Jordan Lee', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', picks: [5, 12], isYou: false },
    { id: 6, name: 'Taylor Swift', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', picks: [], isYou: false },
    { id: 7, name: 'Chris Martin', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', picks: [7, 10], isYou: false },
    { id: 8, name: 'Dana White', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', picks: [8, 9], isYou: false },
  ];

  // Create draft order (snake draft)
  const createDraftOrder = (): Pick[] => {
    const order: Pick[] = [];
    let pickNumber = 1;
    
    for (let round = 1; round <= 8; round++) {
      const isOddRound = round % 2 === 1;
      const playersThisRound = isOddRound ? [...players] : [...players].reverse();
      
      playersThisRound.forEach((player) => {
        order.push({
          round,
          pickNumber: pickNumber++,
          playerId: player.id,
          teamId: null,
        });
      });
    }
    
    return order;
  };

  const [draftOrder, setDraftOrder] = useState<Pick[]>(createDraftOrder());
  const currentPick = draftOrder[currentPickIndex];
  const isYourTurn = currentPick && players.find(p => p.id === currentPick.playerId)?.isYou;

  // Get drafted team IDs
  const draftedTeamIds = players.flatMap(p => p.picks);

  // Filter available teams
  const availableTeams = allTeams.filter(team => {
    if (draftedTeamIds.includes(team.id)) return false;
    
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesConference = conferenceFilter === 'all' || 
      team.conference === conferenceFilter ||
      (conferenceFilter === 'Other' && !['ACC', 'Big 12', 'Big Ten', 'SEC'].includes(team.conference));
    
    return matchesSearch && matchesConference;
  });

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleSelectTeam = (teamId: number) => {
    if (isYourTurn) {
      setSelectedTeam(teamId);
    }
  };

  const handleConfirmPick = () => {
    if (selectedTeam && isYourTurn) {
      // Add pick logic here
      alert(`You drafted ${allTeams.find(t => t.id === selectedTeam)?.name}!`);
      setSelectedTeam(null);
      setCurrentPickIndex(currentPickIndex + 1);
      setTimeLeft(90);
    }
  };

  const addToQueue = (teamId: number) => {
    if (!draftQueue.includes(teamId)) {
      setDraftQueue([...draftQueue, teamId]);
    }
  };

  const removeFromQueue = (teamId: number) => {
    setDraftQueue(draftQueue.filter(id => id !== teamId));
  };

  const moveInQueue = (teamId: number, direction: 'up' | 'down') => {
    const currentIndex = draftQueue.indexOf(teamId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= draftQueue.length) return;
    
    const newQueue = [...draftQueue];
    [newQueue[currentIndex], newQueue[newIndex]] = [newQueue[newIndex], newQueue[currentIndex]];
    setDraftQueue(newQueue);
  };

  const getTeamById = (id: number) => allTeams.find(t => t.id === id);

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
      </div>

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('dashboard')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="font-bold text-foreground">Office Champions League</h1>
                <p className="text-xs text-muted-foreground">Round {currentPick?.round} • Pick {currentPick?.pickNumber}</p>
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-4">
              <Card className={`px-4 py-2 ${timeLeft <= 10 ? 'bg-red-500/10 border-red-500/50' : 'bg-card border-border'}`}>
                <div className="flex items-center gap-2">
                  <Clock className={`w-5 h-5 ${timeLeft <= 10 ? 'text-red-400' : 'text-orange-400'}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">Time Left</p>
                    <p className={`text-lg font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-foreground'}`}>
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 pt-20 pb-6 px-4 sm:px-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex gap-6 h-[calc(100vh-120px)]">
            {/* Left Side - Available Teams (60%) */}
            <div className="flex-1 flex flex-col space-y-4">
              {/* On the Clock Banner */}
              {isYourTurn ? (
                <Card className="p-4 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border-orange-500/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center animate-pulse">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">You're On The Clock!</h2>
                        <p className="text-sm text-muted-foreground">Select a team to draft</p>
                      </div>
                    </div>
                    {selectedTeam && (
                      <Button 
                        onClick={handleConfirmPick}
                        className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Confirm Pick
                      </Button>
                    )}
                  </div>
                </Card>
              ) : (
                <Card className="p-4 bg-card border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <ImageWithFallback
                        src={players.find(p => p.id === currentPick?.playerId)?.avatar || ''}
                        alt="Current picker"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">On The Clock</p>
                      <p className="font-bold text-foreground">
                        {players.find(p => p.id === currentPick?.playerId)?.name} is picking...
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Search and Filters */}
              <Card className="p-4 bg-card border-border">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search teams..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-background border-border"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto">
                    <Button
                      variant={conferenceFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setConferenceFilter('all')}
                      className={conferenceFilter === 'all' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                    >
                      All
                    </Button>
                    {['ACC', 'Big 12', 'Big Ten', 'SEC', 'Other'].map((conf) => (
                      <Button
                        key={conf}
                        variant={conferenceFilter === conf ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setConferenceFilter(conf as any)}
                        className={conferenceFilter === conf ? 'bg-orange-500 hover:bg-orange-600' : ''}
                      >
                        {conf}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQueue(!showQueue)}
                    className="relative"
                  >
                    <List className="w-4 h-4 mr-2" />
                    Queue
                    {draftQueue.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                        {draftQueue.length}
                      </span>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Available Teams Grid */}
              <Card className="flex-1 p-4 bg-card border-border overflow-hidden">
                <div className="h-full overflow-y-auto">
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {availableTeams.map((team) => (
                      <Card
                        key={team.id}
                        onClick={() => handleSelectTeam(team.id)}
                        className={`p-3 cursor-pointer transition-all ${
                          selectedTeam === team.id
                            ? 'bg-orange-500/20 border-orange-500 ring-2 ring-orange-500'
                            : draftQueue.includes(team.id)
                            ? 'bg-blue-500/10 border-blue-500/50'
                            : 'bg-background border-border hover:border-orange-500/50'
                        } ${!isYourTurn ? 'opacity-60' : ''}`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded overflow-hidden bg-muted flex items-center justify-center text-xs font-bold">
                                {team.seed}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground text-sm line-clamp-1">{team.name}</h3>
                                <p className="text-xs text-muted-foreground">{team.conference}</p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (draftQueue.includes(team.id)) {
                                  removeFromQueue(team.id);
                                } else {
                                  addToQueue(team.id);
                                }
                              }}
                              className="text-muted-foreground hover:text-orange-400"
                            >
                              <Star className={`w-4 h-4 ${draftQueue.includes(team.id) ? 'fill-orange-400 text-orange-400' : ''}`} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">#{team.rank}</span>
                            <span className="text-green-400 font-medium">{team.record}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Your Current Picks */}
              {showMyPicks && (
                <Card className="p-4 bg-card border-border border-purple-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">Your Picks</h3>
                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                      {players.find(p => p.isYou)?.picks.length || 0} / 8
                    </Badge>
                  </div>
                  <div className="flex gap-2 overflow-x-auto">
                    {players
                      .find(p => p.isYou)
                      ?.picks.map((teamId) => {
                        const team = getTeamById(teamId);
                        return team ? (
                          <div key={teamId} className="flex-shrink-0">
                            <Card className="p-2 bg-background border-border w-32">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-bold">
                                  {team.seed}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-foreground line-clamp-1">{team.name}</p>
                                </div>
                              </div>
                            </Card>
                          </div>
                        ) : null;
                      })}
                    {Array.from({ length: 8 - (players.find(p => p.isYou)?.picks.length || 0) }).map((_, i) => (
                      <div key={`empty-${i}`} className="flex-shrink-0">
                        <Card className="p-2 bg-background border-dashed border-border w-32 h-10 flex items-center justify-center">
                          <p className="text-xs text-muted-foreground">Empty</p>
                        </Card>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Right Side - Draft Board (40%) */}
            <div className="w-[500px] flex flex-col space-y-4">
              {/* Draft Order */}
              <Card className="flex-1 p-4 bg-card border-border overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Draft Board</h3>
                  <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                    Snake Draft
                  </Badge>
                </div>

                <div className="h-full overflow-y-auto space-y-3">
                  {players.map((player) => (
                    <Card
                      key={player.id}
                      className={`p-3 ${
                        player.id === currentPick?.playerId
                          ? 'bg-orange-500/10 border-orange-500/50'
                          : 'bg-background border-border'
                      } ${player.isYou ? 'ring-1 ring-purple-500/50' : ''}`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            <ImageWithFallback
                              src={player.avatar}
                              alt={player.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground text-sm">
                              {player.name}
                              {player.isYou && <span className="text-purple-400 ml-1">(You)</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">{player.picks.length} / 8 picks</p>
                          </div>
                          {player.id === currentPick?.playerId && (
                            <Badge className="bg-orange-500 text-white">
                              <Clock className="w-3 h-3 mr-1" />
                              Picking
                            </Badge>
                          )}
                        </div>

                        {/* Player's Picks */}
                        <div className="grid grid-cols-4 gap-1">
                          {Array.from({ length: 8 }).map((_, i) => {
                            const teamId = player.picks[i];
                            const team = teamId ? getTeamById(teamId) : null;
                            
                            return (
                              <div
                                key={i}
                                className={`aspect-square rounded flex items-center justify-center text-xs font-bold ${
                                  team
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                    : 'bg-muted/20 text-muted-foreground border border-border'
                                }`}
                              >
                                {team ? team.seed : '-'}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              {/* Auto-Draft Queue */}
              {showQueue && (
                <Card className="h-64 p-4 bg-card border-border border-blue-500/30 overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <List className="w-4 h-4 text-blue-400" />
                      <h3 className="font-semibold text-foreground">Auto-Draft Queue</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQueue(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="h-full overflow-y-auto space-y-2 pb-12">
                    {draftQueue.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No teams in queue</p>
                        <p className="text-xs text-muted-foreground mt-1">Click the star icon to add teams</p>
                      </div>
                    ) : (
                      draftQueue.map((teamId, index) => {
                        const team = getTeamById(teamId);
                        if (!team) return null;
                        
                        return (
                          <Card key={teamId} className="p-2 bg-background border-border">
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => moveInQueue(teamId, 'up')}
                                  disabled={index === 0}
                                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => moveInQueue(teamId, 'down')}
                                  disabled={index === draftQueue.length - 1}
                                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                              <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-bold">
                                {team.seed}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground line-clamp-1">{team.name}</p>
                              </div>
                              <button
                                onClick={() => removeFromQueue(teamId)}
                                className="text-muted-foreground hover:text-red-400"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
