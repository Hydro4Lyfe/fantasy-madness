import type { DbClient } from "@fantasy-madness/db";
import { Prisma, type TournamentSyncState } from "@prisma/client";

export async function upsertTournamentFromSummary(args: {
  db: DbClient;
  tournamentId: string;
  seasonYear: number;
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  payloadRaw: Prisma.InputJsonValue;
}): Promise<void> {
  const { db } = args;

  await db.tournament.upsert({
    where: { id: args.tournamentId },
    create: {
      id: args.tournamentId,
      seasonYear: args.seasonYear,
      name: args.name,
      startDate: args.startDate,
      endDate: args.endDate,
      syncState: "MONITORING",
      eventStatusRaw: Prisma.JsonNull,
      payloadRaw: args.payloadRaw,
      statsUpdatedAt: new Date(),
      nextCheckAt: new Date(0),
    },
    update: {
      name: args.name,
      startDate: args.startDate ?? undefined,
      endDate: args.endDate ?? undefined,
      payloadRaw: args.payloadRaw,
      statsUpdatedAt: new Date(),
    },
  });
}

export async function updateTournamentEventStatusRaw(args: {
  db: DbClient;
  tournamentId: string;
  eventStatusRaw: Prisma.InputJsonValue;
}): Promise<void> {
  await args.db.tournament.update({
    where: { id: args.tournamentId },
    data: { eventStatusRaw: args.eventStatusRaw, statsUpdatedAt: new Date() },
  });
}

export type TournamentLite = {
  id: string;
  seasonYear: number;
  startDate: Date | null;
  endDate: Date | null;
  syncState: TournamentSyncState;
};

export async function findLatestTournamentInStates(args: {
  db: DbClient;
  states: TournamentSyncState[];
}): Promise<TournamentLite | null> {
  return args.db.tournament.findFirst({
    where: { syncState: { in: args.states as any } },
    orderBy: [{ seasonYear: "desc" }, { startDate: "desc" }],
    select: { id: true, seasonYear: true, startDate: true, endDate: true, syncState: true },
  });
}

export async function hasTournamentInStates(args: {
  db: DbClient;
  states: TournamentSyncState[];
}): Promise<boolean> {
  const t = await args.db.tournament.findFirst({
    where: { syncState: { in: args.states as any } },
    select: { id: true },
  });
  return Boolean(t);
}

export type TournamentSnapshot = {
  tournament: {
    id: string;
    seasonYear: number;
    name: string;
    syncState: TournamentSyncState;
    bracketLockedAt: Date | null;
    startDate: Date | null;
    endDate: Date | null;
  } | null;
  tournamentTeams: { total: number; seeded: number };
  bracket: {
    slotsTotal: number;
    slotsAssigned: number;
    slotsUnassigned: number;
    candidatesTotal: number;
  };
};

export async function getTournamentSnapshot(args: {
  db: DbClient;
  tournamentId: string;
}): Promise<TournamentSnapshot> {
  const { db, tournamentId } = args;
  const [t, ttTotal, ttSeeded, slotsTotal, slotsAssigned, candTotal] = await Promise.all([
    db.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        id: true,
        seasonYear: true,
        name: true,
        syncState: true,
        bracketLockedAt: true,
        startDate: true,
        endDate: true,
      },
    }),
    db.tournamentTeam.count({ where: { tournamentId } }),
    db.tournamentTeam.count({
      where: { tournamentId, seed: { not: null }, quadrant: { not: null } },
    }),
    db.bracketSlot.count({ where: { tournamentId } }),
    db.bracketSlot.count({ where: { tournamentId, assignedTeamId: { not: null } } }),
    db.bracketSlotCandidate.count({ where: { slot: { tournamentId } } }),
  ]);

  const slotsUnassigned = slotsTotal - slotsAssigned;

  return {
    tournament: t,
    tournamentTeams: { total: ttTotal, seeded: ttSeeded },
    bracket: {
      slotsTotal,
      slotsAssigned,
      slotsUnassigned,
      candidatesTotal: candTotal,
    },
  };
}

export async function getPhaseInputs(args: {
  db: DbClient;
  states: TournamentSyncState[];
  now?: Date;
}): Promise<{
  tournament: Pick<TournamentLite, "id" | "startDate" | "endDate" | "syncState"> | null;
  gameCount: number;
  teamCount: number;
  nextGameAt: Date | null;
  lastClosedAt: Date | null;
}> {
  const now = args.now ?? new Date();

  const t = await args.db.tournament.findFirst({
    where: { syncState: { in: args.states as any, not: "COMPLETED" as any } },
    orderBy: [{ seasonYear: "desc" }, { startDate: "desc" }],
    select: { id: true, startDate: true, endDate: true, syncState: true },
  });

  if (!t) {
    return { tournament: null, gameCount: 0, teamCount: 0, nextGameAt: null, lastClosedAt: null };
  }

  const [gameCount, teamCount, nextGame, lastClosed] = await Promise.all([
    args.db.game.count({ where: { tournamentId: t.id } }),
    args.db.tournamentTeam.count({ where: { tournamentId: t.id } }),
    args.db.game.findFirst({
      where: { tournamentId: t.id, scheduledAt: { gte: now } },
      orderBy: { scheduledAt: "asc" },
      select: { scheduledAt: true },
    }),
    args.db.game.findFirst({
      where: { tournamentId: t.id, finalizedAt: { not: null } },
      orderBy: { finalizedAt: "desc" },
      select: { finalizedAt: true },
    }),
  ]);

  return {
    tournament: t,
    gameCount,
    teamCount,
    nextGameAt: nextGame?.scheduledAt ?? null,
    lastClosedAt: (lastClosed?.finalizedAt as Date | null) ?? null,
  };
}
