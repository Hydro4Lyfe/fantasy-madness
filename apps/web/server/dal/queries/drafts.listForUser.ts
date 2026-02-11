import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";

export type DraftListRow = {
  id: string;
  name: string;
  status: string;
  tournamentId: string;
  tournamentName: string;
  tournamentYear: number;
  isPrivate: boolean;
  rosterSize: number;
  pickTimerSec: number | null;
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
          isPrivate: true,
          rosterSize: true,
          pickTimerSec: true,
          lockAt: true,
          tournament: {
            select: { name: true, seasonYear: true },
          },
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
    tournamentName: r.draft.tournament?.name ?? "Tournament",
    tournamentYear: r.draft.tournament?.seasonYear ?? 2025,
    isPrivate: r.draft.isPrivate,
    rosterSize: r.draft.rosterSize,
    pickTimerSec: r.draft.pickTimerSec,
    lockAt: r.draft.lockAt,
    participantCount: r.draft._count?.participants ?? 0,
  }));
}
