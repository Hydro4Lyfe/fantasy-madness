"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2, Crown, ShieldX } from "lucide-react";
import { toast } from "sonner";
import { joinLeagueByInviteAction } from "@/server/actions/leagues";

interface JoinLeagueCardProps {
  league: {
    id: string;
    name: string;
    status: string;
    maxParticipants: number | null;
    participantCount: number;
    tournamentName: string;
    tournamentYear: number;
    hostName: string | null;
    isBanned: boolean;
  };
  inviteCode: string;
}

export function JoinLeagueCard({ league, inviteCode }: JoinLeagueCardProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isFull =
    league.maxParticipants !== null &&
    league.participantCount >= league.maxParticipants;
  const isOpen = league.status === "OPEN";

  const handleJoin = () => {
    startTransition(async () => {
      const result = await joinLeagueByInviteAction(inviteCode);

      if (result.success) {
        toast.success("Successfully joined the league!");
        router.push(`/leagues/${league.id}`);
      } else {
        toast.error(result.error ?? "Failed to join league");
      }
    });
  };

  if (league.isBanned) {
    return (
      <Card className="p-6 bg-card border-border space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
            <ShieldX className="w-7 h-7 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{league.name}</h1>
          <p className="text-sm text-muted-foreground">
            You have been banned from this league.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto">
          <Crown className="w-7 h-7 text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{league.name}</h1>
        <p className="text-sm text-muted-foreground">
          {league.tournamentName}
        </p>
        {league.hostName && (
          <p className="text-sm text-muted-foreground">
            Hosted by {league.hostName}
          </p>
        )}
      </div>

      <div className="flex justify-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>
            {league.participantCount}
            {league.maxParticipants ? `/${league.maxParticipants}` : ""} players
          </span>
        </div>
        <Badge
          className={
            isOpen
              ? "bg-green-500/10 text-green-400 border-green-500/30"
              : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
          }
        >
          {isOpen ? "Open" : league.status}
        </Badge>
      </div>

      {!isOpen ? (
        <p className="text-center text-sm text-muted-foreground">
          This league is no longer accepting participants.
        </p>
      ) : isFull ? (
        <p className="text-center text-sm text-muted-foreground">
          This league is full.
        </p>
      ) : (
        <Button
          onClick={handleJoin}
          disabled={isPending}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Joining...
            </>
          ) : (
            "Join League"
          )}
        </Button>
      )}
    </Card>
  );
}
