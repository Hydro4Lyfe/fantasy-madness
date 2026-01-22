import { log } from "./logger.js";

type SportradarConfig = {
  baseUrl: string;
  apiKey: string;
};

let cfg: SportradarConfig | null = null;

function must(v: string | undefined, name: string): string {
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

/**
 * Docker --env-file keeps quotes if you write KEY="value".
 * Also, people love trailing slashes. Both break URL building.
 */
function normalizeEnvValue(v: string): string {
  let s = String(v).trim();
  // Strip a single pair of surrounding quotes
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  // Remove a trailing slash to avoid double-slashes in `${baseUrl}${path}`
  s = s.replace(/\/+$/, "");
  return s;
}

export function initSportradarConfig() {
  // Read env *at call time*, not module import time
  const baseUrl = normalizeEnvValue(
    must(process.env.SPORTRADAR_BASE_URL, "SPORTRADAR_BASE_URL"),
  );
  const apiKey = normalizeEnvValue(
    must(process.env.SPORTRADAR_API_KEY, "SPORTRADAR_API_KEY"),
  );

  cfg = { baseUrl, apiKey };
}

function getCfg(): SportradarConfig {
  if (!cfg) initSportradarConfig();
  return cfg!;
}

async function httpGetJson(path: string): Promise<any> {
  const { baseUrl, apiKey } = getCfg();
  const url = `${baseUrl}${path}${path.includes("?") ? "&" : "?"}api_key=${encodeURIComponent(apiKey)}`;

  const startedAt = Date.now();
  log.info({ method: "GET", path }, "sportradar request");

  const res = await fetch(url, { method: "GET" });

  log.info(
    { method: "GET", path, status: res.status, ms: Date.now() - startedAt },
    "sportradar response",
  );

  if (res.status === 429) {
    const ra = res.headers.get("retry-after");
    const retryAfterMs = ra ? Number(ra) * 1000 : undefined;
    const err = new Error(`RATE_LIMIT 429 for ${path}`);
    (err as any).retryAfterMs = Number.isFinite(retryAfterMs)
      ? retryAfterMs
      : undefined;
    throw err;
  }

  if (res.status >= 500)
    throw new Error(`SPORTRADAR_${res.status} for ${path}`);
  if (!res.ok) throw new Error(`HTTP_${res.status} for ${path}`);

  return await res.json();
}

export async function fetchTournamentList(
  seasonYear: number,
  seasonType: string,
) {
  return httpGetJson(`/tournaments/${seasonYear}/${seasonType}/schedule.json`);
}

export async function fetchTournamentSummary(tournamentId: string) {
  return httpGetJson(`/tournaments/${tournamentId}/summary.json`);
}

export async function fetchTournamentSchedule(tournamentId: string) {
  return httpGetJson(`/tournaments/${tournamentId}/schedule.json`);
}

export async function fetchDailyChangeLog(dateISO: string) {
  const [y, m, d] = dateISO.split("-");
  return httpGetJson(`/league/${y}/${m}/${d}/changes.json`);
}
