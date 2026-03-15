"use client"

import { cn } from "@/lib/utils"
import { Loader2, WifiOff, AlertCircle } from "lucide-react"

interface ConnectionBannerProps {
  connectionState: "connecting" | "connected" | "disconnected" | "error"
  error: string | null
  onReconnect: () => void
}

export function ConnectionBanner({
  connectionState,
  error,
  onReconnect,
}: ConnectionBannerProps) {
  if (connectionState === "connecting") {
    return (
      <div
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm bg-card border border-border"
        style={{
          color: "rgba(251,191,36,0.9)",
          animation: "dr-fade-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
        <span>Connecting to draft room...</span>
      </div>
    )
  }

  if (connectionState === "disconnected") {
    return (
      <div
        className="flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm"
        style={{
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.2)",
          color: "rgba(248,113,113,0.9)",
          animation: "dr-fade-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      >
        <div className="flex items-center gap-2">
          <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Disconnected from draft room</span>
        </div>
        <button
          onClick={onReconnect}
          className="text-xs h-7 px-3 rounded-lg transition-all duration-200"
          style={{ color: "rgba(248,113,113,0.9)" }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.10)"
            ;(e.currentTarget as HTMLButtonElement).style.color = "rgba(252,165,165,1)"
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = "transparent"
            ;(e.currentTarget as HTMLButtonElement).style.color = "rgba(248,113,113,0.9)"
          }}
        >
          Reconnect
        </button>
      </div>
    )
  }

  if (connectionState === "error" && error) {
    return (
      <div
        className="flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm"
        style={{
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.2)",
          color: "rgba(248,113,113,0.9)",
          animation: "dr-fade-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
        <button
          onClick={onReconnect}
          className="text-xs h-7 px-3 rounded-lg transition-all duration-200"
          style={{ color: "rgba(248,113,113,0.9)" }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.10)"
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = "transparent"
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return null
}
