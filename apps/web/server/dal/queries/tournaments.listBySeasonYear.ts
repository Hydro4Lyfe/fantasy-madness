import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";

export type TournamentListRow = {
  id: string;
  seasonYear: number;
  name: string;
  syncState: string;
  startDate: Date | null;
  endDate: Date | null;
};

export async function listTournaments(args: { db?: DbClient; limit?: number } = {}): Promise<TournamentListRow[]> {
  const db = (args.db ?? prisma) as any;
  const limit = args.limit ?? 20;

  const rows = await db.tournament.findMany({
    take: limit,
    orderBy: { seasonYear: "desc" },
    select: { id: true, seasonYear: true, name: true, syncState: true, startDate: true, endDate: true },
  });

  return rows.map((t: any) => ({
    id: t.id,
    seasonYear: t.seasonYear,
    name: t.name,
    syncState: String(t.syncState),
    startDate: t.startDate ?? null,
    endDate: t.endDate ?? null,
  }));
}
