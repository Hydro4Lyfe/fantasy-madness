import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";

export type UpdateLeagueInput = {
  leagueId: string;
  userId: string; // must be host
  name?: string;
  isPrivate?: boolean;
  maxParticipants?: number | null;
};

export async function updateLeague(args: {
  db?: DbClient;
  input: UpdateLeagueInput;
}): Promise<{ success: boolean }> {
  const db = (args.db ?? prisma) as any;
  const { leagueId, userId, ...updates } = args.input;

  // Verify user is host
  const entry = await db.leagueEntry.findFirst({
    where: { leagueId, userId, isHost: true },
  });

  if (!entry) {
    throw new DomainError(
      "UNAUTHORIZED",
      "Only the host can update league settings"
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
      "Cannot update league after it has locked"
    );
  }

  // If updating maxParticipants, verify it's not less than current count
  if (updates.maxParticipants !== undefined && updates.maxParticipants !== null) {
    const currentCount = await db.leagueEntry.count({
      where: { leagueId },
    });
    if (updates.maxParticipants < currentCount) {
      throw new DomainError(
        "INVALID_STATE",
        `Cannot set max participants below current count (${currentCount})`
      );
    }
  }

  // Build update data, trimming name if provided
  const updateData: Record<string, unknown> = {};
  if (updates.name !== undefined) {
    updateData.name = updates.name.trim();
  }
  if (updates.isPrivate !== undefined) {
    updateData.isPrivate = updates.isPrivate;
  }
  if (updates.maxParticipants !== undefined) {
    updateData.maxParticipants = updates.maxParticipants;
  }

  if (Object.keys(updateData).length > 0) {
    await db.league.update({
      where: { id: leagueId },
      data: updateData,
    });
  }

  return { success: true };
}
