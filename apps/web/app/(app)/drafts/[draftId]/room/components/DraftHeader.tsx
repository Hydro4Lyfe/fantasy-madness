"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface DraftHeaderProps {
  draftId: string
  draftName: string
  currentRound: number
  currentPickNumber: number
  totalPicks: number
  isConnected: boolean
  timeLeft: number | null
}

function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`
}

export function DraftHeader({
  draftId,
  draftName,
  currentRound,
  currentPickNumber,
  totalPicks,
  isConnected,
  timeLeft,
}: DraftHeaderProps) {
  const isUrgent = timeLeft !== null && timeLeft <= 10

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-card/60 backdrop-blur-sm border border-border/50">
      {/* Left: exit + draft info */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-muted-foreground hover:text-foreground h-8 px-2"
        >
          <Link href={`/drafts/${draftId}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>

        <div className="h-5 w-px bg-border/50" />

        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold text-foreground tracking-tight">
            {draftName}
          </h1>
          {isConnected && (
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" title="Connected" />
          )}
        </div>

        <span className="text-xs text-muted-foreground">
          Round {currentRound}
        </span>

        <span className="text-[11px] text-muted-foreground/60 tabular-nums">
          Pick {currentPickNumber} of {totalPicks}
        </span>
      </div>

      {/* Right: timer */}
      {timeLeft !== null && (
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors",
            isUrgent
              ? "bg-red-500/10 border border-red-500/30"
              : "bg-card border border-border/50"
          )}
        >
          <Clock
            className={cn(
              "w-3.5 h-3.5",
              isUrgent ? "text-red-400 animate-pulse" : "text-orange-400"
            )}
          />
          <span
            className={cn(
              "text-lg font-bold tabular-nums tracking-tight font-mono",
              isUrgent ? "text-red-400" : "text-foreground"
            )}
          >
            {formatTime(timeLeft)}
          </span>
        </div>
      )}
    </div>
  )
}
