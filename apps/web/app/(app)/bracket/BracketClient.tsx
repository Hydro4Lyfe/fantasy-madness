"use client";

import { useState, useCallback } from "react";
import { Check } from "lucide-react";
import type { BracketSlotWithTeamDTO } from "@/server/dal";
import { useBracketState } from "@/components/bracket/useBracketState";
import { DesktopBracket } from "@/components/bracket/DesktopBracket";
import { MobileBracket } from "@/components/bracket/MobileBracket";

interface BracketClientProps {
  tournamentId: string;
  seasonYear: number;
  tournamentName: string;
  slots: BracketSlotWithTeamDTO[];
}

export default function BracketClient({
  tournamentId,
  slots,
}: BracketClientProps) {
  const { games, makePick, totalPicks } = useBracketState(tournamentId, slots);
  const [showSaved, setShowSaved] = useState(false);

  const handlePick = useCallback(
    (gameIndex: number, teamId: number) => {
      makePick(gameIndex, teamId);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 1500);
    },
    [makePick]
  );

  return (
    <div className="w-full pb-8 md:pb-4">
      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopBracket games={games} onPick={handlePick} />
      </div>

      {/* Mobile */}
      <div className="md:hidden -mt-6">
        <MobileBracket games={games} onPick={handlePick} />
      </div>

      {/* Save status bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div
          className="flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium transition-all duration-300"
          style={{
            background: "rgba(22,27,34,0.9)",
            border: "1px solid #30363D",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            opacity: showSaved ? 1 : 0,
            transform: showSaved ? "translateY(0)" : "translateY(8px)",
            pointerEvents: "none",
          }}
        >
          <Check className="h-3.5 w-3.5 text-[#3B82F6]" />
          <span className="text-[#E6EDF3]">Bracket saved</span>
          <span className="text-[#6e7681]">{totalPicks}/63 picks</span>
        </div>
      </div>
    </div>
  );
}
