import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";

export type DraftListRow = {
  id: string;
  name: string;
  status: string;
  tournamentId: string;
  lockAt: Date | null;
  participantCount: number;
};

export async function listDraftsForUser(args: { db?: DbClient; userId: string }): Promise<DraftListRow[]> {
  const db = (args.db ?? prisma) as any;

  // Get drafts where user is a participant.
  const rows = await db.draftParticipant.findMany({
    where: { userId: args.userId },
    select: {
      draft: {
        select: {
          id: true,
          name: true,
          status: true,
          tournamentId: true,
          lockAt: true,
          _count: { select: { participants: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((r: any) => ({
    id: r.draft.id,
    name: r.draft.name,
    status: String(r.draft.status),
    tournamentId: r.draft.tournamentId,
    lockAt: r.draft.lockAt,
    participantCount: r.draft._count?.participants ?? 0,
  }));
}
