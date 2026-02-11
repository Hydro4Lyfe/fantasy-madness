import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";

export type LeagueByInviteCode = {
  id: string;
  name: string;
  status: string;
  isPrivate: boolean;
  maxParticipants: number | null;
  participantCount: number;
  tournamentName: string;
  tournamentYear: number;
  hostName: string | null;
  isAlreadyJoined: boolean;
  isBanned: boolean;
} | null;

export async function getLeagueByInviteCode(args: {
  db?: DbClient;
  inviteCode: string;
  userId?: string;
}): Promise<LeagueByInviteCode> {
  const db = (args.db ?? prisma) as any;

  const league = await db.league.findUnique({
    where: { inviteCode: args.inviteCode },
    select: {
      id: true,
      name: true,
      status: true,
      isPrivate: true,
      maxParticipants: true,
      tournament: {
        select: { name: true, seasonYear: true },
      },
      entries: {
        select: {
          userId: true,
          isHost: true,
          user: { select: { username: true, name: true } },
        },
      },
      bans: args.userId
        ? {
            where: { userId: args.userId },
            select: { id: true },
          }
        : false,
    },
  });

  if (!league) return null;

  const host = league.entries.find((e: any) => e.isHost);
  const isAlreadyJoined = args.userId
    ? league.entries.some((e: any) => e.userId === args.userId)
    : false;
  const isBanned = args.userId && league.bans ? league.bans.length > 0 : false;

  return {
    id: league.id,
    name: league.name,
    status: String(league.status),
    isPrivate: league.isPrivate,
    maxParticipants: league.maxParticipants,
    participantCount: league.entries.length,
    tournamentName: league.tournament.name,
    tournamentYear: league.tournament.seasonYear,
    hostName: host?.user?.username ?? host?.user?.name ?? null,
    isAlreadyJoined,
    isBanned,
  };
}
