import type { DbClient } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";
import { Prisma } from "@prisma/client";
import { mapPrismaError } from "../errors/mapPrismaError";

export type JoinDraftInput = {
  draftId: string;
  userId: string; // NOTE: Prisma User.id is cuid() (text) — not uuid.
  idempotencyKey?: string;
};

export type JoinDraftResult = { draftId: string; pickOrder: number };

function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export async function joinDraft(args: { db: DbClient; input: JoinDraftInput }): Promise<JoinDraftResult> {
  const input = args.input;
  const db = args.db;

  // Minimal validation (avoid rejecting cuid userIds)
  if (!input || typeof input !== "object") throw new DomainError("CONFLICT", "Invalid input");
  if (!input.draftId || !isUuid(String(input.draftId))) throw new DomainError("CONFLICT", "Invalid draftId");
  if (!input.userId || typeof input.userId !== "string" || input.userId.length < 1) {
    throw new DomainError("CONFLICT", "Invalid userId");
  }

  try {
    const run = async (tx: any) => {
      // 1) idempotent: already joined?
      const existing = await tx.draftParticipant.findUnique({
        where: { draftId_userId: { draftId: input.draftId, userId: input.userId } },
        select: { pickOrder: true },
      });
      if (existing) return { draftId: input.draftId, pickOrder: existing.pickOrder };

      // 2) ensure draft exists + joinable
      const draft = await tx.draft.findUnique({
        where: { id: input.draftId },
        select: { id: true, lockAt: true, rosterSize: true },
      });
      if (!draft) throw new DomainError("NOT_FOUND", "Draft not found");
      if (draft.lockAt && draft.lockAt <= new Date()) throw new DomainError("INVALID_STATE", "Draft is locked");

      // 3) claim next pickOrder safely (unique index handles contention)
      for (let attempt = 0; attempt < 10; attempt++) {
        const count = await tx.draftParticipant.count({ where: { draftId: input.draftId } });
        const nextPickOrder = count + 1;

        if (draft.rosterSize && nextPickOrder > draft.rosterSize) {
          throw new DomainError("DRAFT_FULL", "Draft is full");
        }

        try {
          const created = await tx.draftParticipant.create({
            data: {
              draftId: input.draftId,
              userId: input.userId,
              pickOrder: nextPickOrder,
              // isHost defaults false
            },
            select: { pickOrder: true },
          });
          return { draftId: input.draftId, pickOrder: created.pickOrder };
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
          throw e;
        }
      }

      throw new DomainError("CONFLICT", "Could not claim a pickOrder after retries");
    };

    const maybePrismaClient = db as any;
    if (typeof maybePrismaClient.$transaction === "function") {
      return await maybePrismaClient.$transaction((tx: any) => run(tx));
    }
    return await run(db as any);
  } catch (e) {
    throw mapPrismaError(e);
  }
}
