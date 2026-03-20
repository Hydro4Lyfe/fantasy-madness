"use client";

import { cn } from "@/lib/utils";
import { TeamRow } from "./TeamRow";
import type { BracketGame } from "@/lib/bracket/types";

interface MatchupCardProps {
  game: BracketGame;
  onPick: (gameIndex: number, teamId: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function MatchupCard({ game, onPick, className, style }: MatchupCardProps) {
  return (
    <div
      className={cn(
        "border border-[#30363D] rounded bg-[#161B22] overflow-hidden",
        className
      )}
      style={style}
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
      />
      <div className="border-t border-[#30363D]" />
      <TeamRow
        team={game.bottomTeam}
        isWinner={game.winner === game.bottomTeam?.teamId}
        isLoser={game.winner != null && game.winner !== game.bottomTeam?.teamId}
        onClick={
          game.bottomTeam
            ? () => onPick(game.index, game.bottomTeam!.teamId)
            : undefined
        }
      />
    </div>
  );
}
