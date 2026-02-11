import { LeaderboardsClient, type DraftLeaderboard } from "./LeaderboardsClient";
import { requireUserId } from "@/server/auth/guards";
import { listDraftsForUser, getDraftResults } from "@/server/dal";

// Map DAL status to UI status
function mapStatus(dalStatus: string): "active" | "draft" | "completed" {
  switch (dalStatus) {
    case "LOBBY":
      return "draft";
    case "DRAFTING":
    case "LIVE":
      return "active";
    case "COMPLETE":
      return "completed";
    default:
      return "draft";
  }
}

export default async function LeaderboardsPage() {
  const userId = await requireUserId();

  // Fetch user's drafts
  const drafts = await listDraftsForUser({ userId });

  // Build leaderboard data for each draft
  const draftLeaderboards: DraftLeaderboard[] = await Promise.all(
    drafts.map(async (draft) => {
      let yourRank: number | null = null;

      // For completed or active drafts, fetch results to get user's rank
      if (draft.status === "COMPLETE" || draft.status === "LIVE" || draft.status === "DRAFTING") {
        try {
          const results = await getDraftResults({ draftId: draft.id });
          const userResult = results.participants.find((p) => p.userId === userId);
          yourRank = userResult?.rank ?? null;
        } catch {
          // Results not available yet
        }
      }

      return {
        id: draft.id,
        name: draft.name,
        participants: draft.participantCount,
        yourRank,
        status: mapStatus(draft.status),
      };
    })
  );

  return <LeaderboardsClient draftLeaderboards={draftLeaderboards} />;
}
