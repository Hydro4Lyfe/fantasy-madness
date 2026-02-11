import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";

export type LeaguePickResultDTO = {
  slotId: string;
  teamName: string | null;
  seed: number;
  quadrant: number;
  wins: number;
  pickScore: number;
  pickNo: number;
};

export type LeagueParticipantResultDTO = {
  userId: string;
  userName: string | null;
  userImage: string | null;
  isHost: boolean;
  totalScore: number;
  picks: LeaguePickResultDTO[];
  rank: number;
  hasCompletedPicks: boolean;
};

export type LeagueLeaderboardDTO = {
  id: string;
  name: string;
  status: string;
  isPrivate: boolean;
  maxParticipants: number | null;
  tournamentId: string;
  tournamentName: string;
  seasonYear: number;
  participants: LeagueParticipantResultDTO[];
};

export async function getLeagueLeaderboard(args: {
  db?: DbClient;
  leagueId: string;
}): Promise<LeagueLeaderboardDTO> {
  const db = (args.db ?? prisma) as any;

  const league = await db.league.findUnique({
    where: { id: args.leagueId },
    select: {
      id: true,
      name: true,
      status: true,
      isPrivate: true,
      maxParticipants: true,
      tournamentId: true,
      tournament: {
        select: {
          name: true,
          seasonYear: true,
        },
      },
      entries: {
        select: {
          userId: true,
          isHost: true,
          user: {
            select: {
              username: true,
              name: true,
              image: true,
            },
          },
          picks: {
            select: {
              pickNo: true,
              slotId: true,
              slot: {
                select: {
                  seed: true,
                  quadrant: true,
                  assignedTeamId: true,
                  assignedTeam: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
            orderBy: { pickNo: "asc" },
          },
          score: {
            select: {
              score: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!league) throw new DomainError("NOT_FOUND", "League not found");

  // Get team stats for all teams in this tournament
  const teamStats = await db.teamTournamentStats.findMany({
    where: { tournamentId: league.tournamentId },
    select: {
      teamId: true,
      wins: true,
      teamScore: true,
    },
  });

  const teamStatsMap = new Map<
    string,
    { wins: number; teamScore: number | null }
  >(
    teamStats.map((ts: any) => [
      ts.teamId,
      { wins: ts.wins, teamScore: ts.teamScore },
    ])
  );

  // Build participant results with scores
  const participantsWithScores = league.entries.map((e: any) => {
    const picks = e.picks.map((p: any) => {
      const teamId = p.slot.assignedTeamId;
      const stats = teamId ? teamStatsMap.get(teamId) : null;
      const wins = stats?.wins ?? 0;
      const pickScore = p.slot.seed * wins;

      return {
        slotId: p.slotId,
        teamName: p.slot.assignedTeam?.name ?? null,
        seed: p.slot.seed,
        quadrant: p.slot.quadrant,
        wins,
        pickScore,
        pickNo: p.pickNo,
      };
    });

    const storedScore = e.score?.score;
    const totalScore =
      storedScore ??
      picks.reduce((sum: number, pick: any) => sum + pick.pickScore, 0);

    return {
      userId: e.userId,
      userName: e.user?.username ?? e.user?.name ?? null,
      userImage: e.user?.image ?? null,
      isHost: e.isHost,
      totalScore,
      picks,
      rank: 0, // Will be assigned after sorting
      hasCompletedPicks: picks.length === 8,
    };
  });

  // Sort by score descending and assign ranks
  participantsWithScores.sort((a: any, b: any) => b.totalScore - a.totalScore);

  let currentRank = 1;
  let previousScore = participantsWithScores[0]?.totalScore ?? 0;

  participantsWithScores.forEach((p: any, index: number) => {
    if (p.totalScore < previousScore) {
      currentRank = index + 1;
    }
    p.rank = currentRank;
    previousScore = p.totalScore;
  });

  return {
    id: league.id,
    name: league.name,
    status: String(league.status),
    isPrivate: league.isPrivate,
    maxParticipants: league.maxParticipants,
    tournamentId: league.tournamentId,
    tournamentName: league.tournament?.name ?? "Tournament",
    seasonYear: league.tournament?.seasonYear ?? new Date().getFullYear(),
    participants: participantsWithScores,
  };
}
