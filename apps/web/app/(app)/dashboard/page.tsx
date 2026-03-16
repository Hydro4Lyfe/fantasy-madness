import { requireUserId } from "@/server/auth/guards";
import {
  getGlobalContestOverview,
  getGlobalContestPicksState,
  listDraftsForUser,
  listLeaguesForUser,
  getDraftRoomState,
} from "@/server/dal";
import { DashboardClient } from "./DashboardClient";
import type { Pick, DraftUpdate } from "./DashboardClient";

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

  // Build draft updates for OPEN and DRAFTING drafts
  const activeDraftRows = drafts.filter(
    (d) => d.status === "OPEN" || d.status === "DRAFTING"
  );

  const draftingIds = activeDraftRows
    .filter((d) => d.status === "DRAFTING")
    .map((d) => d.id);

  // Fetch room state for live drafts to get pick progress & current turn
  const roomStates = await Promise.all(
    draftingIds.map((id) =>
      getDraftRoomState({ draftId: id }).catch(() => null)
    )
  );
  const roomStateById = new Map(
    roomStates
      .filter((rs): rs is NonNullable<typeof rs> => rs !== null)
      .map((rs) => [rs.id, rs])
  );

  const draftUpdates: DraftUpdate[] = activeDraftRows.map((d) => {
    const room = roomStateById.get(d.id);
    const totalExpected = d.rosterSize * d.participantCount;

    if (room) {
      const currentPicker = room.participants.find(
        (p) => p.oduserId === room.currentPickerUserId
      );
      return {
        id: d.id,
        name: d.name,
        status: d.status as DraftUpdate["status"],
        participantCount: d.participantCount,
        rosterSize: d.rosterSize,
        isPrivate: d.isPrivate,
        picksMade: room.totalPicks,
        totalExpectedPicks: totalExpected,
        currentPickerName: currentPicker?.userName ?? null,
        isYourTurn: room.currentPickerUserId === userId,
      };
    }

    return {
      id: d.id,
      name: d.name,
      status: d.status as DraftUpdate["status"],
      participantCount: d.participantCount,
      rosterSize: d.rosterSize,
      isPrivate: d.isPrivate,
      picksMade: 0,
      totalExpectedPicks: totalExpected,
      currentPickerName: null,
      isYourTurn: false,
    };
  });

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
          abbreviation: slot.abbreviation,
          logoTeamId: slot.logoTeamIds[0] ?? null,
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
      abbreviation: null,
      logoTeamId: null,
      quadrant: "",
      status: "pending",
      wins: 0,
      points: 0,
    });
  }

  const leaderboard = (overview?.topPlayers ?? []).slice(0, 5).map((p) => ({
    rank: p.rank,
    name: p.name,
    image: p.image,
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
      draftUpdates={draftUpdates}
      leaderboard={leaderboard}
      activeLeagues={activeLeagues}
      tournamentName={overview?.tournamentName ?? null}
      seasonYear={overview?.seasonYear ?? new Date().getFullYear()}
      hasContest={overview !== null}
      bracketLocked={overview?.bracketLocked ?? false}
    />
  );
}
