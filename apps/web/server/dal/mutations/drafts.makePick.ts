import type { DbClient } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";
import { mapPrismaError } from "../errors/mapPrismaError";

export type MakePickInput = {
  draftId: string;
  userId: string;
  slotId: string;
  isAutoPick?: boolean;
};

export type MakePickResult = {
  pickId: string;
  overallPickNo: number;
  nextPickerUserId: string | null;
  nextDeadlineAt: Date | null;
  isDraftComplete: boolean;
};

export async function makePick(args: {
  db: DbClient;
  input: MakePickInput;
}): Promise<MakePickResult> {
  const { db, input } = args;

  try {
    return await (db as any).$transaction(async (tx: any) => {
      // 1. Fetch draft with participants and current picks
      const draft = await tx.draft.findUnique({
        where: { id: input.draftId },
        select: {
          id: true,
          status: true,
          draftType: true,
          rosterSize: true,
          pickTimerSec: true,
          participants: {
            select: { userId: true, pickOrder: true },
            orderBy: { pickOrder: "asc" },
          },
          _count: { select: { picks: true } },
        },
      });

      if (!draft) throw new DomainError("NOT_FOUND", "Draft not found");
      if (draft.status !== "DRAFTING") {
        throw new DomainError("INVALID_STATE", "Draft is not in progress");
      }

      // 2. Check if user is a participant
      const participant = draft.participants.find((p: any) => p.userId === input.userId);
      if (!participant) {
        throw new DomainError("UNAUTHORIZED", "You are not a participant in this draft");
      }

      // 3. Check if slot is already picked
      const existingPick = await tx.draftPick.findFirst({
        where: { draftId: input.draftId, slotId: input.slotId },
      });
      if (existingPick) {
        throw new DomainError("CONFLICT", "This slot has already been drafted");
      }

      // 4. Calculate whose turn it is (snake draft)
      const totalPicks = draft._count.picks;
      const numParticipants = draft.participants.length;
      const round = Math.floor(totalPicks / numParticipants);
      const positionInRound = totalPicks % numParticipants;

      const isReverseRound = round % 2 === 1;
      const expectedPickOrder = isReverseRound
        ? numParticipants - positionInRound
        : positionInRound + 1;

      // Allow auto-picks to bypass turn validation
      if (!input.isAutoPick && participant.pickOrder !== expectedPickOrder) {
        throw new DomainError("INVALID_STATE", "It's not your turn to pick");
      }

      // 5. Create the pick
      const overallPickNo = totalPicks + 1;
      const rosterSlot = Math.floor((overallPickNo - 1) / numParticipants) + 1;

      const pick = await tx.draftPick.create({
        data: {
          draftId: input.draftId,
          userId: input.userId,
          slotId: input.slotId,
          overallPickNo,
          rosterSlot,
          isAutoPick: input.isAutoPick ?? false,
        },
        select: { id: true, overallPickNo: true },
      });

      // 6. Check if draft is complete
      const totalExpectedPicks = numParticipants * draft.rosterSize;
      const isDraftComplete = overallPickNo >= totalExpectedPicks;

      if (isDraftComplete) {
        await tx.draft.update({
          where: { id: input.draftId },
          data: { status: "COMPLETE" },
        });
        // Delete timer
        await tx.draftTurnTimer.deleteMany({ where: { draftId: input.draftId } });

        return {
          pickId: pick.id,
          overallPickNo: pick.overallPickNo,
          nextPickerUserId: null,
          nextDeadlineAt: null,
          isDraftComplete: true,
        };
      }

      // 7. Calculate next picker and update timer
      let nextPickerUserId: string | null = null;
      let nextDeadlineAt: Date | null = null;

      const nextPickNumber = overallPickNo + 1;
      const nextRound = Math.floor((nextPickNumber - 1) / numParticipants);
      const nextPositionInRound = (nextPickNumber - 1) % numParticipants;
      const nextIsReverseRound = nextRound % 2 === 1;
      const nextPickOrder = nextIsReverseRound
        ? numParticipants - nextPositionInRound
        : nextPositionInRound + 1;

      const nextPicker = draft.participants.find((p: any) => p.pickOrder === nextPickOrder);
      nextPickerUserId = nextPicker?.userId ?? null;

      if (draft.pickTimerSec && nextPickerUserId) {
        const now = new Date();
        nextDeadlineAt = new Date(now.getTime() + draft.pickTimerSec * 1000);

        await tx.draftTurnTimer.upsert({
          where: { draftId: input.draftId },
          create: {
            draftId: input.draftId,
            turnStartedAt: now,
            currentPickNumber: nextPickNumber,
            deadlineAt: nextDeadlineAt,
          },
          update: {
            turnStartedAt: now,
            currentPickNumber: nextPickNumber,
            deadlineAt: nextDeadlineAt,
            timerPausedAt: null, // Clear any pause
          },
        });
      } else {
        // No timer or draft complete - delete timer if exists
        await tx.draftTurnTimer.deleteMany({ where: { draftId: input.draftId } });
      }

      return {
        pickId: pick.id,
        overallPickNo: pick.overallPickNo,
        nextPickerUserId,
        nextDeadlineAt,
        isDraftComplete: false,
      };
    });
  } catch (e) {
    throw mapPrismaError(e);
  }
}
