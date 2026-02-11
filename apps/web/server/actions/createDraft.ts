"use server";

import { prisma } from "@fantasy-madness/db";
import { createDraft } from "@/server/dal";
import { CreateDraftInputSchema } from "@fantasy-madness/domain";
import { redirect } from "next/navigation";
import { requireUserId } from "@/server/auth/guards";

export type CreateDraftFormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  draftId?: string;
};

export async function createDraftAction(
  _prevState: CreateDraftFormState,
  formData: FormData
): Promise<CreateDraftFormState> {
  const userId = await requireUserId();

  const rawData = {
    name: formData.get("name"),
    tournamentId: formData.get("tournamentId"),
    draftType: formData.get("draftType"),
    isPrivate: formData.get("isPrivate") === "on",
    pickTimerSec: formData.get("pickTimerSec") || undefined,
    startAt: formData.get("startAt") || undefined,
  };

  const parsed = CreateDraftInputSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field) fieldErrors[String(field)] = issue.message;
    }
    return { success: false, error: "Validation failed", fieldErrors };
  }

  try {
    const result = await createDraft({
      db: prisma,
      input: { ...parsed.data, userId },
    });

    redirect(`/drafts/${result.draftId}`);
  } catch (e: any) {
    if (e?.digest?.startsWith("NEXT_REDIRECT")) throw e;
    return { success: false, error: e?.message ?? "Failed to create draft" };
  }
}
