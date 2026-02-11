import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";

export type LeagueDTO = {
  id: string;
  name: string;
  status: string;
  tournamentId: string;
  inviteCode: string | null;
  isPrivate: boolean;
  maxParticipants: number | null;
  lockAt: Date | null;
  participantCount: number;
};

export async function getLeagueById(args: {
  db?: DbClient;
  leagueId: string;
}): Promise<LeagueDTO> {
  const db = (args.db ?? prisma) as any;

  const league = await db.league.findUnique({
    where: { id: args.leagueId },
    select: {
      id: true,
      name: true,
      status: true,
      tournamentId: true,
      inviteCode: true,
      isPrivate: true,
      maxParticipants: true,
      lockAt: true,
      _count: { select: { entries: true } },
    },
  });

  if (!league) throw new DomainError("NOT_FOUND", "League not found");

  return {
    id: league.id,
    name: league.name,
    status: String(league.status),
    tournamentId: league.tournamentId,
    inviteCode: league.inviteCode,
    isPrivate: league.isPrivate,
    maxParticipants: league.maxParticipants,
    lockAt: league.lockAt,
    participantCount: league._count?.entries ?? 0,
  };
}
