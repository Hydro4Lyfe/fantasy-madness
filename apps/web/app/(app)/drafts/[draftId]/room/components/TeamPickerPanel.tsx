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

const REGIONS = [
  { quadrant: 1, name: "East", color: "#3B82F6" },
  { quadrant: 2, name: "West", color: "#10B981" },
  { quadrant: 3, name: "South", color: "#F59E0B" },
  { quadrant: 4, name: "Midwest", color: "#F43F5E" },
] as const

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
  const [activeRegion, setActiveRegion] = useState<"all" | number>("all")

  const filteredSlots = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return slots.filter((slot) => {
      const matchesSearch =
        slot.displayName.toLowerCase().includes(query) ||
        slot.abbreviation?.toLowerCase().includes(query)
      return matchesSearch
    })
  }, [slots, searchQuery])

  /* Group filtered slots by region, sorted by seed */
  const slotsByRegion = useMemo(() => {
    const grouped = new Map<number, AvailableSlot[]>()
    for (const r of REGIONS) grouped.set(r.quadrant, [])
    for (const slot of filteredSlots) {
      grouped.get(slot.quadrant)?.push(slot)
    }
    for (const [, group] of grouped) {
      group.sort((a, b) => a.seed - b.seed)
    }
    return grouped
  }, [filteredSlots])

  const sortedPicks = useMemo(
    () => [...picks].sort((a, b) => a.overallPickNo - b.overallPickNo),
    [picks]
  )

  /* Determine which regions to show */
  const visibleRegions =
    activeRegion === "all"
      ? REGIONS
      : REGIONS.filter((r) => r.quadrant === activeRegion)

  return (
    <div
      className="h-full rounded-2xl border border-border flex flex-col overflow-hidden bg-card"
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

      {/* Region tabs */}
      <div className="flex gap-0.5 p-2 border-b border-border">
        <button
          onClick={() => setActiveRegion("all")}
          className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wider uppercase transition-all duration-200"
          style={
            activeRegion === "all"
              ? { background: "rgba(59,130,246,0.15)", color: "#3B82F6" }
              : { color: "#8A8F98" }
          }
        >
          All
        </button>
        {REGIONS.map((r) => {
          const count = slotsByRegion.get(r.quadrant)?.length ?? 0
          return (
            <button
              key={r.quadrant}
              onClick={() => setActiveRegion(r.quadrant)}
              className="flex-1 py-1.5 rounded-lg text-[11px] font-bold tracking-wider uppercase transition-all duration-200 relative"
              style={
                activeRegion === r.quadrant
                  ? { background: `${r.color}18`, color: r.color }
                  : { color: "#8A8F98" }
              }
            >
              {r.name}
              {count > 0 && (
                <span className="ml-1 text-[9px] opacity-60">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Slot grid — organized by region */}
      <div className="relative z-10 flex-1 overflow-y-auto p-3">
        {filteredSlots.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            No teams match your search
          </div>
        ) : (
          <div className="space-y-4">
            {visibleRegions.map((r) => {
              const regionSlots = slotsByRegion.get(r.quadrant) ?? []
              if (regionSlots.length === 0) return null

              return (
                <div key={r.quadrant}>
                  {/* Region section header (hidden when viewing single region) */}
                  {activeRegion === "all" && (
                    <div
                      className="flex items-center gap-2 px-2 py-1.5 mb-1.5 rounded-lg"
                      style={{
                        background: `${r.color}0A`,
                        borderLeft: `2px solid ${r.color}`,
                      }}
                    >
                      <span
                        className="text-[11px] font-bold tracking-wider uppercase"
                        style={{ color: r.color }}
                      >
                        {r.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-auto font-mono">
                        {regionSlots.length} avail
                      </span>
                    </div>
                  )}

                  <div className="space-y-1">
                    {regionSlots.map((slot, i) => (
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
                </div>
              )
            })}
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
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.10)",
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
