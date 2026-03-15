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
    <div
      className="flex-1 min-h-0 rounded-2xl border border-border flex flex-col overflow-hidden bg-card"
      style={{
        boxShadow: "0 0 0 1px rgba(48,54,61,0.6), 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)",
      }}
    >
      {/* Toolbar */}
      <div className="relative z-10 flex items-center gap-2 p-3 border-b border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
          <Input
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "pl-9 h-8 text-sm",
              "bg-background border-border",
              "text-foreground placeholder:text-muted-foreground",
              "focus-visible:border-[#3B82F6] focus-visible:ring-0",
            )}
          />
        </div>

        {/* Quadrant filter */}
        <div
          className="flex items-center gap-0.5 p-0.5 rounded-lg bg-secondary/30 border border-border"
        >
          {(["all", 1, 2, 3, 4] as const).map((q) => (
            <button
              key={q}
              onClick={() => setQuadrantFilter(q)}
              className="px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200"
              style={
                quadrantFilter === q
                  ? { background: "rgba(59,130,246,0.15)", color: "#3B82F6" }
                  : { color: "#8A8F98" }
              }
            >
              {q === "all" ? "All" : `R${q}`}
            </button>
          ))}
        </div>

        {/* Queue toggle — desktop only */}
        <button
          onClick={onToggleShowQueue}
          className="hidden md:flex relative items-center justify-center h-8 w-8 rounded-lg transition-all duration-200"
          style={
            showQueue
              ? {
                  background: "rgba(59,130,246,0.15)",
                  color: "#3B82F6",
                  border: "1px solid rgba(59,130,246,0.25)",
                }
              : {
                  color: "#8A8F98",
                  border: "1px solid transparent",
                }
          }
        >
          <List className="w-3.5 h-3.5" />
          {draftQueue.length > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white text-[10px] rounded-full flex items-center justify-center font-bold"
              style={{ background: "#3B82F6" }}
            >
              {draftQueue.length}
            </span>
          )}
        </button>
      </div>

      {/* Slot grid */}
      <div className="relative z-10 flex-1 overflow-y-auto p-3">
        {filteredSlots.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            No teams match your filters
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
            {filteredSlots.map((slot, i) => (
              <div
                key={slot.slotId}
                style={{
                  animation: "dr-fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
                  animationDelay: `${Math.min(i * 20, 200)}ms`,
                }}
              >
                <TeamSlotCard
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Your picks bar */}
      <div
        className="relative z-10 border-t border-border p-3 bg-background/50"
      >
        <div className="flex items-center justify-between mb-2.5">
          <h3
            className="text-xs font-mono tracking-widest uppercase text-muted-foreground"
          >
            Your Picks
          </h3>
          <span
            className="text-[10px] h-5 px-1.5 rounded-full inline-flex items-center font-mono border border-border text-muted-foreground"
          >
            {picks.length}/{rosterSize}
          </span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          {sortedPicks.map((pick) => (
            <div
              key={pick.slotId}
              className="flex-shrink-0 flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-secondary border border-border"
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{
                  background: "rgba(48,54,61,0.5)",
                  border: "1px solid rgba(48,54,61,0.8)",
                }}
              >
                <TeamLogo
                  teamId={pick.logoTeamIds[0]}
                  label={pick.displayName}
                  className="w-5 h-5"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate max-w-[88px]">
                  {pick.abbreviation ?? pick.displayName}
                </p>
                <p className="text-[10px] tabular-nums font-mono" style={{ color: "#3B82F6" }}>
                  {pick.seed}pts/w
                </p>
              </div>
            </div>
          ))}

          {Array.from({ length: rosterSize - picks.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex-shrink-0 w-24 h-[42px] rounded-xl flex items-center justify-center border border-dashed border-border"
            >
              <div className="w-1 h-1 rounded-full bg-muted-foreground/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
