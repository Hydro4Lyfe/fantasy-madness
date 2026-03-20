export interface TeamInfo {
  teamId: number;
  fullName: string;
  abbreviation: string | null;
  seed: number;
  slotId: string;
}

export interface BracketGame {
  index: number;
  round: number;
  quadrant?: number;
  region?: string;
  topTeam: TeamInfo | null;
  bottomTeam: TeamInfo | null;
  winner: number | null;
}

export type BracketPicks = Map<number, number>;

export const SEED_PAIRINGS = [
  [1, 16], [8, 9], [5, 12], [4, 13], [6, 11], [3, 14], [7, 10], [2, 15],
] as const;

export const QUADRANT_REGIONS: Record<number, string> = {
  1: "East",
  2: "West",
  3: "South",
  4: "Midwest",
};

export const ROUND_NAMES = [
  "",
  "Round of 64",
  "Round of 32",
  "Sweet 16",
  "Elite 8",
  "Final Four",
  "Championship",
] as const;

export interface RoundMeta {
  round: number;
  name: string;
  startIndex: number;
  gameCount: number;
}

export const ROUNDS: RoundMeta[] = [
  { round: 1, name: "Round of 64", startIndex: 0, gameCount: 32 },
  { round: 2, name: "Round of 32", startIndex: 32, gameCount: 16 },
  { round: 3, name: "Sweet 16", startIndex: 48, gameCount: 8 },
  { round: 4, name: "Elite 8", startIndex: 56, gameCount: 4 },
  { round: 5, name: "Final Four", startIndex: 60, gameCount: 2 },
  { round: 6, name: "Championship", startIndex: 62, gameCount: 1 },
];
