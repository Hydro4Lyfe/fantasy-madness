"use client";

import { ROUNDS } from "@/lib/bracket/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface RoundSelectorProps {
  currentRound: number;
  onRoundChange: (round: number) => void;
}

export function RoundSelector({
  currentRound,
  onRoundChange,
}: RoundSelectorProps) {
  const currentMeta = ROUNDS[currentRound - 1];
  const nextMeta = currentRound < 6 ? ROUNDS[currentRound] : null;
  const isFirst = currentRound === 1;
  const isLast = currentRound === 6;

  return (
    <div className="sticky top-14 z-[40] flex items-stretch justify-center border-b border-[#21262D] bg-[#0d1117]">
      {/* Left arrow */}
      <button
        type="button"
        disabled={isFirst}
        onClick={() => onRoundChange(currentRound - 1)}
        className="flex w-9 shrink-0 items-center justify-center text-[#8B949E] disabled:opacity-30"
        aria-label="Previous round"
      >
        <ChevronLeft className="h-[18px] w-[18px]" />
      </button>

      {/* Current round */}
      <div className="relative flex flex-[2] flex-col items-center justify-center py-2.5">
        <span className="text-[13px] font-bold text-[#E6EDF3]">
          {currentMeta.name}
        </span>
        <span className="mt-px text-[10px] text-[#6e7681]">
          {currentMeta.gameCount} games
        </span>
        {/* Blue underline */}
        <div className="absolute inset-x-[20%] bottom-0 h-0.5 bg-[#3B82F6]" />
      </div>

      {/* Next round (dimmed) */}
      {nextMeta ? (
        <div className="flex flex-1 flex-col items-center justify-center py-2.5 opacity-50">
          <span className="text-[13px] font-bold text-[#E6EDF3]">
            {nextMeta.name}
          </span>
          <span className="mt-px text-[10px] text-[#6e7681]">
            {nextMeta.gameCount} games
          </span>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Right arrow */}
      <button
        type="button"
        disabled={isLast}
        onClick={() => onRoundChange(currentRound + 1)}
        className="flex w-9 shrink-0 items-center justify-center text-[#8B949E] disabled:opacity-30"
        aria-label="Next round"
      >
        <ChevronRight className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
}
