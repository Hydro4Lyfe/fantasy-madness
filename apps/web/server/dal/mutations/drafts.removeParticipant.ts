import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";

export type RemoveParticipantInput = {
  draftId: string;
  hostUserId: string; // must be host
  participantUserId: string; // user to remove
};

export async function removeParticipant(args: {
  db?: DbClient;
  input: RemoveParticipantInput;
}): Promise<{ success: boolean }> {
  const db = (args.db ?? prisma) as any;
  const { draftId, hostUserId, participantUserId } = args.input;

  // Verify caller is host
  const hostParticipant = await db.draftParticipant.findFirst({
    where: { draftId, userId: hostUserId, isHost: true },
  });

  if (!hostParticipant) {
    throw new DomainError("UNAUTHORIZED", "Only the host can remove participants");
  }

  // Can't remove yourself as host
  if (hostUserId === participantUserId) {
    throw new DomainError("INVALID_STATE", "Host cannot remove themselves");
  }

  // Verify draft is still open
  const draft = await db.draft.findUnique({
    where: { id: draftId },
    select: { status: true },
  });

  if (!draft) {
    throw new DomainError("NOT_FOUND", "Draft not found");
  }

  if (draft.status !== "OPEN") {
    throw new DomainError("INVALID_STATE", "Cannot remove participants after draft has started");
  }

  // Remove the participant
  await db.draftParticipant.deleteMany({
    where: { draftId, userId: participantUserId },
  });

  // Reorder remaining participants
  const remaining = await db.draftParticipant.findMany({
    where: { draftId },
    orderBy: { pickOrder: "asc" },
  });

  for (let i = 0; i < remaining.length; i++) {
    await db.draftParticipant.update({
      where: { draftId_userId: { draftId, userId: remaining[i].userId } },
      data: { pickOrder: i + 1 },
    });
  }

  return { success: true };
}
