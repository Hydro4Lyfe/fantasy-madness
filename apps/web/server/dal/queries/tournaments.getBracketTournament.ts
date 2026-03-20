import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";

export type BracketTournamentDTO = {
  id: string;
  seasonYear: number;
  name: string | null;
} | null;

export async function getBracketTournament(args?: {
  db?: DbClient;
}): Promise<BracketTournamentDTO> {
  const db = (args?.db ?? prisma) as any;
  return db.tournament.findFirst({
    where: {
      syncState: { in: ["BRACKET_LOCKED", "LIVE", "COMPLETED"] },
    },
    orderBy: { seasonYear: "desc" },
    select: { id: true, seasonYear: true, name: true },
  });
}
