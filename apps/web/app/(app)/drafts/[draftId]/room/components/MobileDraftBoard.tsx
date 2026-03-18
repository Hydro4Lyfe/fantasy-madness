"use client"

import { ImageWithFallback } from "@/components/figma/ImageWithFallback"
import { TeamLogo } from "@/components/team/TeamLogo"
import { Clock, ChevronRight } from "lucide-react"
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

interface MobileDraftBoardProps {
  participants: Participant[]
  currentPickerUserId: string | null
  userId: string
  rosterSize: number
  draftType: string
  currentPickNumber: number
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

function seedColor(seed: number): string {
  if (seed >= 13) return "#818cf8"
  if (seed >= 9) return "#f59e0b"
  return "#8A8F98"
}

export function MobileDraftBoard({
  participants,
  currentPickerUserId,
  userId,
  rosterSize,
  draftType,
  currentPickNumber,
}: MobileDraftBoardProps) {
  const onDeckUserId = getNextPickerUserId(participants, currentPickNumber, draftType)
  const currentPicker = participants.find((p) => p.oduserId === currentPickerUserId)
  const onDeckPicker = participants.find((p) => p.oduserId === onDeckUserId)

  // Build a chronological feed of all picks
  const allPicks: {
    participant: Participant
    pick: ParticipantPick
  }[] = []

  for (const p of participants) {
    for (const pick of p.picks) {
      allPicks.push({ participant: p, pick })
    }
  }

  allPicks.sort((a, b) => b.pick.overallPickNo - a.pick.overallPickNo) // newest first

  return (
    <div className="flex flex-col h-full">
      {/* ── Now Picking / On Deck ────────────────────────────────────── */}
      <div className="flex gap-2 px-1 pb-3 flex-shrink-0">
        {/* Now picking */}
        <div
          className="flex-1 rounded-xl p-3"
          style={{
            background: "rgba(59,130,246,0.06)",
            border: "1px solid rgba(59,130,246,0.20)",
          }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="w-3 h-3 animate-pulse" style={{ color: "#3B82F6" }} />
            <span
              className="text-[9px] font-mono tracking-widest uppercase font-semibold"
              style={{ color: "rgba(59,130,246,0.7)" }}
            >
              Picking
            </span>
          </div>
          {currentPicker ? (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
                style={{ border: "2px solid rgba(59,130,246,0.35)" }}
              >
                <ImageWithFallback
                  src={currentPicker.userImage || ""}
                  alt={currentPicker.userName || ""}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {currentPicker.userName ?? "Unknown"}
                  {currentPicker.oduserId === userId && (
                    <span className="text-[#3B82F6]/60 text-xs ml-1 font-normal">You</span>
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground/50 font-mono">
                  Pick #{currentPickNumber}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">—</p>
          )}
        </div>

        {/* On deck */}
        <div
          className="flex-1 rounded-xl p-3"
          style={{
            background: "rgba(22,27,34,0.6)",
            border: "1px solid rgba(48,54,61,0.8)",
          }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
            <span className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground/50">
              On Deck
            </span>
          </div>
          {onDeckPicker ? (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-border"
              >
                <ImageWithFallback
                  src={onDeckPicker.userImage || ""}
                  alt={onDeckPicker.userName || ""}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground/80 truncate">
                  {onDeckPicker.userName ?? "Unknown"}
                  {onDeckPicker.oduserId === userId && (
                    <span className="text-muted-foreground/50 text-xs ml-1 font-normal">You</span>
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground/40 font-mono">
                  Pick #{currentPickNumber + 1}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">—</p>
          )}
        </div>
      </div>

      {/* ── Pick Feed ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-1">
        {allPicks.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-xs text-muted-foreground/40 font-mono">No picks yet</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {allPicks.map(({ participant, pick }) => {
              const isYou = participant.oduserId === userId
              return (
                <div
                  key={pick.slotId}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5",
                    "transition-all duration-200",
                  )}
                  style={{
                    background: isYou ? "rgba(59,130,246,0.05)" : "rgba(22,27,34,0.4)",
                    border: isYou
                      ? "1px solid rgba(59,130,246,0.15)"
                      : "1px solid rgba(48,54,61,0.5)",
                  }}
                >
                  {/* Pick number */}
                  <span
                    className="text-[10px] font-mono tabular-nums text-muted-foreground/40 w-5 text-right flex-shrink-0"
                  >
                    {pick.overallPickNo}
                  </span>

                  {/* User avatar */}
                  <div
                    className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border border-border"
                  >
                    <ImageWithFallback
                      src={participant.userImage || ""}
                      alt={participant.userName || ""}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Team logo + info */}
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <TeamLogo
                      teamId={pick.logoTeamIds[0]}
                      label={pick.displayName}
                      className="w-5 h-5"
                    />
                  </div>

                  {/* Team name + seed */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {pick.abbreviation ?? pick.displayName}
                    </p>
                    <p className="text-[10px] text-muted-foreground/50 font-mono">
                      <span className="font-semibold" style={{ color: seedColor(pick.seed) }}>
                        #{pick.seed}
                      </span>
                      {" seed"}
                    </p>
                  </div>

                  {/* Drafter name */}
                  <span className="text-[10px] text-muted-foreground/50 truncate max-w-[60px] flex-shrink-0 text-right">
                    {isYou ? "You" : participant.userName?.split(" ")[0] ?? "—"}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
