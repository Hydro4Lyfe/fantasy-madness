import type { DbClient } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";
import { mapPrismaError } from "../errors/mapPrismaError";

export type SaveLeaguePicksInput = {
  leagueId: string;
  userId: string;
  slotIds: string[]; // exactly 8 bracket slot IDs
};

export type SaveLeaguePicksResult = { success: boolean; pickCount: number };

function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v
  );
}

export async function saveLeaguePicks(args: {
  db: DbClient;
  input: SaveLeaguePicksInput;
}): Promise<SaveLeaguePicksResult> {
  const { db, input } = args;

  // Basic validation
  if (!input.leagueId || !isUuid(input.leagueId)) {
    throw new DomainError("CONFLICT", "Invalid leagueId");
  }
  if (!input.userId || input.userId.length < 1) {
    throw new DomainError("CONFLICT", "Invalid userId");
  }
  if (!Array.isArray(input.slotIds) || input.slotIds.length !== 8) {
    throw new DomainError("CONFLICT", "Must select exactly 8 bracket slots");
  }

  // Validate all slotIds are UUIDs
  for (const slotId of input.slotIds) {
    if (!isUuid(slotId)) {
      throw new DomainError("CONFLICT", "Invalid slot ID format");
    }
  }

  // Check for duplicates
  const uniqueSlotIds = new Set(input.slotIds);
  if (uniqueSlotIds.size !== 8) {
    throw new DomainError("CONFLICT", "Cannot select the same slot twice");
  }

  try {
    const run = async (tx: any) => {
      // 1) Verify league exists and is OPEN
      const league = await tx.league.findUnique({
        where: { id: input.leagueId },
        select: { id: true, status: true, tournamentId: true },
      });

      if (!league) {
        throw new DomainError("NOT_FOUND", "League not found");
      }
      if (league.status !== "OPEN") {
        throw new DomainError(
          "INVALID_STATE",
          "Cannot modify picks after league has locked"
        );
      }

      // 2) Verify user has an entry in this league
      const entry = await tx.leagueEntry.findUnique({
        where: {
          leagueId_userId: { leagueId: input.leagueId, userId: input.userId },
        },
        select: { id: true },
      });

      if (!entry) {
        throw new DomainError(
          "NOT_FOUND",
          "You are not a participant in this league"
        );
      }

      // 3) Verify all slotIds belong to this tournament
      const slots = await tx.bracketSlot.findMany({
        where: {
          id: { in: input.slotIds },
          tournamentId: league.tournamentId,
        },
        select: { id: true },
      });

      if (slots.length !== 8) {
        throw new DomainError(
          "CONFLICT",
          "One or more selected slots are invalid or not from this tournament"
        );
      }

      // 4) Delete existing picks for this entry
      await tx.leaguePick.deleteMany({
        where: { entryId: entry.id },
      });

      // 5) Insert new picks
      const pickData = input.slotIds.map((slotId, index) => ({
        entryId: entry.id,
        pickNo: index + 1,
        slotId,
      }));

      await tx.leaguePick.createMany({
        data: pickData,
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
