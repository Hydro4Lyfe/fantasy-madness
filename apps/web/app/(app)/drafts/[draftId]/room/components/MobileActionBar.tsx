"use client"

import { useState, useRef, useEffect } from "react"
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
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 100)
      return () => clearTimeout(t)
    }
  }, [searchOpen])

  const handleToggleSearch = () => {
    if (searchOpen) {
      setSearchOpen(false)
      onSearchChange("")
    } else {
      setSearchOpen(true)
    }
  }

  return (
    <div className="px-2 space-y-2">
      {/* ── Control strip ── */}
      <div
        className="flex items-stretch h-10 rounded-xl overflow-hidden"
        style={{
          background: "rgba(22,27,34,0.7)",
          border: "1px solid rgba(48,54,61,0.8)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        {/* My Picks */}
        <button
          onClick={onOpenMyPicks}
          className="relative flex-1 flex items-center justify-center gap-1.5 transition-colors duration-150 active:bg-white/[0.06]"
          aria-label="My picks"
        >
          <User className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[11px] font-medium text-muted-foreground">Picks</span>
          {pickCount > 0 && (
            <span
              className="absolute top-1 right-1.5 w-4 h-4 text-white text-[9px] rounded-full flex items-center justify-center font-bold"
              style={{ background: "#3B82F6" }}
            >
              {pickCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="w-px self-center h-5" style={{ background: "rgba(48,54,61,0.8)" }} />

        {/* Board */}
        <button
          onClick={onOpenBoard}
          className="flex-1 flex items-center justify-center gap-1.5 transition-colors duration-150 active:bg-white/[0.06]"
          aria-label="Draft board"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[11px] font-medium text-muted-foreground">Board</span>
        </button>

        {/* Divider */}
        <div className="w-px self-center h-5" style={{ background: "rgba(48,54,61,0.8)" }} />

        {/* Queue */}
        <button
          onClick={onOpenQueue}
          className={cn(
            "relative flex-1 flex items-center justify-center gap-1.5 transition-colors duration-150 active:bg-white/[0.06]",
            queueCount > 0 && "text-[#3B82F6]",
          )}
          aria-label="Draft queue"
        >
          <List className={cn("w-3.5 h-3.5", queueCount > 0 ? "text-[#3B82F6]" : "text-muted-foreground")} />
          <span className={cn("text-[11px] font-medium", queueCount > 0 ? "text-[#3B82F6]" : "text-muted-foreground")}>Queue</span>
          {queueCount > 0 && (
            <span
              className="absolute top-1 right-1.5 w-4 h-4 text-white text-[9px] rounded-full flex items-center justify-center font-bold"
              style={{ background: "#3B82F6" }}
            >
              {queueCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="w-px self-center h-5" style={{ background: "rgba(48,54,61,0.8)" }} />

        {/* Search */}
        <button
          onClick={handleToggleSearch}
          className={cn(
            "w-11 flex items-center justify-center flex-shrink-0 transition-colors duration-150 active:bg-white/[0.06]",
            searchOpen && "bg-[#3B82F6]/10",
          )}
          aria-label={searchOpen ? "Close search" : "Search teams"}
        >
          {searchOpen ? (
            <X className="w-4 h-4 text-[#3B82F6]" />
          ) : (
            <Search className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* ── Search input row ── */}
      {searchOpen && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
          <Input
            ref={inputRef}
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              "pl-9 pr-9 h-9 text-sm rounded-xl",
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
      )}
    </div>
  )
}
