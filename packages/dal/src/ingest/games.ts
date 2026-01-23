import type { DbClient } from "@fantasy-madness/db";
import type { Prisma } from "@prisma/client";

export type ExistingGameLite = {
  id: string;
  status: string;
  isPlayIn: boolean;
  winnerTeamId: string | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homePoints: number | null;
  awayPoints: number | null;
  finalizedAt: Date | null;
  closedAt: Date | null;
};

export async function findExistingGamesLite(args: {
  db: DbClient;
  ids: string[];
}): Promise<ExistingGameLite[]> {
  if (args.ids.length === 0) return [];
  return args.db.game.findMany({
    where: { id: { in: args.ids } },
    select: {
      id: true,
      status: true,
      isPlayIn: true,
      winnerTeamId: true,
      homeTeamId: true,
      awayTeamId: true,
      homePoints: true,
      awayPoints: true,
      finalizedAt: true,
      closedAt: true,
    },
  });
}

export type UpsertGameFromScheduleArgs = {
  db: DbClient;
  gameId: string;
  tournamentId: string;
  round: string | null;
  roundSeq: number | null;
  isPlayIn: boolean;
  scheduledAt: Date | null;
  status: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homePoints: number | null;
  awayPoints: number | null;
  winnerTeamId: string | null;
  finalizedAt: Date | null;
  closedAt: Date | null;
  payloadRaw: Prisma.InputJsonValue;
};

export async function upsertGameFromSchedule(args: UpsertGameFromScheduleArgs): Promise<void> {
  await args.db.game.upsert({
    where: { id: args.gameId },
    create: {
      id: args.gameId,
      tournamentId: args.tournamentId,
      round: args.round,
      roundSeq: args.roundSeq,
      isPlayIn: args.isPlayIn,
      scheduledAt: args.scheduledAt,
      status: args.status,
      homeTeamId: args.homeTeamId,
      awayTeamId: args.awayTeamId,
      homePoints: args.homePoints,
      awayPoints: args.awayPoints,
      winnerTeamId: args.winnerTeamId,
      finalizedAt: args.finalizedAt,
      closedAt: args.closedAt,
      payloadRaw: args.payloadRaw,
    },
    update: {
      round: args.round || undefined,
      roundSeq: args.roundSeq ?? undefined,
      isPlayIn: args.isPlayIn,
      scheduledAt: args.scheduledAt ?? undefined,
      status: args.status,
      homeTeamId: args.homeTeamId ?? undefined,
      awayTeamId: args.awayTeamId ?? undefined,
      homePoints: args.homePoints ?? undefined,
      awayPoints: args.awayPoints ?? undefined,
      winnerTeamId: args.winnerTeamId ?? undefined,
      finalizedAt: args.finalizedAt,
      closedAt: args.closedAt,
      payloadRaw: args.payloadRaw,
    },
  });
}
