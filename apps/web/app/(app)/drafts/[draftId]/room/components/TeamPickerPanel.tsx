"use client"

import { useMemo, useState } from "react"
import { Search, List } from "lucide-react"

import { TeamLogo } from "@/components/team/TeamLogo"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import { TeamSlotCard } from "./TeamSlotCard"

interface AvailableSlot {
  slotId: string
  displayName: string
  abbreviation: string | null
  logoTeamIds: number[]
  seed: number
  quadrant: number
  isPlayIn: boolean
}

interface Pick {
  slotId: string
  displayName: string
  abbreviation: string | null
  logoTeamIds: number[]
  seed: number
  quadrant: number
  overallPickNo: number
}

interface TeamPickerPanelProps {
  slots: AvailableSlot[]
  picks: Pick[]
  rosterSize: number
  selectedSlot: string | null
  draftQueue: string[]
  isMyTurn: boolean
  showQueue: boolean
  onSelectSlot: (slotId: string) => void
  onToggleQueue: (slotId: string) => void
  onToggleShowQueue: () => void
}

type QuadrantFilter = "all" | 1 | 2 | 3 | 4

export function TeamPickerPanel({
  slots,
  picks,
  rosterSize,
  selectedSlot,
  draftQueue,
  isMyTurn,
  showQueue,
  onSelectSlot,
  onToggleQueue,
  onToggleShowQueue,
}: TeamPickerPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [quadrantFilter, setQuadrantFilter] = useState<QuadrantFilter>("all")

  const filteredSlots = useMemo(() => {
    const query = searchQuery.toLowerCase()

    return slots.filter((slot) => {
      const matchesSearch =
        slot.displayName.toLowerCase().includes(query) ||
        slot.abbreviation?.toLowerCase().includes(query)
      const matchesQuadrant =
        quadrantFilter === "all" || slot.quadrant === quadrantFilter
      return matchesSearch && matchesQuadrant
    })
  }, [slots, searchQuery, quadrantFilter])

  const sortedPicks = useMemo(
    () => [...picks].sort((a, b) => a.overallPickNo - b.overallPickNo),
    [picks]
  )

  return (
    <div className={cn(
      "flex-1 min-h-0 rounded-2xl border border-white/[0.06] flex flex-col overflow-hidden",
      "bg-gradient-to-b from-white/[0.08] to-white/[0.02]",
      "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)]",
    )}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-white/[0.06]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8A8F98]/50" />
          <Input
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "pl-9 h-8 text-sm",
              "bg-[#0F0F12] border-white/10",
              "text-[#EDEDEF] placeholder:text-[#8A8F98]",
              "focus-visible:border-[#5E6AD2] focus-visible:ring-0",
            )}
          />
        </div>

        {/* Quadrant filter */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          {(["all", 1, 2, 3, 4] as const).map((q) => (
            <button
              key={q}
              onClick={() => setQuadrantFilter(q)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200",
                quadrantFilter === q
                  ? "bg-[#5E6AD2]/15 text-[#5E6AD2]"
                  : "text-[#8A8F98] hover:text-[#EDEDEF]"
              )}
            >
              {q === "all" ? "All" : `R${q}`}
            </button>
          ))}
        </div>

        {/* Queue toggle — desktop only; mobile uses bottom bar */}
        <button
          onClick={onToggleShowQueue}
          className={cn(
            "hidden md:flex relative items-center justify-center h-8 w-8 rounded-lg transition-all duration-200",
            showQueue
              ? "bg-[#5E6AD2]/15 text-[#5E6AD2] border border-[#5E6AD2]/25"
              : "text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.06] border border-transparent",
          )}
        >
          <List className="w-3.5 h-3.5" />
          {draftQueue.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#5E6AD2] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
              {draftQueue.length}
            </span>
          )}
        </button>
      </div>

      {/* Slot grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredSlots.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-[#8A8F98]">
            No teams match your filters
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
            {filteredSlots.map((slot) => (
              <TeamSlotCard
                key={slot.slotId}
                slotId={slot.slotId}
                displayName={slot.displayName}
                abbreviation={slot.abbreviation}
                logoTeamIds={slot.logoTeamIds}
                seed={slot.seed}
                quadrant={slot.quadrant}
                isPlayIn={slot.isPlayIn}
                isSelected={selectedSlot === slot.slotId}
                isQueued={draftQueue.includes(slot.slotId)}
                isMyTurn={isMyTurn}
                onSelect={onSelectSlot}
                onToggleQueue={onToggleQueue}
              />
            ))}
          </div>
        )}
      </div>

      {/* Your picks bar */}
      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-mono tracking-widest uppercase text-[#8A8F98]">
            Your Picks
          </h3>
          <span className={cn(
            "text-[10px] h-5 px-1.5 rounded-full border border-white/[0.06] text-[#8A8F98]",
            "inline-flex items-center",
          )}>
            {picks.length}/{rosterSize}
          </span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {sortedPicks.map((pick) => (
            <div
              key={pick.slotId}
              className="flex-shrink-0 flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.06]"
            >
              <div className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center overflow-hidden flex-shrink-0">
                <TeamLogo
                  teamId={pick.logoTeamIds[0]}
                  label={pick.displayName}
                  className="w-5 h-5"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#EDEDEF] truncate max-w-[88px]">
                  {pick.abbreviation ?? pick.displayName}
                </p>
                <p className="text-[10px] text-[#5E6AD2] tabular-nums font-mono">
                  {pick.seed}pts/w
                </p>
              </div>
            </div>
          ))}

          {Array.from({ length: rosterSize - picks.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex-shrink-0 w-24 h-[42px] rounded-xl border border-dashed border-white/[0.06] flex items-center justify-center"
            >
              <div className="w-1 h-1 rounded-full bg-[#8A8F98]/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
