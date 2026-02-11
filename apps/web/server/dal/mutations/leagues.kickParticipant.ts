import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";

export type KickLeagueParticipantInput = {
  leagueId: string;
  hostUserId: string;
  participantUserId: string;
};

export async function kickLeagueParticipant(args: {
  db?: DbClient;
  input: KickLeagueParticipantInput;
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
      "Only the host can kick participants"
    );
  }

  // Can't kick yourself
  if (hostUserId === participantUserId) {
    throw new DomainError("INVALID_STATE", "Host cannot kick themselves");
  }

  // Verify league is still open
  const league = await db.league.findUnique({
    where: { id: leagueId },
    select: { status: true },
  });

  if (!league) {
    throw new DomainError("NOT_FOUND", "League not found");
  }

  if (league.status !== "OPEN") {
    throw new DomainError(
      "INVALID_STATE",
      "Cannot kick participants after league has locked"
    );
  }

  // Find and delete the participant's entry
  const participantEntry = await db.leagueEntry.findUnique({
    where: { leagueId_userId: { leagueId, userId: participantUserId } },
    select: { id: true },
  });

  if (!participantEntry) {
    throw new DomainError("NOT_FOUND", "Participant not found in this league");
  }

  // Delete the entry (cascades to picks and score)
  await db.leagueEntry.delete({
    where: { id: participantEntry.id },
  });

  return { success: true };
}
