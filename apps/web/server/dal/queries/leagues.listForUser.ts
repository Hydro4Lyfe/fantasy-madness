import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";

export type LeagueListRow = {
  id: string;
  name: string;
  status: string;
  tournamentId: string;
  tournamentName: string;
  tournamentYear: number;
  isPrivate: boolean;
  maxParticipants: number | null;
  lockAt: Date | null;
  participantCount: number;
  isHost: boolean;
  hasCompletedPicks: boolean;
};

export async function listLeaguesForUser(args: {
  db?: DbClient;
  userId: string;
}): Promise<LeagueListRow[]> {
  const db = (args.db ?? prisma) as any;

  // Get leagues where user is a participant
  const rows = await db.leagueEntry.findMany({
    where: { userId: args.userId },
    select: {
      isHost: true,
      picks: {
        select: { pickNo: true },
      },
      league: {
        select: {
          id: true,
          name: true,
          status: true,
          tournamentId: true,
          isPrivate: true,
          maxParticipants: true,
          lockAt: true,
          tournament: {
            select: { name: true, seasonYear: true },
          },
          _count: { select: { entries: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((r: any) => ({
    id: r.league.id,
    name: r.league.name,
    status: String(r.league.status),
    tournamentId: r.league.tournamentId,
    tournamentName: r.league.tournament?.name ?? "Tournament",
    tournamentYear: r.league.tournament?.seasonYear ?? 2025,
    isPrivate: r.league.isPrivate,
    maxParticipants: r.league.maxParticipants,
    lockAt: r.league.lockAt,
    participantCount: r.league._count?.entries ?? 0,
    isHost: r.isHost,
    hasCompletedPicks: r.picks.length === 8,
  }));
}
