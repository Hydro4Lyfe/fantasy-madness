import {
  LeaderboardsClient,
  type DraftLeaderboard,
  type GlobalLeaderboard,
  type LeagueLeaderboard,
} from "./LeaderboardsClient";
import { requireUserId } from "@/server/auth/guards";
import {
  listDraftsForUser,
  getDraftResults,
  getGlobalContestOverview,
  listLeaguesForUser,
  getLeagueLeaderboard,
} from "@/server/dal";
import { unstable_cache } from "next/cache";

// Map DAL status to UI status
function mapDraftStatus(dalStatus: string): "active" | "draft" | "completed" {
  switch (dalStatus) {
    case "OPEN":
      return "draft";
    case "DRAFTING":
      return "active";
    case "LOCKED":
    case "COMPLETE":
      return "completed";
    default:
      return "draft";
  }
}

function mapLeagueStatus(dalStatus: string): "active" | "open" | "completed" {
  switch (dalStatus) {
    case "OPEN":
      return "open";
    case "LOCKED":
      return "active";
    case "COMPLETE":
      return "completed";
    default:
      return "open";
  }
}

// Cache draft results — 60s TTL
const getCachedDraftResults = unstable_cache(
  async (draftId: string) => getDraftResults({ draftId }),
  ["draft-results"],
  { revalidate: 60, tags: ["leaderboard"] }
);

// Cache user's draft list — 60s TTL
const getCachedDraftsForUser = unstable_cache(
  async (userId: string) => listDraftsForUser({ userId }),
  ["drafts-for-user"],
  { revalidate: 60, tags: ["leaderboard"] }
);

// Cache global contest overview — 60s TTL
const getCachedGlobalOverview = unstable_cache(
  async (userId: string) => getGlobalContestOverview({ userId }),
  ["global-overview"],
  { revalidate: 60, tags: ["leaderboard"] }
);

// Cache user's league list — 60s TTL
const getCachedLeaguesForUser = unstable_cache(
  async (userId: string) => listLeaguesForUser({ userId }),
  ["leagues-for-user"],
  { revalidate: 60, tags: ["leaderboard"] }
);

// Cache league leaderboard — 60s TTL
const getCachedLeagueLeaderboard = unstable_cache(
  async (leagueId: string) => getLeagueLeaderboard({ leagueId }),
  ["league-leaderboard"],
  { revalidate: 60, tags: ["leaderboard"] }
);

export default async function LeaderboardsPage() {
  const userId = await requireUserId();

  // Fetch all data in parallel
  const [drafts, globalOverview, leagues] = await Promise.all([
    getCachedDraftsForUser(userId),
    getCachedGlobalOverview(userId),
    getCachedLeaguesForUser(userId),
  ]);

  // Build draft leaderboard data
  const draftLeaderboards: DraftLeaderboard[] = await Promise.all(
    drafts.map(async (draft) => {
      let yourRank: number | null = null;
      let participants: DraftLeaderboard["participants"] = [];

      if (draft.status === "COMPLETE" || draft.status === "LOCKED" || draft.status === "DRAFTING") {
        try {
          const results = await getCachedDraftResults(draft.id);
          const userResult = results.participants.find((p) => p.userId === userId);
          yourRank = userResult?.rank ?? null;
          participants = results.participants.map((p) => ({
            userId: p.userId,
            userName: p.userName,
            userImage: p.userImage,
            totalScore: p.totalScore,
            rank: p.rank,
          }));
        } catch {
          // Results not available yet
        }
      }

      return {
        id: draft.id,
        name: draft.name,
        participantCount: draft.participantCount,
        yourRank,
        status: mapDraftStatus(draft.status),
        participants,
      };
    })
  );

  // Build global leaderboard data
  let globalLeaderboard: GlobalLeaderboard | null = null;
  if (globalOverview) {
    globalLeaderboard = {
      contestId: globalOverview.contestId,
      tournamentName: globalOverview.tournamentName,
      seasonYear: globalOverview.seasonYear,
      totalEntries: globalOverview.totalEntries,
      hasEntered: globalOverview.hasEntered,
      yourRank: globalOverview.yourRank,
      yourPoints: globalOverview.yourPoints,
      topPlayers: globalOverview.topPlayers,
    };
  }

  // Build league leaderboard data
  const leagueLeaderboards: LeagueLeaderboard[] = await Promise.all(
    leagues.map(async (league) => {
      let yourRank: number | null = null;
      let participants: LeagueLeaderboard["participants"] = [];

      try {
        const leaderboard = await getCachedLeagueLeaderboard(league.id);
        const userResult = leaderboard.participants.find((p) => p.userId === userId);
        yourRank = userResult?.rank ?? null;
        participants = leaderboard.participants.map((p) => ({
          userId: p.userId,
          userName: p.userName,
          userImage: p.userImage,
          totalScore: p.totalScore,
          rank: p.rank,
        }));
      } catch {
        // Leaderboard not available yet
      }

      return {
        id: league.id,
        name: league.name,
        participantCount: league.participantCount,
        yourRank,
        status: mapLeagueStatus(league.status),
        isHost: league.isHost,
        participants,
      };
    })
  );

  return (
    <LeaderboardsClient
      draftLeaderboards={draftLeaderboards}
      globalLeaderboard={globalLeaderboard}
      leagueLeaderboards={leagueLeaderboards}
    />
  );
}
