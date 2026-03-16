import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";

export type LeagueParticipantDTO = {
  oduserId: string;
  userName: string | null;
  userImage: string | null;
  isHost: boolean;
  picks: {
    slotId: string;
    displayName: string;
    seed: number;
    quadrant: number;
    pickNo: number;
  }[];
  hasCompletedPicks: boolean;
};

export type LeagueAvailableSlotDTO = {
  slotId: string;
  displayName: string;
  abbreviation: string | null;
  logoTeamIds: number[];
  seed: number;
  quadrant: number;
  isPlayIn: boolean;
};

export type LeagueRoomStateDTO = {
  id: string;
  name: string;
  status: string;
  isPrivate: boolean;
  inviteCode: string | null;
  maxParticipants: number | null;
  tournamentId: string;
  tournamentName: string;
  picksLockAt: string | null;
  isPicksOpen: boolean;
  participants: LeagueParticipantDTO[];
  allSlots: LeagueAvailableSlotDTO[];
  currentUserPicks: string[]; // slotIds for current user
  currentUserEntryId: string | null;
  isHost: boolean;
};

export async function getLeagueRoomState(args: {
  db?: DbClient;
  leagueId: string;
  userId: string;
}): Promise<LeagueRoomStateDTO> {
  const db = (args.db ?? prisma) as any;

  const league = await db.league.findUnique({
    where: { id: args.leagueId },
    select: {
      id: true,
      name: true,
      status: true,
      isPrivate: true,
      inviteCode: true,
      maxParticipants: true,
      tournamentId: true,
      tournament: { select: { name: true, picksLockAt: true } },
      entries: {
        select: {
          id: true,
          userId: true,
          isHost: true,
          user: { select: { username: true, name: true, image: true } },
          picks: {
            select: {
              pickNo: true,
              slotId: true,
              slot: {
                select: {
                  seed: true,
                  quadrant: true,
                  assignedTeam: { select: { fullName: true, abbreviation: true } },
                  candidates: {
                    select: { team: { select: { fullName: true, abbreviation: true } } },
                    orderBy: { team: { name: "asc" } },
                  },
                },
              },
            },
            orderBy: { pickNo: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!league) throw new DomainError("NOT_FOUND", "League not found");

  // Find current user's entry
  const currentUserEntry = league.entries.find(
    (e: any) => e.userId === args.userId
  );

  if (!currentUserEntry) {
    throw new DomainError(
      "UNAUTHORIZED",
      "You are not a participant in this league"
    );
  }

  // Get all bracket slots for this tournament
  const bracketSlots = await db.bracketSlot.findMany({
    where: { tournamentId: league.tournamentId },
    select: {
      id: true,
      seed: true,
      quadrant: true,
      assignedTeamId: true,
      assignedTeam: { select: { fullName: true, abbreviation: true } },
      candidates: {
        select: {
          teamId: true,
          team: { select: { fullName: true, abbreviation: true } },
        },
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

  const getLogoTeamIds = (slot: any): number[] => {
    if (slot.assignedTeamId != null) return [slot.assignedTeamId];
    if (slot.candidates.length > 0) {
      return slot.candidates.map((c: any) => c.teamId);
    }
    return [];
  };

  const allSlots: LeagueAvailableSlotDTO[] = bracketSlots.map((s: any) => ({
    slotId: s.id,
    displayName: getDisplayName(s),
    abbreviation: getAbbreviation(s),
    logoTeamIds: getLogoTeamIds(s),
    seed: s.seed,
    quadrant: s.quadrant,
    isPlayIn: s.candidates.length > 1,
  }));

  // Build participants with their picks
  const participants: LeagueParticipantDTO[] = league.entries.map((e: any) => {
    const picks = e.picks.map((p: any) => ({
      slotId: p.slotId,
      displayName: getDisplayName(p.slot),
      seed: p.slot.seed,
      quadrant: p.slot.quadrant,
      pickNo: p.pickNo,
    }));

    return {
      oduserId: e.userId,
      userName: e.user?.username ?? e.user?.name ?? null,
      userImage: e.user?.image ?? null,
      isHost: e.isHost,
      picks,
      hasCompletedPicks: picks.length === 8,
    };
  });

  // Get current user's pick slot IDs
  const currentUserPicks = currentUserEntry.picks.map((p: any) => p.slotId);

  const picksLockAt = league.tournament?.picksLockAt ?? null;
  const lockAtMs = picksLockAt?.getTime() ?? null;
  const isPicksOpen =
    String(league.status) === "OPEN" &&
    (lockAtMs === null || lockAtMs > Date.now());

  return {
    id: league.id,
    name: league.name,
    status: String(league.status),
    isPrivate: league.isPrivate,
    inviteCode: league.inviteCode,
    maxParticipants: league.maxParticipants,
    tournamentId: league.tournamentId,
    tournamentName: league.tournament?.name ?? "Tournament",
    picksLockAt: picksLockAt?.toISOString() ?? null,
    isPicksOpen,
    participants,
    allSlots,
    currentUserPicks,
    currentUserEntryId: currentUserEntry.id,
    isHost: currentUserEntry.isHost,
  };
}
