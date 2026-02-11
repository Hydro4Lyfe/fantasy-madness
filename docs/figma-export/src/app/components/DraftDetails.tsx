import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import {
  Trophy,
  ArrowLeft,
  Users,
  Settings,
  Crown,
  MoreVertical,
  Copy,
  Check,
  Shield,
  UserX,
  Ban,
  Edit2,
  Calendar,
  Clock,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  Medal,
  Lock,
  Globe,
  AlertCircle,
} from 'lucide-react';

interface DraftDetailsProps {
  onNavigate: (page: string) => void;
}

type TabType = 'participants' | 'draft-room' | 'results';

interface Participant {
  id: number;
  name: string;
  email: string;
  avatar: string;
  isHost: boolean;
  isYou: boolean;
  status: 'active' | 'kicked' | 'banned';
  joinedAt: string;
  totalPoints: number;
  rank: number;
  teamsCount: number;
}

interface DraftSettings {
  name: string;
  maxParticipants: number;
  draftDate: string;
  draftTime: string;
  pickTimeLimit: number;
  draftType: 'snake' | 'linear';
  visibility: 'private' | 'public';
  inviteCode: string;
  allowAutoQueue: boolean;
}

export function DraftDetails({ onNavigate }: DraftDetailsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('participants');
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<number | null>(null);
  
  const isHost = true; // Mock - user is the host
  const draftStatus: 'upcoming' | 'drafting' | 'active' | 'completed' = 'upcoming';

  const [settings, setSettings] = useState<DraftSettings>({
    name: 'Office Champions League',
    maxParticipants: 8,
    draftDate: '2026-03-18',
    draftTime: '19:00',
    pickTimeLimit: 90,
    draftType: 'snake',
    visibility: 'private',
    inviteCode: 'CHAMP2026',
    allowAutoQueue: true,
  });

  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 1,
      name: 'You (Host)',
      email: 'you@example.com',
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100',
      isHost: true,
      isYou: true,
      status: 'active',
      joinedAt: '2026-02-15',
      totalPoints: 1847,
      rank: 1,
      teamsCount: 8,
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      isHost: false,
      isYou: false,
      status: 'active',
      joinedAt: '2026-02-16',
      totalPoints: 1623,
      rank: 2,
      teamsCount: 8,
    },
    {
      id: 3,
      name: 'Mike Chen',
      email: 'mike.chen@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      isHost: false,
      isYou: false,
      status: 'active',
      joinedAt: '2026-02-16',
      totalPoints: 1598,
      rank: 3,
      teamsCount: 8,
    },
    {
      id: 4,
      name: 'Alex Rivera',
      email: 'alex.r@example.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      isHost: false,
      isYou: false,
      status: 'active',
      joinedAt: '2026-02-17',
      totalPoints: 1456,
      rank: 4,
      teamsCount: 8,
    },
    {
      id: 5,
      name: 'Jordan Lee',
      email: 'jordan.lee@example.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      isHost: false,
      isYou: false,
      status: 'active',
      joinedAt: '2026-02-18',
      totalPoints: 1401,
      rank: 5,
      teamsCount: 8,
    },
    {
      id: 6,
      name: 'Taylor Swift',
      email: 'taylor.s@example.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
      isHost: false,
      isYou: false,
      status: 'active',
      joinedAt: '2026-02-20',
      totalPoints: 0,
      rank: 6,
      teamsCount: 0,
    },
  ]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(settings.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleKickParticipant = (participantId: number) => {
    if (window.confirm('Are you sure you want to kick this participant?')) {
      setParticipants(participants.filter(p => p.id !== participantId));
    }
  };

  const handleBanParticipant = (participantId: number) => {
    if (window.confirm('Are you sure you want to ban this participant? They will not be able to rejoin.')) {
      setParticipants(participants.map(p => 
        p.id === participantId ? { ...p, status: 'banned' as const } : p
      ));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">Upcoming</Badge>;
      case 'drafting':
        return <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30 animate-pulse">Drafting Now</Badge>;
      case 'active':
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/30">Active</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/30">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background dark">
      {/* Fixed background */}
      <div className="fixed inset-0 z-0 bg-[#0A0A0F]">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0A0A0F] to-black" />
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-orange-500/[0.03] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-orange-500/[0.02] rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('dashboard')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-foreground truncate">{settings.name}</h1>
                  {isHost && <Crown className="w-4 h-4 text-orange-400 flex-shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground">
                  {participants.filter(p => p.status === 'active').length}/{settings.maxParticipants} participants
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {getStatusBadge(draftStatus)}
              {draftStatus === 'drafting' && (
                <Button 
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                  onClick={() => onNavigate('draft-room')}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Join Draft
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('participants')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'participants'
                  ? 'text-orange-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Participants
              {activeTab === 'participants' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('draft-room')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'draft-room'
                  ? 'text-orange-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Target className="w-4 h-4 inline mr-2" />
              Draft Room
              {activeTab === 'draft-room' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'results'
                  ? 'text-orange-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Trophy className="w-4 h-4 inline mr-2" />
              Results
              {activeTab === 'results' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-32 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Participants Tab */}
          {activeTab === 'participants' && (
            <div className="space-y-6">
              {/* Draft Settings */}
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-orange-400" />
                    <h2 className="text-xl font-bold text-foreground">Draft Settings</h2>
                  </div>
                  {isHost && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingSettings(!isEditingSettings)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      {isEditingSettings ? 'Cancel' : 'Edit Settings'}
                    </Button>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Draft Name</label>
                    {isEditingSettings ? (
                      <Input
                        value={settings.name}
                        onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                        className="bg-background border-border"
                      />
                    ) : (
                      <p className="text-foreground font-medium">{settings.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Max Participants</label>
                    {isEditingSettings ? (
                      <Input
                        type="number"
                        min="2"
                        max="12"
                        value={settings.maxParticipants}
                        onChange={(e) => setSettings({ ...settings, maxParticipants: parseInt(e.target.value) })}
                        className="bg-background border-border"
                      />
                    ) : (
                      <p className="text-foreground font-medium">{settings.maxParticipants} players</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Draft Date & Time</label>
                    {isEditingSettings ? (
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          value={settings.draftDate}
                          onChange={(e) => setSettings({ ...settings, draftDate: e.target.value })}
                          className="bg-background border-border"
                        />
                        <Input
                          type="time"
                          value={settings.draftTime}
                          onChange={(e) => setSettings({ ...settings, draftTime: e.target.value })}
                          className="bg-background border-border"
                        />
                      </div>
                    ) : (
                      <p className="text-foreground font-medium">
                        Mar 18, 2026 at 7:00 PM
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Pick Time Limit</label>
                    {isEditingSettings ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="30"
                          max="300"
                          value={settings.pickTimeLimit}
                          onChange={(e) => setSettings({ ...settings, pickTimeLimit: parseInt(e.target.value) })}
                          className="bg-background border-border"
                        />
                        <span className="text-sm text-muted-foreground">sec</span>
                      </div>
                    ) : (
                      <p className="text-foreground font-medium">{settings.pickTimeLimit} seconds</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Draft Type</label>
                    {isEditingSettings ? (
                      <select
                        value={settings.draftType}
                        onChange={(e) => setSettings({ ...settings, draftType: e.target.value as 'snake' | 'linear' })}
                        className="w-full h-10 px-3 rounded-md bg-background border border-border text-foreground"
                      >
                        <option value="snake">Snake Draft</option>
                        <option value="linear">Linear Draft</option>
                      </select>
                    ) : (
                      <p className="text-foreground font-medium capitalize">{settings.draftType} Draft</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Visibility</label>
                    {isEditingSettings ? (
                      <select
                        value={settings.visibility}
                        onChange={(e) => setSettings({ ...settings, visibility: e.target.value as 'private' | 'public' })}
                        className="w-full h-10 px-3 rounded-md bg-background border border-border text-foreground"
                      >
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        {settings.visibility === 'private' ? (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Globe className="w-4 h-4 text-blue-400" />
                        )}
                        <p className="text-foreground font-medium capitalize">{settings.visibility}</p>
                      </div>
                    )}
                  </div>
                </div>

                {isEditingSettings && (
                  <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsEditingSettings(false)}>
                      Cancel
                    </Button>
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600"
                      onClick={() => setIsEditingSettings(false)}
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </Card>

              {/* Invite Code */}
              <Card className="p-6 bg-card border-border border-orange-500/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Invite Code</h3>
                    <p className="text-sm text-muted-foreground">Share this code with friends to join the draft</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="px-4 py-2 rounded bg-background border border-border text-orange-400 font-bold text-lg tracking-wider">
                      {settings.inviteCode}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyCode}
                      className="relative"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-4 h-4 mr-2 text-green-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Participants List */}
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      Participants ({participants.filter(p => p.status === 'active').length}/{settings.maxParticipants})
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {settings.maxParticipants - participants.filter(p => p.status === 'active').length} spots remaining
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {participants.map((participant) => (
                    <Card
                      key={participant.id}
                      className={`p-4 ${
                        participant.isYou
                          ? 'bg-orange-500/5 border-orange-500/30'
                          : 'bg-background border-border'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <ImageWithFallback
                              src={participant.avatar}
                              alt={participant.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {participant.isHost && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                              <Crown className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">
                              {participant.name}
                            </h3>
                            {participant.status === 'banned' && (
                              <Badge className="bg-red-500/10 text-red-400 border-red-500/30">
                                Banned
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{participant.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Joined {participant.joinedAt}
                          </p>
                        </div>

                        <div className="hidden sm:flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="text-muted-foreground text-xs">Teams</p>
                            <p className="font-bold text-foreground">{participant.teamsCount}/8</p>
                          </div>
                        </div>

                        {isHost && !participant.isHost && participant.status === 'active' && (
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedParticipant(
                                selectedParticipant === participant.id ? null : participant.id
                              )}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>

                            {selectedParticipant === participant.id && (
                              <Card className="absolute right-0 top-10 w-48 p-2 bg-card border-border z-50 shadow-lg">
                                <button
                                  onClick={() => handleKickParticipant(participant.id)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded transition-colors"
                                >
                                  <UserX className="w-4 h-4" />
                                  Kick Player
                                </button>
                                <button
                                  onClick={() => handleBanParticipant(participant.id)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                >
                                  <Ban className="w-4 h-4" />
                                  Ban Player
                                </button>
                              </Card>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                {participants.filter(p => p.status === 'active').length < settings.maxParticipants && (
                  <Card className="mt-4 p-8 bg-background border-dashed border-border text-center">
                    <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">Waiting for more players</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Share the invite code to fill the remaining spots
                    </p>
                    <Button variant="outline" size="sm" onClick={handleCopyCode}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Invite Code
                    </Button>
                  </Card>
                )}
              </Card>
            </div>
          )}

          {/* Draft Room Tab */}
          {activeTab === 'draft-room' && (
            <div className="space-y-6">
              <Card className="p-12 bg-card border-border text-center">
                <Target className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Draft Room</h2>
                <p className="text-muted-foreground mb-6">
                  {draftStatus === 'upcoming' && 'The draft room will open on March 18, 2026 at 7:00 PM'}
                  {draftStatus === 'drafting' && 'The draft is currently in progress!'}
                  {draftStatus === 'active' && 'View the draft results and picks'}
                  {draftStatus === 'completed' && 'The draft has been completed'}
                </p>
                {draftStatus === 'drafting' && (
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                    onClick={() => onNavigate('draft-room')}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Enter Draft Room
                  </Button>
                )}
                {draftStatus === 'upcoming' && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Draft starts in 3 days, 5 hours</span>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="space-y-6">
              <Card className="p-6 bg-card border-border">
                <h2 className="text-xl font-bold text-foreground mb-6">Leaderboard</h2>

                {draftStatus === 'upcoming' || draftStatus === 'drafting' ? (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                    <h3 className="font-semibold text-foreground mb-2">Results Coming Soon</h3>
                    <p className="text-muted-foreground">
                      The leaderboard will be available once the tournament begins
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {participants
                      .filter(p => p.status === 'active')
                      .sort((a, b) => a.rank - b.rank)
                      .map((participant, index) => (
                        <Card
                          key={participant.id}
                          className={`p-4 ${
                            participant.isYou
                              ? 'bg-orange-500/5 border-orange-500/30'
                              : 'bg-background border-border'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10">
                              {index === 0 && <Medal className="w-8 h-8 text-yellow-400" />}
                              {index === 1 && <Medal className="w-8 h-8 text-gray-400" />}
                              {index === 2 && <Medal className="w-7 h-7 text-orange-600" />}
                              {index > 2 && (
                                <span className="text-lg font-bold text-muted-foreground">
                                  {participant.rank}
                                </span>
                              )}
                            </div>

                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <ImageWithFallback
                                src={participant.avatar}
                                alt={participant.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">
                                {participant.name}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {participant.teamsCount} teams drafted
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-2xl font-bold text-orange-400">
                                {participant.totalPoints}
                              </p>
                              <p className="text-xs text-muted-foreground">points</p>
                            </div>

                            <div className="hidden sm:block">
                              {index === 0 ? (
                                <div className="flex items-center gap-1 text-green-400">
                                  <TrendingUp className="w-4 h-4" />
                                  <span className="text-sm font-medium">Leading</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <TrendingDown className="w-4 h-4" />
                                  <span className="text-sm">
                                    -{participants[0].totalPoints - participant.totalPoints}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}