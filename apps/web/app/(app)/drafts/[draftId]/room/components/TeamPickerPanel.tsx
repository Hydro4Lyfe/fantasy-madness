"use client"

import { useMemo, useState } from "react"
import { Search, List } from "lucide-react"

import { TeamLogo } from "@/components/team/TeamLogo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
    <div className="flex-1 min-h-0 rounded-lg border border-border/30 bg-card/20 flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 p-3 border-b border-border/30">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
          <Input
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-sm bg-card/40 border-border/50 focus:border-orange-500/40"
          />
        </div>

        <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-card/40 border border-border/50">
          {(["all", 1, 2, 3, 4] as const).map((q) => (
            <button
              key={q}
              onClick={() => setQuadrantFilter(q)}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                quadrantFilter === q
                  ? "bg-orange-500/15 text-orange-400"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {q === "all" ? "All" : `R${q}`}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleShowQueue}
          className={cn(
            "relative h-8 px-2.5",
            showQueue ? "text-blue-400" : "text-muted-foreground"
          )}
        >
          <List className="w-3.5 h-3.5" />
          {draftQueue.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
              {draftQueue.length}
            </span>
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {filteredSlots.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
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

      <div className="border-t border-border/30 p-3">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Your Picks
          </h3>
          <Badge
            variant="outline"
            className="text-[10px] h-5 px-1.5 border-border/50 text-muted-foreground"
          >
            {picks.length}/{rosterSize}
          </Badge>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {sortedPicks.map((pick) => (
            <div
              key={pick.slotId}
              className="flex-shrink-0 flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-card/60 border border-border/40"
            >
              <div className="w-6 h-6 rounded bg-white/[0.03] border border-white/[0.06] flex items-center justify-center overflow-hidden flex-shrink-0">
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
                <p className="text-[10px] text-green-400/80 tabular-nums">
                  {pick.seed}pts/w
                </p>
              </div>
            </div>
          ))}

          {Array.from({ length: rosterSize - picks.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex-shrink-0 w-24 h-[42px] rounded-md border border-dashed border-border/30 flex items-center justify-center"
            >
              <div className="w-1 h-1 rounded-full bg-muted-foreground/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
