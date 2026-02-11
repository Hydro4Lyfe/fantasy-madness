"use client"

import { Trophy } from "lucide-react"

export function DraftCompleteBanner() {
  return (
    <div className="flex items-center gap-3 px-5 py-4 rounded-lg bg-green-500/5 border border-green-500/20">
      <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center">
        <Trophy className="w-4.5 h-4.5 text-green-400" />
      </div>
      <div>
        <p className="font-semibold text-green-400 text-sm">Draft Complete</p>
        <p className="text-xs text-muted-foreground">
          Redirecting to results...
        </p>
      </div>
    </div>
  )
}
