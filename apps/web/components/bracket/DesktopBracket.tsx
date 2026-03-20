"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { MatchupCard } from "./MatchupCard";
import { ChampionshipCard } from "./ChampionshipCard";
import type { BracketGame } from "@/lib/bracket/types";

/* ------------------------------------------------------------------ */
/*  Constants (ported from bracket-v5.html mockup)                     */
/* ------------------------------------------------------------------ */
const MH = 53; // matchup height: 26px row * 2 + 1px border
const GAP = 5; // gap between R64 matchups
const UNIT = MH + GAP; // 58px per matchup slot
const CW = 32; // connector column width
const REGION_GAP = 100; // vertical gap between upper/lower regions
const REGION_H = 8 * UNIT - GAP; // height of one region's R64 column
const SIDE_GAP = 16; // gap between left and right halves
const MIN_MW = 80; // minimum matchup width

/** Base Y for the lower region (south / midwest). */
const SECOND_BASE = REGION_H + REGION_GAP;

/** Total bracket field height. */
const TOTAL_H = SECOND_BASE + REGION_H;

/* ------------------------------------------------------------------ */
/*  Visual region mapping                                              */
/*  Left  top = East  (Q1)   Left  bottom = South (Q3)               */
/*  Right top = West  (Q2)   Right bottom = Midwest (Q4)             */
/* ------------------------------------------------------------------ */
interface RegionDef {
  quadrant: number;
  label: string;
  side: "left" | "right";
  baseY: number;
}

const REGION_DEFS: RegionDef[] = [
  { quadrant: 1, label: "East", side: "left", baseY: 0 },
  { quadrant: 3, label: "South", side: "left", baseY: SECOND_BASE },
  { quadrant: 2, label: "West", side: "right", baseY: 0 },
  { quadrant: 4, label: "Midwest", side: "right", baseY: SECOND_BASE },
];

/* ------------------------------------------------------------------ */
/*  Vertical-position helpers (center between parent matchups)         */
/* ------------------------------------------------------------------ */
function getR32y(base: number, i: number): number {
  return (
    (base + i * 2 * UNIT + base + (i * 2 + 1) * UNIT + MH) / 2 - MH / 2
  );
}

function getS16y(base: number, i: number): number {
  return (
    (getR32y(base, i * 2) + getR32y(base, i * 2 + 1) + MH) / 2 - MH / 2
  );
}

function getE8y(base: number): number {
  return (getS16y(base, 0) + getS16y(base, 1) + MH) / 2 - MH / 2;
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface DesktopBracketProps {
  games: BracketGame[];
  onPick: (gameIndex: number, teamId: number) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function DesktopBracket({ games, onPick }: DesktopBracketProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Measure container on mount + resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => setContainerWidth(el.clientWidth);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Derived layout values
  const layout = useMemo(() => {
    if (containerWidth === 0) return null;
    const availableW = containerWidth - 40; // minus padding
    const MW = Math.max(Math.floor((availableW - 6 * CW - SIDE_GAP) / 8), MIN_MW);

    const sideWidth = 4 * MW + 3 * CW;
    const totalWidth = sideWidth + SIDE_GAP + sideWidth;

    // Column X positions — left side
    const leftR64x = 0;
    const leftR32x = MW + CW;
    const leftS16x = (MW + CW) * 2;
    const leftE8x = (MW + CW) * 3;

    // Column X positions — right side (mirrored)
    const rightE8x = sideWidth + SIDE_GAP;
    const rightS16x = rightE8x + MW + CW;
    const rightR32x = rightS16x + MW + CW;
    const rightR64x = rightR32x + MW + CW;

    // Center section
    const bracketCenterX = totalWidth / 2;
    const centerMW = MW;
    const CENTER_GAP = Math.max(16, MW * 0.3);
    const ffLeftX = bracketCenterX - centerMW * 1.5 - CENTER_GAP;
    const ffRightX = bracketCenterX + centerMW * 0.5 + CENTER_GAP;
    const champCardW = centerMW + 40;
    const champX = bracketCenterX - champCardW / 2;
    const gapCenter = (REGION_H + SECOND_BASE) / 2;
    const centerY = gapCenter - MH / 2;
    const champCardH = 97; // 48px * 2 + 1px border
    const champY = gapCenter - champCardH / 2;

    // Final rounds header width
    const finalRoundsW = MW + CW + SIDE_GAP + CW + MW;

    return {
      MW,
      sideWidth,
      totalWidth,
      leftR64x,
      leftR32x,
      leftS16x,
      leftE8x,
      rightE8x,
      rightS16x,
      rightR32x,
      rightR64x,
      bracketCenterX,
      centerMW,
      CENTER_GAP,
      ffLeftX,
      ffRightX,
      champCardW,
      champX,
      champY,
      centerY,
      gapCenter,
      finalRoundsW,
    };
  }, [containerWidth]);

  // Helpers to get column X for a round/side
  const getColX = useCallback(
    (round: number, side: "left" | "right") => {
      if (!layout) return 0;
      if (side === "left") {
        switch (round) {
          case 1: return layout.leftR64x;
          case 2: return layout.leftR32x;
          case 3: return layout.leftS16x;
          case 4: return layout.leftE8x;
          default: return 0;
        }
      } else {
        switch (round) {
          case 1: return layout.rightR64x;
          case 2: return layout.rightR32x;
          case 3: return layout.rightS16x;
          case 4: return layout.rightE8x;
          default: return 0;
        }
      }
    },
    [layout]
  );

  if (!layout) {
    return (
      <div ref={containerRef} className="w-full max-w-[1536px] mx-auto px-5">
        {/* Placeholder while measuring */}
        <div style={{ height: TOTAL_H }} />
      </div>
    );
  }

  const { MW, totalWidth, centerMW, ffLeftX, ffRightX, champCardW, champX, champY, centerY, gapCenter, finalRoundsW } = layout;

  /* ---------------------------------------------------------------- */
  /*  Build matchup cards + connector lines                            */
  /* ---------------------------------------------------------------- */
  const matchupCards: React.ReactNode[] = [];
  const connectorLines: React.ReactNode[] = [];
  const regionLabels: React.ReactNode[] = [];

  let keyIdx = 0;

  // Helper: add a horizontal or vertical connector line
  function addLine(x1: number, y1: number, x2: number, y2: number) {
    const key = `line-${keyIdx++}`;
    if (y1 === y2) {
      // Horizontal
      connectorLines.push(
        <div
          key={key}
          className="absolute border-[#30363D] border-solid border-0 border-t"
          style={{
            left: Math.min(x1, x2),
            top: y1,
            width: Math.abs(x2 - x1),
          }}
        />
      );
    } else {
      // Vertical
      connectorLines.push(
        <div
          key={key}
          className="absolute border-[#30363D] border-solid border-0 border-l"
          style={{
            left: x1,
            top: Math.min(y1, y2),
            height: Math.abs(y2 - y1),
          }}
        />
      );
    }
  }

  // Helper: draw bracket connector between a pair of matchups and their child
  function drawConn(
    parentX: number,
    y1top: number,
    y1bot: number,
    childX: number,
    childY: number,
    side: "left" | "right"
  ) {
    const midY1 = y1top + MH / 2;
    const midY2 = y1bot + MH / 2;
    const outY = childY + MH / 2;

    if (side === "left") {
      addLine(parentX + MW, midY1, parentX + MW + CW / 2, midY1);
      addLine(parentX + MW, midY2, parentX + MW + CW / 2, midY2);
      addLine(parentX + MW + CW / 2, midY1, parentX + MW + CW / 2, midY2);
      addLine(parentX + MW + CW / 2, outY, childX, outY);
    } else {
      addLine(parentX, midY1, parentX - CW / 2, midY1);
      addLine(parentX, midY2, parentX - CW / 2, midY2);
      addLine(parentX - CW / 2, midY1, parentX - CW / 2, midY2);
      addLine(parentX - CW / 2, outY, childX + MW, outY);
    }
  }

  // Draw each region (rounds 1-4)
  for (const region of REGION_DEFS) {
    const { quadrant, label, side, baseY } = region;
    const r64x = getColX(1, side);
    const r32x = getColX(2, side);
    const s16x = getColX(3, side);
    const e8x = getColX(4, side);

    // Region label
    const labelAlign = side === "right" ? "right" : "left";
    regionLabels.push(
      <div
        key={`region-${quadrant}`}
        className="absolute text-[10px] font-bold uppercase tracking-[0.12em] text-[#6e7681] px-1 pb-1"
        style={{
          left: r64x,
          top: baseY - 18,
          width: MW,
          textAlign: labelAlign,
        }}
      >
        {label}
      </div>
    );

    // R64 matchups (8 per region)
    const r64Games = games.filter(
      (g) => g.round === 1 && g.quadrant === quadrant
    );
    r64Games.forEach((game, i) => {
      matchupCards.push(
        <MatchupCard
          key={`m-${game.index}`}
          game={game}
          onPick={onPick}
          className="absolute"
          style={{
            left: r64x,
            top: baseY + i * UNIT,
            width: MW,
          }}
        />
      );
    });

    // R32 matchups (4 per region)
    const r32Games = games.filter(
      (g) => g.round === 2 && g.quadrant === quadrant
    );
    r32Games.forEach((game, i) => {
      const y = getR32y(baseY, i);
      matchupCards.push(
        <MatchupCard
          key={`m-${game.index}`}
          game={game}
          onPick={onPick}
          className="absolute"
          style={{ left: r32x, top: y, width: MW }}
        />
      );
      // Connector from R64 pair to this R32
      drawConn(r64x, baseY + i * 2 * UNIT, baseY + (i * 2 + 1) * UNIT, r32x, y, side);
    });

    // S16 matchups (2 per region)
    const s16Games = games.filter(
      (g) => g.round === 3 && g.quadrant === quadrant
    );
    s16Games.forEach((game, i) => {
      const y = getS16y(baseY, i);
      matchupCards.push(
        <MatchupCard
          key={`m-${game.index}`}
          game={game}
          onPick={onPick}
          className="absolute"
          style={{ left: s16x, top: y, width: MW }}
        />
      );
      // Connector from R32 pair to this S16
      drawConn(r32x, getR32y(baseY, i * 2), getR32y(baseY, i * 2 + 1), s16x, y, side);
    });

    // E8 matchup (1 per region)
    const e8Games = games.filter(
      (g) => g.round === 4 && g.quadrant === quadrant
    );
    if (e8Games.length > 0) {
      const ey = getE8y(baseY);
      matchupCards.push(
        <MatchupCard
          key={`m-${e8Games[0].index}`}
          game={e8Games[0]}
          onPick={onPick}
          className="absolute"
          style={{ left: e8x, top: ey, width: MW }}
        />
      );
      // Connector from S16 pair to this E8
      drawConn(s16x, getS16y(baseY, 0), getS16y(baseY, 1), e8x, ey, side);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Center section: Final Four + Championship                        */
  /* ---------------------------------------------------------------- */

  // FF Left (game 60)
  const ffLeftGame = games.find((g) => g.index === 60);
  if (ffLeftGame) {
    matchupCards.push(
      <MatchupCard
        key="m-60"
        game={ffLeftGame}
        onPick={onPick}
        className="absolute"
        style={{ left: ffLeftX, top: centerY, width: centerMW }}
      />
    );
  }

  // FF Left label
  matchupCards.push(
    <div
      key="ff-label-left"
      className="absolute text-[11px] font-bold uppercase tracking-[0.12em] text-[#8B949E] text-center"
      style={{ left: ffLeftX, top: centerY - 16, width: centerMW }}
    >
      Final Four
    </div>
  );

  // FF Right (game 61)
  const ffRightGame = games.find((g) => g.index === 61);
  if (ffRightGame) {
    matchupCards.push(
      <MatchupCard
        key="m-61"
        game={ffRightGame}
        onPick={onPick}
        className="absolute"
        style={{ left: ffRightX, top: centerY, width: centerMW }}
      />
    );
  }

  // FF Right label
  matchupCards.push(
    <div
      key="ff-label-right"
      className="absolute text-[11px] font-bold uppercase tracking-[0.12em] text-[#8B949E] text-center"
      style={{ left: ffRightX, top: centerY - 16, width: centerMW }}
    >
      Final Four
    </div>
  );

  // Championship (game 62)
  const champGame = games.find((g) => g.index === 62);
  if (champGame) {
    matchupCards.push(
      <ChampionshipCard
        key="m-62"
        game={champGame}
        onPick={onPick}
        className="absolute"
        style={{ left: champX, top: champY, width: champCardW }}
      />
    );
  }

  // Connector lines: FF Left → Championship, FF Right → Championship
  const ffMidY = centerY + MH / 2;
  addLine(ffLeftX + centerMW, ffMidY, champX, ffMidY);
  addLine(champX + champCardW, ffMidY, ffRightX, ffMidY);

  /* ---------------------------------------------------------------- */
  /*  Round headers                                                    */
  /* ---------------------------------------------------------------- */
  const leftRounds = [
    ["R64", "Mar 19-20"],
    ["R32", "Mar 21-22"],
    ["Sweet 16", "Mar 26-27"],
  ];
  const rightRounds = [
    ["Sweet 16", "Mar 26-27"],
    ["R32", "Mar 21-22"],
    ["R64", "Mar 19-20"],
  ];

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[1536px] mx-auto px-5 pb-10"
    >
      {/* Round headers */}
      <div className="flex justify-center gap-0 pb-3 mb-6 border-b border-[#21262D]">
        {leftRounds.map((r, i) => (
          <div key={`lh-${i}`} className="flex items-start">
            {i > 0 && <div className="w-8 shrink-0" />}
            <div
              className="text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8B949E] shrink-0"
              style={{ width: MW }}
            >
              {r[0]}
              <div className="text-[9px] text-[#6e7681] font-normal mt-px">
                {r[1]}
              </div>
            </div>
          </div>
        ))}

        {/* Connector before center */}
        <div className="w-8 shrink-0" />

        {/* Final Rounds header */}
        <div
          className="text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8B949E] shrink-0"
          style={{ width: finalRoundsW }}
        >
          Final Rounds
          <div className="text-[9px] text-[#6e7681] font-normal mt-px">
            Mar 28 - Apr 7
          </div>
        </div>

        {rightRounds.map((r, i) => (
          <div key={`rh-${i}`} className="flex items-start">
            <div className="w-8 shrink-0" />
            <div
              className="text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8B949E] shrink-0"
              style={{ width: MW }}
            >
              {r[0]}
              <div className="text-[9px] text-[#6e7681] font-normal mt-px">
                {r[1]}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bracket field */}
      <div
        className="relative mx-auto"
        style={{ width: totalWidth, height: TOTAL_H }}
      >
        {regionLabels}
        {connectorLines}
        {matchupCards}
      </div>
    </div>
  );
}
