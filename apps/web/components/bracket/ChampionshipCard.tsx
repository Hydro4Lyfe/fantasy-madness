"use client";

import { cn } from "@/lib/utils";
import { TeamRow } from "./TeamRow";
import type { BracketGame } from "@/lib/bracket/types";

interface ChampionshipCardProps {
  game: BracketGame;
  onPick: (gameIndex: number, teamId: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function ChampionshipCard({
  game,
  onPick,
  className,
  style,
}: ChampionshipCardProps) {
  return (
    <div className={cn("flex flex-col items-center", className)} style={style}>
      <span className="text-[13px] font-extrabold uppercase tracking-[0.18em] text-[#E6EDF3] mb-1">
        Championship
      </span>
      <span className="text-[9px] text-[#6e7681] tracking-wide mb-3">
        Indianapolis, IN &bull; Apr 7
      </span>
      <div
        className="border border-[#3B82F6] rounded-lg overflow-hidden w-full"
        style={{
          background: "#13171e",
          boxShadow:
            "0 0 0 1px rgba(59,130,246,0.25), 0 0 30px rgba(59,130,246,0.12), 0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        <TeamRow
          team={game.topTeam}
          isWinner={game.winner === game.topTeam?.teamId}
          isLoser={game.winner != null && game.winner !== game.topTeam?.teamId}
          onClick={
            game.topTeam
              ? () => onPick(game.index, game.topTeam!.teamId)
              : undefined
          }
          size="lg"
        />
        <div className="border-t border-[rgba(59,130,246,0.15)]" />
        <TeamRow
          team={game.bottomTeam}
          isWinner={game.winner === game.bottomTeam?.teamId}
          isLoser={
            game.winner != null && game.winner !== game.bottomTeam?.teamId
          }
          onClick={
            game.bottomTeam
              ? () => onPick(game.index, game.bottomTeam!.teamId)
              : undefined
          }
          size="lg"
        />
      </div>
    </div>
  );
}
