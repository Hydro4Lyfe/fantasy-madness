"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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

  // --- Timer effect ---
  useEffect(() => {
    if (!draft?.timerDeadlineAt) {
      setTimeLeft(null)
      return
    }

    const deadlineMs = new Date(draft.timerDeadlineAt).getTime()

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
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/50" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 h-[calc(100vh-140px)]">
      {/* Connection banners */}
      <ConnectionBanner
        connectionState={connectionState}
        error={wsError}
        onReconnect={reconnect}
      />

      {/* Draft complete */}
      {draft.status === "COMPLETE" && <DraftCompleteBanner />}

      {/* Header bar */}
      <DraftHeader
        draftId={draftId}
        draftName={draft.name}
        currentRound={currentRound}
        currentPickNumber={draft.currentPickNumber}
        totalPicks={draft.totalPicks}
        isConnected={connectionState === "connected"}
        timeLeft={timeLeft}
      />

      {/* Main content: 60/40 split */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left panel */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          {/* On the clock */}
          <OnTheClockBanner
            isMyTurn={!!isMyTurn}
            currentPickerName={currentPicker?.userName ?? null}
            currentPickerImage={currentPicker?.userImage ?? null}
            selectedSlot={selectedSlot}
            onConfirmPick={handleConfirmPick}
          />

          {myParticipant && <SeedWeightCard picks={myParticipant.picks} />}

          <TeamPickerPanel
            slots={draft.availableSlots}
            picks={myParticipant?.picks ?? []}
            rosterSize={draft.rosterSize}
            selectedSlot={selectedSlot}
            draftQueue={draftQueue}
            isMyTurn={!!isMyTurn}
            showQueue={showQueue}
            onSelectSlot={handleSelectSlot}
            onToggleQueue={handleToggleQueue}
            onToggleShowQueue={() => setShowQueue((v) => !v)}
          />
        </div>

        {/* Right panel */}
        <div className="w-[420px] flex-shrink-0 flex flex-col gap-3 min-h-0">
          {/* Draft board */}
          <div className="flex-1 min-h-0">
            <DraftBoard
              participants={draft.participants}
              currentPickerUserId={draft.currentPickerUserId}
              userId={userId}
              rosterSize={draft.rosterSize}
              draftType={draft.draftType}
            />
          </div>

          {/* Auto-draft queue */}
          {showQueue && (
            <DraftQueuePanel
              queue={draftQueue}
              availableSlots={draft.availableSlots}
              onRemove={handleRemoveFromQueue}
              onMove={handleMoveInQueue}
              onClose={() => setShowQueue(false)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
