import type { DbClient } from "@fantasy-madness/db";
import { JoinDraftInputSchema, type JoinDraftInput, DomainError } from "@fantasy-madness/domain";
import { Prisma } from "@prisma/client";
import { mapPrismaError } from "../errors/mapPrismaError.js";

export type JoinDraftResult = { draftId: string; pickOrder: number };

export async function joinDraft(args: { db: DbClient; input: JoinDraftInput }): Promise<JoinDraftResult> {
  const input = JoinDraftInputSchema.parse(args.input);
  const db = args.db;

  try {
    // IMPORTANT: if `db` is already a tx, $transaction still works with PrismaClient but not with TransactionClient.
    // So we only run a transaction if we have a PrismaClient.
    const run = async (tx: any) => {
      // 1) idempotent: already joined?
      const existing = await tx.draftParticipant.findUnique({
        where: { draftId_userId: { draftId: input.draftId, userId: input.userId } },
        select: { pickOrder: true },
      });
      if (existing) return { draftId: input.draftId, pickOrder: existing.pickOrder };

      // 2) (optional) check draft joinable
      const draft = await tx.draft.findUnique({
        where: { id: input.draftId },
        select: { id: true, lockAt: true, rosterSize: true },
      });
      if (!draft) throw new DomainError("NOT_FOUND", "Draft not found");
      if (draft.lockAt && draft.lockAt <= new Date()) throw new DomainError("INVALID_STATE", "Draft is locked");

      // 3) claim next pickOrder safely
      // We compute "next = currentCount + 1". Concurrency is handled by unique(draftId, pickOrder).
      // If two pods race, one insert will fail with P2002 and we retry.
      for (let attempt = 0; attempt < 10; attempt++) {
        const count = await tx.draftParticipant.count({ where: { draftId: input.draftId } });
        const nextPickOrder = count + 1;

        // Optional capacity guard if rosterSize is your max participants
        if (draft.rosterSize && nextPickOrder > draft.rosterSize) {
          throw new DomainError("DRAFT_FULL", "Draft is full");
        }

        try {
          const created = await tx.draftParticipant.create({
            data: {
              draftId: input.draftId,
              userId: input.userId,
              pickOrder: nextPickOrder,

              // ---- FILL OTHER REQUIRED FIELDS HERE ----
              // Examples (only include what your schema requires):
              // role: "PLAYER",
              // joinedAt: new Date(),
              // isOwner: false,
              // status: "ACTIVE",
            },
            select: { pickOrder: true },
          });

          return { draftId: input.draftId, pickOrder: created.pickOrder };
        } catch (e) {
          // If pickOrder collision, retry loop
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
          throw e;
        }
      }

      throw new DomainError("CONFLICT", "Could not claim a pickOrder after retries");
    };

    // If `db` has $transaction (PrismaClient), use it; otherwise assume we're already in a tx
    const maybePrismaClient = db as any;
    if (typeof maybePrismaClient.$transaction === "function") {
      return await maybePrismaClient.$transaction((tx: any) => run(tx));
    }
    return await run(db as any);
  } catch (e) {
    throw mapPrismaError(e);
  }
}
