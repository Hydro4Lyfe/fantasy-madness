import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getOpenTournament } from "@/server/dal";

import { NewLeagueForm } from "./NewLeagueForm";

export default async function NewLeaguePage() {
  const openTournament = await getOpenTournament();

  return (
    <div className="space-y-8">
      {!openTournament ? (
        <Card className="max-w-2xl p-8 bg-card border-border text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Create League</h1>
          <p className="text-muted-foreground mb-5">
            No open tournament is available right now, so league creation is temporarily unavailable.
          </p>
          <Button asChild variant="outline">
            <Link href="/leagues">Back to Leagues</Link>
          </Button>
        </Card>
      ) : (
        <NewLeagueForm
          tournamentId={openTournament.id}
          tournamentLabel={`${openTournament.name} ${openTournament.seasonYear}`}
        />
      )}
    </div>
  );
}
