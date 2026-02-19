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
  const progressPct = Math.max(2, ((currentPickNumber - 1) / Math.max(totalPicks, 1)) * 100)

  return (
    <div className={cn(
      "rounded-2xl border border-white/[0.06] overflow-hidden",
      "bg-gradient-to-b from-white/[0.08] to-white/[0.02]",
      "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4)]",
    )}>
      <div className="flex items-center justify-between px-4 py-3">

        {/* Left: back + live badge + draft name */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/drafts/${draftId}`}
            className={cn(
              "flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0",
              "text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.06]",
              "border border-transparent hover:border-white/[0.06]",
              "transition-all duration-200",
            )}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>

          <div className="h-5 w-px bg-white/[0.06] flex-shrink-0" />

          {/* LIVE pill */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#5E6AD2]/30 bg-[#5E6AD2]/[0.08] px-2.5 py-0.5 flex-shrink-0">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5E6AD2] opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#5E6AD2]" />
            </span>
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#5E6AD2]/80">
              Live
            </span>
          </div>

          {/* Draft name */}
          <h1 className={cn(
            "text-sm font-semibold tracking-tight truncate",
            "bg-gradient-to-b from-[#EDEDEF] to-[#EDEDEF]/70 bg-clip-text text-transparent",
          )}>
            {draftName}
          </h1>

          {isConnected && (
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" title="Connected" />
          )}
        </div>

        {/* Center: round + pick counter — hidden on mobile, shown md+ */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          {/* Round badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#8A8F98]">Rd</span>
            <span className="text-sm font-bold text-[#EDEDEF] tabular-nums leading-none">
              {currentRound}
            </span>
          </div>

          {/* Pick counter */}
          <div className="text-xs tabular-nums">
            <span className="text-[#8A8F98]">Pick </span>
            <span className="text-[#EDEDEF] font-semibold">{currentPickNumber}</span>
            <span className="text-[#8A8F98]/50"> / {totalPicks}</span>
          </div>
        </div>

        {/* Right: timer */}
        {timeLeft !== null ? (
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 flex-shrink-0",
              isUrgent
                ? "bg-red-500/10 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                : "bg-white/[0.05] border border-white/[0.08]"
            )}
          >
            <Clock
              className={cn(
                "w-3.5 h-3.5 flex-shrink-0",
                isUrgent ? "text-red-400 animate-pulse" : "text-[#5E6AD2]"
              )}
            />
            <span
              className={cn(
                "text-xl font-bold tabular-nums tracking-tight font-mono leading-none",
                isUrgent ? "text-red-400" : "text-[#EDEDEF]"
              )}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
        ) : (
          /* spacer to keep layout stable when no timer */
          <div className="w-24 flex-shrink-0" />
        )}
      </div>

      {/* Draft progress bar */}
      <div className="h-[2px] bg-white/[0.04]">
        <div
          className="h-full bg-gradient-to-r from-[#5E6AD2]/70 via-[#5E6AD2] to-[#6872D9] transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  )
}
