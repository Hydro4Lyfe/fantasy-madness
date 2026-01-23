import { getTournamentBySeasonYear, listBracketSlotsBySeasonYear } from "@fantasy-madness/dal";

export async function getTournamentHubVM(year: number): Promise<{ year: number; syncState?: string | null; teamCount?: number | null; gameCount?: number | null }> {
  // TODO: flesh out as DAL queries are implemented
  const t = await getTournamentBySeasonYear({ seasonYear: year });
  return {
    year,
    syncState: (t as any)?.syncState ?? null,
    teamCount: (t as any)?.teamCount ?? null,
    gameCount: (t as any)?.gameCount ?? null,
  };
}

export async function getBracketVM(year: number): Promise<{ year: number; slotCount: number }> {
  const slots = await listBracketSlotsBySeasonYear({ seasonYear: year });
  return { year, slotCount: Array.isArray(slots) ? slots.length : 0 };
}
