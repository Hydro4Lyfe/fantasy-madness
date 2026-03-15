"use client"

import { Trophy } from "lucide-react"

export function DraftCompleteBanner() {
  return (
    <div
      className="relative flex items-center gap-3 px-5 py-4 rounded-2xl overflow-hidden bg-card border border-border"
      style={{
        boxShadow: "0 0 0 1px rgba(34,197,94,0.1), 0 0 40px rgba(34,197,94,0.08)",
        animation: "dr-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
      }}
    >
      {/* Top edge highlight */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.4) 50%, transparent 100%)",
        }}
      />

      <div
        className="relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: "rgba(34,197,94,0.10)",
          border: "1px solid rgba(34,197,94,0.25)",
          boxShadow: "0 0 20px rgba(34,197,94,0.2)",
        }}
      >
        <Trophy className="w-4.5 h-4.5" style={{ width: 18, height: 18, color: "#4ade80" }} />
      </div>

      <div className="relative">
        <p
          className="font-semibold text-sm"
          style={{
            background: "linear-gradient(135deg, #4ade80 0%, #86efac 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Draft Complete
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Redirecting to results...
        </p>
      </div>

      {/* Animated dots */}
      <div className="ml-auto flex gap-1 items-center flex-shrink-0">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: "rgba(74,222,128,0.5)",
              animation: `pulse 1s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
