import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";

export type OpenTournament = {
  id: string;
  seasonYear: number;
  name: string;
} | null;

export async function getOpenTournament(args: { db?: DbClient } = {}): Promise<OpenTournament> {
  const db = (args.db ?? prisma) as any;

  const contest = await db.globalContest.findFirst({
    where: { status: "OPEN" },
    select: {
      tournament: {
        select: { id: true, seasonYear: true, name: true },
      },
    },
  });

  if (!contest?.tournament) return null;

  return {
    id: contest.tournament.id,
    seasonYear: contest.tournament.seasonYear,
    name: contest.tournament.name,
  };
}
