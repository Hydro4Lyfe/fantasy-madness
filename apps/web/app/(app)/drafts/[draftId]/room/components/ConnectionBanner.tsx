"use client"

import { Button } from "@/components/ui/button"
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
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-500/5 border border-yellow-500/20 text-yellow-400/90 text-sm">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Connecting to draft room...</span>
      </div>
    )
  }

  if (connectionState === "disconnected") {
    return (
      <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-red-500/5 border border-red-500/20 text-red-400/90 text-sm">
        <div className="flex items-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Disconnected from draft room</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReconnect}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 text-xs"
        >
          Reconnect
        </Button>
      </div>
    )
  }

  if (connectionState === "error" && error) {
    return (
      <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-red-500/5 border border-red-500/20 text-red-400/90 text-sm">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReconnect}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 text-xs"
        >
          Retry
        </Button>
      </div>
    )
  }

  return null
}
