"use client";

import { useRef, useCallback } from "react";
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
  const prevMeta = currentRound > 1 ? ROUNDS[currentRound - 2] : null;
  const isFirst = currentRound === 1;
  const isLast = currentRound === 6;

  // Swipe handling
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only trigger if horizontal swipe is dominant and > 50px
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0 && currentRound < 6) {
        onRoundChange(currentRound + 1);
      } else if (dx > 0 && currentRound > 1) {
        onRoundChange(currentRound - 1);
      }
    }
  }, [currentRound, onRoundChange]);

  return (
    <div
      className="sticky top-14 z-[40] flex items-stretch justify-center border-b border-[#21262D] bg-[#0d1117]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
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

      {/* Previous round (dimmed) — tappable */}
      {prevMeta ? (
        <button
          type="button"
          onClick={() => onRoundChange(currentRound - 1)}
          className="flex flex-1 flex-col items-center justify-center py-2.5 opacity-40 hover:opacity-60 transition-opacity min-w-0"
        >
          <span className="text-[10px] font-semibold text-[#E6EDF3] truncate w-full text-center">
            {prevMeta.name}
          </span>
          <span className="mt-px text-[9px] text-[#6e7681]">
            {prevMeta.gameCount} games
          </span>
        </button>
      ) : (
        <div className="flex-1" />
      )}

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

      {/* Next round (dimmed) — tappable */}
      {nextMeta ? (
        <button
          type="button"
          onClick={() => onRoundChange(currentRound + 1)}
          className="flex flex-1 flex-col items-center justify-center py-2.5 opacity-40 hover:opacity-60 transition-opacity min-w-0"
        >
          <span className="text-[10px] font-semibold text-[#E6EDF3] truncate w-full text-center">
            {nextMeta.name}
          </span>
          <span className="mt-px text-[9px] text-[#6e7681]">
            {nextMeta.gameCount} games
          </span>
        </button>
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
