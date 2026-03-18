"use client"

import { Check, Zap } from "lucide-react"
import { ImageWithFallback } from "@/components/figma/ImageWithFallback"
import { TeamLogo } from "@/components/team/TeamLogo"
import { cn } from "@/lib/utils"

interface SelectedSlotData {
  displayName: string
  abbreviation: string | null
  seed: number
  logoTeamIds: number[]
  quadrant: number
}

interface MobileStatusBannerProps {
  isMyTurn: boolean
  currentPickerName: string | null
  currentPickerImage: string | null
  selectedSlotData: SelectedSlotData | null
  onConfirmPick: () => void
}

export function MobileStatusBanner({
  isMyTurn,
  currentPickerName,
  currentPickerImage,
  selectedSlotData,
  onConfirmPick,
}: MobileStatusBannerProps) {
  // State 3: Your turn + team selected — show team info + confirm button
  if (isMyTurn && selectedSlotData) {
    return (
      <div
        className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0.06) 100%)",
          animation: "dr-clock-glow 2.5s ease-in-out infinite",
        }}
      >
        {/* Top edge highlight */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.5) 50%, transparent 100%)",
          }}
        />

        {/* Team logo */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(59,130,246,0.3)",
            boxShadow: "0 0 16px rgba(59,130,246,0.2)",
          }}
        >
          <TeamLogo
            teamId={selectedSlotData.logoTeamIds[0]}
            label={selectedSlotData.displayName}
            className="w-8 h-8"
          />
        </div>

        {/* Team info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {selectedSlotData.abbreviation ?? selectedSlotData.displayName}
          </p>
          <p className="text-xs text-muted-foreground">
            Seed {selectedSlotData.seed} · {selectedSlotData.seed}pts/w
          </p>
        </div>

        {/* Confirm button */}
        <button
          onClick={onConfirmPick}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-semibold text-white transition-all duration-200 active:scale-[0.97] flex-shrink-0"
          style={{
            background: "#3B82F6",
            boxShadow: "0 0 0 1px rgba(59,130,246,0.5), 0 4px 16px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          <Check className="w-3.5 h-3.5" />
          Pick
        </button>
      </div>
    )
  }

  // State 2: Your turn, no selection — prompt to pick
  if (isMyTurn) {
    return (
      <div
        className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0.06) 100%)",
          animation: "dr-clock-glow 2.5s ease-in-out infinite",
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.5) 50%, transparent 100%)",
          }}
        />

        <div
          className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(59,130,246,0.15)",
            border: "1px solid rgba(59,130,246,0.3)",
          }}
        >
          <Zap className="w-4 h-4 text-[#3B82F6]" />
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">
            Your turn to pick!
          </p>
          <p className="text-xs text-muted-foreground">
            Select a team below
          </p>
        </div>
      </div>
    )
  }

  // State 1: Waiting — someone else is picking
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-card border border-border"
      style={{
        boxShadow: "0 0 0 1px rgba(48,54,61,0.6), 0 2px 12px rgba(0,0,0,0.3)",
      }}
    >
      <div
        className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-secondary border border-border"
      >
        <ImageWithFallback
          src={currentPickerImage || ""}
          alt={currentPickerName || "Current picker"}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {currentPickerName ?? "Unknown"}{" "}
          <span className="text-muted-foreground font-normal">is picking...</span>
        </p>
      </div>

      {/* Pulsing indicator */}
      <div className="flex-shrink-0 flex gap-0.5 items-end h-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-0.5 rounded-full"
            style={{
              background: "rgba(59,130,246,0.4)",
              height: `${40 + i * 20}%`,
              animation: `pulse ${0.8 + i * 0.2}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
