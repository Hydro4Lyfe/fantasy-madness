import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DomainError } from "@fantasy-madness/domain";
import { ArrowLeft, Shield } from "lucide-react";

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
        <div className="space-y-6">
          <Link
            href="/leagues"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Leagues
          </Link>

          <div className="bg-card border border-border rounded-lg">
            <div className="py-16 px-8 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-1">
                  Join League to Make Picks
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  You need to be a participant in this league before you can
                  submit picks.
                </p>
              </div>
              <Link
                href="/leagues"
                className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium border border-border bg-secondary hover:bg-accent text-foreground transition-colors mt-2"
              >
                Back to Leagues
              </Link>
            </div>
          </div>
        </div>
      );
    }

    if (error instanceof DomainError && error.code === "INVALID_STATE") {
      redirect(`/leagues/${leagueId}`);
    }

    throw error;
  }
}
