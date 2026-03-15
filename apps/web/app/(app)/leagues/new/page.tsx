import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

import { getOpenTournament } from "@/server/dal";

import { NewLeagueForm } from "./NewLeagueForm";

export default async function NewLeaguePage() {
  const openTournament = await getOpenTournament();

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

      {!openTournament ? (
        <div className="bg-card border border-border rounded-lg max-w-2xl">
          <div className="py-16 px-8 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                No Open Tournament
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                League creation is temporarily unavailable. Check back when a
                tournament is announced.
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
      ) : (
        <NewLeagueForm
          tournamentId={openTournament.id}
          tournamentLabel={openTournament.name}
        />
      )}
    </div>
  );
}
