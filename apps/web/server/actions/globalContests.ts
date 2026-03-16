"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@fantasy-madness/db";
import { requireUserId } from "@/server/auth/guards";
import { saveGlobalContestPicks } from "@/server/dal";

export async function saveGlobalContestPicksAction(
  contestId: string,
  slotIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const userId = await requireUserId();

  if (!contestId || typeof contestId !== "string") {
    return { success: false, error: "Invalid contest" };
  }

  if (!Array.isArray(slotIds)) {
    return { success: false, error: "Invalid picks" };
  }

  try {
    await saveGlobalContestPicks({
      db: prisma,
      input: {
        contestId,
        userId,
        slotIds,
      },
    });

    revalidatePath("/global-contest");
    revalidatePath("/global-contest/picks");
    revalidateTag("leaderboard");
    return { success: true };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message ?? "Failed to save global contest picks",
    };
  }
}
