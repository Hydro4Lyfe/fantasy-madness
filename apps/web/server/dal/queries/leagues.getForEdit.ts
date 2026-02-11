import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";

export type LeagueEditParticipant = {
  oduserId: string;
  userName: string | null;
  userImage: string | null;
  isHost: boolean;
  hasCompletedPicks: boolean;
};

export type LeagueBannedUser = {
  userId: string;
  userName: string | null;
  reason: string | null;
  bannedAt: Date;
};

export type LeagueEditDTO = {
  id: string;
  name: string;
  status: string;
  isPrivate: boolean;
  inviteCode: string | null;
  maxParticipants: number | null;
  tournamentId: string;
  tournamentName: string;
  createdAt: Date;
  participants: LeagueEditParticipant[];
  bannedUsers: LeagueBannedUser[];
  isHost: boolean;
};

export async function getLeagueForEdit(args: {
  db?: DbClient;
  leagueId: string;
  userId: string;
}): Promise<LeagueEditDTO> {
  const db = (args.db ?? prisma) as any;

  const league = await db.league.findUnique({
    where: { id: args.leagueId },
    select: {
      id: true,
      name: true,
      status: true,
      isPrivate: true,
      inviteCode: true,
      maxParticipants: true,
      tournamentId: true,
      createdAt: true,
      tournament: { select: { name: true } },
      entries: {
        select: {
          userId: true,
          isHost: true,
          user: { select: { username: true, name: true, image: true } },
          picks: {
            select: { pickNo: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      bans: {
        select: {
          userId: true,
          reason: true,
          bannedAt: true,
          user: { select: { username: true, name: true } },
        },
        orderBy: { bannedAt: "desc" },
      },
    },
  });

  if (!league) {
    throw new DomainError("NOT_FOUND", "League not found");
  }

  // Check if user is a participant
  const userEntry = league.entries.find((e: any) => e.userId === args.userId);

  if (!userEntry) {
    throw new DomainError(
      "UNAUTHORIZED",
      "You are not a participant in this league"
    );
  }

  const participants: LeagueEditParticipant[] = league.entries.map((e: any) => ({
    oduserId: e.userId,
    userName: e.user?.username ?? e.user?.name ?? null,
    userImage: e.user?.image ?? null,
    isHost: e.isHost,
    hasCompletedPicks: e.picks.length === 8,
  }));

  const bannedUsers: LeagueBannedUser[] = league.bans.map((b: any) => ({
    userId: b.userId,
    userName: b.user?.username ?? b.user?.name ?? null,
    reason: b.reason,
    bannedAt: b.bannedAt,
  }));

  return {
    id: league.id,
    name: league.name,
    status: String(league.status),
    isPrivate: league.isPrivate,
    inviteCode: league.inviteCode,
    maxParticipants: league.maxParticipants,
    tournamentId: league.tournamentId,
    tournamentName: league.tournament?.name ?? "Tournament",
    createdAt: league.createdAt,
    participants,
    bannedUsers,
    isHost: userEntry.isHost,
  };
}
