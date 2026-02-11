import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";

export type LeaveLeagueInput = {
  leagueId: string;
  userId: string;
};

export async function leaveLeague(args: {
  db?: DbClient;
  input: LeaveLeagueInput;
}): Promise<{ success: boolean }> {
  const db = (args.db ?? prisma) as any;
  const { leagueId, userId } = args.input;

  // Check if user is in the league
  const entry = await db.leagueEntry.findUnique({
    where: { leagueId_userId: { leagueId, userId } },
    select: { id: true, isHost: true },
  });

  if (!entry) {
    throw new DomainError("NOT_FOUND", "You are not a member of this league");
  }

  // Host cannot leave
  if (entry.isHost) {
    throw new DomainError(
      "INVALID_STATE",
      "Host cannot leave the league. Transfer ownership or delete the league instead."
    );
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
      "Cannot leave league after it has locked"
    );
  }

  // Delete the entry (cascades to picks and score)
  await db.leagueEntry.delete({
    where: { id: entry.id },
  });

  return { success: true };
}
