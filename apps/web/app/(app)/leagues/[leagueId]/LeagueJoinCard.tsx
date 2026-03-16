"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Users, Lock, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { joinLeagueAction } from "@/server/actions/leagues";

function statusToBadge(status: string): "open" | "locked" | "complete" {
  if (status === "OPEN") return "open";
  if (status === "LOCKED") return "locked";
  return "complete";
}

interface LeagueJoinCardProps {
  league: {
    id: string;
    name: string;
    status: string;
    participantCount: number;
    maxParticipants: number | null;
    isPrivate: boolean;
  };
}

export function LeagueJoinCard({ league }: LeagueJoinCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isFull =
    league.maxParticipants !== null &&
    league.participantCount >= league.maxParticipants;
  const isOpen = league.status === "OPEN";
  const canJoin = isOpen && !isFull;

  const handleJoin = () => {
    setError(null);
    startTransition(async () => {
      const result = await joinLeagueAction(league.id);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error ?? "Failed to join league");
      }
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B]" />

      <div className="px-6 sm:px-8 py-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center mb-6">
          <Users className="w-8 h-8 text-[#F59E0B]" />
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-foreground mb-2">
          {league.name}
        </h1>

        <div className="flex items-center gap-3 mb-6">
          <StatusBadge status={statusToBadge(league.status)} />
          <span className="text-sm text-muted-foreground">
            {league.participantCount}
            {league.maxParticipants
              ? `/${league.maxParticipants}`
              : ""}{" "}
            participants
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5 mb-4 w-full max-w-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {canJoin ? (
          <>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm leading-relaxed">
              Join this league to start making your picks. Pick 8 bracket slots
              and compete against other participants.
            </p>
            <button
              onClick={handleJoin}
              disabled={isPending}
              className={cn(
                "inline-flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-medium text-white bg-[#F59E0B] hover:bg-[#F59E0B]/90 transition-colors shadow-[0_0_16px_rgba(245,158,11,0.25)]",
                isPending && "opacity-60 cursor-not-allowed"
              )}
            >
              {isPending ? "Joining..." : "Join League"}
            </button>
          </>
        ) : isFull ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            This league is full
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            This league is no longer accepting participants
          </div>
        )}
      </div>
    </div>
  );
}
