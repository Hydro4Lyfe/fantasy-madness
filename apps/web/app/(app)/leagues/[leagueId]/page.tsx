import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DomainError } from "@fantasy-madness/domain";
import { ArrowLeft } from "lucide-react";

import { requireUserId } from "@/server/auth/guards";
import {
  getLeagueById,
  getLeagueLeaderboard,
  getLeagueRoomState,
} from "@/server/dal";

import { LeagueDetailClient } from "./LeagueDetailClient";
import { LeagueJoinCard } from "./LeagueJoinCard";

export default async function LeagueDetailsPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  const userId = await requireUserId();

  try {
    const [roomState, leaderboard] = await Promise.all([
      getLeagueRoomState({ leagueId, userId }),
      getLeagueLeaderboard({ leagueId }),
    ]);

    return (
      <div className="space-y-6">
        {/* Back link */}
        <Link
          href="/leagues"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Leagues
        </Link>

        <LeagueDetailClient
          roomState={roomState}
          leaderboard={leaderboard}
          userId={userId}
        />
      </div>
    );
  } catch (error) {
    if (error instanceof DomainError && error.code === "NOT_FOUND") {
      notFound();
    }

    if (error instanceof DomainError && error.code === "UNAUTHORIZED") {
      // Non-member: show join card for public leagues, redirect for private
      const league = await getLeagueById({ leagueId });

      if (league.isPrivate) {
        redirect("/leagues");
      }

      return (
        <div className="space-y-6">
          <Link
            href="/leagues"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Leagues
          </Link>

          <LeagueJoinCard league={league} />
        </div>
      );
    }

    throw error;
  }
}
