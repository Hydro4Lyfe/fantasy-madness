const rawBase = process.env.SPORTRADAR_BASE_URL;
const rawKey = process.env.SPORTRADAR_API_KEY;

function must(v: string | undefined, name: string): string {
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

// Removes wrapping quotes and trims whitespace
function cleanEnv(v: string): string {
  const s = v.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1).trim();
  }
  return s;
}

const BASE_URL = cleanEnv(must(rawBase, "SPORTRADAR_BASE_URL")).replace(/\/+$/, ""); // no trailing slash
const API_KEY = cleanEnv(must(rawKey, "SPORTRADAR_API_KEY"));

export function initSportradarConfig() {
  // Validate the base URL is actually a URL
  try {
    new URL(BASE_URL);
  } catch {
    throw new Error(`SPORTRADAR_BASE_URL is not a valid URL: ${BASE_URL}`);
  }
}

async function httpGetJson(path: string): Promise<any> {
  const cleanPath = String(path).trim().replace(/^\/?/, "/"); // ensure exactly one leading slash
  const url = new URL(BASE_URL + cleanPath);
  url.searchParams.set("api_key", API_KEY);

  const res = await fetch(url.toString(), { method: "GET" });

  if (res.status === 429) throw new Error(`RATE_LIMIT 429 for ${cleanPath}`);
  if (res.status >= 500) throw new Error(`SPORTRADAR_${res.status} for ${cleanPath}`);
  if (!res.ok) throw new Error(`HTTP_${res.status} for ${cleanPath}`);

  return await res.json();
}

export async function fetchDailyChangeLog(dateISO: string) {
  return httpGetJson(`/changes/${dateISO}.json`);
}

export async function fetchTournamentSchedule(tournamentExternalId: string) {
  return httpGetJson(`/tournaments/${tournamentExternalId}/schedule.json`);
}

export async function fetchGameSummary(gameExternalId: string) {
  return httpGetJson(`/games/${gameExternalId}/summary.json`);
}

export async function fetchTournamentList(seasonYear: number, seasonType: string) {
  const st = cleanEnv(String(seasonType)).toUpperCase(); // normalize
  return httpGetJson(`/tournaments/${seasonYear}/${st}/schedule.json`);
}
