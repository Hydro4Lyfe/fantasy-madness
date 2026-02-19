"use client"

import { ImageWithFallback } from "@/components/figma/ImageWithFallback"
import { TeamLogo } from "@/components/team/TeamLogo"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface ParticipantPick {
  slotId: string
  displayName: string
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

// ─── Seed tier helpers ────────────────────────────────────────────────────────

/** Seed number color — higher seed = bigger upset = more valuable = more saturated */
function seedTierTextColor(seed: number): string {
  if (seed <= 4) return "text-[#8A8F98]"    // safe / low reward
  if (seed <= 8) return "text-[#EDEDEF]"    // moderate
  if (seed <= 12) return "text-amber-400"   // mild upset
  return "text-[#5E6AD2]"                   // big upset — high value
}

/** Border tint matching the seed tier */
function seedTierBorderColor(seed: number): string {
  if (seed <= 4) return "border-white/[0.06]"
  if (seed <= 8) return "border-white/[0.08]"
  if (seed <= 12) return "border-amber-500/25"
  return "border-[#5E6AD2]/35"
}

/** First word of displayName, hard-capped at 6 chars */
function shortName(displayName: string): string {
  const first = displayName.split(" ")[0]
  return first.length > 6 ? first.slice(0, 5) + "…" : first
}

// ─── On-deck derivation ───────────────────────────────────────────────────────
//
// For a SNAKE draft with N players:
//   Odd rounds  (1, 3, 5…) → ascending pickOrder  1 → N
//   Even rounds (2, 4, 6…) → descending pickOrder N → 1
//
// Given pick number n (1-indexed):
//   round   = floor((n-1)/N) + 1
//   posInRound = (n-1) % N   (0-indexed)
//   If round is odd:  pickOrder = posInRound + 1
//   If round is even: pickOrder = N - posInRound

function getNextPickerUserId(
  participants: Participant[],
  currentPickNumber: number,
  draftType: string,
): string | null {
  const N = participants.length
  if (N === 0) return null

  const next = currentPickNumber + 1
  const nextRound = Math.floor((next - 1) / N) + 1
  const nextPos = (next - 1) % N // 0-indexed

  let nextPickOrder: number
  if (draftType === "SNAKE") {
    nextPickOrder = nextRound % 2 === 1 ? nextPos + 1 : N - nextPos
  } else {
    nextPickOrder = nextPos + 1
  }

  return participants.find((p) => p.pickOrder === nextPickOrder)?.oduserId ?? null
}

// ─── Component ────────────────────────────────────────────────────────────────

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
    <div className={cn(
      "flex flex-col h-full rounded-2xl border border-white/[0.06] overflow-hidden",
      "bg-gradient-to-b from-white/[0.08] to-white/[0.02]",
      "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)]",
      className,
    )}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
        <div>
          <h3 className="text-xs font-mono tracking-widest uppercase text-[#8A8F98]">
            Draft Board
          </h3>
          <p className="text-[10px] text-[#8A8F98]/40 mt-0.5">
            grey → amber → <span className="text-[#5E6AD2]/60">indigo</span> = upset value
          </p>
        </div>
        <span className="text-[10px] h-5 px-2 rounded-full border border-white/[0.06] text-[#8A8F98] inline-flex items-center font-mono">
          {draftType === "SNAKE" ? "Snake" : "Linear"}
        </span>
      </div>

      {/* ── Status strip ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.01] flex-shrink-0">

        {/* On the clock */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="inline-flex items-center gap-1 rounded-full bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 px-2 py-0.5 flex-shrink-0">
            <Clock className="w-2.5 h-2.5 text-[#5E6AD2] animate-pulse" />
            <span className="text-[8px] font-mono tracking-widest uppercase text-[#5E6AD2]/70">
              Picking
            </span>
          </div>
          {currentPicker ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-4 h-4 rounded-full overflow-hidden border border-[#5E6AD2]/30 flex-shrink-0">
                <ImageWithFallback
                  src={currentPicker.userImage || ""}
                  alt={currentPicker.userName || ""}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-semibold text-[#EDEDEF] truncate">
                {currentPicker.userName ?? "—"}
              </span>
            </div>
          ) : (
            <span className="text-xs text-[#8A8F98]">—</span>
          )}
        </div>

        {/* Arrow separator */}
        <span className="text-[#8A8F98]/25 text-sm flex-shrink-0">→</span>

        {/* On deck */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-[8px] font-mono tracking-widest uppercase text-[#8A8F98]/45 flex-shrink-0">
            On Deck
          </span>
          {onDeckPicker ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-4 h-4 rounded-full overflow-hidden border border-white/[0.08] flex-shrink-0">
                <ImageWithFallback
                  src={onDeckPicker.userImage || ""}
                  alt={onDeckPicker.userName || ""}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs text-[#8A8F98] truncate">
                {onDeckPicker.userName ?? "—"}
              </span>
            </div>
          ) : (
            <span className="text-xs text-[#8A8F98]">—</span>
          )}
        </div>

      </div>

      {/* ── Participant list ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {participants.map((participant) => {
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
              className={cn(
                "rounded-xl border p-3 transition-all duration-300",
                isCurrentPicker
                  ? "bg-[#5E6AD2]/[0.06] border-[#5E6AD2]/25 shadow-[0_0_0_1px_rgba(94,106,210,0.2),0_4px_16px_rgba(94,106,210,0.07)]"
                  : isOnDeck
                    ? "bg-white/[0.03] border-white/[0.07]"
                    : isYou
                      ? "bg-white/[0.04] border-white/[0.08]"
                      : "bg-white/[0.02] border-white/[0.04]"
              )}
            >
              {/* Participant header row */}
              <div className="flex items-center gap-2 mb-2.5">

                {/* Pick order badge */}
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                  "text-[9px] font-mono font-bold tabular-nums",
                  isCurrentPicker
                    ? "bg-[#5E6AD2]/20 border border-[#5E6AD2]/40 text-[#5E6AD2]"
                    : isOnDeck
                      ? "bg-white/[0.06] border border-white/[0.10] text-[#EDEDEF]/60"
                      : "bg-white/[0.04] border border-white/[0.06] text-[#8A8F98]/50",
                )}>
                  {participant.pickOrder}
                </span>

                {/* Avatar */}
                <div className={cn(
                  "w-6 h-6 rounded-full overflow-hidden flex-shrink-0",
                  isCurrentPicker
                    ? "border border-[#5E6AD2]/40 bg-white/[0.06]"
                    : "border border-white/[0.08] bg-white/[0.06]",
                )}>
                  <ImageWithFallback
                    src={participant.userImage || ""}
                    alt={participant.userName || "Player"}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Name */}
                <p className="text-xs font-medium text-[#EDEDEF] truncate flex-1 min-w-0">
                  {participant.userName ?? "Unknown"}
                  {isYou && (
                    <span className="text-[#5E6AD2]/60 ml-1 font-normal">(You)</span>
                  )}
                </p>

                {/* Seed weight */}
                {seedWeight > 0 && (
                  <div className="flex items-baseline gap-0.5 flex-shrink-0">
                    <span className="text-xs font-mono font-bold text-[#5E6AD2] tabular-nums">
                      {seedWeight}
                    </span>
                    <span className="text-[9px] text-[#8A8F98]/60 font-mono">pts/w</span>
                  </div>
                )}

                {/* Status badge */}
                {isCurrentPicker ? (
                  <Clock className="w-3 h-3 text-[#5E6AD2] flex-shrink-0 animate-pulse" />
                ) : isOnDeck ? (
                  <span className="text-[8px] font-mono tracking-wide uppercase text-[#8A8F98]/50 flex-shrink-0">
                    next
                  </span>
                ) : null}
              </div>

              {/* Pick chips */}
              <div className="flex gap-1 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                {sortedPicks.map((pick) => (
                  <div
                    key={pick.slotId}
                    className={cn(
                      "flex-shrink-0 flex items-center gap-1.5 px-2 h-11 w-[70px] rounded-xl border",
                      seedTierBorderColor(pick.seed),
                      "bg-white/[0.03]",
                    )}
                    title={`${pick.displayName} · Seed ${pick.seed}`}
                  >
                    {/* Team logo */}
                    <div className="w-5 h-5 rounded-md bg-white/[0.06] border border-white/[0.06] flex items-center justify-center overflow-hidden flex-shrink-0">
                      <TeamLogo
                        teamId={pick.logoTeamIds[0]}
                        label={pick.displayName}
                        className="w-4 h-4"
                      />
                    </div>
                    {/* Seed + short name */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className={cn(
                        "text-[9px] font-bold font-mono tabular-nums leading-none",
                        seedTierTextColor(pick.seed),
                      )}>
                        #{pick.seed}
                      </span>
                      <span className="text-[10px] font-medium text-[#EDEDEF]/90 leading-tight mt-0.5 truncate">
                        {shortName(pick.displayName)}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: emptySlots }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="flex-shrink-0 w-[70px] h-11 rounded-xl border border-dashed border-white/[0.04] flex items-center justify-center"
                  >
                    <div className="w-1 h-1 rounded-full bg-white/[0.08]" />
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
