"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";
import { joinDraftByInviteAction } from "@/server/actions/drafts";

interface JoinDraftCardProps {
  draft: {
    id: string;
    name: string;
    status: string;
    rosterSize: number;
    participantCount: number;
    tournamentName: string;
    tournamentYear: number;
    hostName: string | null;
  };
  inviteCode: string;
}

export function JoinDraftCard({ draft, inviteCode }: JoinDraftCardProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isFull = draft.participantCount >= draft.rosterSize;
  const isOpen = draft.status === "OPEN" || draft.status === "LOBBY";

  const handleJoin = () => {
    startTransition(async () => {
      const result = await joinDraftByInviteAction(inviteCode);

      if (result.success && result.draftId) {
        toast.success("Successfully joined the draft!");
        router.push(`/drafts/${result.draftId}`);
      } else {
        toast.error(result.error ?? "Failed to join draft");
      }
    });
  };

  return (
    <Card className="p-6 bg-card border-border space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto">
          <Trophy className="w-7 h-7 text-orange-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{draft.name}</h1>
        <p className="text-sm text-muted-foreground">
          {draft.tournamentName}
        </p>
        {draft.hostName && (
          <p className="text-sm text-muted-foreground">
            Hosted by {draft.hostName}
          </p>
        )}
      </div>

      <div className="flex justify-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>
            {draft.participantCount}/{draft.rosterSize} players
          </span>
        </div>
        <Badge
          className={
            isOpen
              ? "bg-green-500/10 text-green-400 border-green-500/30"
              : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
          }
        >
          {isOpen ? "Open" : draft.status}
        </Badge>
      </div>

      {!isOpen ? (
        <p className="text-center text-sm text-muted-foreground">
          This draft is no longer accepting participants.
        </p>
      ) : isFull ? (
        <p className="text-center text-sm text-muted-foreground">
          This draft is full.
        </p>
      ) : (
        <Button
          onClick={handleJoin}
          disabled={isPending}
          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Joining...
            </>
          ) : (
            "Join Draft"
          )}
        </Button>
      )}
    </Card>
  );
}
