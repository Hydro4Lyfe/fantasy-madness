"use client"

import Link from "next/link"
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
  const isWarning = timeLeft !== null && timeLeft <= 30 && timeLeft > 10
  const progressPct = Math.max(2, ((currentPickNumber - 1) / Math.max(totalPicks, 1)) * 100)

  return (
    <div
      className={cn(
        "rounded-2xl border border-border overflow-hidden",
        "bg-card",
      )}
      style={{
        boxShadow: "0 0 0 1px rgba(48,54,61,0.6), 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)",
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">

        {/* Left: back + live badge + draft name */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/drafts/${draftId}`}
            className={cn(
              "flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0",
              "text-muted-foreground hover:text-foreground hover:bg-secondary",
              "border border-transparent hover:border-border",
              "transition-all duration-200",
            )}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>

          <div className="h-5 w-px bg-border flex-shrink-0" />

          {/* LIVE pill with pulsing dot — red (ESPN convention) */}
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 flex-shrink-0"
            style={{
              background: "rgba(248,81,73,0.08)",
              border: "1px solid rgba(248,81,73,0.3)",
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: "#F85149" }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "#F85149" }} />
            </span>
            <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: "rgba(248,81,73,0.8)" }}>
              Live
            </span>
          </div>

          {/* Draft name — gradient text */}
          <h1
            className="text-sm font-semibold tracking-tight truncate text-foreground"
          >
            {draftName}
          </h1>

          {isConnected && (
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                background: "#22c55e",
                boxShadow: "0 0 6px rgba(34,197,94,0.6)",
              }}
              title="Connected"
            />
          )}
        </div>

        {/* Center: round + pick counter — hidden on mobile */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          {/* Round badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary border border-border"
          >
            <span className="text-[10px] font-mono tracking-wider uppercase text-muted-foreground">Rd</span>
            <span className="text-sm font-bold text-foreground tabular-nums leading-none">
              {currentRound}
            </span>
          </div>

          {/* Pick counter */}
          <div className="text-xs tabular-nums">
            <span className="text-muted-foreground">Pick </span>
            <span className="text-foreground font-semibold">{currentPickNumber}</span>
            <span className="text-muted-foreground/50"> / {totalPicks}</span>
          </div>
        </div>

        {/* Right: timer */}
        {timeLeft !== null ? (
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 flex-shrink-0",
            )}
            style={
              isUrgent
                ? {
                    background: "rgba(239,68,68,0.08)",
                    animation: "dr-urgent-pulse 1s ease-in-out infinite",
                  }
                : isWarning
                ? {
                    background: "rgba(245,158,11,0.07)",
                    border: "1px solid rgba(245,158,11,0.25)",
                  }
                : {
                    background: "rgba(59,130,246,0.06)",
                    border: "1px solid rgba(59,130,246,0.2)",
                  }
            }
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
                "text-xl font-bold tabular-nums tracking-tight font-mono leading-none",
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
        ) : (
          <div className="w-24 flex-shrink-0" />
        )}
      </div>

      {/* Draft progress bar */}
      <div className="h-[2px] bg-border/40">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${progressPct}%`,
            background: "linear-gradient(90deg, rgba(59,130,246,0.7) 0%, #3B82F6 50%, #60A5FA 100%)",
            boxShadow: "0 0 8px rgba(59,130,246,0.5)",
          }}
        />
      </div>
    </div>
  )
}
