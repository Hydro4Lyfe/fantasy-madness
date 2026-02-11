import Link from "next/link";
import { Globe, Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { requireUserId } from "@/server/auth/guards";
import { listLeaguesForUser, listPublicLeagues } from "@/server/dal";

import { LeagueCard, type League } from "./LeagueCard";

function toCardStatus(args: {
  status: string;
  participantCount: number;
  maxParticipants: number | null;
}): League["status"] {
  if (args.maxParticipants && args.participantCount >= args.maxParticipants) {
    return "full";
  }
  if (args.status === "OPEN") {
    return "open";
  }
  return "closed";
}

export default async function LeaguesPage() {
  const userId = await requireUserId();
  const [userLeagueRows, publicLeagueRows] = await Promise.all([
    listLeaguesForUser({ userId }),
    listPublicLeagues({}),
  ]);

  const leagues: League[] = userLeagueRows.map((row) => ({
    id: row.id,
    name: row.name,
    currentSize: row.participantCount,
    capacity: row.maxParticipants ?? row.participantCount,
    status: toCardStatus({
      status: row.status,
      participantCount: row.participantCount,
      maxParticipants: row.maxParticipants,
    }),
    closeDateTime: row.lockAt,
  }));

  const joinedLeagueIds = new Set(leagues.map((league) => league.id));
  const publicLeagues = publicLeagueRows.filter(
    (league) => !joinedLeagueIds.has(league.id)
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Leagues</h1>
          <p className="text-muted-foreground">
            Manage your leagues and discover open public leagues
          </p>
        </div>

        <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
          <Link href="/leagues/new">
            <Plus className="w-4 h-4 mr-2" />
            Create League
          </Link>
        </Button>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">My Leagues</h2>
          <span className="text-xs px-2.5 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400">
            {leagues.length}
          </span>
        </div>

        {leagues.length === 0 ? (
          <div className="p-8 bg-card/40 border border-border rounded-lg text-center">
            <p className="text-muted-foreground mb-4">
              You are not in any leagues yet.
            </p>
            <Button asChild variant="outline">
              <Link href="/leagues/new">Create your first league</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {leagues.map((league) => (
              <Link key={league.id} href={`/leagues/${league.id}`} className="block">
                <LeagueCard league={league} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-orange-400" />
            <h2 className="text-lg font-semibold text-foreground">Public Leagues</h2>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full border border-border bg-card/60 text-muted-foreground">
            {publicLeagues.length}
          </span>
        </div>

        {publicLeagues.length === 0 ? (
          <div className="p-8 bg-card/40 border border-border rounded-lg text-center">
            <p className="text-muted-foreground">No public leagues are open right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {publicLeagues.map((league) => {
              const participantLabel = league.maxParticipants
                ? `${league.participantCount} / ${league.maxParticipants} participants`
                : `${league.participantCount} participants`;

              return (
                <Link key={league.id} href={`/leagues/${league.id}`} className="block">
                  <div className="bg-card/70 border border-border rounded-lg p-6 hover:border-border/80 hover:bg-card transition-colors space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-foreground text-lg font-semibold leading-tight">
                        {league.name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs border ${
                          league.isFull
                            ? "text-amber-300 bg-amber-500/10 border-amber-500/30"
                            : "text-emerald-300 bg-emerald-500/10 border-emerald-500/30"
                        }`}
                      >
                        {league.isFull ? "Full" : "Open"}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{participantLabel}</span>
                      </div>
                      <p>
                        Hosted by{" "}
                        <span className="text-foreground/90">{league.hostName ?? "Unknown"}</span>
                      </p>
                      <p>
                        {league.tournamentName} {league.tournamentYear}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
