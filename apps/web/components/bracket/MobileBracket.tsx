"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
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
  const showConn = game1.round > 1;
  return (
    <div className="mb-4 flex items-stretch overflow-hidden matchup-anim">
      {/* Matchup stack: two cards stacked vertically */}
      <div className="flex w-[68%] shrink-0 flex-col gap-4 m-pair-stack">
        <MatchupCard
          game={game1}
          onPick={onPick}
          className="w-full" size="md" showConnector={showConn}
        />
        <MatchupCard
          game={game2}
          onPick={onPick}
          className="w-full" size="md" showConnector={showConn}
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
function SingleWithPeek({
  game,
  peekGame,
  onPick,
}: {
  game: BracketGame;
  peekGame: BracketGame | undefined;
  onPick: (gameIndex: number, teamId: number) => void;
}) {
  return (
    <div className="mb-4 flex items-stretch overflow-hidden">
      <div className="w-[68%] shrink-0">
        <MatchupCard game={game} onPick={onPick} className="w-full" size="md" showConnector />
      </div>
      <div className="relative w-7 shrink-0">
        <div className="absolute right-0 top-1/2 w-full border-t border-[#30363D]" />
      </div>
      <PeekCard game={peekGame} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MobileBracket Component                                            */
/* ------------------------------------------------------------------ */
export function MobileBracket({ games, onPick }: MobileBracketProps) {
  const [currentRound, setCurrentRound] = useState(1);
  const [slideDir, setSlideDir] = useState<"left" | "right" | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleRoundChange = useCallback((newRound: number) => {
    setSlideDir(newRound > currentRound ? "left" : "right");
    setAnimKey((k) => k + 1);
    setCurrentRound(newRound);
  }, [currentRound]);

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

  // Build round content
  let roundContent: React.ReactNode;

  if (currentRound === 6) {
    const champGame = roundGames[0];
    roundContent = champGame ? (
      <div className="px-4 pt-4">
        <ChampionshipCard game={champGame} onPick={onPick} />
      </div>
    ) : null;
  } else if (currentRound === 5) {
    // Final Four: 2 games feed into 1 Championship — show as a pair with Championship peek
    const champGame = games[62];
    if (roundGames.length === 2) {
      roundContent = (
        <div className="pl-3 pt-2">
          <MatchupPair
            game1={roundGames[0]}
            game2={roundGames[1]}
            peekGame={champGame}
            onPick={onPick}
          />
        </div>
      );
    } else {
      roundContent = (
        <div className="px-3 pt-2">
          {roundGames.map((game) => (
            <div key={game.index} className="mb-4 pl-3">
              <MatchupCard game={game} onPick={onPick} className="w-full" size="md" showConnector />
            </div>
          ))}
        </div>
      );
    }
  } else {
    // Check if every region has exactly 1 game (Elite 8 case)
    // If so, group by shared advancement target across regions instead of per-region
    const isCrossRegionPairing = regionGroups != null && regionGroups.every(rg => rg.games.length === 1);

    if (isCrossRegionPairing && regionGroups) {
      // Group games by their shared next-round target
      const byTarget = new Map<number, { games: BracketGame[]; regions: string[] }>();
      for (const { region, games: rGames } of regionGroups) {
        const g = rGames[0];
        const target = getAdvancementIndex(g.index) ?? -1;
        const entry = byTarget.get(target);
        if (entry) {
          entry.games.push(g);
          entry.regions.push(region);
        } else {
          byTarget.set(target, { games: [g], regions: [region] });
        }
      }

      roundContent = Array.from(byTarget.entries()).map(([target, { games: pairGames, regions }]) => {
        const peekGame = target >= 0 ? games[target] : undefined;
        return (
          <div key={target} className="mb-1 pl-3">
            <div className="px-1 pb-2 pt-3.5 text-sm font-bold italic text-[#8B949E] uppercase">
              {regions.join(" / ")}
            </div>
            {pairGames.length === 2 ? (
              <MatchupPair
                game1={pairGames[0]}
                game2={pairGames[1]}
                peekGame={peekGame}
                onPick={onPick}
              />
            ) : (
              <SingleWithPeek game={pairGames[0]} peekGame={peekGame} onPick={onPick} />
            )}
          </div>
        );
      });
    } else {
      roundContent = regionGroups?.map(({ region, quadrant, games: regionGames }) => (
        <div key={quadrant} className="mb-1 pl-3">
          <div className="px-1 pb-2 pt-3.5 text-sm font-bold italic text-[#8B949E] uppercase">
            {region}
          </div>
          {Array.from(
            { length: Math.floor(regionGames.length / 2) },
            (_, i) => {
              const game1 = regionGames[i * 2];
              const game2 = regionGames[i * 2 + 1];
              const peekIndex = getAdvancementIndex(game1.index);
              const peekGame = peekIndex != null ? games[peekIndex] : undefined;
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
          {regionGames.length % 2 !== 0 && (() => {
            const g = regionGames[regionGames.length - 1];
            const peekIndex = getAdvancementIndex(g.index);
            const peekGame = peekIndex != null ? games[peekIndex] : undefined;
            return <SingleWithPeek key={g.index} game={g} peekGame={peekGame} onPick={onPick} />;
          })()}
        </div>
      ));
    }
  }

  const slideClass =
    slideDir === "left"
      ? "animate-[bracketScrollRight_400ms_ease-out]"
      : slideDir === "right"
        ? "animate-[bracketScrollLeft_400ms_ease-out]"
        : "";

  return (
    <div className="pb-10">
      <style>{`
        @keyframes bracketScrollRight {
          0% {
            opacity: 0;
            transform: translateX(100px);
          }
          40% {
            opacity: 1;
          }
          100% {
            transform: translateX(0);
          }
        }
        @keyframes bracketScrollLeft {
          0% {
            opacity: 0;
            transform: translateX(-100px);
          }
          40% {
            opacity: 1;
          }
          100% {
            transform: translateX(0);
          }
        }
        /* Animate the gap between matchup cards within pairs */
        .bracket-round-enter .m-pair-stack {
          animation: gapCompress 500ms ease-out;
        }
        @keyframes gapCompress {
          from { gap: 2rem; }
          to { gap: 1rem; }
        }
        /* Animate individual matchup cards staggered */
        .bracket-round-enter .matchup-anim {
          animation: matchupSlideIn 400ms ease-out both;
        }
        .bracket-round-enter .matchup-anim:nth-child(2) { animation-delay: 50ms; }
        .bracket-round-enter .matchup-anim:nth-child(3) { animation-delay: 100ms; }
        .bracket-round-enter .matchup-anim:nth-child(4) { animation-delay: 150ms; }
        @keyframes matchupSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <RoundSelector
        currentRound={currentRound}
        onRoundChange={handleRoundChange}
      />
      <div className="py-3 text-center text-[11px] text-[#6e7681]">
        {picksMade} / {roundMeta.gameCount} picks made
      </div>
      <div key={animKey} ref={contentRef} className={cn("pt-1 bracket-round-enter", slideClass)}>
        {roundContent}
      </div>
    </div>
  );
}
