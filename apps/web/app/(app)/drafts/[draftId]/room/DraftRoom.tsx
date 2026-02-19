"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { parseDeadlineMs } from "@/lib/date"
import { useRouter } from "next/navigation"
import { useDraftWebSocket } from "@/hooks/useDraftWebSocket"
import { Loader2, LayoutGrid, List } from "lucide-react"
import type { DraftRoomStateDTO } from "@/server/dal"

import { ConnectionBanner } from "./components/ConnectionBanner"
import { DraftCompleteBanner } from "./components/DraftCompleteBanner"
import { DraftHeader } from "./components/DraftHeader"
import { OnTheClockBanner } from "./components/OnTheClockBanner"
import { TeamPickerPanel } from "./components/TeamPickerPanel"
import { SeedWeightCard } from "./components/SeedWeightCard"
import { DraftBoard } from "./components/DraftBoard"
import { DraftQueuePanel } from "./components/DraftQueuePanel"
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

interface DraftRoomProps {
  draftId: string
  userId: string
  initialState: DraftRoomStateDTO
}

export function DraftRoom({ draftId, userId, initialState }: DraftRoomProps) {
  const router = useRouter()
  const autoPickAttemptRef = useRef<string | null>(null)

  // WebSocket connection
  const {
    state,
    connectionState,
    error: wsError,
    submitPick,
    reconnect,
  } = useDraftWebSocket({ draftId, initialState, enabled: true })

  // Local UI state
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [draftQueue, setDraftQueue] = useState<string[]>([])
  const [showQueue, setShowQueue] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  // Mobile drawer state
  const [showBoardDrawer, setShowBoardDrawer] = useState(false)
  const [showQueueDrawer, setShowQueueDrawer] = useState(false)

  const draft = state

  // --- Derived values ---
  const isMyTurn = draft?.currentPickerUserId === userId
  const currentPicker = draft?.participants.find(
    (p) => p.oduserId === draft.currentPickerUserId
  )
  const myParticipant = draft?.participants.find(
    (p) => p.oduserId === userId
  )
  const numParticipants = draft?.participants.length ?? 0
  const currentRound =
    numParticipants > 0
      ? Math.floor(((draft?.currentPickNumber ?? 1) - 1) / numParticipants) + 1
      : 1
  const seedWeight = myParticipant?.picks.reduce((sum, p) => sum + p.seed, 0) ?? 0

  // --- Timer effect ---
  useEffect(() => {
    if (!draft?.timerDeadlineAt) {
      setTimeLeft(null)
      return
    }

    const deadlineMs = parseDeadlineMs(draft.timerDeadlineAt)

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.floor((deadlineMs - Date.now()) / 1000)
      )
      setTimeLeft(remaining)
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [draft?.timerDeadlineAt])

  // --- Clear selectedSlot if it was taken ---
  useEffect(() => {
    if (
      selectedSlot &&
      draft &&
      !draft.availableSlots.some((s) => s.slotId === selectedSlot)
    ) {
      setSelectedSlot(null)
    }
  }, [selectedSlot, draft])

  // --- Auto-clean queue when slots get drafted ---
  useEffect(() => {
    if (!draft) return
    const availableIds = new Set(draft.availableSlots.map((s) => s.slotId))
    setDraftQueue((prev) => {
      const filtered = prev.filter((id) => availableIds.has(id))
      return filtered.length !== prev.length ? filtered : prev
    })
  }, [draft])

  // --- Auto-pick from queue on your turn ---
  useEffect(() => {
    if (!draft || draft.status !== "DRAFTING" || !isMyTurn || draftQueue.length === 0) {
      return
    }

    const availableIds = new Set(draft.availableSlots.map((slot) => slot.slotId))
    const nextQueuedSlotId = draftQueue.find((slotId) => availableIds.has(slotId))

    if (!nextQueuedSlotId) return

    const attemptKey = `${draft.currentPickNumber}:${nextQueuedSlotId}`
    if (autoPickAttemptRef.current === attemptKey) return

    autoPickAttemptRef.current = attemptKey
    submitPick(nextQueuedSlotId)
  }, [draft, draftQueue, isMyTurn, submitPick])

  // Reset auto-pick dedupe lock when the pick advances.
  useEffect(() => {
    autoPickAttemptRef.current = null
  }, [draft?.currentPickNumber])

  // --- Draft completion: redirect ---
  useEffect(() => {
    if (draft?.status === "COMPLETE") {
      const timeout = setTimeout(() => {
        router.push(`/drafts/${draftId}/results`)
      }, 3000)
      return () => clearTimeout(timeout)
    }
  }, [draft?.status, draftId, router])

  // --- Actions ---
  const handleSelectSlot = useCallback(
    (slotId: string) => {
      if (isMyTurn) setSelectedSlot(slotId)
    },
    [isMyTurn]
  )

  const handleConfirmPick = useCallback(() => {
    if (selectedSlot && isMyTurn) {
      submitPick(selectedSlot)
      setSelectedSlot(null)
    }
  }, [selectedSlot, isMyTurn, submitPick])

  const handleToggleQueue = useCallback((slotId: string) => {
    setDraftQueue((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId]
    )
  }, [])

  const handleRemoveFromQueue = useCallback((slotId: string) => {
    setDraftQueue((prev) => prev.filter((id) => id !== slotId))
  }, [])

  const handleMoveInQueue = useCallback(
    (slotId: string, direction: "up" | "down") => {
      setDraftQueue((prev) => {
        const currentIndex = prev.indexOf(slotId)
        if (currentIndex === -1) return prev
        const newIndex =
          direction === "up" ? currentIndex - 1 : currentIndex + 1
        if (newIndex < 0 || newIndex >= prev.length) return prev
        const newQueue = [...prev]
        ;[newQueue[currentIndex], newQueue[newIndex]] = [
          newQueue[newIndex],
          newQueue[currentIndex],
        ]
        return newQueue
      })
    },
    []
  )

  // --- Loading state ---
  if (!draft) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[#8A8F98]/50" />
      </div>
    )
  }

  // ── Shared prop bundles ────────────────────────────────────────────────────
  const headerProps = {
    draftId,
    draftName: draft.name,
    currentRound,
    currentPickNumber: draft.currentPickNumber,
    totalPicks: draft.totalPicks,
    isConnected: connectionState === "connected",
    timeLeft,
  }

  const clockProps = {
    isMyTurn: !!isMyTurn,
    currentPickerName: currentPicker?.userName ?? null,
    currentPickerImage: currentPicker?.userImage ?? null,
    selectedSlot,
    onConfirmPick: handleConfirmPick,
  }

  const pickerProps = {
    slots: draft.availableSlots,
    picks: myParticipant?.picks ?? [],
    rosterSize: draft.rosterSize,
    selectedSlot,
    draftQueue,
    isMyTurn: !!isMyTurn,
    showQueue,
    onSelectSlot: handleSelectSlot,
    onToggleQueue: handleToggleQueue,
    onToggleShowQueue: () => setShowQueue((v) => !v),
  }

  const boardProps = {
    participants: draft.participants,
    currentPickerUserId: draft.currentPickerUserId,
    userId,
    rosterSize: draft.rosterSize,
    draftType: draft.draftType,
    currentPickNumber: draft.currentPickNumber,
  }

  const queueProps = {
    queue: draftQueue,
    availableSlots: draft.availableSlots,
    onRemove: handleRemoveFromQueue,
    onMove: handleMoveInQueue,
    onClose: () => setShowQueue(false),
  }

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────────────
          MOBILE LAYOUT  (hidden md+)
      ───────────────────────────────────────────────────────────────────── */}
      <div className="flex md:hidden flex-col gap-2 h-[calc(100dvh-80px)]">
        <ConnectionBanner
          connectionState={connectionState}
          error={wsError}
          onReconnect={reconnect}
        />
        {draft.status === "COMPLETE" && <DraftCompleteBanner />}

        <DraftHeader {...headerProps} />
        <OnTheClockBanner {...clockProps} />

        {/* Team picker fills all remaining space */}
        <TeamPickerPanel {...pickerProps} />

        {/* ── Mobile bottom action bar ── */}
        <div className={cn(
          "flex-shrink-0 flex items-center gap-2 px-4 py-2.5",
          "border-t border-white/[0.06]",
          "bg-gradient-to-b from-white/[0.06] to-white/[0.02]",
        )}>
          {/* Seed weight — left anchor */}
          <div className="flex-1 flex items-baseline gap-1 min-w-0">
            {seedWeight > 0 ? (
              <>
                <span className="text-sm font-bold tabular-nums font-mono text-[#5E6AD2]">
                  {seedWeight}
                </span>
                <span className="text-[10px] text-[#8A8F98]/60 font-mono">pts/w</span>
              </>
            ) : (
              <span className="text-[10px] text-[#8A8F98]/40 font-mono">No picks yet</span>
            )}
          </div>

          {/* Pick progress — center */}
          <div className="text-xs tabular-nums flex-shrink-0">
            <span className="text-[#8A8F98] text-[10px]">Rd</span>
            <span className="text-[#EDEDEF] font-semibold ml-0.5">{currentRound}</span>
            <span className="text-[#8A8F98]/40 mx-1">·</span>
            <span className="text-[#8A8F98] text-[10px]">P</span>
            <span className="text-[#EDEDEF] font-semibold">{draft.currentPickNumber}</span>
            <span className="text-[#8A8F98]/40">/{draft.totalPicks}</span>
          </div>

          {/* Board button */}
          <button
            onClick={() => setShowBoardDrawer(true)}
            className={cn(
              "flex items-center gap-1.5 h-9 px-3 rounded-xl flex-shrink-0",
              "text-xs font-medium transition-all duration-200",
              "bg-white/[0.05] border border-white/[0.08] text-[#8A8F98]",
              "active:scale-[0.98]",
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Board
          </button>

          {/* Queue button */}
          <button
            onClick={() => setShowQueueDrawer(true)}
            className={cn(
              "relative flex items-center gap-1.5 h-9 px-3 rounded-xl flex-shrink-0",
              "text-xs font-medium transition-all duration-200",
              draftQueue.length > 0
                ? "bg-[#5E6AD2]/15 border border-[#5E6AD2]/25 text-[#5E6AD2]"
                : "bg-white/[0.05] border border-white/[0.08] text-[#8A8F98]",
              "active:scale-[0.98]",
            )}
          >
            <List className="w-3.5 h-3.5" />
            Queue
            {draftQueue.length > 0 && (
              <span className="w-4 h-4 bg-[#5E6AD2] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {draftQueue.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          MOBILE: Draft Board Drawer
      ───────────────────────────────────────────────────────────────────── */}
      <Drawer open={showBoardDrawer} onOpenChange={setShowBoardDrawer} direction="bottom">
        <DrawerContent className={cn(
          "bg-[#0a0a0c] border-white/[0.06]",
          "max-h-[85dvh] flex flex-col",
        )}>
          {/* Drag handle */}
          <div className="mx-auto mt-3 mb-1 h-1 w-10 flex-shrink-0 rounded-full bg-white/[0.12]" />

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
            <h2 className="text-xs font-mono tracking-widest uppercase text-[#8A8F98]">
              Draft Board
            </h2>
            <span className={cn(
              "text-[10px] h-5 px-2 rounded-full border border-white/[0.06]",
              "text-[#8A8F98] inline-flex items-center font-mono",
            )}>
              {draft.draftType === "SNAKE" ? "Snake" : "Linear"}
            </span>
          </div>

          {/* Scrollable board content */}
          <div className="flex-1 overflow-y-auto p-3">
            <DraftBoard {...boardProps} className="h-auto" />
          </div>
        </DrawerContent>
      </Drawer>

      {/* ─────────────────────────────────────────────────────────────────────
          MOBILE: Queue Drawer
      ───────────────────────────────────────────────────────────────────── */}
      <Drawer open={showQueueDrawer} onOpenChange={setShowQueueDrawer} direction="bottom">
        <DrawerContent className={cn(
          "bg-[#0a0a0c] border-white/[0.06]",
          "max-h-[75dvh] flex flex-col",
        )}>
          {/* Drag handle */}
          <div className="mx-auto mt-3 mb-1 h-1 w-10 flex-shrink-0 rounded-full bg-white/[0.12]" />

          {/* Scrollable queue content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {myParticipant && <SeedWeightCard picks={myParticipant.picks} />}
            <DraftQueuePanel
              {...queueProps}
              onClose={() => setShowQueueDrawer(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* ─────────────────────────────────────────────────────────────────────
          DESKTOP LAYOUT  (hidden below md)
      ───────────────────────────────────────────────────────────────────── */}
      <div className="hidden md:flex flex-col gap-3 h-[calc(100vh-140px)]">
        <ConnectionBanner
          connectionState={connectionState}
          error={wsError}
          onReconnect={reconnect}
        />
        {draft.status === "COMPLETE" && <DraftCompleteBanner />}

        <DraftHeader {...headerProps} />

        {/* Main content: 60/40 split */}
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Left panel */}
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            <OnTheClockBanner {...clockProps} />
            {myParticipant && <SeedWeightCard picks={myParticipant.picks} />}
            <TeamPickerPanel {...pickerProps} />
          </div>

          {/* Right panel */}
          <div className="w-[420px] flex-shrink-0 flex flex-col gap-3 min-h-0">
            <div className="flex-1 min-h-0">
              <DraftBoard {...boardProps} />
            </div>
            {showQueue && (
              <DraftQueuePanel {...queueProps} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
