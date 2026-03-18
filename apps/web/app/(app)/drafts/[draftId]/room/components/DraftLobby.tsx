"use client"

import { useState, useEffect } from "react"
import { Users, Clock, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DraftRoomStateDTO } from "@/server/dal"

interface DraftLobbyProps {
  draft: DraftRoomStateDTO
  userId: string
}

export function DraftLobby({ draft, userId }: DraftLobbyProps) {
  const [timeUntilStart, setTimeUntilStart] = useState("")
  const [copied, setCopied] = useState(false)

  // Countdown to startAt
  useEffect(() => {
    if (!draft.startAt) return

    const tick = () => {
      const startMs = new Date(draft.startAt!).getTime()
      const remaining = Math.max(0, startMs - Date.now())

      if (remaining <= 0) {
        setTimeUntilStart("Starting soon...")
        return
      }

      const mins = Math.floor(remaining / 60_000)
      const secs = Math.floor((remaining % 60_000) / 1000)
      setTimeUntilStart(
        mins > 0 ? `${mins}m ${secs.toString().padStart(2, "0")}s` : `${secs}s`
      )
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [draft.startAt])

  const handleCopyInvite = async () => {
    if (!draft.inviteCode) return
    const url = `${window.location.origin}/join/${draft.inviteCode}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isHost = draft.participants.some(
    (p) => p.oduserId === userId && p.isHost
  )

  return (
    <div className="flex flex-col items-center justify-center gap-8 px-4 py-8 min-h-[60vh]">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{draft.name}</h1>
        <p className="text-sm text-muted-foreground">
          {draft.tournamentName}
        </p>
      </div>

      {/* Countdown to start */}
      {draft.startAt && (
        <div
          className={cn(
            "flex flex-col items-center gap-2 p-6 rounded-2xl",
            "bg-card/60 border border-border backdrop-blur-sm",
          )}
        >
          <Clock className="w-5 h-5 text-[#3B82F6]" />
          <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
            Draft starts in
          </p>
          <p
            className="text-3xl font-bold tabular-nums font-mono"
            style={{
              background:
                "linear-gradient(135deg, #3B82F6 0%, #60A5FA 50%, #3B82F6 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {timeUntilStart}
          </p>
        </div>
      )}

      {/* Participants */}
      <div
        className={cn(
          "w-full max-w-md rounded-2xl p-4",
          "bg-card/60 border border-border backdrop-blur-sm",
        )}
      >
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
            Participants ({draft.participants.length}/8)
          </span>
        </div>

        <div className="space-y-2">
          {draft.participants.map((p) => (
            <div
              key={p.oduserId}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl",
                "bg-secondary/50 border border-border/50",
                p.oduserId === userId && "ring-1 ring-[#3B82F6]/30",
              )}
            >
              {p.userImage ? (
                <img
                  src={p.userImage}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                  {(p.userName ?? "?")[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {p.userName ?? "Unknown"}
                  {p.oduserId === userId && (
                    <span className="text-xs text-muted-foreground ml-1.5">
                      (you)
                    </span>
                  )}
                </p>
              </div>
              {p.isHost && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  Host
                </span>
              )}
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 8 - draft.participants.length) }).map(
            (_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-dashed border-border/30"
              >
                <div className="w-8 h-8 rounded-full bg-muted/30" />
                <p className="text-sm text-muted-foreground/40">
                  Waiting for player...
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Invite link (host only, private drafts) */}
      {isHost && draft.isPrivate && draft.inviteCode && (
        <button
          onClick={handleCopyInvite}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl",
            "text-sm font-medium transition-all duration-200",
            "bg-[#3B82F6]/15 border border-[#3B82F6]/25 text-[#3B82F6]",
            "hover:bg-[#3B82F6]/25",
            "active:scale-[0.98]",
          )}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Invite Link
            </>
          )}
        </button>
      )}

      {/* Draft info */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground/60 font-mono">
        <span>{draft.draftType} draft</span>
        <span className="text-muted-foreground/20">|</span>
        <span>{draft.rosterSize} picks each</span>
        {draft.pickTimerSec && (
          <>
            <span className="text-muted-foreground/20">|</span>
            <span>{draft.pickTimerSec}s timer</span>
          </>
        )}
      </div>
    </div>
  )
}
