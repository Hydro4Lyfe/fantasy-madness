import { redirect } from "next/navigation";
import { getDraftForEdit } from "@fantasy-madness/dal";
import { requireUserId } from "@/server/auth/guards";

export default async function DraftPage({ params }: { params: Promise<{ draftId: string }> }) {
  const { draftId } = await params;
  const userId = await requireUserId();

  const draft = await getDraftForEdit({ draftId, userId });

  // Redirect based on draft status
  if (draft.status === "DRAFTING" || draft.status === "COMPLETE") {
    redirect(`/drafts/${draftId}/room`);
  }

  // For OPEN drafts, redirect to room (which shows waiting state)
  // Hosts can access edit via the room page
  redirect(`/drafts/${draftId}/room`);
}
