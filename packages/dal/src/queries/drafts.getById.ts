import type { DbClient } from "@fantasy-madness/db";
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
};

export async function getDraftById(args: { db: DbClient; draftId: string }): Promise<DraftDTO> {
  const draft = await args.db.draft.findUnique({
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
    },
  });

  if (!draft) throw new DomainError("NOT_FOUND", "Draft not found");
  return draft;
}
