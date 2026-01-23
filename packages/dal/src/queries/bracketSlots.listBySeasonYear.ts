import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";

export type BracketSlotDTO = {
  id: string;
  tournamentId: string;
  quadrant: number;
  seed: number;
  assignedTeamId: string | null;
  playInGameId: string | null;
};

export async function listBracketSlotsBySeasonYear(args: { db?: DbClient; seasonYear: number }): Promise<BracketSlotDTO[]> {
  const db = (args.db ?? prisma) as any;

  const t = await db.tournament.findFirst({ where: { seasonYear: args.seasonYear }, select: { id: true } });
  if (!t) return [];

  const slots = await db.bracketSlot.findMany({
    where: { tournamentId: t.id },
    orderBy: [{ quadrant: "asc" }, { seed: "asc" }],
    select: {
      id: true,
      tournamentId: true,
      quadrant: true,
      seed: true,
      assignedTeamId: true,
      playInGameId: true,
    },
  });

  return slots.map((s: any) => ({
    id: s.id,
    tournamentId: s.tournamentId,
    quadrant: Number(s.quadrant),
    seed: Number(s.seed),
    assignedTeamId: s.assignedTeamId ?? null,
    playInGameId: s.playInGameId ?? null,
  }));
}
