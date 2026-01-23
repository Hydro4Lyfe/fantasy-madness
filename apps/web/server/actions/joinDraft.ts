"use server";

import { withTx } from "@fantasy-madness/db";
import { joinDraft } from "@fantasy-madness/dal";
import { revalidatePath } from "next/cache";

// Replace with your auth layer (Supabase, etc.)
function requireUserId(): string {
  throw new Error("requireUserId not implemented");
}

export async function joinDraftAction(input: { draftId: string; idempotencyKey?: string }) {
  const userId = requireUserId();

  const result = await withTx((tx) =>
    joinDraft({ db: tx, input: { draftId: input.draftId, userId, idempotencyKey: input.idempotencyKey } })
  );

  revalidatePath(`/drafts/${input.draftId}`);
  return result;
}
