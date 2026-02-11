"use server";

import { prisma } from "@fantasy-madness/db";
import { joinDraft } from "@/server/dal";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUserId } from "@/server/auth/guards";

export type JoinDraftByInviteResult = {
  success: boolean;
  error?: string;
};

export async function joinDraftByInviteAction(
  inviteCode: string
): Promise<JoinDraftByInviteResult> {
  const userId = await requireUserId();

  // Find draft by invite code
  const draft = await prisma.draft.findUnique({
    where: { inviteCode },
    select: { id: true, status: true, rosterSize: true },
  });

  if (!draft) {
    return { success: false, error: "Invalid invite code" };
  }

  if (draft.status !== "OPEN") {
    return { success: false, error: "This draft is no longer accepting participants" };
  }

  try {
    await joinDraft({
      db: prisma,
      input: { draftId: draft.id, userId },
    });

    revalidatePath(`/drafts/${draft.id}`);
  } catch (e: any) {
    if (e?.code === "DRAFT_FULL") {
      return { success: false, error: "This draft is full" };
    }
    return { success: false, error: e?.message ?? "Failed to join draft" };
  }

  redirect(`/drafts/${draft.id}`);
}
