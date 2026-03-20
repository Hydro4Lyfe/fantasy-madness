import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";

export type BracketSlotWithTeamDTO = {
  id: string;
  tournamentId: string;
  quadrant: number;
  seed: number;
  assignedTeamId: number | null;
  playInGameId: string | null;
  assignedTeam: {
    id: number;
    fullName: string;
    abbreviation: string | null;
  } | null;
  candidates: Array<{
    team: {
      id: number;
      fullName: string;
      abbreviation: string | null;
    };
  }>;
};

export async function listBracketSlotsWithTeams(args: {
  db?: DbClient;
  tournamentId: string;
}): Promise<BracketSlotWithTeamDTO[]> {
  const db = (args.db ?? prisma) as any;
  const slots = await db.bracketSlot.findMany({
    where: { tournamentId: args.tournamentId },
    select: {
      id: true,
      tournamentId: true,
      quadrant: true,
      seed: true,
      assignedTeamId: true,
      playInGameId: true,
      assignedTeam: {
        select: { id: true, fullName: true, abbreviation: true },
      },
      candidates: {
        select: {
          team: {
            select: { id: true, fullName: true, abbreviation: true },
          },
        },
      },
    },
    orderBy: [{ quadrant: "asc" }, { seed: "asc" }],
  });
  return slots;
}
