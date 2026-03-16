import type { DbClient } from "@fantasy-madness/db";

export type SavePickQueueInput = {
  draftId: string;
  userId: string;
  slotIds: string[];
  autoPickEnabled: boolean;
};

/**
 * Upsert a user's pick queue for a draft.
 * Persists the ordered slot preferences and auto-pick toggle.
 */
export async function savePickQueue(args: {
  db: DbClient;
  input: SavePickQueueInput;
}): Promise<void> {
  const { db, input } = args;

  await (db as any).draftPickQueue.upsert({
    where: {
      draftId_userId: {
        draftId: input.draftId,
        userId: input.userId,
      },
    },
    create: {
      draftId: input.draftId,
      userId: input.userId,
      slotIds: input.slotIds,
      autoPickEnabled: input.autoPickEnabled,
    },
    update: {
      slotIds: input.slotIds,
      autoPickEnabled: input.autoPickEnabled,
    },
  });
}
