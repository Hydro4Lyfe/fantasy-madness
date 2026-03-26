import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";

type LeaderRow = {
  rank: number;
  name: string;
  image: string | null;
  points: number;
};

export type GlobalContestOverviewDTO = {
  contestId: string;
  tournamentId: string;
  tournamentName: string;
  seasonYear: number;
  tournamentStartAt: string | null;
  lockAt: string | null;
  isOpen: boolean;
  bracketLocked: boolean;
  totalEntries: number;
  hasEntered: boolean;
  yourRank: number | null;
  yourPoints: number;
  topPlayers: LeaderRow[];
};

export async function getGlobalContestOverview(args: {
  db?: DbClient;
  userId: string;
}): Promise<GlobalContestOverviewDTO | null> {
  const db = (args.db ?? prisma) as any;

  const contest = await db.globalContest.findFirst({
    where: { status: { in: ["OPEN", "LOCKED"] } },
    select: {
      id: true,
      status: true,
      lockAt: true,
      tournamentId: true,
      tournament: {
        select: {
          name: true,
          seasonYear: true,
          startDate: true,
          syncState: true,
        },
      },
      entries: {
        select: {
          userId: true,
          createdAt: true,
          user: { select: { username: true, name: true, image: true } },
          score: { select: { score: true } },
          picks: {
            select: {
              slot: {
                select: {
                  seed: true,
                  assignedTeamId: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: [{ lockAt: "asc" }, { createdAt: "asc" }],
  });

  if (!contest) {
    return null;
  }

  const now = Date.now();
  const lockAtMs = contest.lockAt?.getTime() ?? null;
  const isOpen = contest.status === "OPEN" && (lockAtMs === null || lockAtMs > now);

  const BRACKET_LOCKED_STATES = new Set(["BRACKET_LOCKED", "LIVE", "COMPLETED"]);
  const bracketLocked = BRACKET_LOCKED_STATES.has(
    String(contest.tournament?.syncState ?? "")
  );

  // Fetch team stats for on-the-fly score calculation
  const teamStats = await db.teamTournamentStats.findMany({
    where: { tournamentId: contest.tournamentId },
    select: { teamId: true, wins: true },
  });
  const winsMap = new Map<string, number>(
    teamStats.map((ts: any) => [ts.teamId, ts.wins])
  );

  const leaderboard = contest.entries
    .map((entry: any) => {
      const calculatedScore = entry.picks.reduce((sum: number, p: any) => {
        const wins = p.slot.assignedTeamId ? (winsMap.get(p.slot.assignedTeamId) ?? 0) : 0;
        return sum + p.slot.seed * wins;
      }, 0);

      return {
        userId: entry.userId,
        name: entry.user?.username ?? entry.user?.name ?? "Anonymous",
        image: (entry.user?.image as string | null) ?? null,
        points: entry.score?.score != null ? Number(entry.score.score) : calculatedScore,
        createdAt: entry.createdAt as Date,
      };
    })
    .sort((a: any, b: any) => {
      if (b.points !== a.points) return b.points - a.points;
      return a.createdAt.getTime() - b.createdAt.getTime();
    })
    .map((entry: any, index: number, arr: any[]) => {
      const prev = arr[index - 1];
      const rank = index === 0 ? 1 : entry.points === prev.points ? prev.rank : index + 1;
      return { ...entry, rank };
    });

  const yourRow = leaderboard.find((row: any) => row.userId === args.userId) ?? null;

  return {
    contestId: contest.id,
    tournamentId: contest.tournamentId,
    tournamentName: contest.tournament?.name ?? "Global Championship",
    seasonYear: contest.tournament?.seasonYear ?? new Date().getFullYear(),
    tournamentStartAt: contest.tournament?.startDate?.toISOString() ?? null,
    lockAt: contest.lockAt?.toISOString() ?? null,
    isOpen,
    bracketLocked,
    totalEntries: contest.entries.length,
    hasEntered: yourRow !== null,
    yourRank: yourRow?.rank ?? null,
    yourPoints: yourRow?.points ?? 0,
    topPlayers: leaderboard.slice(0, 10).map((row: any) => ({
      rank: row.rank,
      name: row.name,
      image: row.image,
      points: row.points,
    })),
  };
}
