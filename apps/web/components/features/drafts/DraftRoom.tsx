"use client";

import { useState, useEffect } from "react";
import { useDraftWebSocket } from "@/hooks/useDraftWebSocket";
import type { DraftRoomStateDTO } from "@fantasy-madness/dal";
import { GlassCard } from "@/components/ui/GlassCard";

type Props = {
  initialState: DraftRoomStateDTO;
  currentUserId: string;
};

export function DraftRoom({ initialState, currentUserId }: Props) {
  const { state: wsState, connectionState, error: wsError, submitPick, reconnect } = useDraftWebSocket({
    draftId: initialState.id,
    initialState,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickError, setPickError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Use WebSocket state if available, otherwise fall back to initial state
  const state = wsState ?? initialState;

  const isMyTurn = state.currentPickerUserId === currentUserId;
  const currentPicker = state.participants.find(
    (p: { oduserId: string }) => p.oduserId === state.currentPickerUserId
  );

  // Countdown timer effect
  useEffect(() => {
    if (!state.timerDeadlineAt || state.status !== "DRAFTING") {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const deadline = new Date(state.timerDeadlineAt!).getTime();
      const remaining = Math.max(0, Math.floor((deadline - now) / 1000));
      setCountdown(remaining);
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [state.timerDeadlineAt, state.status]);

  const handlePick = async (slotId: string) => {
    if (!isMyTurn || isSubmitting) return;

    setIsSubmitting(true);
    setPickError(null);

    try {
      // Send pick via WebSocket
      submitPick(slotId);
      // Keep submitting state for a moment to prevent double-clicks
      setTimeout(() => setIsSubmitting(false), 1000);
    } catch (err) {
      setPickError("Failed to submit pick");
      setIsSubmitting(false);
    }
  };

  const totalExpectedPicks = state.participants.length * state.rosterSize;
  const progressPercent = (state.totalPicks / totalExpectedPicks) * 100;

  // Format countdown display
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="grid gap-6">
      {/* Header */}
      <GlassCard className="rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white m-0">{state.name}</h1>
            <p className="text-gray-400 text-sm m-0 mt-1">{state.tournamentName}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionState === "connected"
                    ? "bg-green-500"
                    : connectionState === "connecting"
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-red-500"
                }`}
              />
              <span className="text-xs text-gray-400">
                {connectionState === "connected"
                  ? "Live"
                  : connectionState === "connecting"
                  ? "Connecting..."
                  : "Disconnected"}
              </span>
            </div>
            <span
              className={`px-4 py-2 text-sm font-semibold rounded-full ${
                state.status === "DRAFTING"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : state.status === "COMPLETE"
                  ? "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}
            >
              {state.status === "DRAFTING" ? "Drafting" : state.status}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Round {Math.floor(state.totalPicks / state.participants.length) + 1}</span>
            <span>Pick {state.currentPickNumber} of {totalExpectedPicks}</span>
          </div>
          <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Current picker */}
        {state.status === "DRAFTING" && currentPicker && (
          <div
            className={`p-4 rounded-lg ${
              isMyTurn
                ? "bg-indigo-500/20 border border-indigo-500/30"
                : "bg-dark-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 m-0">Current Pick</p>
                <p className="text-lg font-semibold text-white m-0 mt-1">
                  {isMyTurn ? "Your Turn!" : currentPicker.userName ?? "Unknown"}
                </p>
              </div>
              {countdown !== null && state.pickTimerSec && (
                <div className="text-center">
                  <p className="text-xs text-gray-400 m-0">Time Remaining</p>
                  <p
                    className={`text-2xl font-bold m-0 mt-1 ${
                      countdown <= 10 ? "text-red-400 animate-pulse" : "text-white"
                    }`}
                  >
                    {formatCountdown(countdown)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Connection error */}
        {wsError && connectionState === "disconnected" && (
          <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
            <div className="flex items-center justify-between">
              <p className="text-red-500 text-sm m-0">{wsError}</p>
              <button
                onClick={reconnect}
                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-xs text-red-400 transition-colors"
              >
                Reconnect
              </button>
            </div>
          </div>
        )}

        {/* Pick error */}
        {pickError && (
          <div className="mt-4 p-3 bg-red-500/10 rounded-lg text-red-500 text-sm">
            {pickError}
          </div>
        )}
      </GlassCard>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Available Slots */}
        <div className="lg:col-span-2">
          <GlassCard className="rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Available Picks ({state.availableSlots.length})
            </h2>
            {state.status === "COMPLETE" ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏁</div>
                <h3 className="text-2xl font-bold text-white mb-2">Draft Complete!</h3>
                <p className="text-gray-400 mb-6">All picks have been made. Good luck!</p>
                <a
                  href={`/drafts/${state.id}/results`}
                  className="inline-block px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all no-underline shadow-lg"
                >
                  View Results
                </a>
              </div>
            ) : state.availableSlots.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No slots available</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
                {state.availableSlots.map((slot: { slotId: string; displayName: string; seed: number; isPlayIn: boolean }) => (
                  <button
                    key={slot.slotId}
                    onClick={() => handlePick(slot.slotId)}
                    disabled={!isMyTurn || isSubmitting || state.status !== "DRAFTING"}
                    className={`p-3 rounded-lg text-left transition-all ${
                      isMyTurn && state.status === "DRAFTING"
                        ? "bg-dark-800 hover:bg-indigo-600/30 hover:border-indigo-500/50 border border-gray-700 cursor-pointer hover:scale-105"
                        : "bg-dark-800/50 border border-gray-700/50 cursor-not-allowed opacity-60"
                    } ${slot.isPlayIn ? "ring-1 ring-amber-500/30" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${
                        slot.isPlayIn
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-indigo-500/20 text-indigo-400"
                      }`}>
                        {slot.seed}
                      </span>
                      <span className="text-white text-sm font-medium truncate">
                        {slot.displayName}
                      </span>
                    </div>
                    {slot.isPlayIn && (
                      <p className="text-xs text-amber-500/70 mt-1 ml-8">Play-In</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Participants & Picks */}
        <GlassCard className="rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Draft Order</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {state.participants.map((participant: { oduserId: string; userName: string | null; isHost: boolean; picks: Array<{ slotId: string; displayName: string; seed: number }> }, i: number) => {
              const isCurrentPicker = participant.oduserId === state.currentPickerUserId;
              const isMe = participant.oduserId === currentUserId;

              return (
                <div
                  key={participant.oduserId}
                  className={`p-3 rounded-lg ${
                    isCurrentPicker
                      ? "bg-indigo-500/20 border border-indigo-500/30"
                      : "bg-dark-800"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        isCurrentPicker
                          ? "bg-gradient-to-br from-indigo-500 to-purple-500"
                          : "bg-gradient-to-br from-gray-600 to-gray-700"
                      }`}
                    >
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
                      <p className="text-gray-500 text-xs m-0">
                        {participant.picks.length} picks
                      </p>
                    </div>
                  </div>

                  {participant.picks.length > 0 && (
                    <div className="flex flex-wrap gap-1 ml-11">
                      {participant.picks.map((pick: { slotId: string; displayName: string; seed: number }) => (
                        <span
                          key={pick.slotId}
                          className="px-2 py-0.5 bg-dark-700 rounded text-xs text-gray-300"
                          title={pick.displayName}
                        >
                          {pick.seed} {pick.displayName.split(" / ")[0].split(" ").pop()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
