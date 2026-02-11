import type { DbClient } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";
import { mapPrismaError } from "../errors/mapPrismaError";

export type SaveGlobalContestPicksInput = {
  contestId: string;
  userId: string;
  slotIds: string[];
};

export type SaveGlobalContestPicksResult = {
  success: boolean;
  pickCount: number;
};

function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v
  );
}

export async function saveGlobalContestPicks(args: {
  db: DbClient;
  input: SaveGlobalContestPicksInput;
}): Promise<SaveGlobalContestPicksResult> {
  const { db, input } = args;

  if (!input.contestId || !isUuid(input.contestId)) {
    throw new DomainError("CONFLICT", "Invalid contestId");
  }

  if (!input.userId || input.userId.length < 1) {
    throw new DomainError("CONFLICT", "Invalid userId");
  }

  if (!Array.isArray(input.slotIds) || input.slotIds.length !== 8) {
    throw new DomainError("CONFLICT", "Must select exactly 8 bracket slots");
  }

  for (const slotId of input.slotIds) {
    if (!isUuid(slotId)) {
      throw new DomainError("CONFLICT", "Invalid slot ID format");
    }
  }

  const uniqueSlotIds = new Set(input.slotIds);
  if (uniqueSlotIds.size !== 8) {
    throw new DomainError("CONFLICT", "Cannot select the same slot twice");
  }

  try {
    const run = async (tx: any) => {
      const contest = await tx.globalContest.findUnique({
        where: { id: input.contestId },
        select: {
          id: true,
          status: true,
          lockAt: true,
          tournamentId: true,
        },
      });

      if (!contest) {
        throw new DomainError("NOT_FOUND", "Global contest not found");
      }

      if (contest.status !== "OPEN") {
        throw new DomainError(
          "INVALID_STATE",
          "Cannot modify picks after contest has locked"
        );
      }

      if (contest.lockAt && contest.lockAt.getTime() <= Date.now()) {
        throw new DomainError(
          "INVALID_STATE",
          "Cannot modify picks after contest has locked"
        );
      }

      const slots = await tx.bracketSlot.findMany({
        where: {
          id: { in: input.slotIds },
          tournamentId: contest.tournamentId,
        },
        select: { id: true },
      });

      if (slots.length !== 8) {
        throw new DomainError(
          "CONFLICT",
          "One or more selected slots are invalid or not from this tournament"
        );
      }

      const entry = await tx.globalEntry.upsert({
        where: {
          contestId_userId: {
            contestId: input.contestId,
            userId: input.userId,
          },
        },
        update: {},
        create: {
          contestId: input.contestId,
          userId: input.userId,
        },
        select: { id: true },
      });

      await tx.globalPick.deleteMany({
        where: { entryId: entry.id },
      });

      await tx.globalPick.createMany({
        data: input.slotIds.map((slotId, index) => ({
          entryId: entry.id,
          pickNo: index + 1,
          slotId,
        })),
      });

      return { success: true, pickCount: 8 };
    };

    const maybePrismaClient = db as any;
    if (typeof maybePrismaClient.$transaction === "function") {
      return await maybePrismaClient.$transaction((tx: any) => run(tx));
    }
    return await run(db as any);
  } catch (e) {
    throw mapPrismaError(e);
  }
}
