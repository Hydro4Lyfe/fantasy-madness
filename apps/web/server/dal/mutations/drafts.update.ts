import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";

export type UpdateDraftInput = {
  draftId: string;
  userId: string; // must be host
  name?: string;
  rosterSize?: number;
  pickTimerSec?: number | null;
  startAt?: Date | null;
};

export async function updateDraft(args: {
  db?: DbClient;
  input: UpdateDraftInput;
}): Promise<{ success: boolean }> {
  const db = (args.db ?? prisma) as any;
  const { draftId, userId, ...updates } = args.input;

  // Verify user is host
  const participant = await db.draftParticipant.findFirst({
    where: { draftId, userId, isHost: true },
  });

  if (!participant) {
    throw new DomainError("UNAUTHORIZED", "Only the host can update draft settings");
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
    throw new DomainError("INVALID_STATE", "Cannot update draft after it has started");
  }

  await db.draft.update({
    where: { id: draftId },
    data: updates,
  });

  return { success: true };
}
