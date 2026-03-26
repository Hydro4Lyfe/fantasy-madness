import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";

type Region = "East" | "West" | "South" | "Midwest";

export type GlobalContestSlotOptionDTO = {
  slotId: string;
  displayName: string;
  abbreviation: string | null;
  logoTeamIds: number[];
  seed: number;
  quadrant: number;
  region: Region;
  isPlayIn: boolean;
};

export type GlobalContestPicksStateDTO = {
  contestId: string;
  tournamentId: string;
  tournamentName: string;
  seasonYear: number;
  lockAt: string | null;
  isOpen: boolean;
  bracketLocked: boolean;
  selectedSlotIds: string[];
  slotOptions: GlobalContestSlotOptionDTO[];
};

const REGION_BY_QUADRANT: Record<number, Region> = {
  1: "East",
  2: "West",
  3: "South",
  4: "Midwest",
};

function getRegion(quadrant: number): Region {
  return REGION_BY_QUADRANT[quadrant] ?? "East";
}

export async function getGlobalContestPicksState(args: {
  db?: DbClient;
  userId: string;
}): Promise<GlobalContestPicksStateDTO | null> {
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
          syncState: true,
        },
      },
      entries: {
        where: { userId: args.userId },
        select: {
          picks: {
            select: {
              slotId: true,
              pickNo: true,
            },
            orderBy: { pickNo: "asc" },
          },
        },
        take: 1,
      },
    },
    orderBy: [{ lockAt: "asc" }, { createdAt: "asc" }],
  });

  if (!contest) {
    return null;
  }

  const bracketSlots = await db.bracketSlot.findMany({
    where: { tournamentId: contest.tournamentId },
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

  const slotOptions = bracketSlots.map((slot: any) => ({
    slotId: slot.id,
    displayName: getDisplayName(slot),
    abbreviation: getAbbreviation(slot),
    logoTeamIds: getLogoTeamIds(slot),
    seed: slot.seed,
    quadrant: slot.quadrant,
    region: getRegion(slot.quadrant),
    isPlayIn: slot.candidates.length > 1,
  }));

  const selectedSlotIds = contest.entries[0]?.picks.map((pick: any) => pick.slotId) ?? [];

  const now = Date.now();
  const lockAtMs = contest.lockAt?.getTime() ?? null;
  const isOpen = contest.status === "OPEN" && (lockAtMs === null || lockAtMs > now);

  const BRACKET_LOCKED_STATES = new Set(["BRACKET_LOCKED", "LIVE", "COMPLETED"]);
  const bracketLocked = BRACKET_LOCKED_STATES.has(
    String(contest.tournament?.syncState ?? "")
  );

  return {
    contestId: contest.id,
    tournamentId: contest.tournamentId,
    tournamentName: contest.tournament?.name ?? "Global Championship",
    seasonYear: contest.tournament?.seasonYear ?? new Date().getFullYear(),
    lockAt: contest.lockAt?.toISOString() ?? null,
    isOpen,
    bracketLocked,
    selectedSlotIds,
    slotOptions,
  };
}
