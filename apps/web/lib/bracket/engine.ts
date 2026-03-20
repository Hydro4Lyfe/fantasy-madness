import { ROUNDS, SEED_PAIRINGS, QUADRANT_REGIONS } from "./types";
import type { TeamInfo, BracketGame, BracketPicks } from "./types";

export function getAdvancementIndex(gameIndex: number): number | null {
  for (const round of ROUNDS) {
    const end = round.startIndex + round.gameCount;
    if (gameIndex >= round.startIndex && gameIndex < end) {
      if (round.round === 6) return null;
      const nextRound = ROUNDS[round.round];
      const offset = gameIndex - round.startIndex;
      return nextRound.startIndex + Math.floor(offset / 2);
    }
  }
  return null;
}

export function getGameRound(gameIndex: number): number {
  for (const round of ROUNDS) {
    if (gameIndex < round.startIndex + round.gameCount) return round.round;
  }
  return 6;
}

export function getGameQuadrant(gameIndex: number): number | undefined {
  const round = getGameRound(gameIndex);
  if (round >= 5) return undefined;
  const roundMeta = ROUNDS[round - 1];
  const offset = gameIndex - roundMeta.startIndex;
  const gamesPerQuadrant = roundMeta.gameCount / 4;
  return Math.floor(offset / gamesPerQuadrant) + 1;
}

export function isTopSlot(gameIndex: number): boolean {
  const roundMeta = ROUNDS[getGameRound(gameIndex) - 1];
  return (gameIndex - roundMeta.startIndex) % 2 === 0;
}

export function buildInitialGames(
  slots: Array<{ quadrant: number; seed: number; team: TeamInfo | null }>
): BracketGame[] {
  const games: BracketGame[] = [];

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

export function applyCascade(
  picks: BracketPicks,
  gameIndex: number,
  newWinnerId: number
): BracketPicks {
  const newPicks = new Map(picks);
  const oldWinnerId = newPicks.get(gameIndex);
  newPicks.set(gameIndex, newWinnerId);
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
}

export function deriveGameState(
  baseGames: BracketGame[],
  picks: BracketPicks
): BracketGame[] {
  const games = baseGames.map((g) => ({
    ...g,
    topTeam: g.topTeam ? { ...g.topTeam } : null,
    bottomTeam: g.bottomTeam ? { ...g.bottomTeam } : null,
    winner: null,
  }));

  for (const [gameIndex, winnerId] of picks) {
    const game = games[gameIndex];
    if (!game) continue;
    game.winner = winnerId;

    const nextIndex = getAdvancementIndex(gameIndex);
    if (nextIndex === null) continue;

    const nextGame = games[nextIndex];
    if (!nextGame) continue;

    const winnerTeam =
      game.topTeam?.teamId === winnerId ? game.topTeam :
      game.bottomTeam?.teamId === winnerId ? game.bottomTeam :
      null;

    if (!winnerTeam) continue;

    if (isTopSlot(gameIndex)) {
      nextGame.topTeam = winnerTeam;
    } else {
      nextGame.bottomTeam = winnerTeam;
    }
  }

  return games;
}

export function calculateBest8(
  games: BracketGame[],
  picks: BracketPicks
): Array<{ team: TeamInfo; wins: number; score: number }> {
  const teamWins = new Map<number, { team: TeamInfo; wins: number }>();

  for (const [, winnerId] of picks) {
    for (const game of games) {
      if (game.winner !== winnerId) continue;
      const winnerTeam =
        game.topTeam?.teamId === winnerId ? game.topTeam :
        game.bottomTeam?.teamId === winnerId ? game.bottomTeam :
        null;
      if (!winnerTeam) continue;

      const existing = teamWins.get(winnerId);
      if (!existing) {
        teamWins.set(winnerId, { team: winnerTeam, wins: 0 });
      }
      break;
    }
  }

  for (const [gameIndex, winnerId] of picks) {
    const existing = teamWins.get(winnerId);
    if (existing) {
      existing.wins += 1;
    }
  }

  return Array.from(teamWins.values())
    .map(({ team, wins }) => ({ team, wins, score: team.seed * wins }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}
