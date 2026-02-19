"use client"

import { Trophy } from "lucide-react"

export function DraftCompleteBanner() {
  return (
    <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-green-500/[0.06] border border-green-500/20">
      <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
        <Trophy className="w-4 h-4 text-green-400" />
      </div>
      <div>
        <p className="font-semibold text-green-400 text-sm">Draft Complete</p>
        <p className="text-xs text-[#8A8F98]">
          Redirecting to results...
        </p>
      </div>
    </div>
  )
}
