"use server";

import { requireUserId } from "@/server/auth/guards";
import {
  updateDraft,
  removeParticipant,
  startDraft,
  getDraftByInviteCode,
  joinDraft,
} from "@/server/dal";
import { prisma } from "@fantasy-madness/db";
import { revalidatePath } from "next/cache";

export async function updateDraftAction(
  draftId: string,
  data: { name?: string; rosterSize?: number; pickTimerSec?: number | null; startAt?: string | null }
) {
  const userId = await requireUserId();

  try {
    await updateDraft({
      input: {
        draftId,
        userId,
        ...data,
        startAt: data.startAt ? new Date(data.startAt) : data.startAt === null ? null : undefined,
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

export async function joinDraftByInviteAction(inviteCode: string) {
  const userId = await requireUserId();

  try {
    // Look up draft by invite code
    const draft = await getDraftByInviteCode({
      inviteCode: inviteCode.trim(),
      userId,
    });

    if (!draft) {
      return { success: false, error: "Draft not found. Please check the invite code." };
    }

    if (draft.isAlreadyJoined) {
      // Already a member, just redirect
      return { success: true, draftId: draft.id, alreadyJoined: true };
    }

    if (draft.status !== "OPEN") {
      return { success: false, error: "This draft has already started and is no longer accepting participants." };
    }

    if (draft.participantCount >= draft.rosterSize) {
      return { success: false, error: "This draft is full." };
    }

    // Join the draft
    await joinDraft({
      db: prisma,
      input: {
        draftId: draft.id,
        userId,
      },
    });

    revalidatePath("/drafts");
    revalidatePath(`/drafts/${draft.id}`);

    return { success: true, draftId: draft.id };
  } catch (error: any) {
    return { success: false, error: error.message ?? "Failed to join draft" };
  }
}
