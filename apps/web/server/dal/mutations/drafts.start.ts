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

    // Check tournament time-based lock (first Round 1 game)
    const tournament = await tx.tournament.findUnique({
      where: { id: draft.tournamentId },
      select: { picksLockAt: true },
    });
    if (tournament?.picksLockAt && tournament.picksLockAt.getTime() <= Date.now()) {
      throw new DomainError("INVALID_STATE", "Cannot start draft after the first round has started");
    }

    if (draft._count.participants < 2) {
      throw new DomainError("INVALID_STATE", "Need at least 2 participants to start");
    }

    // 3. Randomize pick order
    const participantIds = draft.participants.map((p: any) => p.userId);
    // Fisher-Yates shuffle
    for (let i = participantIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [participantIds[i], participantIds[j]] = [participantIds[j], participantIds[i]];
    }
    // Update each participant's pickOrder based on shuffled position
    await Promise.all(
      participantIds.map((uid: string, idx: number) =>
        tx.draftParticipant.update({
          where: { draftId_userId: { draftId, userId: uid } },
          data: { pickOrder: idx + 1 },
        })
      )
    );

    // 4. Update draft status
    await tx.draft.update({
      where: { id: draftId },
      data: { status: "DRAFTING" },
    });

    // 5. Initialize timer if enabled
    let firstDeadlineAt: Date | null = null;
    const firstPicker = participantIds[0]; // pickOrder 1 after shuffle

    if (draft.pickTimerSec) {
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
      firstPickerUserId: firstPicker,
      firstDeadlineAt,
    };
  });
}
