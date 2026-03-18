"use client"

import { TeamLogo } from "@/components/team/TeamLogo"
import { cn } from "@/lib/utils"
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer"

interface Pick {
  slotId: string
  displayName: string
  abbreviation: string | null
  logoTeamIds: number[]
  seed: number
  quadrant: number
  overallPickNo: number
}

interface MobileMyPicksDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  picks: Pick[]
  rosterSize: number
}

export function MobileMyPicksDrawer({
  open,
  onOpenChange,
  picks,
  rosterSize,
}: MobileMyPicksDrawerProps) {
  const sortedPicks = [...picks].sort((a, b) => a.overallPickNo - b.overallPickNo)
  const totalSeedWeight = picks.reduce((sum, p) => sum + p.seed, 0)

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className={cn("bg-card border-border", "max-h-[75dvh] flex flex-col")}>
        <div className="mx-auto mt-3 mb-1 h-1 w-10 flex-shrink-0 rounded-full bg-border" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <h2 className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
            My Picks
          </h2>
          <span className={cn(
            "text-[10px] h-5 px-2 rounded-full border border-border",
            "text-muted-foreground inline-flex items-center font-mono",
          )}>
            {picks.length}/{rosterSize}
          </span>
        </div>

        {/* Pick list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {sortedPicks.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
              No picks yet
            </div>
          ) : (
            sortedPicks.map((pick) => (
              <div
                key={pick.slotId}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-secondary/30"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <TeamLogo
                    teamId={pick.logoTeamIds[0]}
                    label={pick.displayName}
                    className="w-7 h-7"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {pick.displayName}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {pick.abbreviation ? `${pick.abbreviation} · ` : ""}Seed {pick.seed}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold tabular-nums font-mono" style={{ color: "#3B82F6" }}>
                    {pick.seed}
                  </p>
                  <p className="text-[9px] text-muted-foreground/60 font-mono">pts/w</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: seed weight total */}
        {totalSeedWeight > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border flex-shrink-0">
            <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
              Total Seed Weight
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
      </DrawerContent>
    </Drawer>
  )
}
