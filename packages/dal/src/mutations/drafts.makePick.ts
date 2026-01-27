import type { DbClient } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";
import { mapPrismaError } from "../errors/mapPrismaError.js";

export type MakePickInput = {
  draftId: string;
  userId: string;
  slotId: string;
};

export type MakePickResult = {
  pickId: string;
  overallPickNo: number;
};

export async function makePick(args: {
  db: DbClient;
  input: MakePickInput;
}): Promise<MakePickResult> {
  const { db, input } = args;

  try {
    const draft = await (db as any).draft.findUnique({
      where: { id: input.draftId },
      select: {
        id: true,
        status: true,
        draftType: true,
        rosterSize: true,
        participants: {
          select: { userId: true, pickOrder: true },
          orderBy: { pickOrder: "asc" },
        },
        picks: {
          select: { slotId: true, userId: true, overallPickNo: true },
          orderBy: { overallPickNo: "desc" },
          take: 1,
        },
        _count: { select: { picks: true } },
      },
    });

    if (!draft) throw new DomainError("NOT_FOUND", "Draft not found");
    if (draft.status !== "DRAFTING") {
      throw new DomainError("INVALID_STATE", "Draft is not in progress");
    }

    // Check if user is a participant
    const participant = draft.participants.find((p: any) => p.userId === input.userId);
    if (!participant) {
      throw new DomainError("UNAUTHORIZED", "You are not a participant in this draft");
    }

    // Check if slot is already picked
    const existingPick = await (db as any).draftPick.findFirst({
      where: { draftId: input.draftId, slotId: input.slotId },
    });
    if (existingPick) {
      throw new DomainError("CONFLICT", "This slot has already been drafted");
    }

    // Calculate whose turn it is (snake draft)
    const totalPicks = draft._count.picks;
    const numParticipants = draft.participants.length;
    const round = Math.floor(totalPicks / numParticipants);
    const positionInRound = totalPicks % numParticipants;

    const isReverseRound = round % 2 === 1;
    const expectedPickOrder = isReverseRound
      ? numParticipants - positionInRound
      : positionInRound + 1;

    if (participant.pickOrder !== expectedPickOrder) {
      throw new DomainError("INVALID_STATE", "It's not your turn to pick");
    }

    // Create the pick
    const overallPickNo = totalPicks + 1;
    const rosterSlot = Math.floor((overallPickNo - 1) / numParticipants) + 1;

    const pick = await (db as any).draftPick.create({
      data: {
        draftId: input.draftId,
        userId: input.userId,
        slotId: input.slotId,
        overallPickNo,
        rosterSlot,
      },
      select: { id: true, overallPickNo: true },
    });

    // Check if draft is complete
    const totalExpectedPicks = numParticipants * draft.rosterSize;
    if (overallPickNo >= totalExpectedPicks) {
      await (db as any).draft.update({
        where: { id: input.draftId },
        data: { status: "COMPLETE" },
      });
    }

    return {
      pickId: pick.id,
      overallPickNo: pick.overallPickNo,
    };
  } catch (e) {
    throw mapPrismaError(e);
  }
}
