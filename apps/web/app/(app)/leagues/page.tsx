import { requireUserId } from "@/server/auth/guards";
import { listLeaguesForUser, listPublicLeagues } from "@/server/dal";
import { LeaguesClient } from "./LeaguesClient";

export default async function LeaguesPage() {
  const userId = await requireUserId();
  const [userLeagueRows, publicLeagueRows] = await Promise.all([
    listLeaguesForUser({ userId }),
    listPublicLeagues({}),
  ]);

  const myLeagues = userLeagueRows.map((row) => ({
    id: row.id,
    name: row.name,
    status: row.status,
    tournamentName: row.tournamentName,
    tournamentYear: row.tournamentYear,
    isPrivate: row.isPrivate,
    maxParticipants: row.maxParticipants,
    lockAt: row.lockAt?.toISOString() ?? null,
    participantCount: row.participantCount,
    isHost: row.isHost,
    hasCompletedPicks: row.hasCompletedPicks,
  }));

  // Filter out leagues user already joined
  const joinedIds = new Set(myLeagues.map((l) => l.id));
  const publicLeagues = publicLeagueRows
    .filter((l) => !joinedIds.has(l.id))
    .map((l) => ({
      id: l.id,
      name: l.name,
      tournamentName: l.tournamentName,
      tournamentYear: l.tournamentYear,
      maxParticipants: l.maxParticipants,
      participantCount: l.participantCount,
      hostName: l.hostName,
      isFull: l.isFull,
    }));

  return <LeaguesClient myLeagues={myLeagues} publicLeagues={publicLeagues} />;
}
