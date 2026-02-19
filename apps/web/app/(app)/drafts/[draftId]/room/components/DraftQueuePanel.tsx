"use client"

import { useCallback } from "react"
import { TeamLogo } from "@/components/team/TeamLogo"
import { ChevronUp, ChevronDown, X, List } from "lucide-react"
import { cn } from "@/lib/utils"

interface AvailableSlot {
  slotId: string
  displayName: string
  abbreviation: string | null
  logoTeamIds: number[]
  seed: number
  quadrant: number
  isPlayIn: boolean
}

interface DraftQueuePanelProps {
  queue: string[]
  availableSlots: AvailableSlot[]
  onRemove: (slotId: string) => void
  onMove: (slotId: string, direction: "up" | "down") => void
  onClose: () => void
}

export function DraftQueuePanel({
  queue,
  availableSlots,
  onRemove,
  onMove,
  onClose,
}: DraftQueuePanelProps) {
  const getSlot = useCallback(
    (slotId: string) => availableSlots.find((s) => s.slotId === slotId),
    [availableSlots]
  )

  return (
    <div className={cn(
      "rounded-2xl border border-[#5E6AD2]/20 overflow-hidden h-60",
      "bg-gradient-to-b from-white/[0.08] to-white/[0.02]",
      "shadow-[0_0_0_1px_rgba(94,106,210,0.15),0_2px_20px_rgba(0,0,0,0.4)]",
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <List className="w-3.5 h-3.5 text-[#5E6AD2]" />
          <h3 className="text-xs font-mono tracking-widest uppercase text-[#8A8F98]">
            Draft Queue
          </h3>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-6 h-6 rounded-lg text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.06] transition-all duration-200"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Queue content */}
      <div className="overflow-y-auto h-[calc(100%-40px)] p-2">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6">
            <p className="text-xs text-[#8A8F98]/60">
              No teams queued
            </p>
            <p className="text-[11px] text-[#8A8F98]/40 mt-1">
              Star teams to add them here
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {queue.map((slotId, index) => {
              const slot = getSlot(slotId)
              if (!slot) return null

              return (
                <div
                  key={slotId}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                >
                  {/* Position number */}
                  <span className="w-4 text-[10px] text-[#8A8F98]/50 tabular-nums text-center font-mono">
                    {index + 1}
                  </span>

                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0">
                    <button
                      onClick={() => onMove(slotId, "up")}
                      disabled={index === 0}
                      className="text-[#8A8F98]/40 hover:text-[#EDEDEF] disabled:opacity-20 disabled:pointer-events-none transition-colors duration-200"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onMove(slotId, "down")}
                      disabled={index === queue.length - 1}
                      className="text-[#8A8F98]/40 hover:text-[#EDEDEF] disabled:opacity-20 disabled:pointer-events-none transition-colors duration-200"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Team logo */}
                  <div className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center overflow-hidden flex-shrink-0">
                    <TeamLogo
                      teamId={slot.logoTeamIds[0]}
                      label={slot.displayName}
                      className="w-5 h-5"
                    />
                  </div>

                  {/* Team info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#EDEDEF] truncate">
                      {slot.displayName}
                    </p>
                    <p className="text-[10px] text-[#8A8F98]/60 font-mono">
                      {slot.abbreviation ? `${slot.abbreviation} · ` : ""}R{slot.quadrant} &middot; Seed {slot.seed}
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => onRemove(slotId)}
                    className="text-[#8A8F98]/30 hover:text-red-400 p-0.5 rounded transition-colors duration-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
