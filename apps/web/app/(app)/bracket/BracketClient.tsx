"use client";

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
  const { games, makePick } = useBracketState(tournamentId, slots);

  return (
    <div className="w-full pb-8 md:pb-4">
      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopBracket games={games} onPick={makePick} />
      </div>

      {/* Mobile */}
      <div className="md:hidden pb-20">
        <MobileBracket games={games} onPick={makePick} />
      </div>
    </div>
  );
}
