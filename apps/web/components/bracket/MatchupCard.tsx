"use client";

import { cn } from "@/lib/utils";
import { TeamRow } from "./TeamRow";
import type { BracketGame } from "@/lib/bracket/types";

interface MatchupCardProps {
  game: BracketGame;
  onPick: (gameIndex: number, teamId: number) => void;
  className?: string;
  style?: React.CSSProperties;
  size?: "sm" | "md";
  showConnector?: boolean;
}

export function MatchupCard({ game, onPick, className, style, size = "sm", showConnector = false }: MatchupCardProps) {
  return (
    <div className={cn("flex items-center", className)} style={style}>
      {/* Optional left-side incoming connector — straight line from screen edge */}
      {showConnector && (
        <div className="relative w-8 shrink-0 -ml-8">
          <div className="absolute left-0 top-1/2 w-full border-t border-[#30363D]" />
        </div>
      )}
      <div className="flex-1 border border-[#30363D] rounded bg-[#161B22] overflow-hidden">
        <TeamRow
          team={game.topTeam}
          isWinner={game.winner === game.topTeam?.teamId}
          isLoser={game.winner != null && game.winner !== game.topTeam?.teamId}
          onClick={
            game.topTeam
              ? () => onPick(game.index, game.topTeam!.teamId)
              : undefined
          }
          size={size === "md" ? "md" : "sm"}
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
          size={size === "md" ? "md" : "sm"}
        />
      </div>
    </div>
  );
}
