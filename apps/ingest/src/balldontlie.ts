import { log } from "./logger.js";

// ─────────────────────────────────────────────────────────────────────────────
// BallDontLie NCAAB API Client
// Docs: https://ncaab.balldontlie.io
// ─────────────────────────────────────────────────────────────────────────────

type BallDontLieConfig = {
  baseUrl: string;
  apiKey: string;
};

let cfg: BallDontLieConfig | null = null;

function must(v: string | undefined, name: string): string {
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function normalizeEnvValue(v: string): string {
  let s = String(v).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  s = s.replace(/\/+$/, "");
  return s;
}

export function initBallDontLieConfig() {
  const baseUrl = normalizeEnvValue(
    process.env.BALLDONTLIE_BASE_URL ?? "https://api.balldontlie.io/ncaab/v1",
  );
  const apiKey = normalizeEnvValue(
    must(process.env.BALLDONTLIE_API_KEY, "BALLDONTLIE_API_KEY"),
  );
  cfg = { baseUrl, apiKey };
}

function getCfg(): BallDontLieConfig {
  if (!cfg) initBallDontLieConfig();
  return cfg!;
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type BDLTeam = {
  id: number;
  conference_id: number;
  name: string;
  full_name: string;
  college: string;
  abbreviation: string;
};

export type BDLBracketTeam = BDLTeam & {
  seed: string;
  score: number | null;
  winner: boolean | null;
};

export type BDLBracketGame = {
  game_id: string;
  season: number;
  round: number; // 0=First Four, 1=R64, 2=R32, 3=Sweet16, 4=Elite8, 5=Final4, 6=Championship
  bracket_location: number;
  date: string; // ISO timestamp
  location: string;
  status: string; // "pre", "in", "post"
  period_detail: string | null;
  broadcasts: string[];
  home_team: BDLBracketTeam;
  away_team: BDLBracketTeam;
};

export type BDLGame = {
  id: number;
  date: string; // ISO timestamp
  season: number;
  status: string; // "pre", "in", "post"
  period: number;
  period_detail: string | null;
  home_team: BDLTeam;
  visitor_team: BDLTeam;
  home_score: number | null;
  away_score: number | null;
  home_score_h1: number | null;
  away_score_h1: number | null;
  home_score_h2: number | null;
  away_score_h2: number | null;
  home_ot_scores: number[] | null;
  away_ot_scores: number[] | null;
};

export type BDLPaginationMeta = {
  next_cursor?: number;
  per_page: number;
};

export type BDLResponse<T> = {
  data: T;
  meta?: BDLPaginationMeta;
};

// ─────────────────────────────────────────────────────────────────────────────
// HTTP Client
// ─────────────────────────────────────────────────────────────────────────────

async function httpGetJson<T>(path: string): Promise<T> {
  const { baseUrl, apiKey } = getCfg();
  const url = `${baseUrl}${path}`;

  const startedAt = Date.now();
  log.info({ method: "GET", path }, "balldontlie request");

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: apiKey,
      Accept: "application/json",
    },
  });

  log.info(
    { method: "GET", path, status: res.status, ms: Date.now() - startedAt },
    "balldontlie response",
  );

  if (res.status === 429) {
    const ra = res.headers.get("retry-after");
    const retryAfterMs = ra ? Number(ra) * 1000 : 60_000; // Default 60s for BDL
    const err = new Error(`RATE_LIMIT 429 for ${path}`);
    (err as any).retryAfterMs = Number.isFinite(retryAfterMs) ? retryAfterMs : 60_000;
    throw err;
  }

  if (res.status === 401) {
    throw new Error(`UNAUTHORIZED 401 - Check BALLDONTLIE_API_KEY or subscription tier`);
  }

  if (res.status >= 500) throw new Error(`BALLDONTLIE_${res.status} for ${path}`);
  if (!res.ok) throw new Error(`HTTP_${res.status} for ${path}`);

  return (await res.json()) as T;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Endpoints
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch March Madness bracket data for a given season.
 * Requires GOAT tier ($39.99/mo).
 * 
 * Round values: 0=First Four, 1=R64, 2=R32, 3=Sweet16, 4=Elite8, 5=Final4, 6=Championship
 */
export async function fetchBracket(
  season: number,
  opts?: { round?: number; cursor?: number; perPage?: number }
): Promise<BDLResponse<BDLBracketGame[]>> {
  const params = new URLSearchParams();
  params.set("season", String(season));
  if (opts?.round !== undefined) params.set("round_id", String(opts.round));
  if (opts?.cursor !== undefined) params.set("cursor", String(opts.cursor));
  if (opts?.perPage !== undefined) params.set("per_page", String(opts.perPage));

  return httpGetJson(`/bracket?${params.toString()}`);
}

/**
 * Fetch all bracket games for a season, handling pagination.
 */
export async function fetchAllBracketGames(season: number): Promise<BDLBracketGame[]> {
  const allGames: BDLBracketGame[] = [];
  let cursor: number | undefined;

  do {
    const resp = await fetchBracket(season, { cursor, perPage: 100 });
    allGames.push(...resp.data);
    cursor = resp.meta?.next_cursor ?? undefined;
  } while (cursor !== undefined);

  return allGames;
}

/**
 * Fetch all NCAAB teams.
 */
export async function fetchTeams(
  opts?: { conferenceId?: number }
): Promise<BDLResponse<BDLTeam[]>> {
  const params = new URLSearchParams();
  if (opts?.conferenceId !== undefined) params.set("conference_id", String(opts.conferenceId));

  const query = params.toString();
  return httpGetJson(`/teams${query ? `?${query}` : ""}`);
}

/**
 * Fetch games by date range or specific dates.
 */
export async function fetchGames(opts: {
  dates?: string[] // YYYY-MM-DD format
  seasons?: number[]
  teamIds?: number[]
  startDate?: string
  endDate?: string
  cursor?: number
  perPage?: number
}): Promise<BDLResponse<BDLGame[]>> {
  const params = new URLSearchParams();

  if (opts.dates) {
    opts.dates.forEach((d) => params.append("dates[]", d));
  }
  if (opts.seasons) {
    opts.seasons.forEach((s) => params.append("seasons[]", String(s)));
  }
  if (opts.teamIds) {
    opts.teamIds.forEach((id) => params.append("team_ids[]", String(id)));
  }
  if (opts.startDate) params.set("start_date", opts.startDate);
  if (opts.endDate) params.set("end_date", opts.endDate);
  if (opts.cursor !== undefined) params.set("cursor", String(opts.cursor));
  if (opts.perPage !== undefined) params.set("per_page", String(opts.perPage));

  return httpGetJson(`/games?${params.toString()}`);
}

/**
 * Fetch a specific game by ID.
 */
export async function fetchGame(gameId: number): Promise<BDLResponse<BDLGame>> {
  return httpGetJson(`/games/${gameId}`);
}
