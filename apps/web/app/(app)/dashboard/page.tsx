import { requireUserId } from "@/server/auth/guards";
import {
  getGlobalContestOverview,
  getGlobalContestPicksState,
  listDraftsForUser,
  listLeaguesForUser,
} from "@/server/dal";
import { DashboardClient } from "./DashboardClient";
import type { Pick } from "./DashboardClient";

export default async function DashboardPage() {
  const userId = await requireUserId();

  const [overview, picksState, drafts, leagues] = await Promise.all([
    getGlobalContestOverview({ userId }),
    getGlobalContestPicksState({ userId }),
    listDraftsForUser({ userId }),
    listLeaguesForUser({ userId }),
  ]);

  const activeDrafts = drafts.filter(
    (d) => d.status === "OPEN" || d.status === "DRAFTING"
  ).length;

  const activeLeagues = leagues.filter((l) => l.status === "OPEN").length;

  // Build picks array from the user's global contest picks
  const picks: Pick[] = [];
  if (picksState) {
    const optionsById = new Map(
      picksState.slotOptions.map((s) => [s.slotId, s])
    );
    for (const slotId of picksState.selectedSlotIds) {
      const slot = optionsById.get(slotId);
      if (slot) {
        picks.push({
          id: slotId,
          seed: slot.seed,
          teamName: slot.displayName,
          quadrant: slot.region,
          status: "alive",
          wins: 0,
          points: 0,
        });
      }
    }
  }
  // Pad to 8 slots
  while (picks.length < 8) {
    picks.push({
      id: `empty-${picks.length}`,
      seed: 0,
      teamName: "",
      quadrant: "",
      status: "pending",
      wins: 0,
      points: 0,
    });
  }

  const leaderboard = (overview?.topPlayers ?? []).slice(0, 5).map((p) => ({
    rank: p.rank,
    name: p.name,
    points: p.points,
  }));

  const user = {
    name: "Player",
    totalPoints: overview?.yourPoints ?? 0,
    rank: overview?.yourRank ?? 0,
    totalPlayers: overview?.totalEntries ?? 0,
    activeDrafts,
  };

  return (
    <DashboardClient
      user={user}
      picks={picks}
      leaderboard={leaderboard}
      activeLeagues={activeLeagues}
      tournamentName={overview?.tournamentName ?? null}
      seasonYear={overview?.seasonYear ?? new Date().getFullYear()}
      hasContest={overview !== null}
      bracketLocked={overview?.bracketLocked ?? false}
    />
  );
}
