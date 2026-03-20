"use client";

import type { BracketSlotWithTeamDTO } from "@/server/dal";

interface BracketClientProps {
  tournamentId: string;
  seasonYear: number;
  tournamentName: string;
  slots: BracketSlotWithTeamDTO[];
}

export default function BracketClient({
  tournamentName,
  slots,
}: BracketClientProps) {
  return (
    <div className="w-full max-w-[1536px] mx-auto px-4">
      <h1 className="text-xl font-bold py-4">{tournamentName} Bracket</h1>
      <p className="text-muted-foreground">{slots.length} slots loaded</p>
    </div>
  );
}
