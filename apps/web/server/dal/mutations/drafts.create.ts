import type { DbClient } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";
import { mapPrismaError } from "../errors/mapPrismaError";
import { randomBytes } from "crypto";

export type CreateDraftInput = {
  name: string;
  tournamentId: string;
  userId: string;
  draftType?: "SNAKE" | "LINEAR" | "AUCTION";
  isPrivate?: boolean;
  pickTimerSec?: number;
  startAt?: Date;
};

export type CreateDraftResult = { draftId: string; inviteCode: string | null };

function generateInviteCode(): string {
  return randomBytes(6).toString("base64url");
}

export async function createDraft(args: { db: DbClient; input: CreateDraftInput }): Promise<CreateDraftResult> {
  const { db, input } = args;

  if (!input.name?.trim()) throw new DomainError("CONFLICT", "Name is required");
  if (!input.tournamentId?.trim()) throw new DomainError("CONFLICT", "Tournament is required");
  if (!input.userId?.trim()) throw new DomainError("CONFLICT", "User is required");

  try {
    const tournament = await (db as any).tournament.findUnique({
      where: { id: input.tournamentId },
      select: { id: true, syncState: true, picksLockAt: true },
    });

    if (!tournament) throw new DomainError("NOT_FOUND", "Tournament not found");

    // Check tournament time-based lock (first Round 1 game)
    if (tournament.picksLockAt && tournament.picksLockAt.getTime() <= Date.now()) {
      throw new DomainError("INVALID_STATE", "Cannot create draft after the first round has started");
    }

    const inviteCode = input.isPrivate !== false ? generateInviteCode() : null;

    const draft = await (db as any).draft.create({
      data: {
        name: input.name.trim(),
        tournamentId: input.tournamentId,
        draftType: input.draftType ?? "SNAKE",
        rosterSize: 8,
        isPrivate: input.isPrivate ?? true,
        pickTimerSec: input.pickTimerSec ?? null,
        startAt: input.startAt ?? null,
        inviteCode,
        participants: {
          create: {
            userId: input.userId,
            pickOrder: 1,
            isHost: true,
          },
        },
      },
      select: { id: true, inviteCode: true },
    });

    return { draftId: draft.id, inviteCode: draft.inviteCode };
  } catch (e) {
    throw mapPrismaError(e);
  }
}
