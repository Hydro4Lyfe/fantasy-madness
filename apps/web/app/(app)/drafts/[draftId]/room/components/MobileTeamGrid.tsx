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
      {/* Team logo */}
      {slot.isPlayIn && slot.logoTeamIds.length >= 2 ? (
        <div className="flex items-center gap-0.5 flex-shrink-0">
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
        </div>
      ) : (
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.10)" }}
        >
          <TeamLogo teamId={slot.logoTeamIds[0]} label={slot.displayName} className="w-7 h-7" />
        </div>
      )}

      {/* Team info */}
      <div className="flex-1 min-w-0">
        {slot.isPlayIn && teamAbbrs.length >= 2 ? (
          <div className="flex items-center gap-1 leading-tight">
            <span className="text-xs font-semibold text-foreground truncate">{teamAbbrs[0]}</span>
            <span className="text-[8px] text-amber-400/70 font-bold flex-shrink-0">vs</span>
            <span className="text-xs font-semibold text-foreground truncate">{teamAbbrs[1]}</span>
          </div>
        ) : (
          <p className="text-xs font-semibold text-foreground truncate leading-tight">
            {slot.abbreviation ?? slot.displayName}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Seed {slot.seed} · {slot.seed}pts/w
        </p>
      </div>

      {/* Seed badge */}
      <span
        className="inline-flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-bold tabular-nums flex-shrink-0"
        style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}
      >
        {slot.seed}
      </span>

      {/* Queue star button — easy tap target */}
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
