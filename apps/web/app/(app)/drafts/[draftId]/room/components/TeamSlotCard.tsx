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
        "group relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200",
        isSelected
          ? "bg-[#5E6AD2]/[0.08] border-[#5E6AD2]/40 shadow-[inset_3px_0_0_0_rgba(94,106,210,0.8)]"
          : isQueued
            ? "bg-white/[0.05] border-white/[0.10] shadow-[inset_3px_0_0_0_rgba(94,106,210,0.35)]"
            : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.10]",
        isMyTurn ? "cursor-pointer" : "cursor-default opacity-75"
      )}
    >
      {/* Logo container */}
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center overflow-hidden">
        <TeamLogo
          teamId={logoTeamIds[0]}
          label={displayName}
          className="w-9 h-9"
        />
      </div>

      {/* Team info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-[#EDEDEF] leading-tight truncate">
          {displayName}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          {abbreviation && (
            <>
              <span className="text-[10px] font-semibold tracking-wide text-[#8A8F98] truncate max-w-[88px]">
                {abbreviation}
              </span>
              <span className="text-[11px] text-[#8A8F98]/40">|</span>
            </>
          )}
          <span className="text-[11px] text-[#8A8F98]">
            Region {quadrant}
          </span>
          {isPlayIn && (
            <>
              <span className="text-[11px] text-[#8A8F98]/40">|</span>
              <span className="text-[11px] text-amber-400/70">First Four</span>
            </>
          )}
        </div>
      </div>

      {/* Right side: seed + pts/w + queue star */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="text-right">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.08] text-xs font-bold text-[#EDEDEF] tabular-nums">
            {seed}
          </span>
          <p className="text-[10px] text-[#5E6AD2] mt-0.5 tabular-nums font-mono">
            {seed}pts/w
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleQueue(slotId)
          }}
          className={cn(
            "p-1 rounded-lg transition-colors duration-200",
            isQueued
              ? "text-[#5E6AD2]"
              : "text-[#8A8F98]/30 hover:text-[#8A8F98]/70"
          )}
          aria-label={isQueued ? "Remove from queue" : "Add to queue"}
        >
          <Star
            className={cn(
              "w-3.5 h-3.5",
              isQueued && "fill-[#5E6AD2]"
            )}
          />
        </button>
      </div>
    </div>
  )
}
