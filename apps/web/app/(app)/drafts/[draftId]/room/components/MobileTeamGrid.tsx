"use client"

import { useMemo } from "react"
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

/** Seed-tier badge color — solid enough to read over a logo */
function seedBadge(seed: number): { text: string; bg: string; shadow: string } {
  if (seed <= 4)  return { text: "#d1d5db", bg: "rgba(30,34,42,0.92)",  shadow: "0 0 0 1px rgba(138,143,152,0.3)" }
  if (seed <= 8)  return { text: "#f3f4f6", bg: "rgba(30,34,42,0.92)",  shadow: "0 0 0 1px rgba(237,237,239,0.25)" }
  if (seed <= 12) return { text: "#fbbf24", bg: "rgba(30,34,42,0.92)",  shadow: "0 0 0 1px rgba(245,158,11,0.4)" }
  return              { text: "#a5b4fc", bg: "rgba(30,34,42,0.92)",  shadow: "0 0 0 1px rgba(129,140,248,0.4)" }
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
  const sb = seedBadge(slot.seed)

  // Play-in: show both names
  const teamNames = slot.isPlayIn ? slot.displayName.split(" / ") : [slot.displayName]
  const teamAbbrs = slot.isPlayIn && slot.abbreviation ? slot.abbreviation.split(" / ") : slot.abbreviation ? [slot.abbreviation] : []

  return (
    <div
      onClick={() => { if (isMyTurn) onSelect(slot.slotId) }}
      className={cn(
        "relative flex items-center gap-2.5 p-2 rounded-xl border transition-all duration-200",
        isMyTurn ? "cursor-pointer active:scale-[0.98]" : "cursor-default opacity-60",
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
      {/* Team logo with seed badge overlay */}
      {slot.isPlayIn && slot.logoTeamIds.length >= 2 ? (
        <div className="relative flex items-center gap-0.5 flex-shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.10)" }}
          >
            <TeamLogo teamId={slot.logoTeamIds[0]} label={teamNames[0] ?? "TBD"} className="w-6 h-6" />
          </div>
          <span className="text-[7px] text-amber-400/70 font-bold">vs</span>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.10)" }}
          >
            <TeamLogo teamId={slot.logoTeamIds[1]} label={teamNames[1] ?? "TBD"} className="w-6 h-6" />
          </div>
          {/* Seed badge — centered below the vs */}
          <span
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 inline-flex items-center justify-center w-5 h-4 rounded-full text-[9px] font-bold tabular-nums"
            style={{ background: sb.bg, color: sb.text, boxShadow: sb.shadow }}
          >
            {slot.seed}
          </span>
        </div>
      ) : (
        <div className="relative flex-shrink-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.10)" }}
          >
            <TeamLogo teamId={slot.logoTeamIds[0]} label={slot.displayName} className="w-8 h-8" />
          </div>
          {/* Seed badge — bottom-right corner of logo */}
          <span
            className="absolute -bottom-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-0.5 rounded-full text-[9px] font-bold tabular-nums"
            style={{ background: sb.bg, color: sb.text, boxShadow: sb.shadow }}
          >
            {slot.seed}
          </span>
        </div>
      )}

      {/* Team info — more room now without the seed column */}
      <div className="flex-1 min-w-0">
        {slot.isPlayIn && teamAbbrs.length >= 2 ? (
          <>
            <div className="flex items-center gap-1 leading-tight">
              <span className="text-xs font-semibold text-foreground truncate">{teamAbbrs[0]}</span>
              <span className="text-[8px] text-amber-400/70 font-bold flex-shrink-0">vs</span>
              <span className="text-xs font-semibold text-foreground truncate">{teamAbbrs[1]}</span>
            </div>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">
              First Four
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold text-foreground truncate leading-tight">
              {slot.displayName}
            </p>
            {slot.abbreviation && (
              <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">
                {slot.abbreviation}
              </p>
            )}
          </>
        )}
      </div>

      {/* Queue star button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleQueue(slot.slotId)
        }}
        className="p-1.5 rounded-lg transition-all duration-200 flex-shrink-0 active:scale-[0.9]"
        style={
          isQueued
            ? { color: "#3B82F6", background: "rgba(59,130,246,0.12)" }
            : { color: "rgba(138,143,152,0.4)" }
        }
        aria-label={isQueued ? "Remove from queue" : "Add to queue"}
      >
        <Star
          className="w-4 h-4"
          style={isQueued ? { fill: "#3B82F6" } : {}}
        />
      </button>
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
    <div className="grid grid-cols-2 gap-1.5 p-2">
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
