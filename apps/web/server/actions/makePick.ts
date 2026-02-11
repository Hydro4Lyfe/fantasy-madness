"use server";

import { prisma } from "@fantasy-madness/db";
import { makePick } from "@/server/dal";
import { revalidatePath } from "next/cache";
import { requireUserId } from "@/server/auth/guards";
import { getRedisPubSub } from "@/lib/redis/pubsub";

const redis = getRedisPubSub();

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
      input: { draftId, userId, slotId, isAutoPick: false },
    });

    // Broadcast to all clients via Redis
    await redis.publish(`draft:${draftId}`, {
      type: 'pick:made',
      payload: {
        pickId: result.pickId,
        userId,
        slotId,
        overallPickNo: result.overallPickNo,
        isAutoPick: false,
      },
    });

    // If not complete, send turn change
    if (!result.isDraftComplete && result.nextPickerUserId) {
      await redis.publish(`draft:${draftId}`, {
        type: 'turn:changed',
        payload: {
          currentPickerUserId: result.nextPickerUserId,
          deadlineAt: result.nextDeadlineAt?.toISOString() ?? null,
        },
      });
    } else if (result.isDraftComplete) {
      await redis.publish(`draft:${draftId}`, {
        type: 'draft:completed',
        payload: {},
      });
    }

    revalidatePath(`/drafts/${draftId}/room`);

    return { success: true, pickId: result.pickId };
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Failed to make pick" };
  }
}
