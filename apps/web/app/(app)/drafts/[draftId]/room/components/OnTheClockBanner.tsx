"use client"

import { ImageWithFallback } from "@/components/figma/ImageWithFallback"
import { Check, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface OnTheClockBannerProps {
  isMyTurn: boolean
  currentPickerName: string | null
  currentPickerImage: string | null
  selectedSlot: string | null
  onConfirmPick: () => void
}

export function OnTheClockBanner({
  isMyTurn,
  currentPickerName,
  currentPickerImage,
  selectedSlot,
  onConfirmPick,
}: OnTheClockBannerProps) {
  if (isMyTurn) {
    return (
      <div
        className="relative flex items-center justify-between px-4 py-3.5 rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0.06) 100%)",
          animation: "dr-clock-glow 2.5s ease-in-out infinite",
        }}
      >
        {/* Subtle top edge highlight */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.5) 50%, transparent 100%)",
          }}
        />

        {/* Left: icon + text */}
        <div className="flex items-center gap-3">
          <div
            className="relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(59,130,246,0.15)",
              border: "1px solid rgba(59,130,246,0.3)",
              boxShadow: "0 0 20px rgba(59,130,246,0.2)",
            }}
          >
            {/* Pulsing ring behind icon */}
            <div
              className="absolute inset-0 rounded-xl"
              style={{
                border: "1px solid rgba(59,130,246,0.4)",
                animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
                opacity: 0.4,
              }}
            />
            <Zap className="w-4.5 h-4.5 text-[#3B82F6] relative z-10" style={{ width: 18, height: 18 }} />
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">
              You&apos;re on the clock
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedSlot ? "Ready — confirm your pick" : "Select a team below"}
            </p>
          </div>
        </div>

        {/* Right: confirm button */}
        {selectedSlot ? (
          <button
            onClick={onConfirmPick}
            className="inline-flex items-center gap-1.5 h-9 px-5 rounded-lg text-xs font-semibold text-white transition-all duration-200 active:scale-[0.97] flex-shrink-0"
            style={{
              background: "#3B82F6",
              boxShadow: "0 0 0 1px rgba(59,130,246,0.5), 0 4px 16px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#60A5FA"
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 1px rgba(59,130,246,0.6), 0 6px 20px rgba(59,130,246,0.45), inset 0 1px 0 rgba(255,255,255,0.25)"
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#3B82F6"
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 1px rgba(59,130,246,0.5), 0 4px 16px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.2)"
            }}
          >
            <Check className="w-3.5 h-3.5" />
            Confirm Pick
          </button>
        ) : (
          /* Subtle placeholder to keep layout stable */
          <div className="h-9 w-28 rounded-lg flex-shrink-0" style={{ background: "rgba(59,130,246,0.06)", border: "1px dashed rgba(59,130,246,0.2)" }} />
        )}
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border"
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
      <div>
        <p className="text-xs text-muted-foreground">On the clock</p>
        <p className="text-sm font-medium text-foreground">
          {currentPickerName ?? "Unknown"}{" "}
          <span className="text-muted-foreground font-normal">is picking...</span>
        </p>
      </div>

      {/* Subtle pulsing indicator */}
      <div className="ml-auto flex-shrink-0">
        <div className="flex gap-0.5 items-end h-4">
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
    </div>
  )
}
