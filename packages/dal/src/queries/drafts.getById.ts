import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";

export type DraftDTO = {
  id: string;
  name: string;
  status: string;
  tournamentId: string;
  inviteCode: string | null;
  draftType: string;
  rosterSize: number;
  isPrivate: boolean;
  pickTimerSec: number | null;
  lockAt: Date | null;
  participantCount?: number;
};

export async function getDraftById(args: { db?: DbClient; draftId: string }): Promise<DraftDTO> {
  const db = (args.db ?? prisma) as any;

  const draft = await db.draft.findUnique({
    where: { id: args.draftId },
    select: {
      id: true,
      name: true,
      status: true,
      tournamentId: true,
      inviteCode: true,
      draftType: true,
      rosterSize: true,
      isPrivate: true,
      pickTimerSec: true,
      lockAt: true,
      _count: { select: { participants: true } },
    },
  });

  if (!draft) throw new DomainError("NOT_FOUND", "Draft not found");

  return {
    id: draft.id,
    name: draft.name,
    status: String(draft.status),
    tournamentId: draft.tournamentId,
    inviteCode: draft.inviteCode,
    draftType: String(draft.draftType),
    rosterSize: draft.rosterSize,
    isPrivate: draft.isPrivate,
    pickTimerSec: draft.pickTimerSec,
    lockAt: draft.lockAt,
    participantCount: draft._count?.participants ?? 0,
  };
}
