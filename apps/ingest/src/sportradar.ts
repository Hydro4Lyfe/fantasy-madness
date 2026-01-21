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

  if (res.status === 429) throw new Error(`RATE_LIMIT 429 for ${path}`);
  if (res.status >= 500) throw new Error(`SPORTRADAR_${res.status} for ${path}`);
  if (!res.ok) throw new Error(`HTTP_${res.status} for ${path}`);

  return await res.json();
}

export async function fetchDailyChangeLog(dateISO: string) {
  // Placeholder path — keep your working endpoint if different
  return httpGetJson(`/changes/${dateISO}.json`);
}

export async function fetchTournamentSchedule(tournamentId: string) {
  return httpGetJson(`/tournaments/${tournamentId}/schedule.json`);
}

export async function fetchGameSummary(gameId: string) {
  return httpGetJson(`/games/${gameId}/summary.json`);
}

export async function fetchTournamentList(seasonYear: number, seasonType: string) {
  // Placeholder path — keep your working endpoint if different
  return httpGetJson(`/tournaments/${seasonYear}/${seasonType}/schedule.json`);
}

// Optional future:
// export async function fetchTournamentSummary(tournamentId: string) {
//   return httpGetJson(`/tournaments/${tournamentId}/summary.json`);
// }
