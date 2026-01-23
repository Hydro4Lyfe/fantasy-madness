"use server";

import { withTx } from "@fantasy-madness/db";
import { joinDraft } from "@fantasy-madness/dal";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireUserId } from "@/server/auth/guards";

export async function joinDraftAction(input: { draftId: string; idempotencyKey?: string }) {
  const userId = requireUserId();

  const result = await withTx((tx) =>
    joinDraft({ db: tx, input: { draftId: input.draftId, userId, idempotencyKey: input.idempotencyKey } })
  );

  revalidatePath(`/drafts/${input.draftId}`);
  revalidateTag(`draft:${input.draftId}`);
  return result;
}
