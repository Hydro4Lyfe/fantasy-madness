import type { DbClient } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";
import { Prisma } from "@prisma/client";
import { mapPrismaError } from "../errors/mapPrismaError";

export type JoinLeagueInput = {
  leagueId: string;
  userId: string;
};

export type JoinLeagueResult = { leagueId: string; entryId: string };

function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v
  );
}

export async function joinLeague(args: {
  db: DbClient;
  input: JoinLeagueInput;
}): Promise<JoinLeagueResult> {
  const { db, input } = args;

  if (!input || typeof input !== "object")
    throw new DomainError("CONFLICT", "Invalid input");
  if (!input.leagueId || !isUuid(String(input.leagueId)))
    throw new DomainError("CONFLICT", "Invalid leagueId");
  if (
    !input.userId ||
    typeof input.userId !== "string" ||
    input.userId.length < 1
  ) {
    throw new DomainError("CONFLICT", "Invalid userId");
  }

  try {
    const run = async (tx: any) => {
      // 1) idempotent: already joined?
      const existing = await tx.leagueEntry.findUnique({
        where: {
          leagueId_userId: { leagueId: input.leagueId, userId: input.userId },
        },
        select: { id: true },
      });
      if (existing)
        return { leagueId: input.leagueId, entryId: existing.id };

      // 2) check if user is banned
      const ban = await tx.leagueBan.findUnique({
        where: {
          leagueId_userId: { leagueId: input.leagueId, userId: input.userId },
        },
      });
      if (ban)
        throw new DomainError("BANNED_FROM_LEAGUE", "You are banned from this league");

      // 3) ensure league exists + joinable
      const league = await tx.league.findUnique({
        where: { id: input.leagueId },
        select: { id: true, status: true, maxParticipants: true },
      });
      if (!league) throw new DomainError("NOT_FOUND", "League not found");
      if (league.status !== "OPEN")
        throw new DomainError("INVALID_STATE", "League is not accepting new participants");

      // 4) check if league is full
      if (league.maxParticipants) {
        const count = await tx.leagueEntry.count({
          where: { leagueId: input.leagueId },
        });
        if (count >= league.maxParticipants) {
          throw new DomainError("LEAGUE_FULL", "League is full");
        }
      }

      // 5) create entry
      const created = await tx.leagueEntry.create({
        data: {
          leagueId: input.leagueId,
          userId: input.userId,
          isHost: false,
        },
        select: { id: true },
      });

      return { leagueId: input.leagueId, entryId: created.id };
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
