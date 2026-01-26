import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";

export type StartDraftInput = {
  draftId: string;
  userId: string; // must be host
};

export async function startDraft(args: {
  db?: DbClient;
  input: StartDraftInput;
}): Promise<{ success: boolean }> {
  const db = (args.db ?? prisma) as any;
  const { draftId, userId } = args.input;

  // Verify user is host
  const participant = await db.draftParticipant.findFirst({
    where: { draftId, userId, isHost: true },
  });

  if (!participant) {
    throw new DomainError("UNAUTHORIZED", "Only the host can start the draft");
  }

  // Get draft with participants
  const draft = await db.draft.findUnique({
    where: { id: draftId },
    include: {
      _count: { select: { participants: true } },
    },
  });

  if (!draft) {
    throw new DomainError("NOT_FOUND", "Draft not found");
  }

  if (draft.status !== "OPEN") {
    throw new DomainError("INVALID_STATE", "Draft has already started or completed");
  }

  if (draft._count.participants < 2) {
    throw new DomainError("INVALID_STATE", "Need at least 2 participants to start");
  }

  await db.draft.update({
    where: { id: draftId },
    data: { status: "DRAFTING" },
  });

  return { success: true };
}
