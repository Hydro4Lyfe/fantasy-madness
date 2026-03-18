export type DraftStatus = "OPEN" | "DRAFTING" | "LOCKED" | "COMPLETE";

export type DraftPhase =
  | "WAITING"    // OPEN, not yet in lobby window
  | "LOBBY"      // OPEN, within 30min of startAt, room accessible
  | "COUNTDOWN"  // OPEN, countdownStartedAt is set, 30s ticking
  | "DRAFTING"   // status === DRAFTING, picks active
  | "LOCKED"     // status === LOCKED
  | "COMPLETE";  // status === COMPLETE

export const LOBBY_WINDOW_MS = 30 * 60_000;    // 30 minutes
export const COUNTDOWN_DURATION_MS = 30_000;    // 30 seconds

export function computeDraftPhase(args: {
  status: string;
  startAt: Date | null;
  countdownStartedAt: Date | null;
  now?: Date;
}): DraftPhase {
  const now = args.now ?? new Date();

  if (args.status === "DRAFTING") return "DRAFTING";
  if (args.status === "LOCKED") return "LOCKED";
  if (args.status === "COMPLETE") return "COMPLETE";

  // status === "OPEN"
  if (args.countdownStartedAt) {
    return "COUNTDOWN";
  }

  if (args.startAt) {
    const lobbyOpensAt = new Date(args.startAt.getTime() - LOBBY_WINDOW_MS);
    if (now >= lobbyOpensAt) return "LOBBY";
  }

  return "WAITING";
}

export type LeagueStatus = "OPEN" | "LOCKED" | "COMPLETE";
