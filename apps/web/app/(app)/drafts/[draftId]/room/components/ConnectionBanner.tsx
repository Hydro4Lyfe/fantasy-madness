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
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-yellow-500/[0.06] border border-yellow-500/20 text-yellow-400/90 text-sm">
        <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
        <span>Connecting to draft room...</span>
      </div>
    )
  }

  if (connectionState === "disconnected") {
    return (
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-red-500/[0.06] border border-red-500/20 text-red-400/90 text-sm">
        <div className="flex items-center gap-2">
          <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Disconnected from draft room</span>
        </div>
        <button
          onClick={onReconnect}
          className={cn(
            "text-xs text-red-400 hover:text-red-300 h-7 px-3 rounded-lg",
            "hover:bg-red-500/10 transition-all duration-200",
          )}
        >
          Reconnect
        </button>
      </div>
    )
  }

  if (connectionState === "error" && error) {
    return (
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-red-500/[0.06] border border-red-500/20 text-red-400/90 text-sm">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
        <button
          onClick={onReconnect}
          className={cn(
            "text-xs text-red-400 hover:text-red-300 h-7 px-3 rounded-lg",
            "hover:bg-red-500/10 transition-all duration-200",
          )}
        >
          Retry
        </button>
      </div>
    )
  }

  return null
}
