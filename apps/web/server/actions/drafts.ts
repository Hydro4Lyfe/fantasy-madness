"use server";

import { requireUserId } from "@/server/auth/guards";
import {
  updateDraft,
  removeParticipant,
  startDraft,
} from "@fantasy-madness/dal";
import { revalidatePath } from "next/cache";

export async function updateDraftAction(
  draftId: string,
  data: { name?: string; rosterSize?: number; pickTimerSec?: number | null }
) {
  const userId = await requireUserId();

  try {
    await updateDraft({
      input: {
        draftId,
        userId,
        ...data,
      },
    });

    revalidatePath(`/drafts/${draftId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message ?? "Failed to update draft" };
  }
}

export async function removeParticipantAction(
  draftId: string,
  participantUserId: string
) {
  const userId = await requireUserId();

  try {
    await removeParticipant({
      input: {
        draftId,
        hostUserId: userId,
        participantUserId,
      },
    });

    revalidatePath(`/drafts/${draftId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message ?? "Failed to remove participant" };
  }
}

export async function startDraftAction(draftId: string) {
  const userId = await requireUserId();

  try {
    await startDraft({
      input: {
        draftId,
        userId,
      },
    });

    revalidatePath(`/drafts/${draftId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message ?? "Failed to start draft" };
  }
}
