import type { DbClient } from "@fantasy-madness/db";

export type PickQueueDTO = {
  slotIds: string[];
  autoPickEnabled: boolean;
};

/**
 * Get a user's pick queue for a draft.
 * Returns null if no queue exists.
 */
export async function getPickQueue(args: {
  db: DbClient;
  draftId: string;
  userId: string;
}): Promise<PickQueueDTO | null> {
  const { db, draftId, userId } = args;

  const queue = await (db as any).draftPickQueue.findUnique({
    where: {
      draftId_userId: { draftId, userId },
    },
    select: {
      slotIds: true,
      autoPickEnabled: true,
    },
  });

  return queue;
}
