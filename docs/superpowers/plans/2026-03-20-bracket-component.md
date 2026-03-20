# Bracket Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full 64-team NCAA tournament bracket page with desktop horizontal tree and mobile round-tab views, allowing users to pick winners for all 63 games.

**Architecture:** Server component fetches bracket slot data via a new DAL query, passes it to a client component that manages all pick state in localStorage. Desktop renders an absolutely-positioned bracket tree with responsive width; mobile uses round-based tab navigation with next-round peek cards. CSS-based responsive switching at 768px breakpoint.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, Vitest, Prisma (read-only query)

**Spec:** `docs/superpowers/specs/2026-03-20-bracket-component-design.md`
**Mockup:** `.superpowers/brainstorm/275365-1774035343/bracket-v5.html`

---

## File Structure

```
Create:
  apps/web/server/dal/queries/bracketSlots.listWithTeams.ts   — DAL query joining team relations
  apps/web/lib/bracket/types.ts                               — Shared types (BracketGame, TeamInfo, etc.)
  apps/web/lib/bracket/engine.ts                              — Pure logic: game indexing, advancement, cascade
  apps/web/lib/bracket/engine.test.ts                         — Tests for bracket engine
  apps/web/app/(app)/bracket/page.tsx                         — Server component: auth, data fetch, guards
  apps/web/app/(app)/bracket/BracketClient.tsx                — Client component: state, responsive shell
  apps/web/components/bracket/useBracketState.ts              — Hook: picks, cascade, localStorage persistence
  apps/web/components/bracket/MatchupCard.tsx                 — Shared matchup card (2 team rows)
  apps/web/components/bracket/TeamRow.tsx                     — Single team row (logo, seed, name, border accent)
  apps/web/components/bracket/DesktopBracket.tsx              — Responsive horizontal tree layout
  apps/web/components/bracket/MobileBracket.tsx               — Round tabs + vertical list + peek cards
  apps/web/components/bracket/ChampionshipCard.tsx            — Larger blue-accented championship matchup
  apps/web/components/bracket/RoundSelector.tsx               — Mobile round tab navigation

Modify:
  apps/web/server/dal/index.ts                                — Add export for new query
```

---

### Task 1: Bracket Engine — Types & Game Indexing

**Files:**
- Create: `apps/web/lib/bracket/types.ts`
- Create: `apps/web/lib/bracket/engine.ts`
- Create: `apps/web/lib/bracket/engine.test.ts`

This task builds the pure logic layer with zero React dependencies. All functions are deterministic and testable.

- [ ] **Step 1: Create types file**

Create `apps/web/lib/bracket/types.ts`:

```typescript
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
  "", // 0-indexed padding
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
```

- [ ] **Step 2: Write failing tests for game indexing and advancement**

Create `apps/web/lib/bracket/engine.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  getAdvancementIndex,
  getGameRound,
  getGameQuadrant,
  buildInitialGames,
  applyCascade,
} from "./engine";
import type { TeamInfo, BracketPicks } from "./types";

describe("getAdvancementIndex", () => {
  it("R64 game 0 advances to game 32", () => {
    expect(getAdvancementIndex(0)).toBe(32);
  });
  it("R64 game 1 advances to game 32", () => {
    expect(getAdvancementIndex(1)).toBe(32);
  });
  it("R64 game 2 advances to game 33", () => {
    expect(getAdvancementIndex(2)).toBe(33);
  });
  it("R32 game 32 advances to game 48", () => {
    expect(getAdvancementIndex(32)).toBe(48);
  });
  it("Elite 8 game 56 advances to game 60", () => {
    expect(getAdvancementIndex(56)).toBe(60);
  });
  it("FF game 60 advances to game 62", () => {
    expect(getAdvancementIndex(60)).toBe(62);
  });
  it("Championship game 62 returns null", () => {
    expect(getAdvancementIndex(62)).toBeNull();
  });
});

describe("getGameRound", () => {
  it("game 0 is round 1", () => { expect(getGameRound(0)).toBe(1); });
  it("game 31 is round 1", () => { expect(getGameRound(31)).toBe(1); });
  it("game 32 is round 2", () => { expect(getGameRound(32)).toBe(2); });
  it("game 62 is round 6", () => { expect(getGameRound(62)).toBe(6); });
});

describe("getGameQuadrant", () => {
  it("game 0 is quadrant 1 (East)", () => { expect(getGameQuadrant(0)).toBe(1); });
  it("game 8 is quadrant 2 (West)", () => { expect(getGameQuadrant(8)).toBe(2); });
  it("game 16 is quadrant 3 (South)", () => { expect(getGameQuadrant(16)).toBe(3); });
  it("game 24 is quadrant 4 (Midwest)", () => { expect(getGameQuadrant(24)).toBe(4); });
  it("R32 game 32 is quadrant 1", () => { expect(getGameQuadrant(32)).toBe(1); });
  it("R32 game 36 is quadrant 2", () => { expect(getGameQuadrant(36)).toBe(2); });
  it("FF game 60 returns undefined", () => { expect(getGameQuadrant(60)).toBeUndefined(); });
  it("Championship game 62 returns undefined", () => { expect(getGameQuadrant(62)).toBeUndefined(); });
});

describe("applyCascade", () => {
  it("changing a R64 pick clears downstream picks that used the old winner", () => {
    const picks: BracketPicks = new Map([
      [0, 100],  // game 0: team 100 won
      [32, 100], // game 32: team 100 advanced and won again
      [48, 100], // game 48: team 100 advanced again
    ]);
    // Now change game 0 pick to team 200
    const result = applyCascade(picks, 0, 200);
    expect(result.get(0)).toBe(200);    // new pick
    expect(result.has(32)).toBe(false);  // cleared — had old winner
    expect(result.has(48)).toBe(false);  // cleared — cascade
  });

  it("changing a pick does not clear unrelated downstream picks", () => {
    const picks: BracketPicks = new Map([
      [0, 100],  // game 0: team 100
      [1, 200],  // game 1: team 200
      [32, 200], // game 32: team 200 won (fed from game 1, not game 0)
    ]);
    const result = applyCascade(picks, 0, 300);
    expect(result.get(0)).toBe(300);
    expect(result.get(32)).toBe(200);  // unaffected — winner came from game 1
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run apps/web/lib/bracket/engine.test.ts`
Expected: FAIL — module not found

- [ ] **Step 4: Implement bracket engine**

Create `apps/web/lib/bracket/engine.ts`:

```typescript
import { ROUNDS, SEED_PAIRINGS, QUADRANT_REGIONS } from "./types";
import type { TeamInfo, BracketGame, BracketPicks } from "./types";

/** Given a game index, return the game index it feeds into (or null for championship) */
export function getAdvancementIndex(gameIndex: number): number | null {
  for (const round of ROUNDS) {
    const end = round.startIndex + round.gameCount;
    if (gameIndex >= round.startIndex && gameIndex < end) {
      if (round.round === 6) return null; // championship
      const nextRound = ROUNDS[round.round]; // next round (0-indexed by round-1)
      const offset = gameIndex - round.startIndex;
      return nextRound.startIndex + Math.floor(offset / 2);
    }
  }
  return null;
}

/** Given a game index, return which round (1-6) it belongs to */
export function getGameRound(gameIndex: number): number {
  for (const round of ROUNDS) {
    if (gameIndex < round.startIndex + round.gameCount) return round.round;
  }
  return 6;
}

/** Given a game index, return the quadrant (1-4) or undefined for FF/Champ */
export function getGameQuadrant(gameIndex: number): number | undefined {
  const round = getGameRound(gameIndex);
  if (round >= 5) return undefined; // FF and Championship are cross-region

  // Trace back to R64 to find which quadrant block this game belongs to
  // Each quadrant has 8 R64 games. In each round, quadrant games halve.
  // R64: Q1=0-7, Q2=8-15, Q3=16-23, Q4=24-31
  // R32: Q1=32-35, Q2=36-39, Q3=40-43, Q4=44-47
  // S16: Q1=48-49, Q2=50-51, Q3=52-53, Q4=54-55
  // E8:  Q1=56, Q2=57, Q3=58, Q4=59
  const roundMeta = ROUNDS[round - 1];
  const offset = gameIndex - roundMeta.startIndex;
  const gamesPerQuadrant = roundMeta.gameCount / 4;
  return Math.floor(offset / gamesPerQuadrant) + 1;
}

/** Whether gameIndex is the "top" slot (even offset) or "bottom" (odd offset) in its parent */
export function isTopSlot(gameIndex: number): boolean {
  const roundMeta = ROUNDS[getGameRound(gameIndex) - 1];
  return (gameIndex - roundMeta.startIndex) % 2 === 0;
}

/** Build the initial 63 BracketGame objects from slot data */
export function buildInitialGames(
  slots: Array<{ quadrant: number; seed: number; team: TeamInfo | null }>
): BracketGame[] {
  const games: BracketGame[] = [];

  // Build R64 (games 0-31) from slot data
  for (let q = 1; q <= 4; q++) {
    const quadrantSlots = slots.filter((s) => s.quadrant === q);
    const slotBySeed = new Map(quadrantSlots.map((s) => [s.seed, s]));

    for (let p = 0; p < SEED_PAIRINGS.length; p++) {
      const [topSeed, botSeed] = SEED_PAIRINGS[p];
      const gameIndex = (q - 1) * 8 + p;
      games.push({
        index: gameIndex,
        round: 1,
        quadrant: q,
        region: QUADRANT_REGIONS[q],
        topTeam: slotBySeed.get(topSeed)?.team ?? null,
        bottomTeam: slotBySeed.get(botSeed)?.team ?? null,
        winner: null,
      });
    }
  }

  // Build rounds 2-6 (games 32-62) as empty
  for (let r = 1; r < ROUNDS.length; r++) {
    const round = ROUNDS[r];
    for (let g = 0; g < round.gameCount; g++) {
      const gameIndex = round.startIndex + g;
      const quadrant = getGameQuadrant(gameIndex);
      games.push({
        index: gameIndex,
        round: round.round,
        quadrant,
        region: quadrant ? QUADRANT_REGIONS[quadrant] : undefined,
        topTeam: null,
        bottomTeam: null,
        winner: null,
      });
    }
  }

  return games.sort((a, b) => a.index - b.index);
}

/** Apply a pick and cascade: returns a new picks map */
export function applyCascade(
  picks: BracketPicks,
  gameIndex: number,
  newWinnerId: number
): BracketPicks {
  const newPicks = new Map(picks);
  const oldWinnerId = newPicks.get(gameIndex);

  // Set the new pick
  newPicks.set(gameIndex, newWinnerId);

  // If there was a previous winner and it changed, cascade clear
  if (oldWinnerId !== undefined && oldWinnerId !== newWinnerId) {
    clearDownstream(newPicks, gameIndex, oldWinnerId);
  }

  return newPicks;
}

function clearDownstream(
  picks: BracketPicks,
  fromGame: number,
  removedTeamId: number
): void {
  const nextIndex = getAdvancementIndex(fromGame);
  if (nextIndex === null) return;

  const nextWinner = picks.get(nextIndex);
  if (nextWinner === removedTeamId) {
    picks.delete(nextIndex);
    clearDownstream(picks, nextIndex, removedTeamId);
  }
  // Also check: if the removed team is sitting as a participant in the next game
  // but hasn't won it, we still need to remove it from the game's team slot.
  // This is handled by the game state derivation in useBracketState, not here.
}

/** Populate games with picks: derive team placements from picks */
export function deriveGameState(
  baseGames: BracketGame[],
  picks: BracketPicks
): BracketGame[] {
  const games = baseGames.map((g) => ({ ...g, topTeam: g.topTeam ? { ...g.topTeam } : null, bottomTeam: g.bottomTeam ? { ...g.bottomTeam } : null, winner: null }));

  // For each pick, place the winner and propagate to next round
  for (const [gameIndex, winnerId] of picks) {
    const game = games[gameIndex];
    if (!game) continue;
    game.winner = winnerId;

    // Advance winner to next round
    const nextIndex = getAdvancementIndex(gameIndex);
    if (nextIndex === null) continue;

    const nextGame = games[nextIndex];
    if (!nextGame) continue;

    // Find the winning team info
    const winnerTeam =
      game.topTeam?.teamId === winnerId ? game.topTeam :
      game.bottomTeam?.teamId === winnerId ? game.bottomTeam :
      null;

    if (!winnerTeam) continue;

    // Place in top or bottom slot of next game
    if (isTopSlot(gameIndex)) {
      nextGame.topTeam = winnerTeam;
    } else {
      nextGame.bottomTeam = winnerTeam;
    }
  }

  return games;
}

/** Calculate the Best 8 teams from bracket picks */
export function calculateBest8(
  games: BracketGame[],
  picks: BracketPicks
): Array<{ team: TeamInfo; wins: number; score: number }> {
  const teamWins = new Map<number, { team: TeamInfo; wins: number }>();

  for (const [gameIndex, winnerId] of picks) {
    const game = games[gameIndex];
    if (!game) continue;

    const winnerTeam =
      game.topTeam?.teamId === winnerId ? game.topTeam :
      game.bottomTeam?.teamId === winnerId ? game.bottomTeam :
      null;

    if (!winnerTeam) continue;

    const existing = teamWins.get(winnerId);
    if (existing) {
      existing.wins += 1;
    } else {
      teamWins.set(winnerId, { team: winnerTeam, wins: 1 });
    }
  }

  return Array.from(teamWins.values())
    .map(({ team, wins }) => ({ team, wins, score: team.seed * wins }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run apps/web/lib/bracket/engine.test.ts`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/lib/bracket/
git commit -m "feat(bracket): add bracket engine with types, game indexing, cascade logic, and tests"
```

---

### Task 2: DAL Query — bracketSlots.listWithTeams

**Files:**
- Create: `apps/web/server/dal/queries/bracketSlots.listWithTeams.ts`
- Modify: `apps/web/server/dal/index.ts`

- [ ] **Step 1: Create the DAL query**

Create `apps/web/server/dal/queries/bracketSlots.listWithTeams.ts` following the pattern from `globalContests.getPicksState.ts`:

```typescript
import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";

export type BracketSlotWithTeamDTO = {
  id: string;
  tournamentId: string;
  quadrant: number;
  seed: number;
  assignedTeamId: number | null;
  playInGameId: string | null;
  assignedTeam: {
    id: number;
    fullName: string;
    abbreviation: string | null;
  } | null;
  candidates: Array<{
    team: {
      id: number;
      fullName: string;
      abbreviation: string | null;
    };
  }>;
};

export async function listBracketSlotsWithTeams(args: {
  db?: DbClient;
  tournamentId: string;
}): Promise<BracketSlotWithTeamDTO[]> {
  const db = (args.db ?? prisma) as any;
  const slots = await db.bracketSlot.findMany({
    where: { tournamentId: args.tournamentId },
    select: {
      id: true,
      tournamentId: true,
      quadrant: true,
      seed: true,
      assignedTeamId: true,
      playInGameId: true,
      assignedTeam: {
        select: {
          id: true,
          fullName: true,
          abbreviation: true,
        },
      },
      candidates: {
        select: {
          team: {
            select: {
              id: true,
              fullName: true,
              abbreviation: true,
            },
          },
        },
      },
    },
    orderBy: [{ quadrant: "asc" }, { seed: "asc" }],
  });

  return slots;
}
```

- [ ] **Step 2: Create tournament lookup DAL query**

Create `apps/web/server/dal/queries/tournaments.getBracketTournament.ts`:

```typescript
import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";

export type BracketTournamentDTO = {
  id: string;
  seasonYear: number;
  name: string | null;
} | null;

export async function getBracketTournament(args?: {
  db?: DbClient;
}): Promise<BracketTournamentDTO> {
  const db = (args?.db ?? prisma) as any;
  return db.tournament.findFirst({
    where: {
      syncState: { in: ["BRACKET_LOCKED", "LIVE", "COMPLETED"] },
    },
    orderBy: { seasonYear: "desc" },
    select: {
      id: true,
      seasonYear: true,
      name: true,
    },
  });
}
```

- [ ] **Step 3: Export from DAL index**

Add to `apps/web/server/dal/index.ts`:

```typescript
export { listBracketSlotsWithTeams } from "./queries/bracketSlots.listWithTeams";
export type { BracketSlotWithTeamDTO } from "./queries/bracketSlots.listWithTeams";
export { getBracketTournament } from "./queries/tournaments.getBracketTournament";
export type { BracketTournamentDTO } from "./queries/tournaments.getBracketTournament";
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit -p apps/web/tsconfig.json`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add apps/web/server/dal/queries/bracketSlots.listWithTeams.ts apps/web/server/dal/index.ts
git commit -m "feat(dal): add bracketSlots.listWithTeams query with team joins"
```

---

### Task 3: Server Page — Auth, Data Fetch, Guards

**Files:**
- Create: `apps/web/app/(app)/bracket/page.tsx`

- [ ] **Step 1: Create the server page**

Create `apps/web/app/(app)/bracket/page.tsx` following the pattern from `global-contest/picks/page.tsx`:

```typescript
import { requireUserId } from "@/server/auth/guards";
import { listBracketSlotsWithTeams, getBracketTournament } from "@/server/dal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BracketClient from "./BracketClient";

export default async function BracketPage() {
  await requireUserId();

  // Find the most recent tournament with bracket locked (via DAL)
  const tournament = await getBracketTournament();

  if (!tournament) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Bracket Not Yet Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The tournament bracket will be available after Selection Sunday
              when the field is announced.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const slots = await listBracketSlotsWithTeams({
    tournamentId: tournament.id,
  });

  return (
    <BracketClient
      tournamentId={tournament.id}
      seasonYear={tournament.seasonYear}
      tournamentName={tournament.name ?? `${tournament.seasonYear} Tournament`}
      slots={slots}
    />
  );
}
```

- [ ] **Step 2: Create a placeholder BracketClient**

Create `apps/web/app/(app)/bracket/BracketClient.tsx`:

```typescript
"use client";

import type { BracketSlotWithTeamDTO } from "@/server/dal";

interface BracketClientProps {
  tournamentId: string;
  seasonYear: number;
  tournamentName: string;
  slots: BracketSlotWithTeamDTO[];
}

export default function BracketClient({
  tournamentId,
  seasonYear,
  tournamentName,
  slots,
}: BracketClientProps) {
  return (
    <div className="w-full max-w-[1536px] mx-auto px-4">
      <h1 className="text-xl font-bold py-4">{tournamentName} Bracket</h1>
      <p className="text-muted-foreground">{slots.length} slots loaded</p>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit -p apps/web/tsconfig.json`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/\(app\)/bracket/
git commit -m "feat(bracket): add server page with auth guard and bracket availability check"
```

---

### Task 4: useBracketState Hook

**Files:**
- Create: `apps/web/components/bracket/useBracketState.ts`

This hook manages all bracket state: converting slot data to games, tracking picks, cascading, and localStorage persistence.

- [ ] **Step 1: Create the hook**

Create `apps/web/components/bracket/useBracketState.ts`:

```typescript
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { BracketSlotWithTeamDTO } from "@/server/dal";
import type { TeamInfo, BracketGame, BracketPicks } from "@/lib/bracket/types";
import {
  buildInitialGames,
  deriveGameState,
  applyCascade,
  calculateBest8,
} from "@/lib/bracket/engine";

function slotsToInitialData(slots: BracketSlotWithTeamDTO[]) {
  return slots.map((slot) => {
    let team: TeamInfo | null = null;

    if (slot.assignedTeam) {
      team = {
        teamId: slot.assignedTeam.id,
        fullName: slot.assignedTeam.fullName,
        abbreviation: slot.assignedTeam.abbreviation,
        seed: slot.seed,
        slotId: slot.id,
      };
    } else if (slot.candidates.length === 1) {
      const c = slot.candidates[0];
      team = {
        teamId: c.team.id,
        fullName: c.team.fullName,
        abbreviation: c.team.abbreviation,
        seed: slot.seed,
        slotId: slot.id,
      };
    } else if (slot.candidates.length > 1) {
      // Play-in: composite display
      const names = slot.candidates.map((c) => c.team.abbreviation).join(" / ");
      team = {
        teamId: slot.candidates[0].team.id, // use first candidate as ID
        fullName: names,
        abbreviation: names,
        seed: slot.seed,
        slotId: slot.id,
      };
    }

    return { quadrant: slot.quadrant, seed: slot.seed, team };
  });
}

const STORAGE_KEY_PREFIX = "bracket-picks-";

function loadPicks(tournamentId: string): BracketPicks {
  if (typeof window === "undefined") return new Map();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + tournamentId);
    if (!raw) return new Map();
    const entries: [number, number][] = JSON.parse(raw);
    return new Map(entries);
  } catch {
    return new Map();
  }
}

function savePicks(tournamentId: string, picks: BracketPicks) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY_PREFIX + tournamentId,
      JSON.stringify(Array.from(picks.entries()))
    );
  } catch {
    // localStorage full or unavailable — silent fail
  }
}

export function useBracketState(
  tournamentId: string,
  slots: BracketSlotWithTeamDTO[]
) {
  const baseGames = useMemo(() => {
    const data = slotsToInitialData(slots);
    return buildInitialGames(data);
  }, [slots]);

  const [picks, setPicks] = useState<BracketPicks>(() =>
    loadPicks(tournamentId)
  );

  // Persist picks to localStorage on change
  useEffect(() => {
    savePicks(tournamentId, picks);
  }, [tournamentId, picks]);

  const games = useMemo(
    () => deriveGameState(baseGames, picks),
    [baseGames, picks]
  );

  const best8 = useMemo(() => calculateBest8(games, picks), [games, picks]);

  const makePick = useCallback(
    (gameIndex: number, teamId: number) => {
      setPicks((prev) => applyCascade(prev, gameIndex, teamId));
    },
    []
  );

  const totalPicks = picks.size;
  const isComplete = totalPicks === 63;

  return { games, picks, best8, makePick, totalPicks, isComplete };
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit -p apps/web/tsconfig.json`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/bracket/useBracketState.ts
git commit -m "feat(bracket): add useBracketState hook with picks, cascade, and localStorage"
```

---

### Task 5: TeamRow & MatchupCard Components

**Files:**
- Create: `apps/web/components/bracket/TeamRow.tsx`
- Create: `apps/web/components/bracket/MatchupCard.tsx`
- Create: `apps/web/components/bracket/ChampionshipCard.tsx`

- [ ] **Step 1: Create TeamRow**

Create `apps/web/components/bracket/TeamRow.tsx`:

```typescript
"use client";

import { cn } from "@/lib/utils";
import { TeamLogo } from "@/components/team/TeamLogo";
import type { TeamInfo } from "@/lib/bracket/types";

interface TeamRowProps {
  team: TeamInfo | null;
  isWinner: boolean;
  isLoser: boolean;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "lg";
}

export function TeamRow({
  team,
  isWinner,
  isLoser,
  onClick,
  className,
  size = "sm",
}: TeamRowProps) {
  const isTbd = !team;
  const isLg = size === "lg";

  return (
    <div
      role="button"
      tabIndex={isTbd ? undefined : 0}
      aria-pressed={isWinner}
      onClick={isTbd ? undefined : onClick}
      onKeyDown={
        isTbd
          ? undefined
          : (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
      }
      className={cn(
        "flex items-center border-l-[3px] border-l-transparent transition-colors",
        isLg
          ? "h-12 px-3 gap-2.5 text-sm"
          : "h-[26px] px-1.5 gap-1.5 text-[11px]",
        !isTbd && "cursor-pointer hover:bg-[#1c2333]",
        isWinner && "bg-[#1c2333] border-l-[#3B82F6]",
        isLoser && "opacity-50",
        isTbd && "text-[#484f58] cursor-default",
        className
      )}
    >
      {team ? (
        <TeamLogo
          teamId={team.teamId}
          label={team.abbreviation ?? team.fullName}
          className={cn(isLg ? "w-7 h-7" : "w-4 h-4")}
        />
      ) : (
        <div
          className={cn(
            "rounded bg-white/[0.04]",
            isLg ? "w-7 h-7" : "w-4 h-4"
          )}
        />
      )}
      <span
        className={cn(
          "font-bold text-[#8B949E] text-right shrink-0",
          isLg ? "w-5 text-sm" : "w-4 text-[10px]",
          isWinner && "text-[#E6EDF3]"
        )}
      >
        {team?.seed ?? "-"}
      </span>
      <span className="flex-1 font-medium truncate">
        {team?.fullName ?? "---"}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Create MatchupCard**

Create `apps/web/components/bracket/MatchupCard.tsx`:

```typescript
"use client";

import { cn } from "@/lib/utils";
import { TeamRow } from "./TeamRow";
import type { BracketGame } from "@/lib/bracket/types";

interface MatchupCardProps {
  game: BracketGame;
  onPick: (gameIndex: number, teamId: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function MatchupCard({ game, onPick, className, style }: MatchupCardProps) {
  return (
    <div
      className={cn(
        "border border-[#30363D] rounded bg-[#161B22] overflow-hidden",
        className
      )}
      style={style}
    >
      <TeamRow
        team={game.topTeam}
        isWinner={game.winner === game.topTeam?.teamId}
        isLoser={game.winner != null && game.winner !== game.topTeam?.teamId}
        onClick={
          game.topTeam
            ? () => onPick(game.index, game.topTeam!.teamId)
            : undefined
        }
      />
      <div className="border-t border-[#30363D]" />
      <TeamRow
        team={game.bottomTeam}
        isWinner={game.winner === game.bottomTeam?.teamId}
        isLoser={game.winner != null && game.winner !== game.bottomTeam?.teamId}
        onClick={
          game.bottomTeam
            ? () => onPick(game.index, game.bottomTeam!.teamId)
            : undefined
        }
      />
    </div>
  );
}
```

- [ ] **Step 3: Create ChampionshipCard**

Create `apps/web/components/bracket/ChampionshipCard.tsx`:

```typescript
"use client";

import { cn } from "@/lib/utils";
import { TeamRow } from "./TeamRow";
import type { BracketGame } from "@/lib/bracket/types";

interface ChampionshipCardProps {
  game: BracketGame;
  onPick: (gameIndex: number, teamId: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function ChampionshipCard({
  game,
  onPick,
  className,
  style,
}: ChampionshipCardProps) {
  return (
    <div className={cn("flex flex-col items-center", className)} style={style}>
      <span className="text-[13px] font-extrabold uppercase tracking-[0.18em] text-[#E6EDF3] mb-1">
        Championship
      </span>
      <span className="text-[9px] text-[#6e7681] tracking-wide mb-3">
        Indianapolis, IN &bull; Apr 7
      </span>
      <div
        className="border border-[#3B82F6] rounded-lg overflow-hidden w-full"
        style={{
          background: "#13171e",
          boxShadow:
            "0 0 0 1px rgba(59,130,246,0.25), 0 0 30px rgba(59,130,246,0.12), 0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        <TeamRow
          team={game.topTeam}
          isWinner={game.winner === game.topTeam?.teamId}
          isLoser={game.winner != null && game.winner !== game.topTeam?.teamId}
          onClick={
            game.topTeam
              ? () => onPick(game.index, game.topTeam!.teamId)
              : undefined
          }
          size="lg"
          className="border-l-4"
        />
        <div className="border-t border-[rgba(59,130,246,0.15)]" />
        <TeamRow
          team={game.bottomTeam}
          isWinner={game.winner === game.bottomTeam?.teamId}
          isLoser={
            game.winner != null && game.winner !== game.bottomTeam?.teamId
          }
          onClick={
            game.bottomTeam
              ? () => onPick(game.index, game.bottomTeam!.teamId)
              : undefined
          }
          size="lg"
          className="border-l-4"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify build**

Run: `npx tsc --noEmit -p apps/web/tsconfig.json`
Expected: No type errors

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/bracket/TeamRow.tsx apps/web/components/bracket/MatchupCard.tsx apps/web/components/bracket/ChampionshipCard.tsx
git commit -m "feat(bracket): add TeamRow, MatchupCard, and ChampionshipCard components"
```

---

### Task 6: DesktopBracket Component

**Files:**
- Create: `apps/web/components/bracket/DesktopBracket.tsx`

This is the largest component. It uses absolute positioning to lay out all matchups, connector lines, and the center Final Four / Championship section. It recalculates layout on resize.

> **Implementation reference**: The mockup at `.superpowers/brainstorm/275365-1774035343/bracket-v5.html` contains the exact JavaScript implementation for `buildDesktop()` — the positioning math, connector line drawing, header construction, and center section layout. Port this logic to React, replacing DOM manipulation with JSX and `useMemo`/`useEffect` for resize handling. The mockup is the source of truth for visual correctness.

- [ ] **Step 1: Create DesktopBracket**

Create `apps/web/components/bracket/DesktopBracket.tsx`. This component:
- Calculates matchup width (`MW`) from container width
- Positions all 63 matchups absolutely using the same math as the mockup
- Draws connector lines as absolutely-positioned `<div>` elements
- Center section (FF + Championship) floats over the gap between regions
- Max-width 1536px
- Rebuilds on window resize with debounce

Reference the mockup at `.superpowers/brainstorm/275365-1774035343/bracket-v5.html` for exact positioning math (the `buildDesktop` function). The key formulas:

```
MW = floor((containerWidth - 6*CW - sideGap) / 8)
sideWidth = 4*MW + 3*CW
getR32y(base, i) = center of matchup pair i in R64
getS16y(base, i) = center of R32 pair i
getE8y(base) = center of S16 pair
```

The component should accept `games` and `onPick` props and render `MatchupCard` for each game, `ChampionshipCard` for game 62, and plain divs for connector lines.

- [ ] **Step 2: Verify it renders**

Run: `npm run dev:web`, navigate to `/bracket`
Expected: Desktop bracket renders with all 63 matchups positioned correctly

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/bracket/DesktopBracket.tsx
git commit -m "feat(bracket): add DesktopBracket with responsive absolute positioning"
```

---

### Task 7: MobileBracket & RoundSelector Components

**Files:**
- Create: `apps/web/components/bracket/RoundSelector.tsx`
- Create: `apps/web/components/bracket/MobileBracket.tsx`

- [ ] **Step 1: Create RoundSelector**

Create `apps/web/components/bracket/RoundSelector.tsx`:

```typescript
"use client";

import { ROUNDS } from "@/lib/bracket/types";

interface RoundSelectorProps {
  currentRound: number;
  onRoundChange: (round: number) => void;
}

export function RoundSelector({
  currentRound,
  onRoundChange,
}: RoundSelectorProps) {
  const current = ROUNDS[currentRound - 1];
  const next = currentRound < 6 ? ROUNDS[currentRound] : null;

  return (
    <div className="flex items-stretch justify-center border-b border-[#21262D] bg-[#0d1117] sticky top-[45px] z-[90]">
      <button
        onClick={() => onRoundChange(Math.max(1, currentRound - 1))}
        disabled={currentRound === 1}
        className="w-9 flex items-center justify-center text-[#8B949E] text-lg disabled:opacity-30"
      >
        &larr;
      </button>
      <div className="flex-[2] flex flex-col items-center justify-center py-2.5 relative">
        <span className="text-[13px] font-bold">{current.name}</span>
        <span className="text-[10px] text-[#8B949E] mt-0.5">
          {current.gameCount} games
        </span>
        <div className="absolute bottom-0 left-[20%] right-[20%] h-0.5 bg-[#3B82F6]" />
      </div>
      {next && (
        <div className="flex-1 flex flex-col items-center justify-center py-2.5 opacity-50">
          <span className="text-[13px] font-bold">{next.name}</span>
          <span className="text-[10px] text-[#8B949E] mt-0.5">
            {next.gameCount} games
          </span>
        </div>
      )}
      <button
        onClick={() => onRoundChange(Math.min(6, currentRound + 1))}
        disabled={currentRound === 6}
        className="w-9 flex items-center justify-center text-[#8B949E] text-lg disabled:opacity-30"
      >
        &rarr;
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create MobileBracket**

> **Implementation reference**: The mockup's mobile section (search for `// ==================== MOBILE ====================` in bracket-v5.html) contains the exact structure — `.m-pair` with `.m-matchup-stack`, `.m-conn` connector lines, and `.m-peek` clipped peek cards with darker background (`#0f1318`). Port this layout to React.

Create `apps/web/components/bracket/MobileBracket.tsx`. This component:
- Renders `RoundSelector` at top
- Groups current round's games by region
- Each pair of matchups shows a "peek" card for the next round (clipped, darker)
- Connector lines between parent matchups and peek card
- Progress text showing picks count for current round

Reference the mockup's mobile section for the pair layout: `.m-pair` with `.m-matchup-stack`, `.m-conn`, and `.m-peek` structure.

- [ ] **Step 3: Verify mobile view**

Run: `npm run dev:web`, resize to < 768px or use dev tools mobile view
Expected: Mobile bracket renders with round tabs and peek cards

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/bracket/RoundSelector.tsx apps/web/components/bracket/MobileBracket.tsx
git commit -m "feat(bracket): add MobileBracket with round tabs and peek cards"
```

---

### Task 8: Wire Up BracketClient

**Files:**
- Modify: `apps/web/app/(app)/bracket/BracketClient.tsx`

- [ ] **Step 1: Update BracketClient to render desktop and mobile**

Update `apps/web/app/(app)/bracket/BracketClient.tsx` to use `useBracketState`, render `DesktopBracket` (hidden below md) and `MobileBracket` (hidden at md+), using CSS-based responsive switching:

```typescript
"use client";

import type { BracketSlotWithTeamDTO } from "@/server/dal";
import { useBracketState } from "@/components/bracket/useBracketState";
import { DesktopBracket } from "@/components/bracket/DesktopBracket";
import { MobileBracket } from "@/components/bracket/MobileBracket";

interface BracketClientProps {
  tournamentId: string;
  seasonYear: number;
  tournamentName: string;
  slots: BracketSlotWithTeamDTO[];
}

export default function BracketClient({
  tournamentId,
  tournamentName,
  slots,
}: BracketClientProps) {
  const { games, makePick, totalPicks, isComplete } = useBracketState(
    tournamentId,
    slots
  );

  return (
    <div className="w-full pb-8 md:pb-4">
      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopBracket games={games} onPick={makePick} />
      </div>

      {/* Mobile */}
      <div className="md:hidden pb-20">
        <MobileBracket games={games} onPick={makePick} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify end-to-end**

Run: `npm run dev:web`, navigate to `/bracket`
Expected: Bracket renders on desktop and mobile, picks work, cascade works, picks persist across page refresh

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/\(app\)/bracket/BracketClient.tsx
git commit -m "feat(bracket): wire up BracketClient with desktop and mobile views"
```

---

### Task 9: Final Polish & Type Check

**Files:**
- All bracket files

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit -p apps/web/tsconfig.json`
Expected: No type errors

- [ ] **Step 3: Run lint**

Run: `npm run lint -w @fantasy-madness/web`
Expected: No lint errors (or only pre-existing ones)

- [ ] **Step 4: Test responsive behavior**

Manual test:
1. Desktop: bracket fills width, max 1536px, no scrollbar
2. Resize: bracket recalculates matchup widths smoothly
3. Below 768px: switches to mobile view
4. Mobile: round tabs work, peek cards show, picks work
5. Refresh page: picks persist from localStorage
6. Pick cascade: change an early pick, downstream clears

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(bracket): final polish and verification"
```
