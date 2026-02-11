"use client"

import { Button } from "@/components/ui/button"
import { ImageWithFallback } from "@/components/figma/ImageWithFallback"
import { Check, Zap } from "lucide-react"

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
      <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-orange-500/8 border border-orange-500/25">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-500/15 flex items-center justify-center">
            <Zap className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              You&apos;re on the clock
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedSlot ? "Confirm your selection" : "Select a team to draft"}
            </p>
          </div>
        </div>
        {selectedSlot && (
          <Button
            onClick={onConfirmPick}
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white h-8 px-4 text-xs font-semibold"
          >
            <Check className="w-3.5 h-3.5 mr-1.5" />
            Confirm Pick
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-card/60 border border-border/50">
      <div className="w-8 h-8 rounded-full overflow-hidden bg-muted">
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
    </div>
  )
}
