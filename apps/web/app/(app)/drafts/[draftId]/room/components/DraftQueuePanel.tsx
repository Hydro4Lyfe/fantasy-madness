"use client"

import { useCallback } from "react"
import { TeamLogo } from "@/components/team/TeamLogo"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, X, List } from "lucide-react"

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
    <div className="rounded-lg border border-blue-500/15 bg-card/20 overflow-hidden h-60">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/20">
        <div className="flex items-center gap-2">
          <List className="w-3.5 h-3.5 text-blue-400" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Draft Queue
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      {/* Queue content */}
      <div className="overflow-y-auto h-[calc(100%-40px)] p-2">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6">
            <p className="text-xs text-muted-foreground/60">
              No teams queued
            </p>
            <p className="text-[11px] text-muted-foreground/40 mt-1">
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
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-card/40 border border-border/20"
                >
                  {/* Position number */}
                  <span className="w-4 text-[10px] text-muted-foreground/50 tabular-nums text-center font-medium">
                    {index + 1}
                  </span>

                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0">
                    <button
                      onClick={() => onMove(slotId, "up")}
                      disabled={index === 0}
                      className="text-muted-foreground/40 hover:text-foreground disabled:opacity-20 disabled:pointer-events-none"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onMove(slotId, "down")}
                      disabled={index === queue.length - 1}
                      className="text-muted-foreground/40 hover:text-foreground disabled:opacity-20 disabled:pointer-events-none"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Team logo */}
                  <div className="w-6 h-6 rounded bg-white/[0.03] border border-white/[0.06] flex items-center justify-center overflow-hidden flex-shrink-0">
                    <TeamLogo
                      teamId={slot.logoTeamIds[0]}
                      label={slot.displayName}
                      className="w-5 h-5"
                    />
                  </div>

                  {/* Team info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {slot.displayName}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60">
                      {slot.abbreviation ? `${slot.abbreviation} · ` : ""}R{slot.quadrant} &middot; Seed {slot.seed}
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => onRemove(slotId)}
                    className="text-muted-foreground/30 hover:text-red-400 p-0.5"
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
