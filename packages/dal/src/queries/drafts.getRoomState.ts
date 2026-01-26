import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";

export type DraftParticipantDTO = {
  oduserId: string;
  userName: string | null;
  userImage: string | null;
  pickOrder: number;
  isHost: boolean;
  picks: {
    teamId: string;
    teamName: string;
    teamSeed: number | null;
    overallPickNo: number;
  }[];
};

export type AvailableTeamDTO = {
  teamId: string;
  teamName: string;
  seed: number | null;
  region: string | null;
};

export type DraftRoomStateDTO = {
  id: string;
  name: string;
  status: string;
  draftType: string;
  rosterSize: number;
  pickTimerSec: number | null;
  tournamentId: string;
  tournamentName: string;
  currentPickNumber: number;
  currentPickerUserId: string | null;
  participants: DraftParticipantDTO[];
  availableTeams: AvailableTeamDTO[];
  totalPicks: number;
};

export async function getDraftRoomState(args: {
  db?: DbClient;
  draftId: string;
}): Promise<DraftRoomStateDTO> {
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
      tournamentId: true,
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
      picks: {
        select: {
          userId: true,
          teamId: true,
          overallPickNo: true,
          team: { select: { name: true } },
        },
        orderBy: { overallPickNo: "asc" },
      },
    },
  });

  if (!draft) throw new DomainError("NOT_FOUND", "Draft not found");

  // Get picked team IDs
  const pickedTeamIds = new Set(draft.picks.map((p: any) => p.teamId));

  // Get available teams from tournament
  const tournamentTeams = await db.tournamentTeam.findMany({
    where: { tournamentId: draft.tournamentId },
    select: {
      teamId: true,
      seed: true,
      region: true,
      team: { select: { name: true } },
    },
    orderBy: [{ seed: "asc" }, { region: "asc" }],
  });

  const availableTeams: AvailableTeamDTO[] = tournamentTeams
    .filter((t: any) => !pickedTeamIds.has(t.teamId))
    .map((t: any) => ({
      teamId: t.teamId,
      teamName: t.team.name,
      seed: t.seed,
      region: t.region,
    }));

  // Build participants with their picks
  const participants: DraftParticipantDTO[] = draft.participants.map((p: any) => {
    const userPicks = draft.picks
      .filter((pick: any) => pick.userId === p.userId)
      .map((pick: any) => {
        const team = tournamentTeams.find((t: any) => t.teamId === pick.teamId);
        return {
          teamId: pick.teamId,
          teamName: pick.team?.name ?? "Unknown",
          teamSeed: team?.seed ?? null,
          overallPickNo: pick.overallPickNo,
        };
      });

    return {
      oduserId: p.userId,
      userName: p.user?.name ?? null,
      userImage: p.user?.image ?? null,
      pickOrder: p.pickOrder,
      isHost: p.isHost,
      picks: userPicks,
    };
  });

  // Calculate current pick
  const totalPicks = draft.picks.length;
  const currentPickNumber = totalPicks + 1;
  const numParticipants = participants.length;

  // Snake draft logic for determining current picker
  let currentPickerUserId: string | null = null;
  if (numParticipants > 0 && draft.status === "DRAFTING") {
    const round = Math.floor(totalPicks / numParticipants);
    const positionInRound = totalPicks % numParticipants;

    // Snake: odd rounds go in reverse order
    const isReverseRound = round % 2 === 1;
    const pickOrderPosition = isReverseRound
      ? numParticipants - positionInRound
      : positionInRound + 1;

    const currentPicker = participants.find(p => p.pickOrder === pickOrderPosition);
    currentPickerUserId = currentPicker?.oduserId ?? null;
  }

  return {
    id: draft.id,
    name: draft.name,
    status: String(draft.status),
    draftType: String(draft.draftType),
    rosterSize: draft.rosterSize,
    pickTimerSec: draft.pickTimerSec,
    tournamentId: draft.tournamentId,
    tournamentName: draft.tournament?.name ?? "Tournament",
    currentPickNumber,
    currentPickerUserId,
    participants,
    availableTeams,
    totalPicks,
  };
}
