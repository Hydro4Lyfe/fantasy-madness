import type { DbClient } from "@fantasy-madness/db";
import type { Prisma } from "@prisma/client";

export async function upsertTeamAndTournamentTeam(args: {
  db: DbClient;
  tournamentId: string;
  teamId: number;
  name: string;
  fullName: string;
  college: string | null;
  abbreviation: string | null;
  conferenceId: number | null;
  payloadRaw: Prisma.InputJsonValue;
  seed: number | null;
  region: string | null;
  quadrant: number | null;
  tournamentPayloadRaw: Prisma.InputJsonValue;
}): Promise<void> {
  const { db, tournamentId, teamId } = args;

  await db.team.upsert({
    where: { id: teamId },
    create: {
      id: teamId,
      name: args.name,
      fullName: args.fullName,
      college: args.college,
      abbreviation: args.abbreviation,
      conferenceId: args.conferenceId,
      payloadRaw: args.payloadRaw,
    },
    update: {
      name: args.name,
      fullName: args.fullName,
      college: args.college,
      abbreviation: args.abbreviation,
      conferenceId: args.conferenceId,
      payloadRaw: args.payloadRaw,
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
      payloadRaw: args.tournamentPayloadRaw,
    },
    update: {
      seed: args.seed ?? undefined,
      region: args.region ?? undefined,
      quadrant: args.quadrant ?? undefined,
      payloadRaw: args.tournamentPayloadRaw,
    },
  });
}

export async function ensureTeamStubForTournament(args: {
  db: DbClient;
  tournamentId: string;
  teamId: number;
  name?: string;
  fullName?: string;
}): Promise<void> {
  const { db, tournamentId, teamId } = args;

  await db.team.upsert({
    where: { id: teamId },
    create: {
      id: teamId,
      name: args.name ?? `Team ${teamId}`,
      fullName: args.fullName ?? `Team ${teamId}`,
      payloadRaw: { id: teamId, stub: true },
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
