import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";

export type TournamentDTO = {
  id: string;
  seasonYear: number;
  name: string;
  syncState: string;
  startDate: Date | null;
  endDate: Date | null;
};

export async function getTournamentBySeasonYear(args: { db?: DbClient; seasonYear: number }): Promise<TournamentDTO> {
  const db = (args.db ?? prisma) as any;

  const t = await db.tournament.findFirst({
    where: { seasonYear: args.seasonYear },
    select: {
      id: true,
      seasonYear: true,
      name: true,
      syncState: true,
      startDate: true,
      endDate: true,
    },
  });

  if (!t) throw new DomainError("NOT_FOUND", `Tournament not found for seasonYear=${args.seasonYear}`);

  return {
    id: t.id,
    seasonYear: t.seasonYear,
    name: t.name,
    syncState: String(t.syncState),
    startDate: t.startDate ?? null,
    endDate: t.endDate ?? null,
  };
}
