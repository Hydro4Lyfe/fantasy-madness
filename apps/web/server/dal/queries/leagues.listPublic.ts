import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";

export type PublicLeagueListRow = {
  id: string;
  name: string;
  status: string;
  tournamentId: string;
  tournamentName: string;
  tournamentYear: number;
  maxParticipants: number | null;
  participantCount: number;
  hostName: string | null;
  isFull: boolean;
};

export async function listPublicLeagues(args: {
  db?: DbClient;
  tournamentId?: string;
}): Promise<PublicLeagueListRow[]> {
  const db = (args.db ?? prisma) as any;

  const whereClause: any = {
    isPrivate: false,
    status: "OPEN",
  };

  if (args.tournamentId) {
    whereClause.tournamentId = args.tournamentId;
  }

  const leagues = await db.league.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      status: true,
      tournamentId: true,
      maxParticipants: true,
      tournament: {
        select: { name: true, seasonYear: true },
      },
      entries: {
        select: {
          isHost: true,
          user: { select: { username: true, name: true } },
        },
      },
      _count: { select: { entries: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return leagues.map((l: any) => {
    const host = l.entries.find((e: any) => e.isHost);
    const participantCount = l._count?.entries ?? 0;
    const isFull = l.maxParticipants
      ? participantCount >= l.maxParticipants
      : false;

    return {
      id: l.id,
      name: l.name,
      status: String(l.status),
      tournamentId: l.tournamentId,
      tournamentName: l.tournament?.name ?? "Tournament",
      tournamentYear: l.tournament?.seasonYear ?? 2025,
      maxParticipants: l.maxParticipants,
      participantCount,
      hostName: host?.user?.username ?? host?.user?.name ?? null,
      isFull,
    };
  });
}
