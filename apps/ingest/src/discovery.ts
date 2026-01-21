import pino from "pino";
import { fetchTournamentList, fetchTournamentSchedule } from "./sportradar.js";

const log = pino({ level: process.env.LOG_LEVEL ?? "info" });

export type DiscoveredTournament = {
  tournamentId: string;
  seasonYear: number;
  seasonType: string;
  pickedFrom: "tournament_list";
  candidateName?: string;
};

type TournamentListItem = {
  id: string;
  name?: string;
  start_date?: string;
};

function computeSeasonYear(d = new Date()): number {
  // Jul–Dec => seasonYear = currentYear; Jan–Jun => currentYear - 1
  const month = d.getUTCMonth() + 1;
  const year = d.getUTCFullYear();
  return month >= 7 ? year : year - 1;
}

function normalizeTournamentListPayload(payload: any): TournamentListItem[] {
  const raw = payload?.tournaments ?? payload ?? [];
  const arr: any[] = Array.isArray(raw) ? raw : [];
  const items: TournamentListItem[] = [];

  for (const x of arr) {
    const t = x?.tournament ?? x;
    const id = t?.id ?? t?.tournament_id ?? null;
    if (!id) continue;

    items.push({
      id: String(id),
      name: t?.name ? String(t.name) : undefined,
      start_date: t?.start_date ? String(t.start_date) : undefined
    });
  }
  return items;
}

function scoreTournament(t: TournamentListItem): number {
  const name = (t.name ?? "").toLowerCase();
  let s = 0;

  if (name.includes("ncaa")) s += 8;
  if (name.includes("division i") || name.includes("d1")) s += 8;
  if (name.includes("men")) s += 5;
  if (name.includes("championship")) s += 5;
  if (name.includes("tournament")) s += 3;

  if (name.includes("nit")) s -= 10;
  if (name.includes("cbi")) s -= 10;

  const start = t.start_date ? new Date(t.start_date) : null;
  if (start && !Number.isNaN(start.getTime()) && start.getUTCMonth() === 2) s += 4; // March

  return s;
}

async function pickBest(items: TournamentListItem[]): Promise<TournamentListItem | null> {
  const ranked = items
    .map((t) => ({ t, score: scoreTournament(t) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0]?.t ?? null;
  if (!best) return null;

  // If close call, sniff schedule for "First Four"
  const bestScore = ranked[0].score;
  const contenders = ranked.filter((x) => x.score >= bestScore - 2).slice(0, 3);

  for (const c of contenders) {
    try {
      const sched = await fetchTournamentSchedule(c.t.id);
      const rounds: any[] = sched?.rounds ?? [];
      const hasFirstFour = rounds.some((r) => /first four/i.test(String(r?.name ?? "")));
      if (hasFirstFour) return c.t;
    } catch {
      // ignore
    }
  }

  return best;
}

export async function discoverTournament(): Promise<DiscoveredTournament> {
  const seasonType = process.env.SEASON_TYPE_OVERRIDE ?? "PST";

  const idOverride = process.env.TOURNAMENT_ID_OVERRIDE;
  const yearOverride = process.env.SEASON_YEAR_OVERRIDE;

  if (idOverride) {
    const seasonYear = yearOverride ? Number(yearOverride) : computeSeasonYear();
    return { tournamentId: String(idOverride), seasonYear, seasonType, pickedFrom: "tournament_list", candidateName: "OVERRIDE" };
  }

  const base = computeSeasonYear();
  const yearsToTry = [base, base - 1, base + 1];

  let lastErr: any = null;

  for (const seasonYear of yearsToTry) {
    try {
      const payload = await fetchTournamentList(seasonYear, seasonType);
      const items = normalizeTournamentListPayload(payload);
      if (!items.length) continue;

      const best = await pickBest(items);
      if (!best) continue;

      log.info({ seasonYear, seasonType, tournamentId: best.id, name: best.name }, "discovered tournament");
      return { tournamentId: best.id, seasonYear, seasonType, pickedFrom: "tournament_list", candidateName: best.name };
    } catch (e: any) {
      lastErr = e;
      log.warn({ err: String(e), seasonYear, seasonType }, "discovery attempt failed");
    }
  }

  throw new Error(`Could not discover tournament via TournamentList. Last error: ${String(lastErr)}`);
}
