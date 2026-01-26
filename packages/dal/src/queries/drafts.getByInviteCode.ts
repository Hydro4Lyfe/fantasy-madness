import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";

export type DraftByInviteCode = {
  id: string;
  name: string;
  status: string;
  draftType: string;
  rosterSize: number;
  participantCount: number;
  tournamentName: string;
  tournamentYear: number;
  hostName: string | null;
  isAlreadyJoined: boolean;
} | null;

export async function getDraftByInviteCode(args: {
  db?: DbClient;
  inviteCode: string;
  userId?: string;
}): Promise<DraftByInviteCode> {
  const db = (args.db ?? prisma) as any;

  const draft = await db.draft.findUnique({
    where: { inviteCode: args.inviteCode },
    select: {
      id: true,
      name: true,
      status: true,
      draftType: true,
      rosterSize: true,
      tournament: {
        select: { name: true, seasonYear: true },
      },
      participants: {
        select: {
          userId: true,
          isHost: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!draft) return null;

  const host = draft.participants.find((p: any) => p.isHost);
  const isAlreadyJoined = args.userId
    ? draft.participants.some((p: any) => p.userId === args.userId)
    : false;

  return {
    id: draft.id,
    name: draft.name,
    status: String(draft.status),
    draftType: String(draft.draftType),
    rosterSize: draft.rosterSize,
    participantCount: draft.participants.length,
    tournamentName: draft.tournament.name,
    tournamentYear: draft.tournament.seasonYear,
    hostName: host?.user?.name ?? null,
    isAlreadyJoined,
  };
}
