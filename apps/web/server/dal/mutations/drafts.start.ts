import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";

export type StartDraftInput = {
  draftId: string;
  userId: string; // must be host
};

export type StartDraftResult = {
  success: boolean;
  firstPickerUserId: string;
  firstDeadlineAt: Date | null;
};

export async function startDraft(args: {
  db?: DbClient;
  input: StartDraftInput;
}): Promise<StartDraftResult> {
  const db = (args.db ?? prisma) as any;
  const { draftId, userId } = args.input;

  return await db.$transaction(async (tx: any) => {
    // 1. Verify user is host
    const participant = await tx.draftParticipant.findFirst({
      where: { draftId, userId, isHost: true },
    });

    if (!participant) {
      throw new DomainError("UNAUTHORIZED", "Only the host can start the draft");
    }

    // 2. Get draft with participants
    const draft = await tx.draft.findUnique({
      where: { id: draftId },
      include: {
        participants: {
          orderBy: { pickOrder: "asc" },
        },
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

    // 3. Update draft status
    await tx.draft.update({
      where: { id: draftId },
      data: { status: "DRAFTING" },
    });

    // 4. Initialize timer if enabled
    let firstDeadlineAt: Date | null = null;
    const firstPicker = draft.participants.find((p: any) => p.pickOrder === 1);

    if (draft.pickTimerSec && firstPicker) {
      const now = new Date();
      firstDeadlineAt = new Date(now.getTime() + draft.pickTimerSec * 1000);

      await tx.draftTurnTimer.create({
        data: {
          draftId,
          turnStartedAt: now,
          currentPickNumber: 1,
          deadlineAt: firstDeadlineAt,
        },
      });
    }

    return {
      success: true,
      firstPickerUserId: firstPicker?.userId ?? draft.participants[0].userId,
      firstDeadlineAt,
    };
  });
}
