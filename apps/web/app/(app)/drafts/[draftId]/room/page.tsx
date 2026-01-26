import { requireUserId } from "@/server/auth/guards";
import { getDraftRoomState, getDraftById } from "@fantasy-madness/dal";
import { DraftRoom } from "@/components/features/drafts/DraftRoom";
import { DraftWaitingRoom } from "./DraftWaitingRoom";

export default async function DraftRoomPage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;
  const userId = await requireUserId();

  const state = await getDraftRoomState({ draftId });

  // For OPEN drafts, show the waiting room
  if (state.status === "OPEN") {
    const draft = await getDraftById({ draftId });
    const isHost = state.participants.some(
      (p) => p.oduserId === userId && p.isHost
    );

    return (
      <DraftWaitingRoom
        state={state}
        currentUserId={userId}
        inviteCode={draft.inviteCode}
        isHost={isHost}
      />
    );
  }

  return <DraftRoom initialState={state} currentUserId={userId} />;
}
