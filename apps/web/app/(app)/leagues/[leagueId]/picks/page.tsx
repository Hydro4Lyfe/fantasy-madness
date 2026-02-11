import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DomainError } from "@fantasy-madness/domain";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUserId } from "@/server/auth/guards";
import { getLeagueRoomState } from "@/server/dal";

import { LeaguePicksClient } from "./LeaguePicksClient";

export default async function LeaguePicksPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  const userId = await requireUserId();

  try {
    const roomState = await getLeagueRoomState({ leagueId, userId });

    return (
      <LeaguePicksClient
        leagueId={leagueId}
        leagueName={roomState.name}
        tournamentName={roomState.tournamentName}
        leagueStatus={roomState.status}
        allSlots={roomState.allSlots}
        selectedSlotIds={roomState.currentUserPicks}
      />
    );
  } catch (error) {
    if (error instanceof DomainError && error.code === "NOT_FOUND") {
      notFound();
    }

    if (error instanceof DomainError && error.code === "UNAUTHORIZED") {
      return (
        <Card className="p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Join League to Make Picks</h1>
          <p className="text-muted-foreground">
            You need to be a participant in this league before you can submit picks.
          </p>
          <Button asChild variant="outline">
            <Link href="/leagues">Back to Leagues</Link>
          </Button>
        </Card>
      );
    }

    if (error instanceof DomainError && error.code === "INVALID_STATE") {
      redirect(`/leagues/${leagueId}`);
    }

    throw error;
  }
}
