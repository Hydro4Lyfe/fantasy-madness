// apps/ingest/src/sportradar.ts
const BASE_URL = process.env.SPORTRADAR_BASE_URL!;
const API_KEY = process.env.SPORTRADAR_API_KEY!;

function must(v: string | undefined, name: string): string {
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export function initSportradarConfig() {
  must(BASE_URL, "SPORTRADAR_BASE_URL");
  must(API_KEY, "SPORTRADAR_API_KEY");
}

async function httpGetJson(path: string): Promise<any> {
  const url = `${BASE_URL}${path}${path.includes("?") ? "&" : "?"}api_key=${API_KEY}`;
  const res = await fetch(url, { method: "GET" });

  if (res.status === 429) {
    const ra = res.headers.get("retry-after");
    const retryAfterMs = ra ? Number(ra) * 1000 : undefined;
    const err = new Error(`RATE_LIMIT 429 for ${path}`);
    (err as any).retryAfterMs = Number.isFinite(retryAfterMs) ? retryAfterMs : undefined;
    throw err;
  }

  if (res.status >= 500) throw new Error(`SPORTRADAR_${res.status} for ${path}`);
  if (!res.ok) throw new Error(`HTTP_${res.status} for ${path}`);

  return await res.json();
}

export async function fetchTournamentList(seasonYear: number, seasonType: string) {
  // https://api.sportradar.com/ncaamb/{access_level}/v4/{lang}/tournaments/{season_year}/{season_type}/schedule.json
  // (you’re using v8 elsewhere; that’s fine if your BASE_URL includes v8)
  return httpGetJson(`/tournaments/${seasonYear}/${seasonType}/schedule.json`);
}

export async function fetchTournamentSummary(tournamentId: string) {
  // https://api.sportradar.com/ncaamb/{access_level}/v8/{lang}/tournaments/{tournament_id}/summary.json
  return httpGetJson(`/tournaments/${tournamentId}/summary.json`);
}

export async function fetchTournamentSchedule(tournamentId: string) {
  // https://api.sportradar.com/ncaamb/{access_level}/v8/{lang}/tournaments/{tournament_id}/schedule.json
  return httpGetJson(`/tournaments/${tournamentId}/schedule.json`);
}

export async function fetchDailyChangeLog(dateISO: string) {
  // NCAAMB Daily Change Log:
  // https://api.sportradar.com/ncaamb/{access_level}/v8/{lang}/league/{year}/{month}/{day}/changes.json
  const [y, m, d] = dateISO.split("-");
  return httpGetJson(`/league/${y}/${m}/${d}/changes.json`);
}
