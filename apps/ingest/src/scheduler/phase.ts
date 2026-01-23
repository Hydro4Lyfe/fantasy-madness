import { prisma } from "@fantasy-madness/db";
import { getPhaseInputs } from "@fantasy-madness/dal";
import { DateTime } from "luxon";

const TZ = "UTC";

export type Phase =
  | "OFFSEASON"
  | "DISCOVERY"
  | "PRE_TOURNAMENT"
  | "SELECTION_WINDOW"
  | "TOURNAMENT_GAMEDAY"
  | "TOURNAMENT_GAPDAY"
  | "COOLDOWN"
  | "COMPLETED";

/**
 * Phase computation (DB-driven):
 * - OFFSEASON: no API calls (until Sep 1 UTC) if we don't already have an active tournament
 * - DISCOVERY: search tournament list until we "latch" a tournament
 * - PRE_TOURNAMENT: tournament exists but bracket/schedule not populated yet
 * - SELECTION_WINDOW: close enough to start (or bracket forming) to pull more frequently
 * - TOURNAMENT_GAMEDAY: next scheduled game within 24h
 * - TOURNAMENT_GAPDAY: tournament live-ish but next game > 24h away
 * - COOLDOWN: within 72h after last close (and no game within 24h)
 * - COMPLETED: tournament completed / clearly done
 */
export async function computePhase(): Promise<Phase> {
  const now = DateTime.now().setZone(TZ);

  // "Active-ish" includes anything we might care about syncing.
  const inputs = await getPhaseInputs({
    db: prisma,
    states: ["DISCOVERED", "MONITORING", "BRACKET_LOCKED", "LIVE", "COMPLETED"] as any,
    now: new Date(),
  });

  const t = inputs.tournament;

  // No tournament in DB: honor your Sep 1 rule.
  if (!t) {
    const sep1 = DateTime.fromObject({ year: now.year, month: 9, day: 1 }, { zone: TZ });
    return now < sep1 ? "OFFSEASON" : "DISCOVERY";
  }

  const gameCount = inputs.gameCount;
  const teamCount = inputs.teamCount;

  const start = t.startDate ? DateTime.fromJSDate(t.startDate).setZone(TZ) : null;
  const end = t.endDate ? DateTime.fromJSDate(t.endDate).setZone(TZ) : null;

  const nextGameAt = inputs.nextGameAt
    ? DateTime.fromJSDate(inputs.nextGameAt).setZone(TZ)
    : null;

  const lastClosedAt = inputs.lastClosedAt
    ? DateTime.fromJSDate(inputs.lastClosedAt).setZone(TZ)
    : null;

  const hoursToNext = nextGameAt ? nextGameAt.diff(now, "hours").hours : null;
  const hoursSinceClose = lastClosedAt ? now.diff(lastClosedAt, "hours").hours : null;

  // COMPLETED: explicit state wins.
  if (String(t.syncState) === "COMPLETED") {
    return "COMPLETED";
  }

  // COMPLETED: inferred (end passed, no upcoming games, nothing closed recently).
  if (
    end &&
    now > end.plus({ days: 2 }) &&
    !nextGameAt &&
    (hoursSinceClose == null || hoursSinceClose > 72)
  ) {
    return "COMPLETED";
  }

  // GAMEDAY: if there's a next game within 24 hours, we’re “live cadence”.
  if (hoursToNext != null && hoursToNext <= 24) {
    return "TOURNAMENT_GAMEDAY";
  }

  // COOLDOWN: if last close was recent and no game within 24h.
  if (hoursSinceClose != null && hoursSinceClose <= 72) {
    return "COOLDOWN";
  }

  // PRE_TOURNAMENT: tournament exists but we don't have real bracket/schedule populated yet.
  // This is what makes September–early March “feel right”.
  if (!start || gameCount === 0 || teamCount === 0) {
    return "PRE_TOURNAMENT";
  }

  // SELECTION_WINDOW: ~10 days before start through ~2 days after start
  // (bracket solidifying, seeds/teams fluctuating).
  const hoursToStart = start.diff(now, "hours").hours;
  if (hoursToStart <= 10 * 24 && hoursToStart >= -2 * 24) {
    return "SELECTION_WINDOW";
  }

  // TOURNAMENT_GAPDAY: tournament is "live-ish" but next game is not within 24h.
  // We'll consider it live-ish if:
  // - syncState indicates it (LIVE/BRACKET_LOCKED), OR
  // - we’re within the tournament date range, OR
  // - there exists a future scheduled game at all.
  const liveish =
    ["LIVE", "BRACKET_LOCKED"].includes(String(t.syncState)) ||
    (start && end && now >= start.minus({ days: 2 }) && now <= end.plus({ days: 2 })) ||
    !!nextGameAt;

  if (liveish) return "TOURNAMENT_GAPDAY";

  // Otherwise: it’s basically pre-tournament maintenance.
  return "PRE_TOURNAMENT";
}
