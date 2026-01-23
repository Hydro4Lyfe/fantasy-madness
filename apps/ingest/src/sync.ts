// apps/ingest/src/sync.ts
import { Prisma as PrismaNS, type Prisma } from "@prisma/client";
import { prisma } from "@fantasy-madness/db";
import { log } from "./logger.js";
import { sha256Hex } from "./hash.js";
import { fetchTournamentSchedule, fetchTournamentSummary } from "./sportradar.js";
import {
  maybeMaterializeBracketSlotsOnce,
  resolvePlayInSlots,
} from "./bracketSlots.js";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function retry<T>(fn: () => Promise<T>, tries = 5): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      // Don't retry permanent "not found"
      if (String(e).includes("HTTP_404")) throw e;

      lastErr = e;
      const hinted = (e as any)?.retryAfterMs;
      const backoff =
        typeof hinted === "number" && hinted > 0
          ? hinted
          : Math.min(30_000, 500 * Math.pow(2, i)) +
            Math.floor(Math.random() * 250);

      log.warn({ err: String(e), backoff }, "retrying");
      await sleep(backoff);
    }
  }
  throw lastErr;
}

function parseDateMaybe(s: any): Date | null {
  if (!s) return null;
  const d = new Date(String(s));
  return Number.isNaN(d.getTime()) ? null : d;
}

type CanonGameStatus =
  | "scheduled"
  | "created"
  | "inprogress"
  | "halftime"
  | "complete"
  | "closed"
  | "cancelled"
  | "delayed"
  | "postponed"
  | "time_tbd"
  | "if_necessary"
  | "unnecessary"
  | "forfeited";

const KNOWN_STATUSES: Record<CanonGameStatus, true> = {
  scheduled: true,
  created: true,
  inprogress: true,
  halftime: true,
  complete: true,
  closed: true,
  cancelled: true,
  delayed: true,
  postponed: true,
  time_tbd: true,
  if_necessary: true,
  unnecessary: true,
  forfeited: true,
};

function isFinalStatus(status: CanonGameStatus): boolean {
  return status === "complete" || status === "closed" || status === "forfeited";
}

type ExistingGameLite = {
  id: string;
  status: string;
  isPlayIn: boolean;
  winnerTeamId: string | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homePoints: number | null;
  awayPoints: number | null;
  finalizedAt: Date | null;
  closedAt: Date | null;
};

function didScoringRelevantChange(
  prev: ExistingGameLite | undefined,
  next: {
    status: CanonGameStatus;
    isPlayIn: boolean;
    winnerTeamId: string | null;
    homePoints: number | null;
    awayPoints: number | null;
  },
): boolean {
  if (!prev) {
    // new game: only matters if it’s already final-like w/ winner
    return isFinalStatus(next.status) && !!next.winnerTeamId && !next.isPlayIn;
  }

  const prevFinal = isFinalStatus(mapGameStatus(prev.status));
  const nextFinal = isFinalStatus(next.status);

  // winner change / flip into or out of final / play-in toggle
  if (prev.winnerTeamId !== next.winnerTeamId) return true;
  if (prev.isPlayIn !== next.isPlayIn) return true;
  if (prevFinal !== nextFinal) return true;

  // point corrections while final-like (rare, but real)
  if (nextFinal) {
    if (prev.homePoints !== next.homePoints) return true;
    if (prev.awayPoints !== next.awayPoints) return true;
  }

  return false;
}

function mapGameStatus(raw: any): CanonGameStatus {
  const s = String(raw ?? "").trim();
  if (!s) return "scheduled";

  let n = s.toLowerCase().replace(/-/g, "_");
  if (n === "in_progress") n = "inprogress";
  if (n === "canceled") n = "cancelled";

  if ((KNOWN_STATUSES as any)[n]) return n as CanonGameStatus;

  const squashed = n.replace(/_/g, "");
  if (squashed === "timetbd") return "time_tbd";
  if (squashed === "ifnecessary") return "if_necessary";

  log.warn({ rawStatus: s }, "Unknown game status; defaulting to scheduled");
  return "scheduled";
}

function pickRoundName(x: any): string {
  // schedule games often have round in `title`
  return String(
    x?.round?.name ??
      x?.tournament_round?.name ??
      x?.round_name ??
      x?.sport_event?.tournament_round?.name ??
      x?.sport_event?.tournament_round?.type ??
      x?.title ??
      x?.round ??
      "",
  ).trim();
}

function pickRoundSeq(x: any): number | null {
  const v =
    x?.round?.sequence ??
    x?.tournament_round?.sequence ??
    x?.sport_event?.tournament_round?.sequence ??
    x?.round_seq ??
    null;
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function isPlayInRound(roundName: string): boolean {
  return /first four|play[-\s]?in/i.test(roundName);
}

/** ---- Summary parsing (brackets->participants is the key for March Madness) ---- */
type BracketMeta = {
  bracketId: string;
  bracketName: string | null;
  bracketRank: number | null;
};

function extractBracketParticipants(
  summary: any,
): Array<{ team: any; meta: BracketMeta }> {
  const brackets = Array.isArray(summary?.brackets) ? summary.brackets : [];
  const out: Array<{ team: any; meta: BracketMeta }> = [];

  for (const b of brackets) {
    const meta: BracketMeta = {
      bracketId: b?.id ? String(b.id) : "",
      bracketName: b?.name ? String(b.name) : null,
      bracketRank: b?.rank == null ? null : Number(b.rank),
    };

    const participants = Array.isArray(b?.participants) ? b.participants : [];
    for (const p of participants) out.push({ team: p, meta });
  }

  // fallback
  const top = Array.isArray(summary?.participants) ? summary.participants : [];
  for (const p of top) {
    out.push({
      team: p,
      meta: { bracketId: "", bracketName: null, bracketRank: null },
    });
  }

  return out;
}

function normalizeTeamName(t: any): {
  name: string | null;
  market: string | null;
  alias: string | null;
} {
  const alias = t?.alias
    ? String(t.alias)
    : t?.abbreviation
      ? String(t.abbreviation)
      : null;

  const market = t?.market ? String(t.market) : null;
  const n1 = t?.name ? String(t.name) : null;
  const full = t?.full_name ? String(t.full_name) : null;

  const display =
    full ??
    (market && n1 ? `${market} ${n1}` : null) ??
    n1 ??
    market ??
    alias ??
    null;

  return { name: display, market, alias };
}

function extractSeedRegionQuadrantFromBracketParticipant(
  p: any,
  meta: BracketMeta,
) {
  const seedRaw = p?.seed ?? null;
  const seed = seedRaw == null ? null : Number(seedRaw);

  // region/quadrant belong to the bracket
  const region = meta.bracketName;
  const quadrant = meta.bracketRank;

  return {
    seed: Number.isFinite(seed) ? seed : null,
    region,
    quadrant: Number.isFinite(quadrant) ? quadrant : null,
  };
}

async function upsertTeamsAndTournamentTeams(
  db: Prisma.TransactionClient | typeof prisma,
  tournamentId: string,
  summary: any,
): Promise<Set<string>> {
  const rows = extractBracketParticipants(summary);
  const known = new Set<string>();

  for (const { team: t, meta } of rows) {
    const teamId = t?.id ? String(t.id) : null;
    if (!teamId) continue;

    const { name, market, alias } = normalizeTeamName(t);

    await db.team.upsert({
      where: { id: teamId },
      create: {
        id: teamId,
        name: name ?? teamId,
        market,
        alias,
        baseTeamRaw: t,
      },
      update: { ...(name ? { name } : {}), market, alias, baseTeamRaw: t },
    });

    const { seed, region, quadrant } =
      extractSeedRegionQuadrantFromBracketParticipant(t, meta);

    await db.tournamentTeam.upsert({
      where: { tournamentId_teamId: { tournamentId, teamId } },
      create: {
        tournamentId,
        teamId,
        seed,
        region,
        quadrant,
        payloadRaw: { participant: t, bracket: meta },
      },
      update: {
        seed: seed ?? undefined,
        region: region ?? undefined,
        quadrant: quadrant ?? undefined,
        payloadRaw: { participant: t, bracket: meta },
      },
    });

    known.add(teamId);
  }

  return known;
}

/** ---- Schedule parsing: STRICTLY use rounds[].games + follow home/away.source recursively ---- */
function canonicalGameId(node: any): string | null {
  // Some schedule nodes might embed sport_event; prefer sport_event.id if present
  const id = node?.sport_event?.id ?? node?.id ?? null;
  return id ? String(id) : null;
}

function looksLikeScheduleGameNode(node: any): boolean {
  if (!node || typeof node !== "object") return false;

  // Prefer an explicit game id if present (direct or sport_event wrapper)
  const id = canonicalGameId(node);
  if (!id) return false;

  // Weed out team objects (teams also have `id` + `name`)
  const looksLikeTeam =
    typeof node?.market === "string" ||
    typeof node?.full_name === "string" ||
    typeof node?.alias === "string";
  if (looksLikeTeam) return false;

  // A game should have a scheduled timestamp somewhere
  const hasScheduled = Boolean(
    node?.scheduled ||
      node?.sport_event?.scheduled ||
      node?.sport_event?.start_time,
  );

  // And it should have competitors/participants in some recognizable form
  const hasSides =
    node?.home_team != null ||
    node?.away_team != null ||
    node?.home != null ||
    node?.away != null ||
    (Array.isArray(node?.sport_event?.competitors) &&
      node.sport_event.competitors.length >= 2) ||
    (Array.isArray(node?.competitors) && node.competitors.length >= 2);

  return hasScheduled && hasSides;
}

function collectScheduleGames(schedule: any): Map<string, any> {
  const out = new Map<string, any>();

  // Iterative walk (safer than deep recursion for big JSON)
  const stack: any[] = [schedule];
  const seen = new Set<any>();

  const push = (v: any) => {
    if (!v) return;
    if (Array.isArray(v)) {
      for (const item of v) stack.push(item);
    } else if (typeof v === "object") {
      stack.push(v);
    }
  };

  const getCandidateId = (node: any): string => {
    const id =
      node?.id ??
      node?.game?.id ??
      node?.sport_event?.id ??
      node?.sport_event?.sport_event_id ??
      "";
    return id ? String(id) : "";
  };

  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== "object") continue;
    if (seen.has(node)) continue;
    seen.add(node);

    // If this looks like a game node, capture it.
    // (This is what feeds your upsert loop.)
    if (looksLikeScheduleGameNode(node)) {
      const id = getCandidateId(node);
      if (id) out.set(id, node);
    }

    // Walk the common Sportradar shapes + a couple of generic containers.
    push((node as any).games);
    push((node as any).sport_events);
    push((node as any).rounds);
    push((node as any).brackets); // <-- key for March Madness regions
    push((node as any).bracket);
    push((node as any).tournament);
    push((node as any).stage);
    push((node as any).regions);

    // Also: scan shallowly through object values in case Sportradar adds a new wrapper
    for (const v of Object.values(node)) {
      if (v && typeof v === "object") push(v);
    }
  }

  return out;
}

async function recomputeTeamTournamentStats(
  db: Prisma.TransactionClient | typeof prisma,
  tournamentId: string,
) {
  // get all teams in tournament + seeds
  const tteams = await db.tournamentTeam.findMany({
    where: { tournamentId },
    select: { teamId: true, seed: true },
  });

  // count wins from FINAL games excluding play-in
  const finals = await db.game.findMany({
    where: {
      tournamentId,
      isPlayIn: false,
      status: { in: ["complete", "closed", "forfeited"] },
      winnerTeamId: { not: null },
    },
    select: { winnerTeamId: true },
  });

  const winsByTeam = new Map<string, number>();
  for (const g of finals) {
    const w = g.winnerTeamId!;
    winsByTeam.set(w, (winsByTeam.get(w) ?? 0) + 1);
  }

  // upsert stats rows
  for (const tt of tteams) {
    const wins = winsByTeam.get(tt.teamId) ?? 0;
    const seed = tt.seed ?? null;
    const teamScore = seed != null ? wins * seed : null;

    await db.teamTournamentStats.upsert({
      where: { tournamentId_teamId: { tournamentId, teamId: tt.teamId } },
      create: {
        tournamentId,
        teamId: tt.teamId,
        wins,
        teamScore,
        lastRecalcAt: new Date(),
      },
      update: {
        wins,
        teamScore,
        lastRecalcAt: new Date(),
      },
    });
  }

  await db.tournament.update({
    where: { id: tournamentId },
    data: { statsUpdatedAt: new Date() },
  });
}

function pickTeamIdsFromScheduleGame(g: any): {
  homeId: string | null;
  awayId: string | null;
} {
  // Common "rounds -> games" shapes
  const directHome = g?.home_team ?? g?.home?.id ?? g?.home_team?.id ?? null;
  const directAway = g?.away_team ?? g?.away?.id ?? g?.away_team?.id ?? null;

  if (directHome || directAway) {
    return {
      homeId: directHome ? String(directHome) : null,
      awayId: directAway ? String(directAway) : null,
    };
  }

  // "sport_events" shape
  const competitors =
    (Array.isArray(g?.sport_event?.competitors) && g.sport_event.competitors) ||
    (Array.isArray(g?.competitors) && g.competitors) ||
    [];

  if (competitors.length) {
    const home =
      competitors.find((c: any) => c?.qualifier === "home") ?? competitors[0];
    const away =
      competitors.find((c: any) => c?.qualifier === "away") ??
      competitors.find((c: any) => c !== home) ??
      competitors[1];

    const homeId = home?.id ?? home?.competitor?.id ?? null;
    const awayId = away?.id ?? away?.competitor?.id ?? null;

    return {
      homeId: homeId ? String(homeId) : null,
      awayId: awayId ? String(awayId) : null,
    };
  }

  return { homeId: null, awayId: null };
}

function pickScheduledAtFromScheduleGame(g: any): Date | null {
  const raw =
    g?.scheduled ??
    g?.sport_event?.scheduled ??
    g?.sport_event?.start_time ??
    null;
  return parseDateMaybe(raw);
}

function pickPointsFromScheduleGame(g: any): {
  homePts: number | null;
  awayPts: number | null;
} {
  const home = g?.home_points ?? g?.sport_event_status?.home_score ?? null;
  const away = g?.away_points ?? g?.sport_event_status?.away_score ?? null;
  return {
    homePts: home == null ? null : Number(home),
    awayPts: away == null ? null : Number(away),
  };
}

function computeWinnerFromSchedule(g: any): string | null {
  const explicit = g?.sport_event_status?.winner_id ?? g?.winner_id ?? null;
  if (explicit) return String(explicit);

  const { homeId, awayId } = pickTeamIdsFromScheduleGame(g);
  const { homePts, awayPts } = pickPointsFromScheduleGame(g);

  if (!homeId || !awayId) return null;
  if (homePts == null || awayPts == null) return null;
  if (homePts === awayPts) return null;
  return homePts > awayPts ? homeId : awayId;
}

async function ensureTeamStubById(
  db: Prisma.TransactionClient | typeof prisma,
  tournamentId: string,
  teamId: string,
  knownTeamIds: Set<string>,
) {
  if (knownTeamIds.has(teamId)) return teamId;

  // minimal stub to satisfy FK if schedule references a team we didn't get in summary (rare)
  await db.team.upsert({
    where: { id: teamId },
    create: {
      id: teamId,
      name: teamId,
      baseTeamRaw: { id: teamId, stub: true },
    },
    update: {},
  });

  await db.tournamentTeam.upsert({
    where: { tournamentId_teamId: { tournamentId, teamId } },
    create: {
      tournamentId,
      teamId,
      seed: null,
      region: null,
      quadrant: null,
      payloadRaw: { stub: true },
    },
    update: {},
  });

  knownTeamIds.add(teamId);
  return teamId;
}

export type SyncMode = "full" | "summary";

export async function runSyncOnce(params: {
  tournamentId: string;
  seasonYear: number;
  /**
   * - full: summary + bracket slots + schedule/games + stats
   * - summary: summary + tournament teams + bracket slots only (skip schedule/games)
   */
  mode?: SyncMode;
}) {
  const mode: SyncMode = params.mode ?? "full";
  const stats: any = {
    summaryTeamsUpserts: 0,
    scheduleGamesSeen: 0,
    scheduleUpserts: 0,
  };

  // A) Tournament Summary (teams)
  const summary = await retry(() => fetchTournamentSummary(params.tournamentId));
  const summaryHash = sha256Hex(summary);

  const bracketCount = Array.isArray(summary?.brackets) ? summary.brackets.length : 0;
  const participantCount = extractBracketParticipants(summary).length;

  log.info(
    {
      tournamentId: params.tournamentId,
      summaryStatus: summary?.status,
      start_date: summary?.start_date,
      end_date: summary?.end_date,
      bracketCount,
      participantCount,
    },
    "tournament summary snapshot",
  );

  // Upsert tournament row
  await prisma.tournament.upsert({
    where: { id: params.tournamentId },
    create: {
      id: params.tournamentId,
      seasonYear: params.seasonYear,
      name: String(summary?.name ?? `NCAA Tournament ${params.seasonYear}`),
      startDate: parseDateMaybe(summary?.start_date),
      endDate: parseDateMaybe(summary?.end_date),
      syncState: "MONITORING",
      eventStatusRaw: PrismaNS.JsonNull,
      payloadRaw: summary,
      statsUpdatedAt: new Date(),
      nextCheckAt: new Date(0),
    },
    update: {
      name: String(summary?.name ?? `NCAA Tournament ${params.seasonYear}`),
      startDate: parseDateMaybe(summary?.start_date) ?? undefined,
      endDate: parseDateMaybe(summary?.end_date) ?? undefined,
      payloadRaw: summary,
      statsUpdatedAt: new Date(),
    },
  });

  await prisma.syncLog.create({
    data: {
      feedType: "TOURNAMENT_SUMMARY",
      tournamentId: params.tournamentId,
      entityId: params.tournamentId,
      fetchedAt: new Date(),
      httpStatus: 200,
      payload: summary,
      payloadHash: summaryHash,
    },
  });

  // Upsert teams + tournamentTeams
  const knownTeamIds = await upsertTeamsAndTournamentTeams(
    prisma,
    params.tournamentId,
    summary,
  );
  stats.summaryTeamsUpserts = knownTeamIds.size;

  // C) Materialize canonical bracket slots ONCE
  await maybeMaterializeBracketSlotsOnce(prisma, params.tournamentId);

  if (mode === "summary") {
    log.info(
      { tournamentId: params.tournamentId },
      "sync ok (summary-only mode: schedule/games skipped)",
    );
    return;
  }

  // B) Tournament Schedule (games only from schedule)
  const schedule = await retry(() => fetchTournamentSchedule(params.tournamentId));
  const scheduleHash = sha256Hex(schedule);

  await prisma.tournament.update({
    where: { id: params.tournamentId },
    data: { eventStatusRaw: schedule, statsUpdatedAt: new Date() },
  });

  await prisma.syncLog.create({
    data: {
      feedType: "TOURNAMENT_SCHEDULE",
      tournamentId: params.tournamentId,
      entityId: params.tournamentId,
      fetchedAt: new Date(),
      httpStatus: 200,
      payload: schedule,
      payloadHash: scheduleHash,
    },
  });

  const scheduleGameMap = collectScheduleGames(schedule);
  stats.scheduleGamesSeen = scheduleGameMap.size;

  if (
    String(summary?.status ?? "").toLowerCase() === "closed" &&
    scheduleGameMap.size < 60
  ) {
    log.warn(
      {
        tournamentId: params.tournamentId,
        scheduleGamesSeen: scheduleGameMap.size,
      },
      "Closed tournament but schedule contains surprisingly few games — check schedule payload shape / access level",
    );
  }

  // Build a lookup of existing games in ONE query
  const gameIds = Array.from(scheduleGameMap.keys());
  const existing: ExistingGameLite[] = await prisma.game.findMany({
    where: { id: { in: gameIds } },
    select: {
      id: true,
      status: true,
      isPlayIn: true,
      winnerTeamId: true,
      homeTeamId: true,
      awayTeamId: true,
      homePoints: true,
      awayPoints: true,
      finalizedAt: true,
      closedAt: true,
    },
  });

  const existingById = new Map<string, ExistingGameLite>(
    existing.map((g) => [g.id, g]),
  );

  let shouldRecalcStats = false;

  for (const [gameId, g] of scheduleGameMap.entries()) {
    const roundName = pickRoundName(g);
    const roundSeq = pickRoundSeq(g);
    const playIn = isPlayInRound(roundName);

    const status = mapGameStatus(
      g?.status ?? g?.sport_event_status?.status ?? g?.sport_event?.status,
    );

    const scheduledAt = pickScheduledAtFromScheduleGame(g);

    const { homeId, awayId } = pickTeamIdsFromScheduleGame(g);
    const safeHomeId = homeId
      ? await ensureTeamStubById(prisma, params.tournamentId, homeId, knownTeamIds)
      : null;
    const safeAwayId = awayId
      ? await ensureTeamStubById(prisma, params.tournamentId, awayId, knownTeamIds)
      : null;

    const { homePts, awayPts } = pickPointsFromScheduleGame(g);

    const winnerId = computeWinnerFromSchedule(g);
    const safeWinnerId = winnerId
      ? await ensureTeamStubById(prisma, params.tournamentId, winnerId, knownTeamIds)
      : null;

    const prev = existingById.get(gameId);

    const scoringChanged = didScoringRelevantChange(prev, {
      status,
      isPlayIn: playIn,
      winnerTeamId: safeWinnerId,
      homePoints: homePts,
      awayPoints: awayPts,
    });

    if (scoringChanged) shouldRecalcStats = true;

    const finalLike = isFinalStatus(status) && safeWinnerId != null;
    const now = new Date();

    // Only set finalizedAt/closedAt the FIRST time we see it happen.
    const finalizedAt =
      finalLike && !prev?.finalizedAt ? now : (prev?.finalizedAt ?? null);

    const closedAt =
      status === "closed" && !prev?.closedAt ? now : (prev?.closedAt ?? null);

    await prisma.game.upsert({
      where: { id: gameId },
      create: {
        id: gameId,
        tournamentId: params.tournamentId,
        round: roundName || null,
        roundSeq,
        isPlayIn: playIn,
        scheduledAt,
        status,
        homeTeamId: safeHomeId,
        awayTeamId: safeAwayId,
        homePoints: homePts,
        awayPoints: awayPts,
        winnerTeamId: safeWinnerId,
        finalizedAt,
        closedAt,
        payloadRaw: g,
      },
      update: {
        round: roundName || undefined,
        roundSeq: roundSeq ?? undefined,
        isPlayIn: playIn,
        scheduledAt: scheduledAt ?? undefined,
        status,
        homeTeamId: safeHomeId ?? undefined,
        awayTeamId: safeAwayId ?? undefined,
        homePoints: homePts ?? undefined,
        awayPoints: awayPts ?? undefined,
        winnerTeamId: safeWinnerId ?? undefined,
        // IMPORTANT: don’t overwrite timestamps every run
        finalizedAt,
        closedAt,
        payloadRaw: g,
      },
    });

    stats.scheduleUpserts++;
  }

  // D) Resolve play-in winners into their canonical slots (idempotent)
  await resolvePlayInSlots(prisma, params.tournamentId);

  // After games are written, recompute stats if needed
  if (shouldRecalcStats) {
    await recomputeTeamTournamentStats(prisma, params.tournamentId);
    log.info({ tournamentId: params.tournamentId }, "stats recomputed");
  }

  log.info({ tournamentId: params.tournamentId, stats }, "sync ok");
}
