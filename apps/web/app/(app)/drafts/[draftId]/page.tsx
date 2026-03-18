import { DraftDetailsClient } from "./DraftDetailsClient";
import { notFound } from "next/navigation";
import { requireUserId } from "@/server/auth/guards";
import {
  getDraftRoomState,
  getDraftResults,
  type DraftRoomStateDTO,
  type DraftParticipantResultDTO,
} from "@/server/dal";
import { DomainError } from "@fantasy-madness/domain";
import type { DraftPhase } from "@fantasy-madness/domain";

// Map DAL phase to UI status
function mapPhaseToStatus(
  phase: DraftPhase
): "upcoming" | "drafting" | "active" | "completed" {
  switch (phase) {
    case "LOBBY":
    case "COUNTDOWN":
      return "drafting"; // Treat lobby/countdown as "drafting" for enter room button
    case "DRAFTING":
      return "drafting";
    case "LOCKED":
      return "active";
    case "COMPLETE":
      return "completed";
    case "WAITING":
    default:
      return "upcoming";
  }
}

// Transform DAL room state to DraftSettings interface
function transformDraftSettings(roomState: DraftRoomStateDTO) {
  return {
    id: roomState.id,
    name: roomState.name,
    type: roomState.isPrivate ? ("private" as const) : ("public" as const),
    status: mapPhaseToStatus(roomState.phase),
    phase: roomState.phase,
    maxParticipants: roomState.rosterSize,
    startAt: roomState.startAt,
    pickTimeLimit: roomState.pickTimerSec ?? 0,
    draftType: roomState.draftType.toLowerCase() as "snake" | "linear",
    visibility: roomState.isPrivate ? ("private" as const) : ("public" as const),
    inviteCode: roomState.inviteCode ?? "",
    allowAutoQueue: false,
  };
}

// Build participant result map from getDraftResults
function buildResultsMap(
  results: DraftParticipantResultDTO[] | null
): Map<string, { totalScore: number; rank: number }> {
  const map = new Map<string, { totalScore: number; rank: number }>();
  if (results) {
    for (const r of results) {
      map.set(r.userId, { totalScore: r.totalScore, rank: r.rank });
    }
  }
  return map;
}

// Transform DAL participants to UI Participant interface
function transformParticipants(
  roomState: DraftRoomStateDTO,
  currentUserId: string,
  resultsMap: Map<string, { totalScore: number; rank: number }>
) {
  return roomState.participants.map((p) => {
    const result = resultsMap.get(p.oduserId);
    return {
      id: p.oduserId,
      name: p.userName ?? "Unknown",
      email: "", // Not exposed in queries for privacy
      avatar: p.userImage ?? "",
      isHost: p.isHost,
      isYou: p.oduserId === currentUserId,
      status: "active" as const,
      joinedAt: "", // Not tracked in current schema
      totalPoints: result?.totalScore ?? 0,
      rank: result?.rank ?? 0,
      teamsCount: p.picks.length,
    };
  });
}

export default async function DraftDetailsPage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;
  const userId = await requireUserId();

  let roomState: DraftRoomStateDTO;
  try {
    roomState = await getDraftRoomState({ draftId });
  } catch (error) {
    if (error instanceof DomainError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  // Fetch results for scoring (useful for LIVE and COMPLETE status)
  let resultsMap = new Map<string, { totalScore: number; rank: number }>();
  if (roomState.status === "LIVE" || roomState.status === "COMPLETE" || roomState.status === "DRAFTING") {
    try {
      const results = await getDraftResults({ draftId });
      resultsMap = buildResultsMap(results.participants);
    } catch {
      // Results not available yet, use empty map
    }
  }

  const draftData = transformDraftSettings(roomState);
  const participants = transformParticipants(roomState, userId, resultsMap);
  const isHost = roomState.participants.some(
    (p) => p.oduserId === userId && p.isHost
  );

  return (
    <DraftDetailsClient
      draft={draftData}
      participants={participants}
      isHost={isHost}
    />
  );
}
