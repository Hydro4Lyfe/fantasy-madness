"use client"

import { Badge } from "@/components/ui/badge"
import { TeamLogo } from "@/components/team/TeamLogo"
import { ImageWithFallback } from "@/components/figma/ImageWithFallback"
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
}

export function DraftBoard({
  participants,
  currentPickerUserId,
  userId,
  rosterSize,
  draftType,
}: DraftBoardProps) {
  return (
    <div className="flex flex-col h-full rounded-lg border border-border/30 bg-card/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Draft Board
        </h3>
        <Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5 border-border/50 text-muted-foreground"
        >
          {draftType === "SNAKE" ? "Snake" : "Linear"}
        </Badge>
      </div>

      {/* Scrollable participant list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {participants.map((participant) => {
          const isCurrentPicker =
            participant.oduserId === currentPickerUserId
          const isYou = participant.oduserId === userId
          const sortedPicks = [...participant.picks].sort(
            (a, b) => a.overallPickNo - b.overallPickNo
          )

          return (
            <div
              key={participant.oduserId}
              className={cn(
                "rounded-lg border p-3 transition-colors",
                isCurrentPicker
                  ? "bg-orange-500/5 border-orange-500/20 shadow-[inset_3px_0_0_0] shadow-orange-500/60"
                  : isYou
                    ? "bg-card/40 border-border/40 shadow-[inset_3px_0_0_0] shadow-purple-500/40"
                    : "bg-card/20 border-border/20"
              )}
            >
              {/* Participant header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  <ImageWithFallback
                    src={participant.userImage || ""}
                    alt={participant.userName || "Player"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {participant.userName ?? "Unknown"}
                    {isYou && (
                      <span className="text-purple-400/70 ml-1 font-normal">
                        (You)
                      </span>
                    )}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                  {participant.picks.length}/{rosterSize}
                </span>
                {isCurrentPicker && (
                  <Clock className="w-3 h-3 text-orange-400" />
                )}
              </div>

              {/* Picks grid - show team logos */}
              <div className="grid grid-cols-4 gap-1">
                {Array.from({ length: rosterSize }).map((_, i) => {
                  const pick = sortedPicks[i]

                  if (pick) {
                    return (
                      <div
                        key={i}
                        className="aspect-square rounded bg-white/[0.03] border border-white/[0.06] flex items-center justify-center overflow-hidden"
                        title={`${pick.displayName} (${pick.seed})`}
                      >
                        <TeamLogo
                          teamId={pick.logoTeamIds[0]}
                          label={pick.displayName}
                          className="w-full h-full p-0.5"
                        />
                      </div>
                    )
                  }

                  return (
                    <div
                      key={i}
                      className="aspect-square rounded bg-muted/10 border border-border/20 flex items-center justify-center"
                    >
                      <div className="w-0.5 h-0.5 rounded-full bg-muted-foreground/15" />
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
