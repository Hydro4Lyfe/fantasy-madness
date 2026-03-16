"use client"

import { ImageWithFallback } from "@/components/figma/ImageWithFallback"
import { TeamLogo } from "@/components/team/TeamLogo"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface ParticipantPick {
  slotId: string
  displayName: string
  abbreviation: string | null
  logoTeamIds: number[]
  seed: number
  quadrant: number
  overallPickNo: number
}

interface Participant {
  oduserId: string
  userName: string | null
  userImage: string | null
  pickOrder: number
  isHost: boolean
  picks: ParticipantPick[]
}

interface DraftBoardProps {
  participants: Participant[]
  currentPickerUserId: string | null
  userId: string
  rosterSize: number
  draftType: string
  currentPickNumber: number
  className?: string
}

/** Seed-tier chip colors */
function seedTierTextColor(seed: number): string {
  if (seed <= 4) return "#8A8F98"
  if (seed <= 8) return "#EDEDEF"
  if (seed <= 12) return "#f59e0b"
  return "#818cf8"
}

function seedTierBorderColor(seed: number): string {
  if (seed <= 4) return "rgba(48,54,61,0.8)"
  if (seed <= 8) return "rgba(48,54,61,1)"
  if (seed <= 12) return "rgba(245,158,11,0.25)"
  return "rgba(59,130,246,0.35)"
}

function shortName(displayName: string): string {
  const first = displayName.split(" ")[0]
  return first.length > 6 ? first.slice(0, 5) + "…" : first
}

function getNextPickerUserId(
  participants: Participant[],
  currentPickNumber: number,
  draftType: string,
): string | null {
  const N = participants.length
  if (N === 0) return null
  const next = currentPickNumber + 1
  const nextRound = Math.floor((next - 1) / N) + 1
  const nextPos = (next - 1) % N
  let nextPickOrder: number
  if (draftType === "SNAKE") {
    nextPickOrder = nextRound % 2 === 1 ? nextPos + 1 : N - nextPos
  } else {
    nextPickOrder = nextPos + 1
  }
  return participants.find((p) => p.pickOrder === nextPickOrder)?.oduserId ?? null
}

export function DraftBoard({
  participants,
  currentPickerUserId,
  userId,
  rosterSize,
  draftType,
  currentPickNumber,
  className,
}: DraftBoardProps) {
  const onDeckUserId = getNextPickerUserId(participants, currentPickNumber, draftType)
  const currentPicker = participants.find((p) => p.oduserId === currentPickerUserId)
  const onDeckPicker = participants.find((p) => p.oduserId === onDeckUserId)

  return (
    <div
      className={cn(
        "flex flex-col h-full rounded-2xl border border-border overflow-hidden bg-card",
        className,
      )}
      style={{
        boxShadow: "0 0 0 1px rgba(48,54,61,0.6), 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0"
      >
        <div>
          <h3 className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
            Draft Board
          </h3>
          <p className="text-[10px] text-muted-foreground/40 mt-0.5">
            grey → amber → <span style={{ color: "rgba(59,130,246,0.6)" }}>blue</span> = upset value
          </p>
        </div>
        <span
          className="text-[10px] h-5 px-2 rounded-full inline-flex items-center font-mono border border-border text-muted-foreground"
        >
          {draftType === "SNAKE" ? "Snake" : "Linear"}
        </span>
      </div>

      {/* ── Status strip ───────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 border-b border-border flex-shrink-0 bg-secondary/30"
      >
        {/* On the clock */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 flex-shrink-0"
            style={{
              background: "rgba(59,130,246,0.10)",
              border: "1px solid rgba(59,130,246,0.20)",
            }}
          >
            <Clock className="w-2.5 h-2.5 animate-pulse" style={{ color: "#3B82F6" }} />
            <span className="text-[8px] font-mono tracking-widest uppercase" style={{ color: "rgba(59,130,246,0.7)" }}>
              Picking
            </span>
          </div>
          {currentPicker ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <div
                className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0"
                style={{ border: "1px solid rgba(59,130,246,0.3)" }}
              >
                <ImageWithFallback
                  src={currentPicker.userImage || ""}
                  alt={currentPicker.userName || ""}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-semibold text-foreground truncate">
                {currentPicker.userName ?? "—"}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>

        <span className="text-muted-foreground/25 text-sm flex-shrink-0">→</span>

        {/* On deck */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-[8px] font-mono tracking-widest uppercase text-muted-foreground/45 flex-shrink-0">
            On Deck
          </span>
          {onDeckPicker ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <div
                className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0 border border-border"
              >
                <ImageWithFallback
                  src={onDeckPicker.userImage || ""}
                  alt={onDeckPicker.userName || ""}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs text-muted-foreground truncate">
                {onDeckPicker.userName ?? "—"}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
      </div>

      {/* ── Participant list ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {participants.map((participant, i) => {
          const isCurrentPicker = participant.oduserId === currentPickerUserId
          const isOnDeck = participant.oduserId === onDeckUserId
          const isYou = participant.oduserId === userId
          const sortedPicks = [...participant.picks].sort(
            (a, b) => a.overallPickNo - b.overallPickNo
          )
          const seedWeight = participant.picks.reduce((sum, p) => sum + p.seed, 0)
          const emptySlots = rosterSize - participant.picks.length

          return (
            <div
              key={participant.oduserId}
              className="rounded-xl border p-3 transition-all duration-300"
              style={{
                animationDelay: `${i * 50}ms`,
                ...(isCurrentPicker
                  ? {
                      background: "rgba(59,130,246,0.06)",
                      borderColor: "rgba(59,130,246,0.25)",
                      animation: `dr-pulse-ring 2.5s ease-in-out infinite, dr-fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both ${i * 50}ms`,
                    }
                  : isOnDeck
                  ? {
                      background: "rgba(22,27,34,0.8)",
                      borderColor: "#30363D",
                      animation: `dr-fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both ${i * 50}ms`,
                    }
                  : isYou
                  ? {
                      background: "rgba(22,27,34,0.9)",
                      borderColor: "#30363D",
                      animation: `dr-fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both ${i * 50}ms`,
                    }
                  : {
                      background: "rgba(22,27,34,0.5)",
                      borderColor: "rgba(48,54,61,0.6)",
                      animation: `dr-fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both ${i * 50}ms`,
                    }
                ),
              }}
            >
              {/* Participant header row */}
              <div className="flex items-center gap-2 mb-2.5">

                {/* Pick order badge */}
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-mono font-bold tabular-nums"
                  style={
                    isCurrentPicker
                      ? {
                          background: "rgba(59,130,246,0.20)",
                          border: "1px solid rgba(59,130,246,0.40)",
                          color: "#3B82F6",
                        }
                      : isOnDeck
                      ? {
                          background: "rgba(48,54,61,0.5)",
                          border: "1px solid #30363D",
                          color: "rgba(237,237,239,0.60)",
                        }
                      : {
                          background: "rgba(48,54,61,0.3)",
                          border: "1px solid rgba(48,54,61,0.8)",
                          color: "rgba(138,143,152,0.50)",
                        }
                  }
                >
                  {participant.pickOrder}
                </span>

                {/* Avatar */}
                <div
                  className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0"
                  style={{
                    border: isCurrentPicker
                      ? "1px solid rgba(59,130,246,0.40)"
                      : "1px solid #30363D",
                    background: "rgba(48,54,61,0.5)",
                  }}
                >
                  <ImageWithFallback
                    src={participant.userImage || ""}
                    alt={participant.userName || "Player"}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Name */}
                <p className="text-xs font-medium text-foreground truncate flex-1 min-w-0">
                  {participant.userName ?? "Unknown"}
                  {isYou && (
                    <span className="text-[#3B82F6]/60 ml-1 font-normal">(You)</span>
                  )}
                </p>

                {/* Seed weight */}
                {seedWeight > 0 && (
                  <div className="flex items-baseline gap-0.5 flex-shrink-0">
                    <span
                      className="text-xs font-mono font-bold tabular-nums"
                      style={{ color: "#3B82F6" }}
                    >
                      {seedWeight}
                    </span>
                    <span className="text-[9px] text-muted-foreground/60 font-mono">pts/w</span>
                  </div>
                )}

                {/* Status badge */}
                {isCurrentPicker ? (
                  <Clock className="w-3 h-3 flex-shrink-0 animate-pulse" style={{ color: "#3B82F6" }} />
                ) : isOnDeck ? (
                  <span className="text-[8px] font-mono tracking-wide uppercase text-muted-foreground/50 flex-shrink-0">
                    next
                  </span>
                ) : null}
              </div>

              {/* Pick chips — 4-col grid so all 8 are visible */}
              <div className="grid grid-cols-4 gap-1">
                {sortedPicks.map((pick) => (
                  <div
                    key={pick.slotId}
                    className="group relative flex items-center gap-1.5 px-1.5 py-1.5 rounded-lg transition-all duration-200 hover:brightness-125"
                    style={{
                      border: `1px solid ${seedTierBorderColor(pick.seed)}`,
                      background: "rgba(22,27,34,0.6)",
                    }}
                    title={`${pick.displayName} · Seed ${pick.seed} · Pick #${pick.overallPickNo}`}
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0"
                      style={{
                        background: "rgba(255,255,255,0.12)",
                        border: "1px solid rgba(255,255,255,0.10)",
                      }}
                    >
                      <TeamLogo
                        teamId={pick.logoTeamIds[0]}
                        label={pick.displayName}
                        className="w-4 h-4"
                      />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span
                        className="text-[9px] font-bold font-mono tabular-nums leading-none"
                        style={{ color: seedTierTextColor(pick.seed) }}
                      >
                        #{pick.seed}
                      </span>
                      <span className="text-[8px] font-medium text-foreground/70 leading-tight mt-0.5 truncate">
                        {pick.abbreviation ?? shortName(pick.displayName)}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: emptySlots }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="rounded-lg flex items-center justify-center py-1.5"
                    style={{
                      border: "1px dashed rgba(48,54,61,0.5)",
                      minHeight: 32,
                    }}
                  >
                    <div className="w-1 h-1 rounded-full bg-border" />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
