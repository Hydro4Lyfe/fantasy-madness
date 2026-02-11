"use client"

import { TeamLogo } from "@/components/team/TeamLogo"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface TeamSlotCardProps {
  slotId: string
  displayName: string
  abbreviation: string | null
  logoTeamIds: number[]
  seed: number
  quadrant: number
  isPlayIn: boolean
  isSelected: boolean
  isQueued: boolean
  isMyTurn: boolean
  onSelect: (slotId: string) => void
  onToggleQueue: (slotId: string) => void
}

export function TeamSlotCard({
  slotId,
  displayName,
  abbreviation,
  logoTeamIds,
  seed,
  quadrant,
  isPlayIn,
  isSelected,
  isQueued,
  isMyTurn,
  onSelect,
  onToggleQueue,
}: TeamSlotCardProps) {
  return (
    <div
      onClick={() => {
        if (isMyTurn) onSelect(slotId)
      }}
      className={cn(
        "group relative flex items-center gap-3 p-3 rounded-lg border transition-all",
        isSelected
          ? "bg-orange-500/8 border-orange-500/40 shadow-[inset_3px_0_0_0] shadow-orange-500"
          : isQueued
            ? "bg-blue-500/5 border-blue-500/20 shadow-[inset_3px_0_0_0] shadow-blue-500/50"
            : "bg-card/40 border-border/50 hover:bg-card/70 hover:border-border",
        isMyTurn ? "cursor-pointer" : "cursor-default opacity-75"
      )}
    >
      {/* Logo container - clean, slightly elevated */}
      <div className="flex-shrink-0 w-11 h-11 rounded-md bg-white/[0.03] border border-white/[0.06] flex items-center justify-center overflow-hidden">
        <TeamLogo
          teamId={logoTeamIds[0]}
          label={displayName}
          className="w-9 h-9"
        />
      </div>

      {/* Team info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-foreground leading-tight truncate">
          {displayName}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          {abbreviation && (
            <>
              <span className="text-[10px] font-semibold tracking-wide text-muted-foreground/85 truncate max-w-[88px]">
                {abbreviation}
              </span>
              <span className="text-[11px] text-muted-foreground/40">|</span>
            </>
          )}
          <span className="text-[11px] text-muted-foreground">
            Region {quadrant}
          </span>
          {isPlayIn && (
            <>
              <span className="text-[11px] text-muted-foreground/40">|</span>
              <span className="text-[11px] text-amber-400/70">First Four</span>
            </>
          )}
        </div>
      </div>

      {/* Right side: seed + points + queue star */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="text-right">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-muted/40 border border-border/50 text-xs font-bold text-foreground tabular-nums">
            {seed}
          </span>
          <p className="text-[10px] text-green-400/80 mt-0.5 tabular-nums">
            {seed}pts/w
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleQueue(slotId)
          }}
          className={cn(
            "p-1 rounded transition-colors",
            isQueued
              ? "text-orange-400"
              : "text-muted-foreground/30 hover:text-muted-foreground/60"
          )}
          aria-label={isQueued ? "Remove from queue" : "Add to queue"}
        >
          <Star
            className={cn(
              "w-3.5 h-3.5",
              isQueued && "fill-orange-400"
            )}
          />
        </button>
      </div>
    </div>
  )
}
