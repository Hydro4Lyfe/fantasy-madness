import type { DbClient } from "@fantasy-madness/db";

export type EnsureGlobalContestResult = {
  contestId: string;
  created: boolean;
  lockedNow: boolean;
  status: "OPEN" | "LOCKED" | "COMPLETE";
  lockAt: Date | null;
};

export async function ensureGlobalContestForTournament(args: {
  db: DbClient;
  tournamentId: string;
  lockAt: Date | null;
  now?: Date;
}): Promise<EnsureGlobalContestResult> {
  const now = args.now ?? new Date();

  const shouldLock = args.lockAt ? args.lockAt.getTime() <= now.getTime() : false;

  const existing = await args.db.globalContest.findUnique({
    where: { tournamentId: args.tournamentId },
    select: {
      id: true,
      status: true,
      lockAt: true,
    },
  });

  if (!existing) {
    const created = await args.db.globalContest.create({
      data: {
        tournamentId: args.tournamentId,
        name: "Global Championship",
        status: shouldLock ? "LOCKED" : "OPEN",
        lockAt: args.lockAt,
      },
      select: {
        id: true,
        status: true,
        lockAt: true,
      },
    });

    return {
      contestId: created.id,
      created: true,
      lockedNow: shouldLock,
      status: created.status,
      lockAt: created.lockAt,
    };
  }

  const updateData: Record<string, unknown> = {};

  const existingLockAtMs = existing.lockAt?.getTime() ?? null;
  const nextLockAtMs = args.lockAt?.getTime() ?? null;
  if (existingLockAtMs !== nextLockAtMs) {
    updateData.lockAt = args.lockAt;
  }

  let lockedNow = false;
  if (existing.status === "OPEN" && shouldLock) {
    updateData.status = "LOCKED";
    lockedNow = true;
  }

  if (Object.keys(updateData).length === 0) {
    return {
      contestId: existing.id,
      created: false,
      lockedNow: false,
      status: existing.status,
      lockAt: existing.lockAt,
    };
  }

  const updated = await args.db.globalContest.update({
    where: { id: existing.id },
    data: updateData,
    select: {
      id: true,
      status: true,
      lockAt: true,
    },
  });

  return {
    contestId: updated.id,
    created: false,
    lockedNow,
    status: updated.status,
    lockAt: updated.lockAt,
  };
}
