import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";

export type PublicDraftListRow = {
  id: string;
  name: string;
  status: string;
  draftType: string;
  tournamentId: string;
  tournamentName: string;
  tournamentYear: number;
  rosterSize: number;
  isFeatured: boolean;
  pickTimerSec: number | null;
  startAt: Date | null;
  participantCount: number;
  hostName: string | null;
  createdAt: Date;
};

export async function listPublicDrafts(args: {
  db?: DbClient;
  tournamentId?: string;
}): Promise<PublicDraftListRow[]> {
  const db = (args.db ?? prisma) as any;

  const whereClause: any = {
    isPrivate: false,
    status: "OPEN",
  };

  if (args.tournamentId) {
    whereClause.tournamentId = args.tournamentId;
  }

  const drafts = await db.draft.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      status: true,
      draftType: true,
      tournamentId: true,
      rosterSize: true,
      isFeatured: true,
      pickTimerSec: true,
      startAt: true,
      createdAt: true,
      tournament: {
        select: { name: true, seasonYear: true },
      },
      participants: {
        select: {
          isHost: true,
          user: { select: { username: true, name: true } },
        },
      },
      _count: { select: { participants: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return drafts.map((d: any) => {
    const host = d.participants.find((p: any) => p.isHost);

    return {
      id: d.id,
      name: d.name,
      status: String(d.status),
      draftType: String(d.draftType),
      tournamentId: d.tournamentId,
      tournamentName: d.tournament?.name ?? "Tournament",
      tournamentYear: d.tournament?.seasonYear ?? 2025,
      rosterSize: d.rosterSize,
      isFeatured: d.isFeatured,
      pickTimerSec: d.pickTimerSec,
      startAt: d.startAt,
      participantCount: d._count?.participants ?? 0,
      hostName: host?.user?.username ?? host?.user?.name ?? null,
      createdAt: d.createdAt,
    };
  });
}
