import pino from "pino";
import type { Prisma } from "@prisma/client";
import { prisma } from "@fantasy-madness/db";
import { sha256Hex } from "./hash.js";
import { fetchDailyChangeLog, fetchTournamentSchedule, fetchGameSummary } from "./sportradar.js";

const log = pino({ level: process.env.LOG_LEVEL ?? "info" });

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function retry<T>(fn: () => Promise<T>, tries = 5): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      lastErr = e;
      const backoff = Math.min(30_000, 500 * Math.pow(2, i)) + Math.floor(Math.random() * 250);
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

function pickRoundName(x: any): string {
  return String(
    x?.round?.name ??
      x?.tournament_round?.name ??
      x?.round_name ??
      x?.sport_event?.tournament_round?.name ??
      x?.sport_event?.tournament_round?.type ??
      x?.round ??
      ""
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
  forfeited: true
};

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

function extractHomeAwayFromScheduleGame(g: any): { homeId: string | null; awayId: string | null } {
  const homeId = g?.home?.id ?? g?.home_team?.id ?? null;
  const awayId = g?.away?.id ?? g?.away_team?.id ?? null;
  return {
    homeId: homeId ? String(homeId) : null,
    awayId: awayId ? String(awayId) : null
  };
}

function extractHomeAwayFromSummary(summary: any): { homeId: string | null; awayId: string | null } {
  const competitors = summary?.sport_event?.competitors ?? [];
  const homeId =
    summary?.home?.id ??
    competitors.find((c: any) => c?.qualifier === "home")?.id ??
    null;

  const awayId =
    summary?.away?.id ??
    competitors.find((c: any) => c?.qualifier === "away")?.id ??
    null;

  return {
    homeId: homeId ? String(homeId) : null,
    awayId: awayId ? String(awayId) : null
  };
}

function extractPointsFromSummary(summary: any): { homePts: number | null; awayPts: number | null } {
  const home = summary?.home_points ?? summary?.sport_event_status?.home_score ?? null;
  const away = summary?.away_points ?? summary?.sport_event_status?.away_score ?? null;

  return {
    homePts: home == null ? null : Number(home),
    awayPts: away == null ? null : Number(away)
  };
}

function computeWinner(
  homePts: number | null,
  awayPts: number | null,
  homeId: string | null,
  awayId: string | null
): string | null {
  if (homePts == null || awayPts == null) return null;
  if (!homeId || !awayId) return null;
  if (homePts === awayPts) return null;
  return homePts > awayPts ? homeId : awayId;
}

function pickChangedTimestamp(item: any): string {
  return String(item?.updated_at ?? item?.timestamp ?? item?.updatedAt ?? "").trim();
}

function pickChangeGameId(item: any): string | null {
  const id = item?.sport_event_id ?? item?.game_id ?? item?.id ?? null;
  return id ? String(id) : null;
}

async function getLastCursorISO(tournamentId: string): Promise<string | null> {
  const t = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { nextCheckAt: true }
  });
  return t?.nextCheckAt ? t.nextCheckAt.toISOString() : null;
}

async function advanceCursor(tournamentId: string, isoTs: string) {
  const d = new Date(isoTs);
  if (Number.isNaN(d.getTime())) return;
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { nextCheckAt: d }
  });
}

export async function runSyncOnce(params: { tournamentId: string; seasonYear: number }) {
  const stats: any = {
    scheduleGamesSeen: 0,
    scheduleUpserts: 0,
    changedGames: 0,
    summariesFetched: 0,
    summariesUpserts: 0
  };

  // 1) schedule
  const schedule = await retry(() => fetchTournamentSchedule(params.tournamentId));
  const scheduleHash = sha256Hex(schedule);

  await prisma.tournament.upsert({
    where: { id: params.tournamentId },
    create: {
      id: params.tournamentId,
      seasonYear: params.seasonYear,
      name: String(schedule?.name ?? `NCAA Tournament ${params.seasonYear}`),
      startDate: schedule?.start_date ? new Date(schedule.start_date) : null,
      endDate: schedule?.end_date ? new Date(schedule.end_date) : null,
      syncState: "MONITORING",
      eventStatusRaw: schedule,
      statsUpdatedAt: new Date(),
      nextCheckAt: new Date(0)
    },
    update: {
      name: String(schedule?.name ?? `NCAA Tournament ${params.seasonYear}`),
      startDate: schedule?.start_date ? new Date(schedule.start_date) : undefined,
      endDate: schedule?.end_date ? new Date(schedule.end_date) : undefined,
      eventStatusRaw: schedule,
      statsUpdatedAt: new Date()
    }
  });

  await prisma.syncLog.create({
    data: {
      feedType: "TOURNAMENT_SCHEDULE",
      tournamentId: params.tournamentId,
      entityId: params.tournamentId,
      fetchedAt: new Date(),
      httpStatus: 200,
      payload: schedule,
      payloadHash: scheduleHash
    }
  });

  const scheduleGames: any[] =
    schedule?.games ?? schedule?.rounds?.flatMap((r: any) => r.games ?? []) ?? [];
  stats.scheduleGamesSeen = scheduleGames.length;

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    for (const g of scheduleGames) {
      const gameId = String(g?.id ?? "");
      if (!gameId) continue;

      const roundName = pickRoundName(g);
      const roundSeq = pickRoundSeq(g);
      const playIn = isPlayInRound(roundName);

      const status = mapGameStatus(g?.status);
      const scheduledAt = parseDateMaybe(g?.scheduled);
      const { homeId, awayId } = extractHomeAwayFromScheduleGame(g);

      const homePoints = g?.home_points != null ? Number(g.home_points) : null;
      const awayPoints = g?.away_points != null ? Number(g.away_points) : null;

      await tx.game.upsert({
        where: { id: gameId },
        create: {
          id: gameId,
          tournamentId: params.tournamentId,
          round: roundName || null,
          roundSeq,
          isPlayIn: playIn,
          scheduledAt,
          status,
          homeTeamId: homeId,
          awayTeamId: awayId,
          homePoints,
          awayPoints,
          winnerTeamId: null,
          finalizedAt: null,
          closedAt: null,
          payloadRaw: g
        },
        update: {
          round: roundName || undefined,
          roundSeq: roundSeq ?? undefined,
          isPlayIn: playIn,
          scheduledAt: scheduledAt ?? undefined,
          status,
          homeTeamId: homeId ?? undefined,
          awayTeamId: awayId ?? undefined,
          homePoints: homePoints ?? undefined,
          awayPoints: awayPoints ?? undefined,
          payloadRaw: g
        }
      });

      stats.scheduleUpserts++;
    }
  });

  // 2) daily change log
  const todayISO = new Date().toISOString().slice(0, 10);
  const lastCursorISO = await getLastCursorISO(params.tournamentId);

  const changes = await retry(() => fetchDailyChangeLog(todayISO));
  const items: any[] = changes?.changes ?? changes?.items ?? [];

  const changedGameIds = items
    .filter((x) => /game|sport_event/i.test(String(x?.type ?? x?.sport_event_type ?? "")) || !!pickChangeGameId(x))
    .filter((x) => (lastCursorISO ? pickChangedTimestamp(x) > lastCursorISO : true))
    .map((x) => pickChangeGameId(x))
    .filter((x): x is string => !!x);

  stats.changedGames = changedGameIds.length;

  const maxTs = items.map(pickChangedTimestamp).filter(Boolean).sort().at(-1);
  if (maxTs) await advanceCursor(params.tournamentId, maxTs);

  await prisma.syncLog.create({
    data: {
      feedType: "DAILY_CHANGE_LOG",
      tournamentId: params.tournamentId,
      entityId: todayISO,
      fetchedAt: new Date(),
      httpStatus: 200,
      payload: { changedGameIds, lastCursorISO, maxTs },
      payloadHash: sha256Hex({ changedGameIds, lastCursorISO, maxTs })
    }
  });

  // 3) summaries
  for (const gameId of changedGameIds) {
    stats.summariesFetched++;

    const summary = await retry(() => fetchGameSummary(gameId));
    const hash = sha256Hex(summary);

    const status = mapGameStatus(summary?.status ?? summary?.sport_event_status?.status);
    const { homeId, awayId } = extractHomeAwayFromSummary(summary);
    const { homePts, awayPts } = extractPointsFromSummary(summary);
    const winner = computeWinner(homePts, awayPts, homeId, awayId);

    const roundName = pickRoundName(summary);
    const roundSeq = pickRoundSeq(summary);
    const playIn = isPlayInRound(roundName);

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existing = await tx.game.findUnique({
        where: { id: gameId },
        select: { finalizedAt: true, closedAt: true }
      });

      const isFinalLike = status === "complete" || status === "closed" || status === "forfeited";
      const shouldSetFinalizedAt = isFinalLike && !existing?.finalizedAt;
      const shouldSetClosedAt = status === "closed" && !existing?.closedAt;

      await tx.game.upsert({
        where: { id: gameId },
        create: {
          id: gameId,
          tournamentId: params.tournamentId,
          round: roundName || null,
          roundSeq,
          isPlayIn: playIn,
          scheduledAt: parseDateMaybe(summary?.scheduled ?? summary?.sport_event?.scheduled),
          status,
          homeTeamId: homeId,
          awayTeamId: awayId,
          homePoints: homePts,
          awayPoints: awayPts,
          winnerTeamId: winner,
          finalizedAt: shouldSetFinalizedAt ? new Date() : null,
          closedAt: shouldSetClosedAt ? new Date() : null,
          payloadRaw: summary
        },
        update: {
          round: roundName || undefined,
          roundSeq: roundSeq ?? undefined,
          isPlayIn: playIn,
          scheduledAt: parseDateMaybe(summary?.scheduled ?? summary?.sport_event?.scheduled) ?? undefined,
          status,
          homeTeamId: homeId ?? undefined,
          awayTeamId: awayId ?? undefined,
          homePoints: homePts ?? undefined,
          awayPoints: awayPts ?? undefined,
          winnerTeamId: winner ?? undefined,
          finalizedAt: shouldSetFinalizedAt ? new Date() : undefined,
          closedAt: shouldSetClosedAt ? new Date() : undefined,
          payloadRaw: summary
        }
      });

      await tx.syncLog.create({
        data: {
          feedType: "GAME_SUMMARY",
          tournamentId: params.tournamentId,
          entityId: gameId,
          fetchedAt: new Date(),
          httpStatus: 200,
          payload: summary,
          payloadHash: hash
        }
      });
    });

    stats.summariesUpserts++;
  }

  log.info({ tournamentId: params.tournamentId, stats }, "sync ok");
}
