import type { DbClient } from "@fantasy-madness/db";
import type { SyncFeedType, Prisma } from "@prisma/client";

export type CreateSyncLogArgs = {
  db: DbClient;
  feedType: SyncFeedType;
  tournamentId: string | null;
  entityId: string | null;
  fetchedAt: Date;
  httpStatus: number;
  payload?: Prisma.InputJsonValue | null;
  payloadHash?: string | null;
  error?: string | null;
};

export async function createSyncLog(args: CreateSyncLogArgs): Promise<void> {
  const { db } = args;
  await db.syncLog.create({
    data: {
      feedType: args.feedType,
      tournamentId: args.tournamentId,
      entityId: args.entityId,
      fetchedAt: args.fetchedAt,
      httpStatus: args.httpStatus,
      payload: args.payload ?? undefined,
      payloadHash: args.payloadHash ?? undefined,
      error: args.error ?? undefined,
    },
  });
}

export async function createSyncLogBestEffort(args: CreateSyncLogArgs): Promise<void> {
  await createSyncLog(args).catch(() => undefined);
}
