"use client";

import { useState } from "react";
import { makePickAction } from "@/server/actions/makePick";
import type { DraftRoomStateDTO } from "@fantasy-madness/dal";

type Props = {
  initialState: DraftRoomStateDTO;
  currentUserId: string;
};

export function DraftRoom({ initialState, currentUserId }: Props) {
  const [state, setState] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMyTurn = state.currentPickerUserId === currentUserId;
  const currentPicker = state.participants.find(
    (p) => p.oduserId === state.currentPickerUserId
  );

  const handlePick = async (slotId: string) => {
    if (!isMyTurn || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const result = await makePickAction(state.id, slotId);

    if (!result.success) {
      setError(result.error ?? "Failed to make pick");
      setIsSubmitting(false);
    } else {
      // Refresh the page to get updated state
      window.location.reload();
    }
  };

  const totalExpectedPicks = state.participants.length * state.rosterSize;
  const progressPercent = (state.totalPicks / totalExpectedPicks) * 100;

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white m-0">{state.name}</h1>
            <p className="text-gray-400 text-sm m-0 mt-1">{state.tournamentName}</p>
          </div>
          <span
            className={`px-4 py-2 text-sm font-semibold rounded-full ${
              state.status === "DRAFTING"
                ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                : state.status === "COMPLETE"
                ? "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            }`}
          >
            {state.status === "DRAFTING" ? "Live" : state.status}
          </span>
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
            <p className="text-sm text-gray-400 m-0">Current Pick</p>
            <p className="text-lg font-semibold text-white m-0 mt-1">
              {isMyTurn ? "Your Turn!" : currentPicker.userName ?? "Unknown"}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Available Slots */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Available Picks ({state.availableSlots.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
              {state.availableSlots.map((slot) => (
                <button
                  key={slot.slotId}
                  onClick={() => handlePick(slot.slotId)}
                  disabled={!isMyTurn || isSubmitting || state.status !== "DRAFTING"}
                  className={`p-3 rounded-lg text-left transition-all ${
                    isMyTurn && state.status === "DRAFTING"
                      ? "bg-dark-800 hover:bg-indigo-600/30 hover:border-indigo-500/50 border border-gray-700 cursor-pointer"
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
          </div>
        </div>

        {/* Participants & Picks */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Draft Order</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {state.participants.map((participant, i) => {
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
                      {participant.picks.map((pick) => (
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
        </div>
      </div>
    </div>
  );
}
