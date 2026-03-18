import { DraftRoom } from "./DraftRoom";
import { notFound, redirect } from "next/navigation";
import { requireUserId } from "@/server/auth/guards";
import { getDraftRoomState } from "@/server/dal";
import { DomainError } from "@fantasy-madness/domain";

const ROOM_ALLOWED_PHASES = new Set(["LOBBY", "COUNTDOWN", "DRAFTING"]);

export default async function DraftRoomPage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;
  const userId = await requireUserId();

  let initialState;
  try {
    initialState = await getDraftRoomState({ draftId });
  } catch (error) {
    if (error instanceof DomainError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  // Allow entry during LOBBY (30min before start), COUNTDOWN, and DRAFTING phases
  if (!ROOM_ALLOWED_PHASES.has(initialState.phase)) {
    redirect(`/drafts/${draftId}`);
  }

  // Only allow participants into the room
  const isParticipant = initialState.participants.some(
    (p) => p.oduserId === userId
  );
  if (!isParticipant) {
    redirect(`/drafts/${draftId}`);
  }

  return (
    <DraftRoom draftId={draftId} userId={userId} initialState={initialState} />
  );
}
