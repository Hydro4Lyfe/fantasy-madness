"use client";

import { cn } from "@/lib/utils";
import { TeamLogo } from "@/components/team/TeamLogo";
import type { TeamInfo } from "@/lib/bracket/types";

interface TeamRowProps {
  team: TeamInfo | null;
  isWinner: boolean;
  isLoser: boolean;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "lg";
}

export function TeamRow({
  team,
  isWinner,
  isLoser,
  onClick,
  className,
  size = "sm",
}: TeamRowProps) {
  const isTbd = !team;
  const isLg = size === "lg";

  return (
    <div
      role="button"
      tabIndex={isTbd ? undefined : 0}
      aria-pressed={isWinner}
      onClick={isTbd ? undefined : onClick}
      onKeyDown={
        isTbd
          ? undefined
          : (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
      }
      className={cn(
        "flex items-center border-l-[3px] border-l-transparent transition-colors",
        isLg
          ? "h-12 px-3 gap-2.5 text-sm"
          : "h-[26px] px-1.5 gap-1.5 text-[11px]",
        !isTbd && "cursor-pointer hover:bg-[#1c2333]",
        isWinner && "bg-[#1c2333] border-l-[#3B82F6]",
        isLoser && "opacity-50",
        isTbd && "text-[#484f58] cursor-default",
        className
      )}
    >
      {team ? (
        <TeamLogo
          teamId={team.teamId}
          label={team.abbreviation ?? team.fullName}
          className={cn(isLg ? "w-7 h-7" : "w-4 h-4")}
        />
      ) : (
        <div
          className={cn(
            "rounded bg-white/[0.04]",
            isLg ? "w-7 h-7" : "w-4 h-4"
          )}
        />
      )}
      <span
        className={cn(
          "font-bold text-[#8B949E] text-right shrink-0",
          isLg ? "w-5 text-sm" : "w-4 text-[10px]",
          isWinner && "text-[#E6EDF3]"
        )}
      >
        {team?.seed ?? "-"}
      </span>
      <span className="flex-1 font-medium truncate">
        {team?.fullName ?? "---"}
      </span>
    </div>
  );
}
