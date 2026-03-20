"use client";

import { useState, useMemo } from "react";
import { MatchupCard } from "./MatchupCard";
import { ChampionshipCard } from "./ChampionshipCard";
import { TeamRow } from "./TeamRow";
import { RoundSelector } from "./RoundSelector";
import { getAdvancementIndex } from "@/lib/bracket/engine";
import { ROUNDS, QUADRANT_REGIONS } from "@/lib/bracket/types";
import type { BracketGame } from "@/lib/bracket/types";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface MobileBracketProps {
  games: BracketGame[];
  onPick: (gameIndex: number, teamId: number) => void;
}

/* ------------------------------------------------------------------ */
/*  Connector (CSS-only bracket lines between pair and peek)           */
/* ------------------------------------------------------------------ */
function PairConnector() {
  return (
    <div className="relative w-7 shrink-0">
      {/* Vertical bar from 25% to 75% */}
      <div className="absolute left-1/2 top-1/4 bottom-1/4 w-0 border-l border-[#30363D]" />
      {/* Top horizontal tick: left edge to center at 25% */}
      <div className="absolute left-0 top-1/4 w-1/2 border-t border-[#30363D]" />
      {/* Bottom horizontal tick */}
      <div className="absolute left-0 bottom-1/4 w-1/2 border-t border-[#30363D]" />
      {/* Output tick: center to right edge at 50% */}
      <div className="absolute right-0 top-1/2 w-1/2 border-t border-[#30363D]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Peek card (read-only preview of the next-round matchup)            */
/* ------------------------------------------------------------------ */
function PeekCard({ game }: { game: BracketGame | undefined }) {
  return (
    <div className="flex w-[68%] shrink-0 flex-col justify-center">
      <div className="overflow-hidden rounded border border-[#252b33] bg-[#0f1318]">
        <div className="flex h-[42px] cursor-default items-center gap-[7px] px-2.5 text-[13px] text-[#8B949E]">
          {game?.topTeam ? (
            <>
              <div className="h-[22px] w-[22px] shrink-0 rounded-[3px] bg-white/[0.04] opacity-60" />
              <span className="w-[18px] shrink-0 text-right text-[11px] font-bold text-[#6e7681]">
                {game.topTeam.seed}
              </span>
              <span className="flex-1 truncate font-medium text-[#8B949E]">
                {game.topTeam.fullName}
              </span>
            </>
          ) : (
            <>
              <div className="h-[22px] w-[22px] shrink-0 rounded-[3px] bg-white/[0.04] opacity-60" />
              <span className="w-[18px] shrink-0 text-right text-[11px] font-bold text-[#6e7681]">
                -
              </span>
              <span className="flex-1 truncate font-medium text-[#8B949E]">
                ---
              </span>
            </>
          )}
        </div>
        <div className="border-t border-[#252b33]" />
        <div className="flex h-[42px] cursor-default items-center gap-[7px] px-2.5 text-[13px] text-[#8B949E]">
          {game?.bottomTeam ? (
            <>
              <div className="h-[22px] w-[22px] shrink-0 rounded-[3px] bg-white/[0.04] opacity-60" />
              <span className="w-[18px] shrink-0 text-right text-[11px] font-bold text-[#6e7681]">
                {game.bottomTeam.seed}
              </span>
              <span className="flex-1 truncate font-medium text-[#8B949E]">
                {game.bottomTeam.fullName}
              </span>
            </>
          ) : (
            <>
              <div className="h-[22px] w-[22px] shrink-0 rounded-[3px] bg-white/[0.04] opacity-60" />
              <span className="w-[18px] shrink-0 text-right text-[11px] font-bold text-[#6e7681]">
                -
              </span>
              <span className="flex-1 truncate font-medium text-[#8B949E]">
                ---
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Matchup pair (two parent games + connector + peek card)            */
/* ------------------------------------------------------------------ */
function MatchupPair({
  game1,
  game2,
  peekGame,
  onPick,
}: {
  game1: BracketGame;
  game2: BracketGame;
  peekGame: BracketGame | undefined;
  onPick: (gameIndex: number, teamId: number) => void;
}) {
  return (
    <div className="mb-2.5 flex items-stretch overflow-hidden">
      {/* Matchup stack: two cards stacked vertically */}
      <div className="flex w-[68%] shrink-0 flex-col gap-1">
        <MatchupCard
          game={game1}
          onPick={onPick}
          className="w-full [&>div]:h-[42px] [&>div]:px-2.5 [&>div]:gap-[7px] [&>div]:text-[13px] [&>div]:border-l-4"
        />
        <MatchupCard
          game={game2}
          onPick={onPick}
          className="w-full [&>div]:h-[42px] [&>div]:px-2.5 [&>div]:gap-[7px] [&>div]:text-[13px] [&>div]:border-l-4"
        />
      </div>

      {/* Connector lines */}
      <PairConnector />

      {/* Peek card (clipped by parent overflow:hidden) */}
      <PeekCard game={peekGame} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Single matchup (for rounds where pairing doesn't apply — odd counts */
/* ------------------------------------------------------------------ */
function SingleMatchup({
  game,
  onPick,
}: {
  game: BracketGame;
  onPick: (gameIndex: number, teamId: number) => void;
}) {
  return (
    <div className="mb-2.5 pl-3">
      <MatchupCard
        game={game}
        onPick={onPick}
        className="w-[68%] [&>div]:h-[42px] [&>div]:px-2.5 [&>div]:gap-[7px] [&>div]:text-[13px] [&>div]:border-l-4"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MobileBracket Component                                            */
/* ------------------------------------------------------------------ */
export function MobileBracket({ games, onPick }: MobileBracketProps) {
  const [currentRound, setCurrentRound] = useState(1);

  const roundMeta = ROUNDS[currentRound - 1];

  // Games for the current round
  const roundGames = useMemo(
    () => games.filter((g) => g.round === currentRound),
    [games, currentRound]
  );

  // Count picks made in this round
  const picksMade = useMemo(
    () => roundGames.filter((g) => g.winner != null).length,
    [roundGames]
  );

  // Group games by region for rounds 1-4
  const regionGroups = useMemo(() => {
    if (currentRound >= 5) return null;

    const groups: Array<{ region: string; quadrant: number; games: BracketGame[] }> = [];
    for (let q = 1; q <= 4; q++) {
      const regionGames = roundGames
        .filter((g) => g.quadrant === q)
        .sort((a, b) => a.index - b.index);
      if (regionGames.length > 0) {
        groups.push({
          region: QUADRANT_REGIONS[q],
          quadrant: q,
          games: regionGames,
        });
      }
    }
    return groups;
  }, [roundGames, currentRound]);

  // Championship round
  if (currentRound === 6) {
    const champGame = roundGames[0];
    return (
      <div className="overflow-x-hidden pb-10">
        <RoundSelector
          currentRound={currentRound}
          onRoundChange={setCurrentRound}
        />
        <div className="py-2 text-center text-[11px] text-[#6e7681]">
          {picksMade} / {roundMeta.gameCount} picks made
        </div>
        {champGame && (
          <div className="px-4 pt-4">
            <ChampionshipCard game={champGame} onPick={onPick} />
          </div>
        )}
      </div>
    );
  }

  // Final Four (round 5) — no regions, just list the matchups
  if (currentRound === 5) {
    return (
      <div className="overflow-x-hidden pb-10">
        <RoundSelector
          currentRound={currentRound}
          onRoundChange={setCurrentRound}
        />
        <div className="py-2 text-center text-[11px] text-[#6e7681]">
          {picksMade} / {roundMeta.gameCount} picks made
        </div>
        <div className="px-3">
          {roundGames.map((game) => {
            const peekIndex = getAdvancementIndex(game.index);
            const peekGame = peekIndex != null ? games[peekIndex] : undefined;
            return (
              <div key={game.index} className="mb-2.5 pl-3">
                <MatchupCard
                  game={game}
                  onPick={onPick}
                  className="w-full [&>div]:h-[42px] [&>div]:px-2.5 [&>div]:gap-[7px] [&>div]:text-[13px] [&>div]:border-l-4"
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Rounds 1-4 — grouped by region with paired matchups + peek cards
  return (
    <div className="overflow-x-hidden pb-10">
      <RoundSelector
        currentRound={currentRound}
        onRoundChange={setCurrentRound}
      />
      <div className="py-2 text-center text-[11px] text-[#6e7681]">
        {picksMade} / {roundMeta.gameCount} picks made
      </div>

      {regionGroups?.map(({ region, quadrant, games: regionGames }) => (
        <div key={quadrant} className="mb-1 pl-3">
          {/* Region header */}
          <div className="px-1 pb-2 pt-3.5 text-sm font-bold italic text-[#8B949E] uppercase">
            {region}
          </div>

          {/* Pair consecutive games */}
          {Array.from(
            { length: Math.floor(regionGames.length / 2) },
            (_, i) => {
              const game1 = regionGames[i * 2];
              const game2 = regionGames[i * 2 + 1];
              // Both games in a pair feed into the same next-round game
              const peekIndex = getAdvancementIndex(game1.index);
              const peekGame =
                peekIndex != null ? games[peekIndex] : undefined;

              return (
                <MatchupPair
                  key={game1.index}
                  game1={game1}
                  game2={game2}
                  peekGame={peekGame}
                  onPick={onPick}
                />
              );
            }
          )}

          {/* Handle odd game out (shouldn't happen but be safe) */}
          {regionGames.length % 2 !== 0 && (
            <SingleMatchup
              game={regionGames[regionGames.length - 1]}
              onPick={onPick}
            />
          )}
        </div>
      ))}
    </div>
  );
}
