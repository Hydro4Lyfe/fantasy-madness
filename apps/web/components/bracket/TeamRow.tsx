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
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: { row: "h-[26px] px-1.5 gap-1.5 text-[11px] border-l-[3px]", logo: "w-4 h-4", seed: "w-4 text-[10px]" },
  md: { row: "h-[42px] px-2.5 gap-2 text-[13px] border-l-4", logo: "w-[22px] h-[22px]", seed: "w-[18px] text-[11px]" },
  lg: { row: "h-12 px-3 gap-2.5 text-sm border-l-4", logo: "w-7 h-7", seed: "w-5 text-sm" },
};

export function TeamRow({
  team,
  isWinner,
  isLoser,
  onClick,
  className,
  size = "sm",
}: TeamRowProps) {
  const isTbd = !team;
  const s = sizeConfig[size];

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
        "flex items-center border-l-transparent transition-colors",
        s.row,
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
          className={s.logo}
        />
      ) : (
        <div className={cn("rounded bg-white/[0.04]", s.logo)} />
      )}
      <span
        className={cn(
          "font-bold text-[#8B949E] text-right shrink-0",
          s.seed,
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
