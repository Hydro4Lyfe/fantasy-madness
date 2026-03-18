"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { parseDeadlineMs } from "@/lib/date"
import { useRouter } from "next/navigation"
import { useDraftWebSocket } from "@/hooks/useDraftWebSocket"
import { Loader2 } from "lucide-react"
import type { DraftRoomStateDTO } from "@/server/dal"

import { ConnectionBanner } from "./components/ConnectionBanner"
import { DraftCompleteBanner } from "./components/DraftCompleteBanner"
import { DraftHeader } from "./components/DraftHeader"
import { OnTheClockBanner } from "./components/OnTheClockBanner"
import { TeamPickerPanel } from "./components/TeamPickerPanel"
import { SeedWeightCard } from "./components/SeedWeightCard"
import { DraftBoard } from "./components/DraftBoard"
import { DraftQueuePanel } from "./components/DraftQueuePanel"
import { DraftLobby } from "./components/DraftLobby"
import { DraftCountdown } from "./components/DraftCountdown"
import { MobileFloatingTimer } from "./components/MobileFloatingTimer"
import { MobileStatusBanner } from "./components/MobileStatusBanner"
import { MobileActionBar } from "./components/MobileActionBar"
import { MobileTeamGrid } from "./components/MobileTeamGrid"
import { MobileMyPicksDrawer } from "./components/MobileMyPicksDrawer"
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
    updateQueue,
    requestState,
    savedQueue,
    reconnect,
  } = useDraftWebSocket({ draftId, initialState, enabled: true })

  // Local UI state
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [draftQueue, setDraftQueue] = useState<string[]>([])
  const [autoPickFromQueue, setAutoPickFromQueue] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  // Mobile drawer state
  const [showBoardDrawer, setShowBoardDrawer] = useState(false)
  const [showQueueDrawer, setShowQueueDrawer] = useState(false)
  const [showMyPicksDrawer, setShowMyPicksDrawer] = useState(false)
  const [mobileSearchQuery, setMobileSearchQuery] = useState("")

  const draft = state

  // --- Poll for state when a phase transition is expected ---
  useEffect(() => {
    if (!draft) return

    // LOBBY phase: poll once startAt has passed (waiting for countdown to begin)
    if (draft.phase === "LOBBY" && draft.startAt) {
      const startMs = new Date(draft.startAt).getTime()
      const now = Date.now()

      if (now >= startMs) {
        // startAt already passed — poll every 3s for countdown/start
        const interval = setInterval(() => requestState(), 3000)
        return () => clearInterval(interval)
      }

      // Set a timeout to start polling when startAt arrives
      const timeout = setTimeout(() => requestState(), startMs - now + 500)
      return () => clearTimeout(timeout)
    }

    // COUNTDOWN phase: poll once countdownEndsAt has passed (waiting for DRAFTING)
    if (draft.phase === "COUNTDOWN" && draft.countdownEndsAt) {
      const endMs = new Date(draft.countdownEndsAt).getTime()
      const now = Date.now()

      if (now >= endMs) {
        // Countdown already expired — poll every 2s for DRAFTING transition
        const interval = setInterval(() => requestState(), 2000)
        return () => clearInterval(interval)
      }

      // Set a timeout to start polling when countdown ends
      const timeout = setTimeout(() => requestState(), endMs - now + 500)
      return () => clearTimeout(timeout)
    }
  }, [draft?.phase, draft?.startAt, draft?.countdownEndsAt, requestState])

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

  const selectedSlotData = selectedSlot && draft
    ? draft.availableSlots.find((s) => s.slotId === selectedSlot) ?? null
    : null

  // --- Reset queue restore flag on disconnect so reconnect re-syncs ---
  const queueRestoredRef = useRef(false)
  useEffect(() => {
    if (connectionState === "disconnected" || connectionState === "connecting") {
      queueRestoredRef.current = false
    }
  }, [connectionState])

  // --- Restore queue from server on connect ---
  useEffect(() => {
    if (savedQueue && !queueRestoredRef.current) {
      queueRestoredRef.current = true
      setDraftQueue(savedQueue.slotIds)
      setAutoPickFromQueue(savedQueue.autoPickEnabled)
    }
  }, [savedQueue])

  // --- Sync queue to server when it changes ---
  const isInitialSyncRef = useRef(true)
  useEffect(() => {
    // Skip the initial render and the restore-from-server render
    if (isInitialSyncRef.current) {
      isInitialSyncRef.current = false
      return
    }
    // Don't sync until we've restored from server (or confirmed no saved queue)
    if (!queueRestoredRef.current && savedQueue === null) {
      queueRestoredRef.current = true // no saved queue to restore
    }
    if (queueRestoredRef.current) {
      updateQueue({ slotIds: draftQueue, autoPickEnabled: autoPickFromQueue })
    }
  }, [draftQueue, autoPickFromQueue, updateQueue, savedQueue])

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

  // --- Queue assist on your turn: auto-select or auto-pick ---
  useEffect(() => {
    if (!draft || draft.status !== "DRAFTING" || !isMyTurn || draftQueue.length === 0) {
      return
    }

    const availableIds = new Set(draft.availableSlots.map((slot) => slot.slotId))
    const nextQueuedSlotId = draftQueue.find((slotId) => availableIds.has(slotId))

    if (!nextQueuedSlotId) return

    if (autoPickFromQueue) {
      // Auto-submit the pick
      const attemptKey = `${draft.currentPickNumber}:${nextQueuedSlotId}`
      if (autoPickAttemptRef.current === attemptKey) return
      autoPickAttemptRef.current = attemptKey
      submitPick(nextQueuedSlotId)
    } else {
      // Just pre-select so the user can confirm
      setSelectedSlot(nextQueuedSlotId)
    }
  }, [draft, draftQueue, isMyTurn, autoPickFromQueue, submitPick])

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

  const handleReorderQueue = useCallback(
    (fromIndex: number, toIndex: number) => {
      setDraftQueue((prev) => {
        if (fromIndex < 0 || fromIndex >= prev.length) return prev
        if (toIndex < 0 || toIndex >= prev.length) return prev
        const newQueue = [...prev]
        const [moved] = newQueue.splice(fromIndex, 1)
        newQueue.splice(toIndex, 0, moved)
        return newQueue
      })
    },
    []
  )

  // --- Loading state ---
  if (!draft) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full blur-xl"
              style={{ background: "rgba(59,130,246,0.3)", animation: "pulse 2s ease-in-out infinite" }}
            />
            <Loader2 className="w-6 h-6 animate-spin text-[#3B82F6] relative z-10" />
          </div>
          <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground/50">
            Loading draft room
          </p>
        </div>
      </div>
    )
  }

  // --- Lobby phase: waiting for draft to start ---
  if (draft.phase === "LOBBY") {
    return (
      <>
        <ConnectionBanner
          connectionState={connectionState}
          error={wsError}
          onReconnect={reconnect}
        />
        <DraftLobby draft={draft} userId={userId} />
      </>
    )
  }

  // --- Countdown phase: 30-second countdown before draft begins ---
  if (draft.phase === "COUNTDOWN" && draft.countdownEndsAt) {
    return (
      <>
        <ConnectionBanner
          connectionState={connectionState}
          error={wsError}
          onReconnect={reconnect}
        />
        <DraftCountdown
          countdownEndsAt={draft.countdownEndsAt}
          draftName={draft.name}
        />
      </>
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
    autoPickEnabled: autoPickFromQueue,
    onToggleAutoPick: () => setAutoPickFromQueue((v) => !v),
    onRemove: handleRemoveFromQueue,
    onReorder: handleReorderQueue,
    onClose: () => setShowQueue(false),
  }

  return (
    <>
      {/* ── Custom keyframes for draft room animations ── */}
      <style>{`
        @keyframes dr-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dr-pulse-ring {
          0%, 100% { box-shadow: 0 0 0 1px rgba(59,130,246,0.25), 0 0 20px rgba(59,130,246,0.08); }
          50% { box-shadow: 0 0 0 1px rgba(59,130,246,0.5), 0 0 40px rgba(59,130,246,0.18); }
        }
        @keyframes dr-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes dr-urgent-pulse {
          0%, 100% { box-shadow: 0 0 0 1px rgba(239,68,68,0.4), 0 0 24px rgba(239,68,68,0.15); }
          50% { box-shadow: 0 0 0 1px rgba(239,68,68,0.7), 0 0 48px rgba(239,68,68,0.3); }
        }
        @keyframes dr-clock-glow {
          0%, 100% {
            box-shadow: 0 0 0 1px rgba(59,130,246,0.3), 0 0 32px rgba(59,130,246,0.12), inset 0 1px 0 rgba(255,255,255,0.06);
          }
          50% {
            box-shadow: 0 0 0 1px rgba(59,130,246,0.55), 0 0 60px rgba(59,130,246,0.22), inset 0 1px 0 rgba(255,255,255,0.08);
          }
        }
        .dr-fade-up {
          animation: dr-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .dr-fade-up-1 { animation-delay: 0ms; }
        .dr-fade-up-2 { animation-delay: 60ms; }
        .dr-fade-up-3 { animation-delay: 120ms; }
        .dr-fade-up-4 { animation-delay: 180ms; }
        .dr-fade-up-5 { animation-delay: 240ms; }
      `}</style>

      {/* ── MOBILE LAYOUT (hidden md+) ── */}
      <div className="fixed md:hidden inset-0 top-20 flex flex-col overflow-hidden z-10">

        {/* Fixed header section — never scrolls */}
        <div className="flex-shrink-0">
          <ConnectionBanner
            connectionState={connectionState}
            error={wsError}
            onReconnect={reconnect}
          />

          {draft.status === "COMPLETE" && (
            <div className="px-2 pt-2">
              <DraftCompleteBanner />
            </div>
          )}

          <MobileFloatingTimer timeLeft={timeLeft} />

          <div className="px-2 pt-2">
            <MobileStatusBanner
              isMyTurn={!!isMyTurn}
              currentPickerName={currentPicker?.userName ?? null}
              currentPickerImage={currentPicker?.userImage ?? null}
              selectedSlotData={selectedSlotData}
              onConfirmPick={handleConfirmPick}
            />
          </div>

          <div className="py-2">
            <MobileActionBar
              pickCount={myParticipant?.picks.length ?? 0}
              queueCount={draftQueue.length}
              searchQuery={mobileSearchQuery}
              onSearchChange={setMobileSearchQuery}
              onOpenMyPicks={() => setShowMyPicksDrawer(true)}
              onOpenBoard={() => setShowBoardDrawer(true)}
              onOpenQueue={() => setShowQueueDrawer(true)}
            />
          </div>
        </div>

        {/* Team grid — only this scrolls */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
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

      {/* ─────────────────────────────────────────────────────────────────────
          MOBILE: Draft Board Drawer
      ───────────────────────────────────────────────────────────────────── */}
      <Drawer open={showBoardDrawer} onOpenChange={setShowBoardDrawer} direction="bottom">
        <DrawerContent className={cn(
          "bg-card border-border",
          "max-h-[85dvh] flex flex-col",
        )}>
          <div className="mx-auto mt-3 mb-1 h-1 w-10 flex-shrink-0 rounded-full bg-border" />
          <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
            <h2 className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
              Draft Board
            </h2>
            <span className={cn(
              "text-[10px] h-5 px-2 rounded-full border border-border",
              "text-muted-foreground inline-flex items-center font-mono",
            )}>
              {draft.draftType === "SNAKE" ? "Snake" : "Linear"}
            </span>
          </div>
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
          "bg-card border-border",
          "max-h-[75dvh] flex flex-col",
        )}>
          <div className="mx-auto mt-3 mb-1 h-1 w-10 flex-shrink-0 rounded-full bg-border" />
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {myParticipant && <SeedWeightCard picks={myParticipant.picks} />}
            <DraftQueuePanel
              {...queueProps}
              onClose={() => setShowQueueDrawer(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* ── MOBILE: My Picks Drawer ── */}
      <MobileMyPicksDrawer
        open={showMyPicksDrawer}
        onOpenChange={setShowMyPicksDrawer}
        picks={myParticipant?.picks ?? []}
        rosterSize={draft.rosterSize}
      />

      {/* ─────────────────────────────────────────────────────────────────────
          DESKTOP LAYOUT  (hidden below md)
      ───────────────────────────────────────────────────────────────────── */}
      <div className="relative hidden md:flex flex-col gap-3 h-[calc(100vh-140px)] overflow-hidden p-3">

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-3 h-full">
          <div className="dr-fade-up dr-fade-up-1">
            <ConnectionBanner
              connectionState={connectionState}
              error={wsError}
              onReconnect={reconnect}
            />
          </div>
          {draft.status === "COMPLETE" && (
            <div className="dr-fade-up dr-fade-up-1">
              <DraftCompleteBanner />
            </div>
          )}

          <div className="dr-fade-up dr-fade-up-2">
            <DraftHeader {...headerProps} />
          </div>

          {/* Main content: 60/40 split */}
          <div className="flex gap-4 flex-1 min-h-0">
            {/* Left panel */}
            <div className="flex-1 flex flex-col gap-3 min-h-0">
              <div className="dr-fade-up dr-fade-up-3">
                <OnTheClockBanner {...clockProps} />
              </div>
              {myParticipant && (
                <div className="dr-fade-up dr-fade-up-4">
                  <SeedWeightCard picks={myParticipant.picks} />
                </div>
              )}
              <div className="dr-fade-up dr-fade-up-5 flex-1 min-h-0">
                <TeamPickerPanel {...pickerProps} />
              </div>
            </div>

            {/* Right panel */}
            <div className="w-[420px] flex-shrink-0 flex flex-col gap-3 min-h-0 dr-fade-up dr-fade-up-4">
              <div className="flex-1 min-h-0">
                <DraftBoard {...boardProps} />
              </div>
              {showQueue && (
                <DraftQueuePanel {...queueProps} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
