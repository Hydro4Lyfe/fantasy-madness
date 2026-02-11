import type { DbClient } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";
import { mapPrismaError } from "../errors/mapPrismaError";
import { randomBytes } from "crypto";

export type CreateLeagueInput = {
  name: string;
  tournamentId: string;
  userId: string;
  isPrivate?: boolean;
  maxParticipants?: number;
};

export type CreateLeagueResult = { leagueId: string; inviteCode: string | null };

function generateInviteCode(): string {
  return randomBytes(6).toString("base64url");
}

export async function createLeague(args: {
  db: DbClient;
  input: CreateLeagueInput;
}): Promise<CreateLeagueResult> {
  const { db, input } = args;

  if (!input.name?.trim())
    throw new DomainError("CONFLICT", "Name is required");
  if (!input.tournamentId?.trim())
    throw new DomainError("CONFLICT", "Tournament is required");
  if (!input.userId?.trim())
    throw new DomainError("CONFLICT", "User is required");

  try {
    const tournament = await (db as any).tournament.findUnique({
      where: { id: input.tournamentId },
      select: { id: true, syncState: true },
    });

    if (!tournament) throw new DomainError("NOT_FOUND", "Tournament not found");

    const inviteCode = input.isPrivate !== false ? generateInviteCode() : null;

    const league = await (db as any).league.create({
      data: {
        name: input.name.trim(),
        tournamentId: input.tournamentId,
        isPrivate: input.isPrivate ?? true,
        maxParticipants: input.maxParticipants ?? null,
        inviteCode,
        entries: {
          create: {
            userId: input.userId,
            isHost: true,
          },
        },
      },
      select: { id: true, inviteCode: true },
    });

    return { leagueId: league.id, inviteCode: league.inviteCode };
  } catch (e) {
    throw mapPrismaError(e);
  }
}
