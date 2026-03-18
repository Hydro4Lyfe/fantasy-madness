"use client"

import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileFloatingTimerProps {
  timeLeft: number | null
}

function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`
}

export function MobileFloatingTimer({ timeLeft }: MobileFloatingTimerProps) {
  if (timeLeft === null) return null

  const isUrgent = timeLeft <= 10
  const isWarning = timeLeft <= 30 && timeLeft > 10

  return (
    <div
      className={cn(
        "sticky top-0 z-30 flex items-center justify-center gap-2 py-1.5 px-4",
        "backdrop-blur-md border-b",
      )}
      style={{
        background: isUrgent
          ? "rgba(239,68,68,0.10)"
          : isWarning
          ? "rgba(245,158,11,0.08)"
          : "rgba(22,27,34,0.85)",
        borderColor: isUrgent
          ? "rgba(239,68,68,0.25)"
          : isWarning
          ? "rgba(245,158,11,0.20)"
          : "rgba(48,54,61,0.6)",
      }}
    >
      <Clock
        className={cn(
          "w-3.5 h-3.5 flex-shrink-0",
          isUrgent
            ? "text-red-400 animate-pulse"
            : isWarning
            ? "text-amber-400"
            : "text-[#3B82F6]"
        )}
      />
      <span
        className={cn(
          "text-lg font-bold tabular-nums tracking-tight font-mono leading-none",
          isUrgent
            ? "text-red-400"
            : isWarning
            ? "text-amber-400"
            : "text-foreground"
        )}
      >
        {formatTime(timeLeft)}
      </span>
    </div>
  )
}
