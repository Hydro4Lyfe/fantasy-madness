import type { DbClient } from "@fantasy-madness/db";
import type { Prisma } from "@prisma/client";

export type ExistingGameLite = {
  id: string;
  status: string;
  isPlayIn: boolean;
  winnerTeamId: number | null;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeScore: number | null;
  awayScore: number | null;
  finalizedAt: Date | null;
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
      homeScore: true,
      awayScore: true,
      finalizedAt: true,
    },
  });
}

export type UpsertGameArgs = {
  db: DbClient;
  gameId: string;
  tournamentId: string;
  round: number | null;
  bracketLocation: number | null;
  isPlayIn: boolean;
  scheduledAt: Date | null;
  status: string;
  periodDetail: string | null;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeScore: number | null;
  awayScore: number | null;
  winnerTeamId: number | null;
  finalizedAt: Date | null;
  payloadRaw: Prisma.InputJsonValue;
};

export async function upsertGame(args: UpsertGameArgs): Promise<void> {
  await args.db.game.upsert({
    where: { id: args.gameId },
    create: {
      id: args.gameId,
      tournamentId: args.tournamentId,
      round: args.round,
      bracketLocation: args.bracketLocation,
      isPlayIn: args.isPlayIn,
      scheduledAt: args.scheduledAt,
      status: args.status,
      periodDetail: args.periodDetail,
      homeTeamId: args.homeTeamId,
      awayTeamId: args.awayTeamId,
      homeScore: args.homeScore,
      awayScore: args.awayScore,
      winnerTeamId: args.winnerTeamId,
      finalizedAt: args.finalizedAt,
      payloadRaw: args.payloadRaw,
    },
    update: {
      round: args.round ?? undefined,
      bracketLocation: args.bracketLocation ?? undefined,
      isPlayIn: args.isPlayIn,
      scheduledAt: args.scheduledAt ?? undefined,
      status: args.status,
      periodDetail: args.periodDetail ?? undefined,
      homeTeamId: args.homeTeamId ?? undefined,
      awayTeamId: args.awayTeamId ?? undefined,
      homeScore: args.homeScore ?? undefined,
      awayScore: args.awayScore ?? undefined,
      winnerTeamId: args.winnerTeamId ?? undefined,
      finalizedAt: args.finalizedAt,
      payloadRaw: args.payloadRaw,
    },
  });
}
