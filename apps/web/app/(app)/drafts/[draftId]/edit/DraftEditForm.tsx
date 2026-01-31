"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { InviteLinkCard } from "@/components/features/drafts/InviteLinkCard";
import {
  updateDraftAction,
  removeParticipantAction,
  startDraftAction,
} from "@/server/actions/drafts";
import type { DraftEditDTO } from "@fantasy-madness/dal";

type Props = {
  draft: DraftEditDTO;
};

export function DraftEditForm({ draft }: Props) {
  const router = useRouter();
  const [name, setName] = useState(draft.name);
  const [rosterSize, setRosterSize] = useState(draft.rosterSize);
  const [pickTimerSec, setPickTimerSec] = useState(draft.pickTimerSec ?? 0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);
    setSuccess(null);

    const result = await updateDraftAction(draft.id, {
      name,
      rosterSize,
      pickTimerSec: pickTimerSec > 0 ? pickTimerSec : null,
    });

    if (result.success) {
      setSuccess("Settings updated!");
      router.refresh();
    } else {
      setError(result.error ?? "Failed to update");
    }

    setIsUpdating(false);
  };

  const handleRemoveParticipant = async (participantUserId: string) => {
    setRemovingUserId(participantUserId);
    setError(null);

    const result = await removeParticipantAction(draft.id, participantUserId);

    if (!result.success) {
      setError(result.error ?? "Failed to remove participant");
    }

    setRemovingUserId(null);
    router.refresh();
  };

  const handleStartDraft = async () => {
    setIsStarting(true);
    setError(null);

    const result = await startDraftAction(draft.id);

    if (result.success) {
      router.push(`/drafts/${draft.id}/room`);
    } else {
      setError(result.error ?? "Failed to start draft");
      setIsStarting(false);
    }
  };

  return (
    <div className="grid gap-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
          {success}
        </div>
      )}

      {/* Settings Form */}
      <GlassCard title="Draft Settings">
        <form onSubmit={handleUpdateSettings} className="grid gap-4">
          <Input
            id="draft-name"
            name="draftName"
            label="Draft Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            id="draft-roster-size"
            name="rosterSize"
            label="Roster Size (picks per player)"
            type="number"
            min={1}
            max={16}
            value={rosterSize}
            onChange={(e) => setRosterSize(parseInt(e.target.value) || 1)}
          />

          <Input
            id="draft-pick-timer"
            name="pickTimerSec"
            label="Pick Timer (seconds, 0 = no timer)"
            type="number"
            min={0}
            max={300}
            value={pickTimerSec}
            onChange={(e) => setPickTimerSec(parseInt(e.target.value) || 0)}
          />

          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </GlassCard>

      {/* Invite Link */}
      {draft.inviteCode && <InviteLinkCard inviteCode={draft.inviteCode} />}

      {/* Participants */}
      <GlassCard title={`Participants (${draft.participants.length})`}>
        <div className="space-y-3">
          {draft.participants.map((participant) => (
            <div
              key={participant.oduserId}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                  {participant.pickOrder}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    {participant.userName ?? "Unknown"}
                    {participant.isHost && (
                      <span className="ml-2 text-xs text-amber-400">(Host)</span>
                    )}
                  </p>
                </div>
              </div>

              {!participant.isHost && (
                <button
                  onClick={() => handleRemoveParticipant(participant.oduserId)}
                  disabled={removingUserId === participant.oduserId}
                  className="px-3 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                >
                  {removingUserId === participant.oduserId ? "Removing..." : "Remove"}
                </button>
              )}
            </div>
          ))}

          {draft.participants.length === 0 && (
            <p className="text-white/50 text-sm text-center py-4">
              No participants yet. Share the invite link!
            </p>
          )}
        </div>
      </GlassCard>

      {/* Start Draft */}
      <GlassCard title="Start Draft">
        <div className="space-y-4">
          <p className="text-white/70 text-sm">
            Once you start the draft, no more participants can join and settings cannot be changed.
          </p>

          {draft.participants.length < 2 ? (
            <p className="text-amber-400 text-sm">
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
      </GlassCard>
    </div>
  );
}
