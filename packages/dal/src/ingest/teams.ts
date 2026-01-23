import type { DbClient } from "@fantasy-madness/db";
import type { Prisma } from "@prisma/client";

export async function upsertTeamAndTournamentTeam(args: {
  db: DbClient;
  tournamentId: string;
  teamId: string;
  name: string | null;
  market: string | null;
  alias: string | null;
  baseTeamRaw: Prisma.InputJsonValue;
  seed: number | null;
  region: string | null;
  quadrant: number | null;
  payloadRaw: Prisma.InputJsonValue;
}): Promise<void> {
  const { db, tournamentId, teamId } = args;

  await db.team.upsert({
    where: { id: teamId },
    create: {
      id: teamId,
      name: args.name ?? teamId,
      market: args.market,
      alias: args.alias,
      baseTeamRaw: args.baseTeamRaw,
    },
    update: {
      ...(args.name ? { name: args.name } : {}),
      market: args.market,
      alias: args.alias,
      baseTeamRaw: args.baseTeamRaw,
    },
  });

  await db.tournamentTeam.upsert({
    where: { tournamentId_teamId: { tournamentId, teamId } },
    create: {
      tournamentId,
      teamId,
      seed: args.seed,
      region: args.region,
      quadrant: args.quadrant,
      payloadRaw: args.payloadRaw,
    },
    update: {
      seed: args.seed ?? undefined,
      region: args.region ?? undefined,
      quadrant: args.quadrant ?? undefined,
      payloadRaw: args.payloadRaw,
    },
  });
}

export async function ensureTeamStubForTournament(args: {
  db: DbClient;
  tournamentId: string;
  teamId: string;
}): Promise<void> {
  const { db, tournamentId, teamId } = args;

  await db.team.upsert({
    where: { id: teamId },
    create: {
      id: teamId,
      name: teamId,
      baseTeamRaw: { id: teamId, stub: true },
    },
    update: {},
  });

  await db.tournamentTeam.upsert({
    where: { tournamentId_teamId: { tournamentId, teamId } },
    create: {
      tournamentId,
      teamId,
      seed: null,
      region: null,
      quadrant: null,
      payloadRaw: { stub: true },
    },
    update: {},
  });
}
