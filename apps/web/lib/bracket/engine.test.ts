import { describe, it, expect } from "vitest";
import {
  getAdvancementIndex,
  getGameRound,
  getGameQuadrant,
  applyCascade,
} from "./engine";
import type { BracketPicks } from "./types";

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
      [0, 100],
      [32, 100],
      [48, 100],
    ]);
    const result = applyCascade(picks, 0, 200);
    expect(result.get(0)).toBe(200);
    expect(result.has(32)).toBe(false);
    expect(result.has(48)).toBe(false);
  });

  it("changing a pick does not clear unrelated downstream picks", () => {
    const picks: BracketPicks = new Map([
      [0, 100],
      [1, 200],
      [32, 200],
    ]);
    const result = applyCascade(picks, 0, 300);
    expect(result.get(0)).toBe(300);
    expect(result.get(32)).toBe(200);
  });
});
