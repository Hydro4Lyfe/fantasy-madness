"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  KeyRound,
  Calendar,
  Lock,
  Globe,
  Archive,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { joinDraftByInviteAction } from "@/server/actions/drafts";

interface Draft {
  id: string;
  name: string;
  type: "private" | "public";
  participants: number;
  maxParticipants: number;
  status: "active" | "draft" | "completed";
  draftDate: string;
  startTime: string;
  myRank: number | null;
  totalPoints: number;
  thumbnail: string;
}

interface MyDraftsClientProps {
  drafts: Draft[];
}

export function MyDraftsClient({ drafts }: MyDraftsClientProps) {
  const [joinCode, setJoinCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleJoinWithCode = () => {
    if (!joinCode.trim()) {
      toast.error("Please enter an invite code");
      return;
    }

    startTransition(async () => {
      const result = await joinDraftByInviteAction(joinCode.trim());

      if (result.success && result.draftId) {
        setJoinCode("");
        if (result.alreadyJoined) {
          toast.info("You're already a member of this draft");
        } else {
          toast.success("Successfully joined the draft!");
        }
        router.push(`/drafts/${result.draftId}`);
      } else {
        toast.error(result.error ?? "Failed to join draft");
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "draft":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "completed":
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  const activeDrafts = drafts.filter((d) => d.status === "active");
  const upcomingDrafts = drafts.filter((d) => d.status === "draft");
  const completedDrafts = drafts.filter((d) => d.status === "completed");

  const stats = {
    total: drafts.length,
    active: activeDrafts.length,
    draft: upcomingDrafts.length,
    completed: completedDrafts.length,
  };

  const renderDraftCard = (draft: Draft) => (
    <Card
      key={draft.id}
      className="relative p-6 bg-gradient-to-br from-card via-card to-card border-border hover:border-purple-500/50 transition-all duration-300 group cursor-pointer overflow-hidden"
    >
      <Link href={`/drafts/${draft.id}`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/15 transition-all" />

        <div className="relative space-y-5">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-lg text-foreground line-clamp-2 flex-1 group-hover:text-orange-400 transition-colors">
                {draft.name}
              </h3>
              <Badge className={`${getStatusColor(draft.status)} flex-shrink-0`}>
                {draft.status === "active"
                  ? "Live"
                  : draft.status === "draft"
                    ? "Upcoming"
                    : "Ended"}
              </Badge>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{draft.draftDate}</span>
              </div>
              <Badge
                variant="outline"
                className={
                  draft.type === "private"
                    ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                    : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                }
              >
                {draft.type === "private" ? (
                  <>
                    <Lock className="w-3 h-3 mr-1" />
                    Private
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3 mr-1" />
                    Public
                  </>
                )}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-background/50 backdrop-blur-sm border border-border group-hover:border-purple-500/20 transition-all rounded-lg">
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Players</p>
              <p className="text-xl font-bold text-foreground">
                {draft.participants}
                <span className="text-sm text-muted-foreground font-normal">
                  /{draft.maxParticipants}
                </span>
              </p>
            </div>
            <div className="space-y-1.5 text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Start Time</p>
              <p className="text-xl font-bold text-orange-400">{draft.startTime}</p>
            </div>
          </div>

          {draft.status !== "draft" && (
            <>
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground uppercase tracking-wide">
                    Your Rank
                  </span>
                  <div className="flex items-center gap-1.5">
                    {draft.myRank && draft.myRank <= 3 && (
                      <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                    )}
                    <span className="text-lg font-bold text-foreground">
                      {draft.myRank ? `#${draft.myRank}` : "N/A"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground uppercase tracking-wide">
                    Total Points
                  </span>
                  <span className="text-lg font-bold text-orange-400">
                    {draft.totalPoints.toLocaleString()}
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="pt-2">
            <Button
              className={`w-full ${
                draft.status === "active"
                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                  : draft.status === "draft"
                    ? "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white border-0 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                    : "bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/30"
              }`}
              variant={draft.status === "completed" ? "outline" : "default"}
            >
              {draft.status === "active"
                ? "Join Live Draft"
                : draft.status === "draft"
                  ? "Prepare Draft"
                  : "View Results"}
            </Button>
          </div>
        </div>
      </Link>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">Drafts</h1>
        <Button
          className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white border-0"
          asChild
        >
          <Link href="/drafts/new">
            <Plus className="w-4 h-4 mr-2" />
            Create New Draft
          </Link>
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
              onClick={handleJoinWithCode}
              disabled={isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] transition-all"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join"
              )}
            </Button>
          </div>
        </div>
      </Card>

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
  );
}
