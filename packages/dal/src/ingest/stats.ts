import type { DbClient } from "@fantasy-madness/db";

export async function recomputeTeamTournamentStats(args: {
  db: DbClient;
  tournamentId: string;
}): Promise<void> {
  const { db, tournamentId } = args;

  const tteams = await db.tournamentTeam.findMany({
    where: { tournamentId },
    select: { teamId: true, seed: true },
  });

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
