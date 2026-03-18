"use client"

import { useMemo, useRef, useCallback } from "react"
import { TeamLogo } from "@/components/team/TeamLogo"
import { Star } from "lucide-react"
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

interface MobileTeamGridProps {
  slots: AvailableSlot[]
  selectedSlot: string | null
  draftQueue: string[]
  isMyTurn: boolean
  searchQuery: string
  onSelectSlot: (slotId: string) => void
  onToggleQueue: (slotId: string) => void
}

/** Seed-tier accent color */
function seedColor(seed: number): { text: string; bg: string; border: string } {
  if (seed <= 4)  return { text: "#8A8F98",   bg: "rgba(138,143,152,0.06)", border: "rgba(138,143,152,0.12)" }
  if (seed <= 8)  return { text: "#EDEDEF",   bg: "rgba(237,237,239,0.06)", border: "rgba(237,237,239,0.12)" }
  if (seed <= 12) return { text: "#f59e0b",   bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)"   }
  return              { text: "#818cf8",   bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.25)"  }
}

/* ── MobileTeamCard (inline) ─────────────────────────────────────────────── */

interface MobileTeamCardProps {
  slot: AvailableSlot
  isSelected: boolean
  isQueued: boolean
  isMyTurn: boolean
  onSelect: (slotId: string) => void
  onToggleQueue: (slotId: string) => void
}

function MobileTeamCard({
  slot,
  isSelected,
  isQueued,
  isMyTurn,
  onSelect,
  onToggleQueue,
}: MobileTeamCardProps) {
  const sc = seedColor(slot.seed)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)

  const handlePointerDown = useCallback(() => {
    didLongPress.current = false
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true
      onToggleQueue(slot.slotId)
    }, 500)
  }, [slot.slotId, onToggleQueue])

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  const handlePointerMove = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  const handleClick = useCallback(() => {
    // Skip if long-press already fired
    if (didLongPress.current) return
    if (isMyTurn) onSelect(slot.slotId)
  }, [slot.slotId, isMyTurn, onSelect])

  // Play-in: show both abbreviations
  const label = slot.isPlayIn && slot.abbreviation
    ? slot.abbreviation.split(" / ").join("/")
    : slot.abbreviation ?? slot.displayName.split(" ")[0]

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      className={cn(
        "relative flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-200",
        isMyTurn ? "cursor-pointer active:scale-[0.96]" : "cursor-default opacity-60",
      )}
      style={
        isSelected
          ? {
              background: "rgba(59,130,246,0.12)",
              borderColor: "rgba(59,130,246,0.5)",
              boxShadow: "0 0 0 1px rgba(59,130,246,0.25), 0 4px 16px rgba(59,130,246,0.15)",
            }
          : isQueued
          ? {
              background: "rgba(22,27,34,0.8)",
              borderColor: "rgba(59,130,246,0.25)",
            }
          : {
              background: "rgba(22,27,34,0.6)",
              borderColor: "rgba(48,54,61,0.8)",
            }
      }
    >
      {/* Queue indicator */}
      {isQueued && (
        <Star
          className="absolute top-1 right-1 w-2.5 h-2.5"
          style={{ fill: "#3B82F6", color: "#3B82F6" }}
        />
      )}

      {/* Team logo */}
      {slot.isPlayIn && slot.logoTeamIds.length >= 2 ? (
        <div className="flex items-center gap-0.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.10)" }}
          >
            <TeamLogo teamId={slot.logoTeamIds[0]} label={slot.displayName.split(" / ")[0] ?? "TBD"} className="w-5 h-5" />
          </div>
          <span className="text-[8px] text-amber-400/70 font-bold">vs</span>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.10)" }}
          >
            <TeamLogo teamId={slot.logoTeamIds[1]} label={slot.displayName.split(" / ")[1] ?? "TBD"} className="w-5 h-5" />
          </div>
        </div>
      ) : (
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
          style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.10)" }}
        >
          <TeamLogo teamId={slot.logoTeamIds[0]} label={slot.displayName} className="w-8 h-8" />
        </div>
      )}

      {/* Seed badge */}
      <span
        className="inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-bold tabular-nums"
        style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}
      >
        {slot.seed}
      </span>

      {/* Team abbreviation */}
      <span className="text-[10px] font-medium text-foreground/80 truncate max-w-full leading-tight">
        {label}
      </span>
    </div>
  )
}

/* ── MobileTeamGrid ──────────────────────────────────────────────────────── */

export function MobileTeamGrid({
  slots,
  selectedSlot,
  draftQueue,
  isMyTurn,
  searchQuery,
  onSelectSlot,
  onToggleQueue,
}: MobileTeamGridProps) {
  const sortedAndFiltered = useMemo(() => {
    const query = searchQuery.toLowerCase()
    const filtered = query
      ? slots.filter(
          (s) =>
            s.displayName.toLowerCase().includes(query) ||
            s.abbreviation?.toLowerCase().includes(query)
        )
      : slots

    // Sort by seed ascending, then quadrant for deterministic order
    return [...filtered].sort((a, b) => a.seed - b.seed || a.quadrant - b.quadrant)
  }, [slots, searchQuery])

  if (sortedAndFiltered.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        No teams match your search
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-1.5 p-2">
      {sortedAndFiltered.map((slot) => (
        <MobileTeamCard
          key={slot.slotId}
          slot={slot}
          isSelected={selectedSlot === slot.slotId}
          isQueued={draftQueue.includes(slot.slotId)}
          isMyTurn={isMyTurn}
          onSelect={onSelectSlot}
          onToggleQueue={onToggleQueue}
        />
      ))}
    </div>
  )
}
