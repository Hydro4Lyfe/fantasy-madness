"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { InviteLinkCard } from "@/components/features/drafts/InviteLinkCard";
import { startDraftAction } from "@/server/actions/drafts";
import type { DraftRoomStateDTO } from "@fantasy-madness/dal";

type Props = {
  state: DraftRoomStateDTO;
  currentUserId: string;
  inviteCode: string | null;
  isHost: boolean;
};

export function DraftWaitingRoom({ state, currentUserId, inviteCode, isHost }: Props) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartDraft = async () => {
    setIsStarting(true);
    setError(null);

    const result = await startDraftAction(state.id);

    if (result.success) {
      router.refresh();
    } else {
      setError(result.error ?? "Failed to start draft");
      setIsStarting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto grid gap-6">
      {/* Header */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-white m-0">{state.name}</h1>
          <span className="px-4 py-2 text-sm font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Waiting to Start
          </span>
        </div>
        <p className="text-gray-400 m-0">{state.tournamentName}</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Invite Link for Host */}
      {isHost && inviteCode && <InviteLinkCard inviteCode={inviteCode} />}

      {/* Participants */}
      <GlassCard title={`Participants (${state.participants.length})`}>
        <div className="space-y-3">
          {state.participants.map((participant, i) => {
            const isMe = participant.oduserId === currentUserId;

            return (
              <div
                key={participant.oduserId}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium m-0">
                    {participant.userName ?? "Unknown"}
                    {isMe && <span className="text-indigo-400 ml-1">(You)</span>}
                    {participant.isHost && (
                      <span className="text-amber-400 ml-1 text-xs">Host</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}

          {state.participants.length === 0 && (
            <p className="text-white/50 text-sm text-center py-4">
              No participants yet.
            </p>
          )}
        </div>
      </GlassCard>

      {/* Draft Info */}
      <GlassCard title="Draft Settings">
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Type</span>
            <span className="text-white">{state.draftType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Roster Size</span>
            <span className="text-white">{state.rosterSize} picks per player</span>
          </div>
          {state.pickTimerSec && (
            <div className="flex justify-between">
              <span className="text-white/60">Pick Timer</span>
              <span className="text-white">{state.pickTimerSec} seconds</span>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Host Controls */}
      {isHost ? (
        <div className="grid gap-3">
          <Link
            href={`/drafts/${state.id}/edit`}
            className="w-full px-6 py-3 text-center text-white bg-white/10 hover:bg-white/15 rounded-lg font-medium transition-colors no-underline"
          >
            Edit Draft Settings
          </Link>

          {state.participants.length < 2 ? (
            <p className="text-amber-400 text-sm text-center">
              Need at least 2 participants to start the draft.
            </p>
          ) : (
            <Button
              onClick={handleStartDraft}
              disabled={isStarting}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {isStarting ? "Starting..." : "Start Draft"}
            </Button>
          )}
        </div>
      ) : (
        <div className="glass-card rounded-xl p-6 text-center">
          <p className="text-white/70 m-0">
            Waiting for the host to start the draft...
          </p>
        </div>
      )}
    </div>
  );
}
