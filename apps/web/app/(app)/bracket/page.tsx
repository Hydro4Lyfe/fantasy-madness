import { requireUserId } from "@/server/auth/guards";
import { listBracketSlotsWithTeams, getBracketTournament } from "@/server/dal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BracketClient from "./BracketClient";

export default async function BracketPage() {
  await requireUserId();

  const tournament = await getBracketTournament();

  if (!tournament) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Bracket Not Yet Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The tournament bracket will be available after Selection Sunday
              when the field is announced.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const slots = await listBracketSlotsWithTeams({
    tournamentId: tournament.id,
  });

  return (
    <BracketClient
      tournamentId={tournament.id}
      seasonYear={tournament.seasonYear}
      tournamentName={tournament.name ?? `${tournament.seasonYear} Tournament`}
      slots={slots}
    />
  );
}
