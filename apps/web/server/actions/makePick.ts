"use server";

import { prisma } from "@fantasy-madness/db";
import { makePick } from "@fantasy-madness/dal";
import { revalidatePath } from "next/cache";
import { requireUserId } from "@/server/auth/guards";

export type MakePickResult = {
  success: boolean;
  error?: string;
  pickId?: string;
};

export async function makePickAction(
  draftId: string,
  slotId: string
): Promise<MakePickResult> {
  const userId = await requireUserId();

  try {
    const result = await makePick({
      db: prisma,
      input: { draftId, userId, slotId },
    });

    revalidatePath(`/drafts/${draftId}/room`);

    return { success: true, pickId: result.pickId };
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Failed to make pick" };
  }
}
