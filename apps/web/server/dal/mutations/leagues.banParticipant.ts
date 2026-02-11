import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";

export type BanLeagueParticipantInput = {
  leagueId: string;
  hostUserId: string;
  participantUserId: string;
  reason?: string;
};

export async function banLeagueParticipant(args: {
  db?: DbClient;
  input: BanLeagueParticipantInput;
}): Promise<{ success: boolean }> {
  const db = (args.db ?? prisma) as any;
  const { leagueId, hostUserId, participantUserId, reason } = args.input;

  // Verify caller is host
  const hostEntry = await db.leagueEntry.findFirst({
    where: { leagueId, userId: hostUserId, isHost: true },
  });

  if (!hostEntry) {
    throw new DomainError("UNAUTHORIZED", "Only the host can ban participants");
  }

  // Can't ban yourself
  if (hostUserId === participantUserId) {
    throw new DomainError("INVALID_STATE", "Host cannot ban themselves");
  }

  // Verify league exists
  const league = await db.league.findUnique({
    where: { id: leagueId },
    select: { id: true, status: true },
  });

  if (!league) {
    throw new DomainError("NOT_FOUND", "League not found");
  }

  // Check if already banned (idempotent)
  const existingBan = await db.leagueBan.findUnique({
    where: { leagueId_userId: { leagueId, userId: participantUserId } },
  });

  if (existingBan) {
    return { success: true }; // Already banned
  }

  // Create ban record
  await db.leagueBan.create({
    data: {
      leagueId,
      userId: participantUserId,
      bannedById: hostUserId,
      reason: reason ?? null,
    },
  });

  // If league is still open, also kick them (remove entry)
  if (league.status === "OPEN") {
    const participantEntry = await db.leagueEntry.findUnique({
      where: { leagueId_userId: { leagueId, userId: participantUserId } },
      select: { id: true },
    });

    if (participantEntry) {
      await db.leagueEntry.delete({
        where: { id: participantEntry.id },
      });
    }
  }

  return { success: true };
}
