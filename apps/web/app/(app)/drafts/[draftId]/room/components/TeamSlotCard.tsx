"use client"

import { TeamLogo } from "@/components/team/TeamLogo"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface TeamSlotCardProps {
  slotId: string
  displayName: string
  abbreviation: string | null
  logoTeamIds: number[]
  seed: number
  quadrant: number
  isPlayIn: boolean
  isSelected: boolean
  isQueued: boolean
  isMyTurn: boolean
  onSelect: (slotId: string) => void
  onToggleQueue: (slotId: string) => void
}

/** Seed-tier accent color for the seed badge */
function seedColor(seed: number): { text: string; bg: string; border: string } {
  if (seed <= 4)  return { text: "#8A8F98",   bg: "rgba(138,143,152,0.06)", border: "rgba(138,143,152,0.12)" }
  if (seed <= 8)  return { text: "#EDEDEF",   bg: "rgba(237,237,239,0.06)", border: "rgba(237,237,239,0.12)" }
  if (seed <= 12) return { text: "#f59e0b",   bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)"   }
  return              { text: "#818cf8",   bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.25)"  }
}

/** Diagonal-split logo showing both play-in teams */
function PlayInLogo({ teamIds, names }: { teamIds: number[]; names: string[] }) {
  return (
    <div
      className="relative flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      {/* Top-left team (clipped to upper-left triangle) */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
      >
        <TeamLogo
          teamId={teamIds[0]}
          label={names[0] ?? "TBD"}
          className="w-7 h-7 -translate-x-0.5 -translate-y-0.5"
        />
      </div>
      {/* Bottom-right team (clipped to lower-right triangle) */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
      >
        <TeamLogo
          teamId={teamIds[1]}
          label={names[1] ?? "TBD"}
          className="w-7 h-7 translate-x-0.5 translate-y-0.5"
        />
      </div>
      {/* Diagonal divider line */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, transparent calc(50% - 0.5px), rgba(255,255,255,0.2) calc(50% - 0.5px), rgba(255,255,255,0.2) calc(50% + 0.5px), transparent calc(50% + 0.5px))",
        }}
      />
    </div>
  )
}

export function TeamSlotCard({
  slotId,
  displayName,
  abbreviation,
  logoTeamIds,
  seed,
  quadrant,
  isPlayIn,
  isSelected,
  isQueued,
  isMyTurn,
  onSelect,
  onToggleQueue,
}: TeamSlotCardProps) {
  const sc = seedColor(seed)

  // Split play-in names for individual display
  const teamNames = isPlayIn ? displayName.split(" / ") : [displayName]
  const teamAbbrs = isPlayIn && abbreviation ? abbreviation.split(" / ") : abbreviation ? [abbreviation] : []

  return (
    <div
      onClick={() => { if (isMyTurn) onSelect(slotId) }}
      className={cn(
        "group relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 overflow-hidden",
        isMyTurn ? "cursor-pointer" : "cursor-default opacity-75"
      )}
      style={
        isSelected
          ? {
              background: "rgba(59,130,246,0.08)",
              borderColor: "rgba(59,130,246,0.45)",
              boxShadow: "inset 3px 0 0 rgba(59,130,246,0.85), 0 0 0 1px rgba(59,130,246,0.2), 0 4px 20px rgba(59,130,246,0.12)",
            }
          : isQueued
          ? {
              background: "rgba(22,27,34,0.8)",
              borderColor: "#30363D",
              boxShadow: "inset 3px 0 0 rgba(59,130,246,0.4)",
            }
          : {
              background: "rgba(22,27,34,0.6)",
              borderColor: "rgba(48,54,61,0.8)",
            }
      }
      onMouseEnter={(e) => {
        if (!isSelected && !isQueued && isMyTurn) {
          ;(e.currentTarget as HTMLDivElement).style.background = "rgba(22,27,34,1)"
          ;(e.currentTarget as HTMLDivElement).style.borderColor = "#30363D"
        }
      }}
    >
      {/* Logo container */}
      {isPlayIn && logoTeamIds.length >= 2 ? (
        <PlayInLogo teamIds={logoTeamIds} names={teamNames} />
      ) : (
        <div
          className="relative flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <TeamLogo
            teamId={logoTeamIds[0]}
            label={displayName}
            className="w-9 h-9"
          />
        </div>
      )}

      {/* Team info */}
      <div className="flex-1 min-w-0 relative z-10">
        {isPlayIn && teamNames.length >= 2 ? (
          <>
            {/* Two team names stacked with "vs" divider */}
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="text-sm font-semibold text-foreground truncate">
                {teamAbbrs[0] ?? teamNames[0]}
              </span>
              <span
                className="text-[9px] font-bold tracking-wider uppercase flex-shrink-0 px-1 py-px rounded"
                style={{
                  color: "rgba(245,158,11,0.85)",
                  background: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.15)",
                }}
              >
                vs
              </span>
              <span className="text-sm font-semibold text-foreground truncate">
                {teamAbbrs[1] ?? teamNames[1]}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-muted-foreground">
                Region {quadrant}
              </span>
              <span className="text-[11px] text-muted-foreground/40">|</span>
              <span className="text-[11px] text-amber-400/70">First Four</span>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-sm font-semibold text-foreground leading-tight truncate">
              {displayName}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              {abbreviation && (
                <>
                  <span className="text-[10px] font-semibold tracking-wide text-muted-foreground truncate max-w-[88px]">
                    {abbreviation}
                  </span>
                  <span className="text-[11px] text-muted-foreground/40">|</span>
                </>
              )}
              <span className="text-[11px] text-muted-foreground">
                Region {quadrant}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Right side: seed + pts/w + queue star */}
      <div className="flex items-center gap-2.5 flex-shrink-0 relative z-10">
        <div className="text-right">
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold tabular-nums"
            style={{
              background: sc.bg,
              border: `1px solid ${sc.border}`,
              color: sc.text,
            }}
          >
            {seed}
          </span>
          <p className="text-[10px] text-[#3B82F6] mt-0.5 tabular-nums font-mono">
            {seed}pts/w
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleQueue(slotId)
          }}
          className="p-1 rounded-lg transition-all duration-200"
          style={
            isQueued
              ? { color: "#3B82F6" }
              : { color: "rgba(138,143,152,0.3)" }
          }
          aria-label={isQueued ? "Remove from queue" : "Add to queue"}
        >
          <Star
            className="w-3.5 h-3.5"
            style={isQueued ? { fill: "#3B82F6" } : {}}
          />
        </button>
      </div>
    </div>
  )
}
