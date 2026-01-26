import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";

export type DraftEditParticipant = {
  oduserId: string;
  userName: string | null;
  userImage: string | null;
  pickOrder: number;
  isHost: boolean;
};

export type DraftEditDTO = {
  id: string;
  name: string;
  status: string;
  draftType: string;
  rosterSize: number;
  pickTimerSec: number | null;
  inviteCode: string | null;
  isPrivate: boolean;
  tournamentId: string;
  tournamentName: string;
  createdAt: Date;
  participants: DraftEditParticipant[];
  isHost: boolean;
};

export async function getDraftForEdit(args: {
  db?: DbClient;
  draftId: string;
  userId: string;
}): Promise<DraftEditDTO> {
  const db = (args.db ?? prisma) as any;

  const draft = await db.draft.findUnique({
    where: { id: args.draftId },
    select: {
      id: true,
      name: true,
      status: true,
      draftType: true,
      rosterSize: true,
      pickTimerSec: true,
      inviteCode: true,
      isPrivate: true,
      tournamentId: true,
      createdAt: true,
      tournament: { select: { name: true } },
      participants: {
        select: {
          userId: true,
          pickOrder: true,
          isHost: true,
          user: { select: { name: true, image: true } },
        },
        orderBy: { pickOrder: "asc" },
      },
    },
  });

  if (!draft) {
    throw new DomainError("NOT_FOUND", "Draft not found");
  }

  // Check if user is a participant
  const userParticipant = draft.participants.find(
    (p: any) => p.userId === args.userId
  );

  if (!userParticipant) {
    throw new DomainError("UNAUTHORIZED", "You are not a participant in this draft");
  }

  const participants: DraftEditParticipant[] = draft.participants.map((p: any) => ({
    oduserId: p.userId,
    userName: p.user?.name ?? null,
    userImage: p.user?.image ?? null,
    pickOrder: p.pickOrder,
    isHost: p.isHost,
  }));

  return {
    id: draft.id,
    name: draft.name,
    status: String(draft.status),
    draftType: String(draft.draftType),
    rosterSize: draft.rosterSize,
    pickTimerSec: draft.pickTimerSec,
    inviteCode: draft.inviteCode,
    isPrivate: draft.isPrivate,
    tournamentId: draft.tournamentId,
    tournamentName: draft.tournament?.name ?? "Tournament",
    createdAt: draft.createdAt,
    participants,
    isHost: userParticipant.isHost,
  };
}
