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
    slotId: string;
    displayName: string;
    abbreviation: string | null;
    logoTeamIds: number[];
    seed: number;
    quadrant: number;
    overallPickNo: number;
  }[];
};

export type AvailableSlotDTO = {
  slotId: string;
  displayName: string;
  abbreviation: string | null;
  logoTeamIds: number[];
  seed: number;
  quadrant: number;
  isPlayIn: boolean;
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
  isPrivate: boolean;
  inviteCode: string | null;
  startAt: string | null;
  currentPickNumber: number;
  currentPickerUserId: string | null;
  participants: DraftParticipantDTO[];
  availableSlots: AvailableSlotDTO[];
  totalPicks: number;
  timerDeadlineAt: string | null;
  timerSecondsRemaining: number | null;
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
      isPrivate: true,
      inviteCode: true,
      startAt: true,
      tournament: { select: { name: true } },
      participants: {
        select: {
          userId: true,
          pickOrder: true,
          isHost: true,
          user: { select: { username: true, name: true, image: true } },
        },
        orderBy: { pickOrder: "asc" },
      },
      picks: {
        select: {
          userId: true,
          slotId: true,
          overallPickNo: true,
          slot: {
            select: {
              seed: true,
              quadrant: true,
              assignedTeam: { select: { id: true, fullName: true, abbreviation: true } },
              candidates: {
                select: { team: { select: { id: true, fullName: true, abbreviation: true } } },
                orderBy: { team: { name: "asc" } },
              },
            },
          },
        },
        orderBy: { overallPickNo: "asc" },
      },
    },
  });

  if (!draft) throw new DomainError("NOT_FOUND", "Draft not found");

  // Get picked slot IDs
  const pickedSlotIds = new Set(draft.picks.map((p: any) => p.slotId));

  // Get available slots from bracket (64 slots per tournament)
  const bracketSlots = await db.bracketSlot.findMany({
    where: { tournamentId: draft.tournamentId },
    select: {
      id: true,
      seed: true,
      quadrant: true,
      assignedTeam: { select: { id: true, fullName: true, abbreviation: true } },
      candidates: {
        select: { team: { select: { id: true, fullName: true, abbreviation: true } } },
        orderBy: { team: { name: "asc" } },
      },
    },
    orderBy: [{ quadrant: "asc" }, { seed: "asc" }],
  });

  // Helper to build display name for a slot (prefer college/school name over mascot)
  const getDisplayName = (slot: any): string => {
    if (slot.assignedTeam) {
      return slot.assignedTeam.fullName;
    }
    if (slot.candidates.length > 0) {
      return slot.candidates.map((c: any) => c.team.fullName).join(" / ");
    }
    return `Slot ${slot.quadrant}-${slot.seed}`;
  };

  const getLogoTeamIds = (slot: any): number[] => {
    if (slot.assignedTeam?.id) {
      return [slot.assignedTeam.id];
    }
    if (slot.candidates.length > 0) {
      return slot.candidates.map((c: any) => c.team.id);
    }
    return [];
  };

  const getAbbreviation = (slot: any): string | null => {
    if (slot.assignedTeam?.abbreviation) {
      return slot.assignedTeam.abbreviation;
    }
    if (slot.candidates.length > 0) {
      const abbreviations = slot.candidates
        .map((c: any) => c.team.abbreviation)
        .filter((abbr: string | null) => Boolean(abbr));
      return abbreviations.length > 0 ? abbreviations.join(" / ") : null;
    }
    return null;
  };

  const availableSlots: AvailableSlotDTO[] = bracketSlots
    .filter((s: any) => !pickedSlotIds.has(s.id))
    .map((s: any) => ({
      slotId: s.id,
      displayName: getDisplayName(s),
      abbreviation: getAbbreviation(s),
      logoTeamIds: getLogoTeamIds(s),
      seed: s.seed,
      quadrant: s.quadrant,
      isPlayIn: s.candidates.length > 1,
    }));

  // Helper to build display name for a pick's slot (prefer college/school name over mascot)
  const getPickDisplayName = (slot: any): string => {
    if (slot.assignedTeam) {
      return slot.assignedTeam.fullName;
    }
    if (slot.candidates.length > 0) {
      return slot.candidates.map((c: any) => c.team.fullName).join(" / ");
    }
    return `Slot ${slot.quadrant}-${slot.seed}`;
  };

  // Build participants with their picks
  const participants: DraftParticipantDTO[] = draft.participants.map((p: any) => {
    const userPicks = draft.picks
      .filter((pick: any) => pick.userId === p.userId)
      .map((pick: any) => ({
        slotId: pick.slotId,
        displayName: getPickDisplayName(pick.slot),
        abbreviation: getAbbreviation(pick.slot),
        logoTeamIds: getLogoTeamIds(pick.slot),
        seed: pick.slot.seed,
        quadrant: pick.slot.quadrant,
        overallPickNo: pick.overallPickNo,
      }));

    return {
      oduserId: p.userId,
      userName: p.user?.username ?? p.user?.name ?? null,
      userImage: p.user?.image ?? null,
      pickOrder: p.pickOrder,
      isHost: p.isHost,
      picks: userPicks,
    };
  });

  // Calculate current pick
  const picksMade = draft.picks.length;
  const currentPickNumber = picksMade + 1;
  const numParticipants = participants.length;
  const totalPicks = draft.rosterSize * numParticipants;

  // Snake draft logic for determining current picker
  let currentPickerUserId: string | null = null;
  if (numParticipants > 0 && draft.status === "DRAFTING") {
    const round = Math.floor(picksMade / numParticipants);
    const positionInRound = picksMade % numParticipants;

    // Snake: odd rounds go in reverse order
    const isReverseRound = round % 2 === 1;
    const pickOrderPosition = isReverseRound
      ? numParticipants - positionInRound
      : positionInRound + 1;

    const currentPicker = participants.find(p => p.pickOrder === pickOrderPosition);
    currentPickerUserId = currentPicker?.oduserId ?? null;
  }

  // Fetch timer info
  const timer = await db.draftTurnTimer.findUnique({
    where: { draftId: args.draftId },
    select: {
      deadlineAt: true,
      currentPickNumber: true,
      timerPausedAt: true,
    },
  });

  let timerDeadlineAt: string | null = null;
  let timerSecondsRemaining: number | null = null;

  if (timer && draft.status === "DRAFTING" && !timer.timerPausedAt) {
    timerDeadlineAt = timer.deadlineAt.toISOString();
    const now = new Date();
    const remaining = timer.deadlineAt.getTime() - now.getTime();
    timerSecondsRemaining = Math.max(0, Math.floor(remaining / 1000));
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
    isPrivate: draft.isPrivate,
    inviteCode: draft.inviteCode,
    startAt: draft.startAt?.toISOString() ?? null,
    currentPickNumber,
    currentPickerUserId,
    participants,
    availableSlots,
    totalPicks,
    timerDeadlineAt,
    timerSecondsRemaining,
  };
}
