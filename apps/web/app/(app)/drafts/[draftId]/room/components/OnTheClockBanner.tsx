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
      <div className={cn(
        "flex items-center justify-between px-4 py-3 rounded-2xl",
        "bg-[#5E6AD2]/[0.08] border border-[#5E6AD2]/25",
        "shadow-[0_0_0_1px_rgba(94,106,210,0.15),0_4px_20px_rgba(94,106,210,0.08)]",
      )}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#5E6AD2]/15 border border-[#5E6AD2]/25 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-[#5E6AD2]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#EDEDEF]">
              You&apos;re on the clock
            </p>
            <p className="text-xs text-[#8A8F98]">
              {selectedSlot ? "Confirm your selection" : "Select a team to draft"}
            </p>
          </div>
        </div>
        {selectedSlot && (
          <button
            onClick={onConfirmPick}
            className={cn(
              "inline-flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-semibold text-white",
              "bg-[#5E6AD2] hover:bg-[#6872D9]",
              "shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]",
              "active:scale-[0.98] transition-all duration-200",
            )}
          >
            <Check className="w-3.5 h-3.5" />
            Confirm Pick
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-2xl",
      "bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.06]",
    )}>
      <div className="w-8 h-8 rounded-full overflow-hidden bg-white/[0.06] border border-white/[0.08] flex-shrink-0">
        <ImageWithFallback
          src={currentPickerImage || ""}
          alt={currentPickerName || "Current picker"}
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <p className="text-xs text-[#8A8F98]">On the clock</p>
        <p className="text-sm font-medium text-[#EDEDEF]">
          {currentPickerName ?? "Unknown"}{" "}
          <span className="text-[#8A8F98] font-normal">is picking...</span>
        </p>
      </div>
    </div>
  )
}
