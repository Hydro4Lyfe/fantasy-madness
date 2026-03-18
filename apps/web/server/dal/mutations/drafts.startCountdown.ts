import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";

export type StartCountdownInput = {
  draftId: string;
};

export type StartCountdownResult = {
  success: boolean;
  countdownStartedAt: Date;
  participantCount: number;
};

/**
 * Initiates the 30-second countdown before a scheduled draft starts.
 * Called by the auto-start job at the scheduled startAt time.
 * Idempotent: returns existing countdownStartedAt if already set.
 */
export async function startCountdown(args: {
  db?: DbClient;
  input: StartCountdownInput;
}): Promise<StartCountdownResult> {
  const db = (args.db ?? prisma) as any;
  const { draftId } = args.input;

  const draft = await db.draft.findUnique({
    where: { id: draftId },
    select: {
      status: true,
      startAt: true,
      countdownStartedAt: true,
      tournamentId: true,
      _count: { select: { participants: true } },
    },
  });

  if (!draft) {
    throw new DomainError("NOT_FOUND", "Draft not found");
  }

  if (draft.status !== "OPEN") {
    throw new DomainError("INVALID_STATE", "Draft has already started or completed");
  }

  // Check tournament time-based lock (first Round 1 game)
  const tournament = await db.tournament.findUnique({
    where: { id: draft.tournamentId },
    select: { picksLockAt: true },
  });
  if (tournament?.picksLockAt && tournament.picksLockAt.getTime() <= Date.now()) {
    throw new DomainError("INVALID_STATE", "Cannot start draft after the first round has started");
  }

  // Idempotent: if countdown already started, return existing
  if (draft.countdownStartedAt) {
    return {
      success: true,
      countdownStartedAt: draft.countdownStartedAt,
      participantCount: draft._count.participants,
    };
  }

  if (draft._count.participants < 2) {
    throw new DomainError("INVALID_STATE", "Not enough participants to start draft");
  }

  const now = new Date();

  await db.draft.update({
    where: { id: draftId, status: "OPEN", countdownStartedAt: null },
    data: { countdownStartedAt: now },
  });

  return {
    success: true,
    countdownStartedAt: now,
    participantCount: draft._count.participants,
  };
}
