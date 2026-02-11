"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { startDraftAction } from "@/server/actions/drafts";
import {
  ArrowLeft,
  Users,
  Settings,
  Crown,
  MoreVertical,
  Copy,
  Check,
  UserX,
  Ban,
  Edit2,
  Target,
  Trophy,
  Clock,
  Zap,
  Lock,
  Globe,
  AlertCircle,
  Medal,
  TrendingUp,
  TrendingDown,
  Play,
  Loader2,
} from "lucide-react";

type TabType = "participants" | "draft-room" | "results";

interface Participant {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isHost: boolean;
  isYou: boolean;
  status: "active" | "kicked" | "banned";
  joinedAt: string;
  totalPoints: number;
  rank: number;
  teamsCount: number;
}

interface DraftSettings {
  id: string;
  name: string;
  type: "private" | "public";
  status: "upcoming" | "drafting" | "active" | "completed";
  maxParticipants: number;
  startAt: string | null;
  pickTimeLimit: number;
  draftType: "snake" | "linear";
  visibility: "private" | "public";
  inviteCode: string;
  allowAutoQueue: boolean;
}

interface DraftDetailsClientProps {
  draft: DraftSettings;
  participants: Participant[];
  isHost: boolean;
}

function formatStartAt(iso: string | null): string {
  if (!iso) return "Not scheduled";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function DraftDetailsClient({
  draft: initialDraft,
  participants: initialParticipants,
  isHost,
}: DraftDetailsClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("participants");
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [settings, setSettings] = useState(initialDraft);
  const [participants, setParticipants] = useState(initialParticipants);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const router = useRouter();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(settings.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleKickParticipant = (participantId: string) => {
    if (window.confirm("Are you sure you want to kick this participant?")) {
      setParticipants(participants.filter((p) => p.id !== participantId));
    }
  };

  const handleStartDraft = async () => {
    if (!window.confirm("Start the draft now? All participants will begin picking.")) return;
    setIsStarting(true);
    setStartError(null);
    const result = await startDraftAction(settings.id);
    if (result.success) {
      router.refresh();
    } else {
      setStartError(result.error ?? "Failed to start draft");
      setIsStarting(false);
    }
  };

  const handleBanParticipant = (participantId: string) => {
    if (
      window.confirm(
        "Are you sure you want to ban this participant? They will not be able to rejoin."
      )
    ) {
      setParticipants(
        participants.map((p) => (p.id === participantId ? { ...p, status: "banned" as const } : p))
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">Upcoming</Badge>
        );
      case "drafting":
        return (
          <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30 animate-pulse">
            Drafting Now
          </Badge>
        );
      case "active":
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/30">Active</Badge>;
      case "completed":
        return (
          <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/30">Completed</Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/drafts">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{settings.name}</h1>
              {isHost && <Crown className="w-5 h-5 text-orange-400" />}
            </div>
            <p className="text-sm text-muted-foreground">
              {participants.filter((p) => p.status === "active").length}/{settings.maxParticipants}{" "}
              participants
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge(settings.status)}
          {isHost && settings.status === "upcoming" && (
            <Button
              onClick={handleStartDraft}
              disabled={isStarting}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Draft
                </>
              )}
            </Button>
          )}
          {settings.status === "drafting" && (
            <Button
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
              asChild
            >
              <Link href={`/drafts/${settings.id}/room`}>
                <Zap className="w-4 h-4 mr-2" />
                Join Draft
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Start Draft Error */}
      {startError && (
        <Card className="p-4 bg-red-500/10 border-red-500/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-sm text-red-400">{startError}</p>
          </div>
        </Card>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("participants")}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "participants" ? "text-orange-400" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Participants
            {activeTab === "participants" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("draft-room")}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "draft-room" ? "text-orange-400" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Draft Room
            {activeTab === "draft-room" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "results" ? "text-orange-400" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            Results
            {activeTab === "results" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400" />
            )}
          </button>
        </div>
      </div>

      {/* Participants Tab */}
      {activeTab === "participants" && (
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
                  {isEditingSettings ? "Cancel" : "Edit Settings"}
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
                    onChange={(e) =>
                      setSettings({ ...settings, maxParticipants: parseInt(e.target.value) })
                    }
                    className="bg-background border-border"
                  />
                ) : (
                  <p className="text-foreground font-medium">{settings.maxParticipants} players</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Draft Date & Time</label>
                {isEditingSettings ? (
                  <Input
                    type="datetime-local"
                    value={settings.startAt ? new Date(settings.startAt).toISOString().slice(0, 16) : ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        startAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                      })
                    }
                    className="bg-background border-border"
                  />
                ) : (
                  <p className="text-foreground font-medium">{formatStartAt(settings.startAt)}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Pick Time Limit</label>
                <p className="text-foreground font-medium">{settings.pickTimeLimit} seconds</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Draft Type</label>
                <p className="text-foreground font-medium capitalize">{settings.draftType} Draft</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Visibility</label>
                <div className="flex items-center gap-2">
                  {settings.visibility === "private" ? (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Globe className="w-4 h-4 text-blue-400" />
                  )}
                  <p className="text-foreground font-medium capitalize">{settings.visibility}</p>
                </div>
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
                <p className="text-sm text-muted-foreground">
                  Share this code with friends to join the draft
                </p>
              </div>
              <div className="flex items-center gap-3">
                <code className="px-4 py-2 rounded bg-background border border-border text-orange-400 font-bold text-lg tracking-wider">
                  {settings.inviteCode}
                </code>
                <Button variant="outline" size="sm" onClick={handleCopyCode} className="relative">
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
                  Participants ({participants.filter((p) => p.status === "active").length}/
                  {settings.maxParticipants})
                </h2>
                <p className="text-sm text-muted-foreground">
                  {settings.maxParticipants - participants.filter((p) => p.status === "active").length}{" "}
                  spots remaining
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {participants.map((participant) => (
                <Card
                  key={participant.id}
                  className={`p-4 ${
                    participant.isYou
                      ? "bg-orange-500/5 border-orange-500/30"
                      : "bg-background border-border"
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
                        <h3 className="font-semibold text-foreground">{participant.name}</h3>
                        {participant.status === "banned" && (
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
                        <p className="font-bold text-foreground">
                          {participant.teamsCount}/8
                        </p>
                      </div>
                    </div>

                    {isHost && !participant.isHost && participant.status === "active" && (
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setSelectedParticipant(
                              selectedParticipant === participant.id ? null : participant.id
                            )
                          }
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

            {participants.filter((p) => p.status === "active").length <
              settings.maxParticipants && (
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
      {activeTab === "draft-room" && (
        <div className="space-y-6">
          <Card className="p-12 bg-card border-border text-center">
            <Target className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Draft Room</h2>
            <p className="text-muted-foreground mb-6">
              {settings.status === "upcoming" &&
                (settings.startAt
                  ? `The draft room will open on ${formatStartAt(settings.startAt)}`
                  : "The draft has not been scheduled yet")}
              {settings.status === "drafting" && "The draft is currently in progress!"}
              {settings.status === "active" && "View the draft results and picks"}
              {settings.status === "completed" && "The draft has been completed"}
            </p>
            {settings.status === "drafting" && (
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                asChild
              >
                <Link href={`/drafts/${settings.id}/room`}>
                  <Zap className="w-5 h-5 mr-2" />
                  Enter Draft Room
                </Link>
              </Button>
            )}
            {settings.status === "upcoming" && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  {settings.startAt
                    ? `Scheduled for ${formatStartAt(settings.startAt)}`
                    : "Start manually when ready"}
                </span>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Results Tab */}
      {activeTab === "results" && (
        <div className="space-y-6">
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Leaderboard</h2>

            {settings.status === "upcoming" || settings.status === "drafting" ? (
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
                  .filter((p) => p.status === "active")
                  .sort((a, b) => a.rank - b.rank)
                  .map((participant, index) => (
                    <Card
                      key={participant.id}
                      className={`p-4 ${
                        participant.isYou
                          ? "bg-orange-500/5 border-orange-500/30"
                          : "bg-background border-border"
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
                          <h3 className="font-semibold text-foreground">{participant.name}</h3>
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
  );
}
