# Mobile Draft Room Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the mobile draft room to maximize team card visibility by replacing the header/search/region chrome with a floating timer, three-state status banner, compact action bar, and a 3-column team grid sorted by seed.

**Architecture:** The mobile layout section in `DraftRoom.tsx` will be replaced with new mobile-specific components. Desktop layout is untouched. All new components live in the existing `room/components/` directory. No data flow or WebSocket changes — components consume the same props/callbacks.

**Tech Stack:** React 19, Next.js 15, Tailwind CSS 4, Vaul (drawer), Lucide icons, existing TeamLogo component

**Spec:** `docs/superpowers/specs/2026-03-18-mobile-draft-room-redesign-design.md`

---

## File Structure

```
apps/web/app/(app)/drafts/[draftId]/room/
├── DraftRoom.tsx                          # MODIFY — replace mobile layout section
└── components/
    ├── MobileFloatingTimer.tsx             # CREATE — sticky timer bar
    ├── MobileStatusBanner.tsx              # CREATE — three-state status/action banner
    ├── MobileActionBar.tsx                 # CREATE — icon button row + search overlay
    ├── MobileTeamGrid.tsx                  # CREATE — 3-col card grid + MobileTeamCard
    └── MobileMyPicksDrawer.tsx             # CREATE — bottom drawer for user's picks
```

**Key decisions:**
- `MobileTeamCard` is inlined inside `MobileTeamGrid.tsx` since it's only used there and is small
- Search overlay is inlined inside `MobileActionBar.tsx` since it's tightly coupled to the search button state
- Play-in logo display reuses the existing `PlayInLogo` pattern from `TeamSlotCard.tsx` but simplified for the compact card

---

## Shared Types

Several components need the same slot/pick types. These already exist as interfaces in `TeamPickerPanel.tsx` and `DraftBoard.tsx`. We'll import/re-export them where needed. The key types:

```typescript
// Already defined in TeamPickerPanel.tsx — we'll reference same shape
interface AvailableSlot {
  slotId: string
  displayName: string
  abbreviation: string | null
  logoTeamIds: number[]
  seed: number
  quadrant: number
  isPlayIn: boolean
}

interface Pick {
  slotId: string
  displayName: string
  abbreviation: string | null
  logoTeamIds: number[]
  seed: number
  quadrant: number
  overallPickNo: number
}
```

---

### Task 1: Create MobileFloatingTimer

**Files:**
- Create: `apps/web/app/(app)/drafts/[draftId]/room/components/MobileFloatingTimer.tsx`

- [ ] **Step 1: Create the MobileFloatingTimer component**

```tsx
"use client"

import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileFloatingTimerProps {
  timeLeft: number | null
}

function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`
}

export function MobileFloatingTimer({ timeLeft }: MobileFloatingTimerProps) {
  if (timeLeft === null) return null

  const isUrgent = timeLeft <= 10
  const isWarning = timeLeft <= 30 && timeLeft > 10

  return (
    <div
      className={cn(
        "sticky top-0 z-30 flex items-center justify-center gap-2 py-1.5 px-4",
        "backdrop-blur-md border-b",
      )}
      style={{
        background: isUrgent
          ? "rgba(239,68,68,0.10)"
          : isWarning
          ? "rgba(245,158,11,0.08)"
          : "rgba(22,27,34,0.85)",
        borderColor: isUrgent
          ? "rgba(239,68,68,0.25)"
          : isWarning
          ? "rgba(245,158,11,0.20)"
          : "rgba(48,54,61,0.6)",
      }}
    >
      <Clock
        className={cn(
          "w-3.5 h-3.5 flex-shrink-0",
          isUrgent
            ? "text-red-400 animate-pulse"
            : isWarning
            ? "text-amber-400"
            : "text-[#3B82F6]"
        )}
      />
      <span
        className={cn(
          "text-lg font-bold tabular-nums tracking-tight font-mono leading-none",
          isUrgent
            ? "text-red-400"
            : isWarning
            ? "text-amber-400"
            : "text-foreground"
        )}
      >
        {formatTime(timeLeft)}
      </span>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /home/matchy/coding-projects/fantasy-madness && npx tsc --noEmit --project apps/web/tsconfig.json 2>&1 | head -20`

Expected: No errors related to MobileFloatingTimer

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/\(app\)/drafts/\[draftId\]/room/components/MobileFloatingTimer.tsx
git commit -m "feat(draft-room): add MobileFloatingTimer component"
```

---

### Task 2: Create MobileStatusBanner

**Files:**
- Create: `apps/web/app/(app)/drafts/[draftId]/room/components/MobileStatusBanner.tsx`

- [ ] **Step 1: Create the MobileStatusBanner component**

This component has three states:
1. **Waiting** — someone else is picking (shows their avatar + name)
2. **Your turn, no selection** — prompts user to pick
3. **Your turn, team selected** — shows selected team info + Confirm Pick button

```tsx
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
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /home/matchy/coding-projects/fantasy-madness && npx tsc --noEmit --project apps/web/tsconfig.json 2>&1 | head -20`

Expected: No errors related to MobileStatusBanner

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/\(app\)/drafts/\[draftId\]/room/components/MobileStatusBanner.tsx
git commit -m "feat(draft-room): add MobileStatusBanner component"
```

---

### Task 3: Create MobileTeamGrid (with inline MobileTeamCard)

**Files:**
- Create: `apps/web/app/(app)/drafts/[draftId]/room/components/MobileTeamGrid.tsx`

- [ ] **Step 1: Create the MobileTeamGrid component with MobileTeamCard**

The grid sorts all available slots by seed ascending, then by quadrant for deterministic order. Each card is a compact cell with logo + seed + abbreviation. Tapping selects; long-pressing toggles queue.

```tsx
"use client"

import { useMemo, useRef, useCallback } from "react"
import { TeamLogo } from "@/components/team/TeamLogo"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface AvailableSlot {
  slotId: string
  displayName: string
  abbreviation: string | null
  logoTeamIds: number[]
  seed: number
  quadrant: number
  isPlayIn: boolean
}

interface MobileTeamGridProps {
  slots: AvailableSlot[]
  selectedSlot: string | null
  draftQueue: string[]
  isMyTurn: boolean
  searchQuery: string
  onSelectSlot: (slotId: string) => void
  onToggleQueue: (slotId: string) => void
}

/** Seed-tier accent color */
function seedColor(seed: number): { text: string; bg: string; border: string } {
  if (seed <= 4)  return { text: "#8A8F98",   bg: "rgba(138,143,152,0.06)", border: "rgba(138,143,152,0.12)" }
  if (seed <= 8)  return { text: "#EDEDEF",   bg: "rgba(237,237,239,0.06)", border: "rgba(237,237,239,0.12)" }
  if (seed <= 12) return { text: "#f59e0b",   bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)"   }
  return              { text: "#818cf8",   bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.25)"  }
}

/* ── MobileTeamCard (inline) ─────────────────────────────────────────────── */

interface MobileTeamCardProps {
  slot: AvailableSlot
  isSelected: boolean
  isQueued: boolean
  isMyTurn: boolean
  onSelect: (slotId: string) => void
  onToggleQueue: (slotId: string) => void
}

function MobileTeamCard({
  slot,
  isSelected,
  isQueued,
  isMyTurn,
  onSelect,
  onToggleQueue,
}: MobileTeamCardProps) {
  const sc = seedColor(slot.seed)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)

  const handlePointerDown = useCallback(() => {
    didLongPress.current = false
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true
      onToggleQueue(slot.slotId)
    }, 500)
  }, [slot.slotId, onToggleQueue])

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  const handlePointerMove = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  const handleClick = useCallback(() => {
    // Skip if long-press already fired
    if (didLongPress.current) return
    if (isMyTurn) onSelect(slot.slotId)
  }, [slot.slotId, isMyTurn, onSelect])

  // Play-in: show both abbreviations
  const label = slot.isPlayIn && slot.abbreviation
    ? slot.abbreviation.split(" / ").join("/")
    : slot.abbreviation ?? slot.displayName.split(" ")[0]

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      className={cn(
        "relative flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-200",
        isMyTurn ? "cursor-pointer active:scale-[0.96]" : "cursor-default opacity-60",
      )}
      style={
        isSelected
          ? {
              background: "rgba(59,130,246,0.12)",
              borderColor: "rgba(59,130,246,0.5)",
              boxShadow: "0 0 0 1px rgba(59,130,246,0.25), 0 4px 16px rgba(59,130,246,0.15)",
            }
          : isQueued
          ? {
              background: "rgba(22,27,34,0.8)",
              borderColor: "rgba(59,130,246,0.25)",
            }
          : {
              background: "rgba(22,27,34,0.6)",
              borderColor: "rgba(48,54,61,0.8)",
            }
      }
    >
      {/* Queue indicator */}
      {isQueued && (
        <Star
          className="absolute top-1 right-1 w-2.5 h-2.5"
          style={{ fill: "#3B82F6", color: "#3B82F6" }}
        />
      )}

      {/* Team logo */}
      {slot.isPlayIn && slot.logoTeamIds.length >= 2 ? (
        <div className="flex items-center gap-0.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.10)" }}
          >
            <TeamLogo teamId={slot.logoTeamIds[0]} label={slot.displayName.split(" / ")[0] ?? "TBD"} className="w-5 h-5" />
          </div>
          <span className="text-[8px] text-amber-400/70 font-bold">vs</span>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.10)" }}
          >
            <TeamLogo teamId={slot.logoTeamIds[1]} label={slot.displayName.split(" / ")[1] ?? "TBD"} className="w-5 h-5" />
          </div>
        </div>
      ) : (
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
          style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.10)" }}
        >
          <TeamLogo teamId={slot.logoTeamIds[0]} label={slot.displayName} className="w-8 h-8" />
        </div>
      )}

      {/* Seed badge */}
      <span
        className="inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-bold tabular-nums"
        style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}
      >
        {slot.seed}
      </span>

      {/* Team abbreviation */}
      <span className="text-[10px] font-medium text-foreground/80 truncate max-w-full leading-tight">
        {label}
      </span>
    </div>
  )
}

/* ── MobileTeamGrid ──────────────────────────────────────────────────────── */

export function MobileTeamGrid({
  slots,
  selectedSlot,
  draftQueue,
  isMyTurn,
  searchQuery,
  onSelectSlot,
  onToggleQueue,
}: MobileTeamGridProps) {
  const sortedAndFiltered = useMemo(() => {
    const query = searchQuery.toLowerCase()
    const filtered = query
      ? slots.filter(
          (s) =>
            s.displayName.toLowerCase().includes(query) ||
            s.abbreviation?.toLowerCase().includes(query)
        )
      : slots

    // Sort by seed ascending, then quadrant for deterministic order
    return [...filtered].sort((a, b) => a.seed - b.seed || a.quadrant - b.quadrant)
  }, [slots, searchQuery])

  if (sortedAndFiltered.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        No teams match your search
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-1.5 p-2">
      {sortedAndFiltered.map((slot) => (
        <MobileTeamCard
          key={slot.slotId}
          slot={slot}
          isSelected={selectedSlot === slot.slotId}
          isQueued={draftQueue.includes(slot.slotId)}
          isMyTurn={isMyTurn}
          onSelect={onSelectSlot}
          onToggleQueue={onToggleQueue}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /home/matchy/coding-projects/fantasy-madness && npx tsc --noEmit --project apps/web/tsconfig.json 2>&1 | head -20`

Expected: No errors related to MobileTeamGrid

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/\(app\)/drafts/\[draftId\]/room/components/MobileTeamGrid.tsx
git commit -m "feat(draft-room): add MobileTeamGrid with compact 3-col card layout"
```

---

### Task 4: Create MobileActionBar (with inline search overlay)

**Files:**
- Create: `apps/web/app/(app)/drafts/[draftId]/room/components/MobileActionBar.tsx`

- [ ] **Step 1: Create the MobileActionBar component**

Contains 4 icon buttons (Search, My Picks, Board, Queue) and the search overlay that slides down when search is active.

```tsx
"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Search, X, User, LayoutGrid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface MobileActionBarProps {
  pickCount: number
  rosterSize: number
  queueCount: number
  searchQuery: string
  onSearchChange: (query: string) => void
  onOpenMyPicks: () => void
  onOpenBoard: () => void
  onOpenQueue: () => void
}

export function MobileActionBar({
  pickCount,
  rosterSize,
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
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /home/matchy/coding-projects/fantasy-madness && npx tsc --noEmit --project apps/web/tsconfig.json 2>&1 | head -20`

Expected: No errors related to MobileActionBar

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/\(app\)/drafts/\[draftId\]/room/components/MobileActionBar.tsx
git commit -m "feat(draft-room): add MobileActionBar with search overlay"
```

---

### Task 5: Create MobileMyPicksDrawer

**Files:**
- Create: `apps/web/app/(app)/drafts/[draftId]/room/components/MobileMyPicksDrawer.tsx`

- [ ] **Step 1: Create the MobileMyPicksDrawer component**

```tsx
"use client"

import { TeamLogo } from "@/components/team/TeamLogo"
import { cn } from "@/lib/utils"
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer"

interface Pick {
  slotId: string
  displayName: string
  abbreviation: string | null
  logoTeamIds: number[]
  seed: number
  quadrant: number
  overallPickNo: number
}

interface MobileMyPicksDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  picks: Pick[]
  rosterSize: number
}

export function MobileMyPicksDrawer({
  open,
  onOpenChange,
  picks,
  rosterSize,
}: MobileMyPicksDrawerProps) {
  const sortedPicks = [...picks].sort((a, b) => a.overallPickNo - b.overallPickNo)
  const totalSeedWeight = picks.reduce((sum, p) => sum + p.seed, 0)

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className={cn("bg-card border-border", "max-h-[75dvh] flex flex-col")}>
        <div className="mx-auto mt-3 mb-1 h-1 w-10 flex-shrink-0 rounded-full bg-border" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <h2 className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
            My Picks
          </h2>
          <span className={cn(
            "text-[10px] h-5 px-2 rounded-full border border-border",
            "text-muted-foreground inline-flex items-center font-mono",
          )}>
            {picks.length}/{rosterSize}
          </span>
        </div>

        {/* Pick list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {sortedPicks.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
              No picks yet
            </div>
          ) : (
            sortedPicks.map((pick) => (
              <div
                key={pick.slotId}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-secondary/30"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <TeamLogo
                    teamId={pick.logoTeamIds[0]}
                    label={pick.displayName}
                    className="w-7 h-7"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {pick.displayName}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {pick.abbreviation ? `${pick.abbreviation} · ` : ""}Seed {pick.seed}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold tabular-nums font-mono" style={{ color: "#3B82F6" }}>
                    {pick.seed}
                  </p>
                  <p className="text-[9px] text-muted-foreground/60 font-mono">pts/w</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: seed weight total */}
        {totalSeedWeight > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border flex-shrink-0">
            <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
              Total Seed Weight
            </span>
            <span
              className="text-lg font-bold tabular-nums font-mono"
              style={{
                background: "linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #93C5FD 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {totalSeedWeight}
            </span>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /home/matchy/coding-projects/fantasy-madness && npx tsc --noEmit --project apps/web/tsconfig.json 2>&1 | head -20`

Expected: No errors related to MobileMyPicksDrawer

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/\(app\)/drafts/\[draftId\]/room/components/MobileMyPicksDrawer.tsx
git commit -m "feat(draft-room): add MobileMyPicksDrawer component"
```

---

### Task 6: Wire up new components in DraftRoom.tsx mobile layout

**Files:**
- Modify: `apps/web/app/(app)/drafts/[draftId]/room/DraftRoom.tsx`

This is the integration task. We replace the mobile layout section (lines 411–519) with the new components, add new state for search and my-picks drawer, and derive the selected slot data for the status banner.

- [ ] **Step 1: Add new imports to DraftRoom.tsx**

Add these imports after the existing component imports (after line 19):

```typescript
import { MobileFloatingTimer } from "./components/MobileFloatingTimer"
import { MobileStatusBanner } from "./components/MobileStatusBanner"
import { MobileActionBar } from "./components/MobileActionBar"
import { MobileTeamGrid } from "./components/MobileTeamGrid"
import { MobileMyPicksDrawer } from "./components/MobileMyPicksDrawer"
```

- [ ] **Step 2: Add new state variables**

Add these state variables after the existing `showQueueDrawer` state (after line 56):

```typescript
const [showMyPicksDrawer, setShowMyPicksDrawer] = useState(false)
const [mobileSearchQuery, setMobileSearchQuery] = useState("")
```

- [ ] **Step 3: Add selectedSlotData derivation**

Add this derived value after the `seedWeight` line (after line 110):

```typescript
const selectedSlotData = selectedSlot && draft
  ? draft.availableSlots.find((s) => s.slotId === selectedSlot) ?? null
  : null
```

- [ ] **Step 4: Replace the mobile layout section**

Replace the entire mobile layout `<div>` (the block from `{/* MOBILE LAYOUT */}` through its closing `</div>`, lines 408–520) with the new mobile layout. The existing mobile Board and Queue drawers (lines 525–565) remain, and we add the My Picks drawer. The new mobile layout:

```tsx
      {/* ── MOBILE LAYOUT (hidden md+) ── */}
      <div className="relative flex md:hidden flex-col h-[calc(100dvh-80px)] overflow-hidden">

        <div className="relative z-10 flex flex-col h-full">
          {/* Connection banner */}
          <ConnectionBanner
            connectionState={connectionState}
            error={wsError}
            onReconnect={reconnect}
          />

          {/* Draft complete banner */}
          {draft.status === "COMPLETE" && (
            <div className="px-2 pt-2">
              <DraftCompleteBanner />
            </div>
          )}

          {/* Floating timer */}
          <MobileFloatingTimer timeLeft={timeLeft} />

          {/* Status banner */}
          <div className="px-2 pt-2">
            <MobileStatusBanner
              isMyTurn={!!isMyTurn}
              currentPickerName={currentPicker?.userName ?? null}
              currentPickerImage={currentPicker?.userImage ?? null}
              selectedSlotData={selectedSlotData}
              onConfirmPick={handleConfirmPick}
            />
          </div>

          {/* Action bar */}
          <div className="py-2">
            <MobileActionBar
              pickCount={myParticipant?.picks.length ?? 0}
              rosterSize={draft.rosterSize}
              queueCount={draftQueue.length}
              searchQuery={mobileSearchQuery}
              onSearchChange={setMobileSearchQuery}
              onOpenMyPicks={() => setShowMyPicksDrawer(true)}
              onOpenBoard={() => setShowBoardDrawer(true)}
              onOpenQueue={() => setShowQueueDrawer(true)}
            />
          </div>

          {/* Team grid — fills remaining space */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <MobileTeamGrid
              slots={draft.availableSlots}
              selectedSlot={selectedSlot}
              draftQueue={draftQueue}
              isMyTurn={!!isMyTurn}
              searchQuery={mobileSearchQuery}
              onSelectSlot={handleSelectSlot}
              onToggleQueue={handleToggleQueue}
            />
          </div>
        </div>
      </div>
```

- [ ] **Step 5: Add MobileMyPicksDrawer after existing drawers**

After the existing Queue Drawer block (after line ~565), add:

```tsx
      {/* ── MOBILE: My Picks Drawer ── */}
      <MobileMyPicksDrawer
        open={showMyPicksDrawer}
        onOpenChange={setShowMyPicksDrawer}
        picks={myParticipant?.picks ?? []}
        rosterSize={draft.rosterSize}
      />
```

- [ ] **Step 6: Verify it compiles**

Run: `cd /home/matchy/coding-projects/fantasy-madness && npx tsc --noEmit --project apps/web/tsconfig.json 2>&1 | head -20`

Expected: No errors. If there are type mismatches, fix them.

- [ ] **Step 7: Verify the dev server runs**

Run: `cd /home/matchy/coding-projects/fantasy-madness && npm run dev:web &` then after a few seconds check it compiled successfully.

Expected: Next.js compiles without errors.

- [ ] **Step 8: Commit**

```bash
git add apps/web/app/\(app\)/drafts/\[draftId\]/room/DraftRoom.tsx
git commit -m "feat(draft-room): wire up new mobile layout components

Replace mobile draft room chrome (header, search bar, region tabs,
bottom bar) with floating timer, status banner, compact action bar,
and 3-column team grid sorted by seed."
```

---

### Task 7: Visual QA and polish

**Files:**
- Modify: any files from Tasks 1-6 that need tweaks

This is a manual QA pass. Check the mobile layout in a browser at a mobile viewport (375px width).

- [ ] **Step 1: Verify layout stacking**

Open the draft room on a mobile viewport. Confirm:
1. Timer bar sticks under nav (only visible if timer is set)
2. Status banner shows correct state
3. Action bar has 4 buttons
4. Team grid shows 3-column cards sorted by seed
5. Scrolling the grid doesn't scroll the timer/banner/action bar

- [ ] **Step 2: Verify search overlay**

1. Tap search icon → overlay slides down
2. Type a team name → grid filters
3. Tap X → overlay closes, grid returns to full
4. Tap outside overlay → closes

- [ ] **Step 3: Verify drawers**

1. Tap My Picks → drawer shows picks with seed weight total
2. Tap Board → drawer shows DraftBoard
3. Tap Queue → drawer shows DraftQueuePanel with SeedWeightCard

- [ ] **Step 4: Verify team selection flow**

1. When it's your turn, tap a team card → card highlights, status banner shows team info + "Pick" button
2. Tap "Pick" → pick submits
3. Long-press a team card → toggles queue (star appears/disappears)

- [ ] **Step 5: Verify desktop is unchanged**

Switch to a desktop viewport (>768px). Confirm the desktop layout is identical to before.

- [ ] **Step 6: Fix any issues found and commit**

```bash
git add -u
git commit -m "fix(draft-room): polish mobile layout from QA pass"
```
