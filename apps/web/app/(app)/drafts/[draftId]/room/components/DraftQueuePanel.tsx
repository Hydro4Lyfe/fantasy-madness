"use client"

import { useCallback, useRef, useState } from "react"
import { TeamLogo } from "@/components/team/TeamLogo"
import { GripVertical, X, List, Check, ChevronUp, ChevronDown, Zap } from "lucide-react"
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

function seedAccent(seed: number): string {
  if (seed >= 13) return "#818cf8"
  if (seed >= 9) return "#f59e0b"
  if (seed >= 5) return "#EDEDEF"
  return "#8A8F98"
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

  // ── Desktop drag-and-drop (HTML5 DnD) ──────────────────────────
  const dragIndexRef = useRef<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    dragIndexRef.current = index
    e.dataTransfer.effectAllowed = "move"
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

  // ── Touch drag-and-drop (mobile) ───────────────────────────────
  const touchDragIndexRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number>(0)
  const listRef = useRef<HTMLDivElement>(null)
  const [touchDragOverIndex, setTouchDragOverIndex] = useState<number | null>(null)

  const handleTouchStart = useCallback((index: number, e: React.TouchEvent) => {
    touchDragIndexRef.current = index
    touchStartYRef.current = e.touches[0].clientY
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchDragIndexRef.current === null || !listRef.current) return
    e.preventDefault()

    const touchY = e.touches[0].clientY
    const items = listRef.current.querySelectorAll("[data-queue-item]")

    for (let i = 0; i < items.length; i++) {
      const rect = items[i].getBoundingClientRect()
      if (touchY >= rect.top && touchY <= rect.bottom) {
        setTouchDragOverIndex(i)
        return
      }
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    const from = touchDragIndexRef.current
    const to = touchDragOverIndex
    if (from !== null && to !== null && from !== to) {
      onReorder(from, to)
    }
    touchDragIndexRef.current = null
    setTouchDragOverIndex(null)
  }, [touchDragOverIndex, onReorder])

  // ── Render ─────────────────────────────────────────────────────
  const totalSeedWeight = queue.reduce((sum, slotId) => {
    const slot = getSlot(slotId)
    return sum + (slot?.seed ?? 0)
  }, 0)

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
            Draft Queue
          </h2>
          {queue.length > 0 && (
            <span
              className="text-[10px] h-5 px-2 rounded-full inline-flex items-center font-mono font-bold tabular-nums"
              style={{
                background: "rgba(59,130,246,0.12)",
                color: "#3B82F6",
                border: "1px solid rgba(59,130,246,0.20)",
              }}
            >
              {queue.length}
            </span>
          )}
        </div>

        {/* Auto-pick toggle */}
        <button
          onClick={onToggleAutoPick}
          className={cn(
            "flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[11px] font-medium transition-all duration-200",
            autoPickEnabled
              ? "text-[#3B82F6]"
              : "text-muted-foreground/60",
          )}
          style={
            autoPickEnabled
              ? {
                  background: "rgba(59,130,246,0.12)",
                  border: "1px solid rgba(59,130,246,0.25)",
                }
              : {
                  background: "rgba(22,27,34,0.6)",
                  border: "1px solid rgba(48,54,61,0.8)",
                }
          }
        >
          <Zap className={cn("w-3 h-3", autoPickEnabled && "fill-[#3B82F6]")} />
          Auto-pick
          <div
            className={cn(
              "w-3.5 h-3.5 rounded-[4px] flex items-center justify-center flex-shrink-0 transition-all duration-200",
              autoPickEnabled
                ? "bg-[#3B82F6]"
                : "border border-muted-foreground/25",
            )}
          >
            {autoPickEnabled && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
          </div>
        </button>
      </div>

      {/* ── Queue list ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 py-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: "rgba(59,130,246,0.06)",
                border: "1px solid rgba(59,130,246,0.12)",
              }}
            >
              <List className="w-6 h-6" style={{ color: "rgba(59,130,246,0.35)" }} />
            </div>
            <p className="text-sm font-medium text-muted-foreground/70 mb-1">
              No teams queued
            </p>
            <p className="text-xs text-muted-foreground/40 leading-relaxed max-w-[200px]">
              Tap the star on any team card to add it to your draft queue
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-1.5" ref={listRef}>
            {queue.map((slotId, index) => {
              const slot = getSlot(slotId)
              if (!slot) return null

              const isDragging = dragIndexRef.current === index
              const isDesktopOver = dragOverIndex === index
              const isTouchOver = touchDragOverIndex === index
              const isTouchDragging = touchDragIndexRef.current === index
              const isOver = (isDesktopOver && !isDragging) || (isTouchOver && !isTouchDragging)
              const isFirst = index === 0

              return (
                <div
                  key={slotId}
                  data-queue-item
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, index)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl transition-all duration-200",
                    "px-3 py-2.5",
                    (isDragging || isTouchDragging) && "opacity-30 scale-[0.97]",
                    isOver && "scale-[1.01]",
                  )}
                  style={{
                    background: isOver
                      ? "rgba(59,130,246,0.08)"
                      : isFirst
                        ? "rgba(59,130,246,0.04)"
                        : "rgba(22,27,34,0.4)",
                    border: isOver
                      ? "1px solid rgba(59,130,246,0.30)"
                      : isFirst
                        ? "1px solid rgba(59,130,246,0.15)"
                        : "1px solid rgba(48,54,61,0.5)",
                  }}
                >
                  {/* Rank badge */}
                  <span
                    className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-bold tabular-nums font-mono"
                    style={
                      isFirst
                        ? {
                            background: "rgba(59,130,246,0.15)",
                            color: "#3B82F6",
                            border: "1px solid rgba(59,130,246,0.25)",
                          }
                        : {
                            background: "rgba(48,54,61,0.3)",
                            color: "rgba(138,143,152,0.5)",
                            border: "1px solid rgba(48,54,61,0.6)",
                          }
                    }
                  >
                    {index + 1}
                  </span>

                  {/* Drag handle — desktop: HTML5, mobile: touch */}
                  <div
                    className="cursor-grab active:cursor-grabbing text-muted-foreground/25 hover:text-muted-foreground/50 transition-colors duration-200 touch-none select-none flex-shrink-0"
                    onTouchStart={(e) => handleTouchStart(index, e)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Team logo */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <TeamLogo
                      teamId={slot.logoTeamIds[0]}
                      label={slot.displayName}
                      className="w-7 h-7"
                    />
                  </div>

                  {/* Team info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {slot.displayName}
                    </p>
                    <p className="text-[11px] text-muted-foreground/50">
                      {slot.abbreviation ? `${slot.abbreviation} · ` : ""}Seed {slot.seed}
                    </p>
                  </div>

                  {/* Seed value */}
                  <div className="text-right flex-shrink-0 mr-0.5">
                    <p
                      className="text-sm font-bold tabular-nums font-mono"
                      style={{ color: seedAccent(slot.seed) }}
                    >
                      {slot.seed}
                    </p>
                    <p className="text-[8px] text-muted-foreground/40 font-mono">pts/w</p>
                  </div>

                  {/* Reorder arrows (mobile only) */}
                  <div className="flex flex-col -gap-0.5 flex-shrink-0 md:hidden">
                    <button
                      onClick={() => index > 0 && onReorder(index, index - 1)}
                      disabled={index === 0}
                      className={cn(
                        "p-1 rounded-md transition-colors duration-150",
                        index === 0
                          ? "text-muted-foreground/10"
                          : "text-muted-foreground/40 active:text-foreground active:bg-white/[0.06]",
                      )}
                      aria-label="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => index < queue.length - 1 && onReorder(index, index + 1)}
                      disabled={index === queue.length - 1}
                      className={cn(
                        "p-1 rounded-md transition-colors duration-150",
                        index === queue.length - 1
                          ? "text-muted-foreground/10"
                          : "text-muted-foreground/40 active:text-foreground active:bg-white/[0.06]",
                      )}
                      aria-label="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => onRemove(slotId)}
                    className="p-1.5 rounded-lg text-muted-foreground/25 hover:text-red-400 active:text-red-400 active:bg-red-400/10 transition-all duration-150 flex-shrink-0"
                    aria-label="Remove from queue"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Footer: total seed weight ─────────────────────────────── */}
      {queue.length > 0 && (
        <div
          className="flex items-center justify-between px-4 py-3 border-t border-border flex-shrink-0"
        >
          <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
            Queue Seed Weight
          </span>
          <span
            className="text-lg font-bold tabular-nums font-mono"
            style={{
              background: "linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #93C5FD 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {totalSeedWeight}
          </span>
        </div>
      )}
    </div>
  )
}
