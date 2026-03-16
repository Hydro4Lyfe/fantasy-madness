import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";

export type DraftPickResultDTO = {
  slotId: string;
  teamId: number | null;
  teamName: string | null;
  seed: number;
  quadrant: number;
  wins: number;
  pickScore: number;
  overallPickNo: number;
  isAutoPick: boolean;
};

export type DraftParticipantResultDTO = {
  userId: string;
  userName: string | null;
  userImage: string | null;
  pickOrder: number;
  isHost: boolean;
  totalScore: number;
  picks: DraftPickResultDTO[];
  rank: number;
};

export type DraftResultsDTO = {
  id: string;
  name: string;
  status: string;
  draftType: string;
  rosterSize: number;
  tournamentId: string;
  tournamentName: string;
  seasonYear: number;
  participants: DraftParticipantResultDTO[];
};

export async function getDraftResults(args: {
  db?: DbClient;
  draftId: string;
}): Promise<DraftResultsDTO> {
  const db = (args.db ?? prisma) as any;

  const draft = await db.draft.findUnique({
    where: { id: args.draftId },
    select: {
      id: true,
      name: true,
      status: true,
      draftType: true,
      rosterSize: true,
      tournamentId: true,
      tournament: {
        select: {
          name: true,
          seasonYear: true,
        },
      },
      participants: {
        select: {
          userId: true,
          pickOrder: true,
          isHost: true,
          user: {
            select: {
              username: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { pickOrder: "asc" },
      },
      picks: {
        select: {
          userId: true,
          slotId: true,
          overallPickNo: true,
          isAutoPick: true,
          slot: {
            select: {
              seed: true,
              quadrant: true,
              assignedTeamId: true,
              assignedTeam: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: { overallPickNo: "asc" },
      },
      scores: {
        select: {
          userId: true,
          score: true,
        },
      },
    },
  });

  if (!draft) throw new DomainError("NOT_FOUND", "Draft not found");

  // Get team stats for all teams in this tournament
  const teamStats = await db.teamTournamentStats.findMany({
    where: { tournamentId: draft.tournamentId },
    select: {
      teamId: true,
      wins: true,
      teamScore: true,
    },
  });

  const teamStatsMap = new Map<string, { wins: number; teamScore: number | null }>(
    teamStats.map((ts: any) => [ts.teamId, { wins: ts.wins, teamScore: ts.teamScore }])
  );

  // Build participant results with scores
  const participantsWithScores = draft.participants.map((p: any) => {
    const userPicks = draft.picks
      .filter((pick: any) => pick.userId === p.userId)
      .map((pick: any) => {
        const teamId = pick.slot.assignedTeamId;
        const stats = teamId ? teamStatsMap.get(teamId) : null;
        const wins = stats?.wins ?? 0;
        const pickScore = pick.slot.seed * wins;

        return {
          slotId: pick.slotId,
          teamId: teamId ?? null,
          teamName: pick.slot.assignedTeam?.fullName ?? null,
          seed: pick.slot.seed,
          quadrant: pick.slot.quadrant,
          wins,
          pickScore,
          overallPickNo: pick.overallPickNo,
          isAutoPick: pick.isAutoPick,
        };
      });

    const draftScore = draft.scores.find((s: any) => s.userId === p.userId);
    const totalScore = draftScore?.score ?? userPicks.reduce((sum: number, pick: any) => sum + pick.pickScore, 0);

    return {
      userId: p.userId,
      userName: p.user?.username ?? p.user?.name ?? null,
      userImage: p.user?.image ?? null,
      pickOrder: p.pickOrder,
      isHost: p.isHost,
      totalScore,
      picks: userPicks,
      rank: 0, // Will be assigned after sorting
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
    id: draft.id,
    name: draft.name,
    status: String(draft.status),
    draftType: String(draft.draftType),
    rosterSize: draft.rosterSize,
    tournamentId: draft.tournamentId,
    tournamentName: draft.tournament?.name ?? "Tournament",
    seasonYear: draft.tournament?.seasonYear ?? new Date().getFullYear(),
    participants: participantsWithScores,
  };
}
