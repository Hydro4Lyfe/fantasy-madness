"use client"

import { useCallback, useRef, useState } from "react"
import { TeamLogo } from "@/components/team/TeamLogo"
import { GripVertical, X, List, Check, ChevronUp, ChevronDown } from "lucide-react"
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
  autoPickEnabled: boolean
  onToggleAutoPick: () => void
  onRemove: (slotId: string) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onClose: () => void
}

export function DraftQueuePanel({
  queue,
  availableSlots,
  autoPickEnabled,
  onToggleAutoPick,
  onRemove,
  onReorder,
  onClose,
}: DraftQueuePanelProps) {
  const getSlot = useCallback(
    (slotId: string) => availableSlots.find((s) => s.slotId === slotId),
    [availableSlots]
  )

  // Drag-and-drop state
  const dragIndexRef = useRef<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    dragIndexRef.current = index
    e.dataTransfer.effectAllowed = "move"
    // Make the drag image semi-transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 0, 0)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverIndex(index)
  }, [])

  const handleDragEnd = useCallback(() => {
    dragIndexRef.current = null
    setDragOverIndex(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, toIndex: number) => {
      e.preventDefault()
      const fromIndex = dragIndexRef.current
      if (fromIndex !== null && fromIndex !== toIndex) {
        onReorder(fromIndex, toIndex)
      }
      dragIndexRef.current = null
      setDragOverIndex(null)
    },
    [onReorder]
  )

  return (
    <div
      className="rounded-2xl overflow-hidden h-60 bg-card"
      style={{
        border: "1px solid rgba(59,130,246,0.2)",
        boxShadow: "0 0 0 1px rgba(59,130,246,0.12), 0 2px 20px rgba(0,0,0,0.4), 0 0 30px rgba(59,130,246,0.06)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b border-border"
        style={{ background: "rgba(59,130,246,0.04)" }}
      >
        <div className="flex items-center gap-2">
          <List className="w-3.5 h-3.5" style={{ color: "#3B82F6" }} />
          <h3 className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
            Draft Queue
          </h3>
          {queue.length > 0 && (
            <span
              className="text-[9px] h-4 px-1.5 rounded-full inline-flex items-center font-mono font-bold"
              style={{
                background: "rgba(59,130,246,0.15)",
                color: "#3B82F6",
                border: "1px solid rgba(59,130,246,0.25)",
              }}
            >
              {queue.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Auto-pick toggle */}
          <button
            onClick={onToggleAutoPick}
            className={cn(
              "flex items-center gap-1.5 h-6 px-2 rounded-lg text-[10px] font-medium transition-all duration-200",
              autoPickEnabled
                ? "text-[#3B82F6]"
                : "text-muted-foreground/60 hover:text-muted-foreground",
            )}
            style={
              autoPickEnabled
                ? {
                    background: "rgba(59,130,246,0.15)",
                    border: "1px solid rgba(59,130,246,0.3)",
                  }
                : {
                    background: "transparent",
                    border: "1px solid rgba(48,54,61,0.6)",
                  }
            }
            title={autoPickEnabled ? "Auto-pick is ON — picks will be submitted automatically from your queue" : "Auto-pick is OFF — queued teams will be pre-selected for you to confirm"}
          >
            <div
              className={cn(
                "w-3 h-3 rounded flex items-center justify-center flex-shrink-0 transition-all duration-200",
                autoPickEnabled
                  ? "bg-[#3B82F6]"
                  : "border border-muted-foreground/30",
              )}
            >
              {autoPickEnabled && <Check className="w-2 h-2 text-white" />}
            </div>
            Auto
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-6 h-6 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Queue content */}
      <div className="overflow-y-auto h-[calc(100%-40px)] p-2">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center mb-2 bg-secondary border border-border"
            >
              <List className="w-3.5 h-3.5 text-muted-foreground/40" />
            </div>
            <p className="text-xs text-muted-foreground/60">
              No teams queued
            </p>
            <p className="text-[11px] text-muted-foreground/40 mt-1">
              Star teams to queue your picks
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {queue.map((slotId, index) => {
              const slot = getSlot(slotId)
              if (!slot) return null

              const isDragging = dragIndexRef.current === index
              const isOver = dragOverIndex === index

              return (
                <div
                  key={slotId}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, index)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-200 bg-secondary border",
                    isDragging && "opacity-40",
                    isOver && !isDragging
                      ? "border-[#3B82F6]/50 bg-[#3B82F6]/5"
                      : "border-border",
                  )}
                >
                  {/* Position number */}
                  <span className="w-4 text-[10px] text-muted-foreground/50 tabular-nums text-center font-mono">
                    {index + 1}
                  </span>

                  {/* Drag handle */}
                  <div className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors duration-200 touch-none">
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>

                  {/* Team logo */}
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.10)",
                    }}
                  >
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
                    <p className="text-[10px] text-muted-foreground/60 font-mono">
                      {slot.abbreviation ? `${slot.abbreviation} · ` : ""}R{slot.quadrant} &middot; Seed {slot.seed}
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => onRemove(slotId)}
                    className="text-muted-foreground/30 hover:text-red-400 p-0.5 rounded transition-colors duration-200"
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
