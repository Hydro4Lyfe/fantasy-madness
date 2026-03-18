"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Search, X, User, LayoutGrid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface MobileActionBarProps {
  pickCount: number
  queueCount: number
  searchQuery: string
  onSearchChange: (query: string) => void
  onOpenMyPicks: () => void
  onOpenBoard: () => void
  onOpenQueue: () => void
}

export function MobileActionBar({
  pickCount,
  queueCount,
  searchQuery,
  onSearchChange,
  onOpenMyPicks,
  onOpenBoard,
  onOpenQueue,
}: MobileActionBarProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) {
      // Small delay to wait for animation
      const t = setTimeout(() => inputRef.current?.focus(), 100)
      return () => clearTimeout(t)
    }
  }, [searchOpen])

  // Click-away dismissal
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
      setSearchOpen(false)
      onSearchChange("")
    }
  }, [onSearchChange])

  useEffect(() => {
    if (searchOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("touchstart", handleClickOutside as EventListener)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        document.removeEventListener("touchstart", handleClickOutside as EventListener)
      }
    }
  }, [searchOpen, handleClickOutside])

  const handleToggleSearch = () => {
    if (searchOpen) {
      setSearchOpen(false)
      onSearchChange("")
    } else {
      setSearchOpen(true)
    }
  }

  const buttonBase = cn(
    "relative flex items-center justify-center h-9 w-9 rounded-xl flex-shrink-0",
    "text-xs font-medium transition-all duration-200",
    "bg-secondary border border-border text-muted-foreground",
    "active:scale-[0.95]",
  )

  return (
    <div ref={overlayRef} className="relative">
      {/* Button row */}
      <div className="flex items-center justify-between gap-2 px-2">
        {/* Search toggle */}
        <button
          onClick={handleToggleSearch}
          className={cn(buttonBase, searchOpen && "bg-[#3B82F6]/15 border-[#3B82F6]/25 text-[#3B82F6]")}
          aria-label={searchOpen ? "Close search" : "Search teams"}
        >
          {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
        </button>

        {/* My Picks */}
        <button
          onClick={onOpenMyPicks}
          className={cn(buttonBase, "w-auto px-3 gap-1.5")}
          aria-label="My picks"
        >
          <User className="w-3.5 h-3.5" />
          <span className="text-[11px]">Picks</span>
          {pickCount > 0 && (
            <span
              className="w-4 h-4 text-white text-[10px] rounded-full flex items-center justify-center font-bold"
              style={{ background: "#3B82F6" }}
            >
              {pickCount}
            </span>
          )}
        </button>

        {/* Board */}
        <button
          onClick={onOpenBoard}
          className={cn(buttonBase, "w-auto px-3 gap-1.5")}
          aria-label="Draft board"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span className="text-[11px]">Board</span>
        </button>

        {/* Queue */}
        <button
          onClick={onOpenQueue}
          className={cn(
            buttonBase,
            "w-auto px-3 gap-1.5",
            queueCount > 0 && "bg-[#3B82F6]/15 border-[#3B82F6]/25 text-[#3B82F6]",
          )}
          aria-label="Draft queue"
        >
          <List className="w-3.5 h-3.5" />
          <span className="text-[11px]">Queue</span>
          {queueCount > 0 && (
            <span
              className="w-4 h-4 text-white text-[10px] rounded-full flex items-center justify-center font-bold"
              style={{ background: "#3B82F6" }}
            >
              {queueCount}
            </span>
          )}
        </button>
      </div>

      {/* Search overlay — slides down */}
      {searchOpen && (
        <div
          className="absolute left-0 right-0 top-full mt-1 mx-2 z-20 rounded-xl border border-border bg-card p-2"
          style={{
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            animation: "dr-fade-up 0.2s cubic-bezier(0.16, 1, 0.3, 1) both",
            transformOrigin: "top center",
          }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
            <Input
              ref={inputRef}
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={cn(
                "pl-9 pr-9 h-9 text-sm",
                "bg-background border-border",
                "text-foreground placeholder:text-muted-foreground",
                "focus-visible:border-[#3B82F6] focus-visible:ring-0",
              )}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
