"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface DraftCountdownProps {
  countdownEndsAt: string
  draftName: string
}

export function DraftCountdown({ countdownEndsAt, draftName }: DraftCountdownProps) {
  const [secondsLeft, setSecondsLeft] = useState(30)

  useEffect(() => {
    const endMs = new Date(countdownEndsAt).getTime()

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((endMs - Date.now()) / 1000))
      setSecondsLeft(remaining)
    }

    tick()
    const interval = setInterval(tick, 100) // Higher frequency for smoother countdown
    return () => clearInterval(interval)
  }, [countdownEndsAt])

  // Progress: 1 at 30s, 0 at 0s
  const progress = secondsLeft / 30

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <style>{`
        @keyframes countdown-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        @keyframes countdown-ring {
          0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
          70% { box-shadow: 0 0 0 20px rgba(59,130,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
        }
      `}</style>

      {/* Draft name */}
      <p className="text-sm font-mono tracking-widest uppercase text-muted-foreground mb-8">
        {draftName}
      </p>

      {/* Countdown circle */}
      <div className="relative mb-8">
        {/* Background ring */}
        <svg className="w-48 h-48 -rotate-90" viewBox="0 0 192 192">
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-border"
          />
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="url(#countdown-gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 88}
            strokeDashoffset={2 * Math.PI * 88 * (1 - progress)}
            className="transition-[stroke-dashoffset] duration-200 ease-linear"
          />
          <defs>
            <linearGradient id="countdown-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#60A5FA" />
            </linearGradient>
          </defs>
        </svg>

        {/* Number */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation:
              secondsLeft <= 10
                ? "countdown-pulse 1s ease-in-out infinite"
                : undefined,
          }}
        >
          <span
            className={cn(
              "text-7xl font-bold tabular-nums font-mono",
              secondsLeft <= 5
                ? "text-red-400"
                : secondsLeft <= 10
                  ? "text-amber-400"
                  : "text-foreground",
            )}
          >
            {secondsLeft}
          </span>
        </div>
      </div>

      {/* Label */}
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold">
          {secondsLeft > 0 ? "Draft starting soon" : "Starting..."}
        </p>
        <p className="text-sm text-muted-foreground">
          {secondsLeft > 0
            ? "Get ready to make your picks!"
            : "Shuffling draft order..."}
        </p>
      </div>
    </div>
  )
}
