import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";

export type UnbanLeagueParticipantInput = {
  leagueId: string;
  hostUserId: string;
  participantUserId: string;
};

export async function unbanLeagueParticipant(args: {
  db?: DbClient;
  input: UnbanLeagueParticipantInput;
}): Promise<{ success: boolean }> {
  const db = (args.db ?? prisma) as any;
  const { leagueId, hostUserId, participantUserId } = args.input;

  // Verify caller is host
  const hostEntry = await db.leagueEntry.findFirst({
    where: { leagueId, userId: hostUserId, isHost: true },
  });

  if (!hostEntry) {
    throw new DomainError(
      "UNAUTHORIZED",
      "Only the host can unban participants"
    );
  }

  // Verify league exists
  const league = await db.league.findUnique({
    where: { id: leagueId },
    select: { id: true },
  });

  if (!league) {
    throw new DomainError("NOT_FOUND", "League not found");
  }

  // Check if ban exists
  const ban = await db.leagueBan.findUnique({
    where: { leagueId_userId: { leagueId, userId: participantUserId } },
  });

  if (!ban) {
    return { success: true }; // Not banned, idempotent
  }

  // Delete the ban
  await db.leagueBan.delete({
    where: { id: ban.id },
  });

  return { success: true };
}
