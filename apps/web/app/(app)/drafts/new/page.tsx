import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";

import { getOpenTournament } from "@/server/dal";
import { CreateDraftPage } from "./CreateDraftPage";

export default async function NewDraftPage() {
  const openTournament = await getOpenTournament();

  if (!openTournament) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/drafts"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Drafts
        </Link>

        <div className="bg-card border border-border rounded-lg">
          <div className="py-16 px-8 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                No Open Tournament
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Draft creation is temporarily unavailable. Check back when a
                tournament is announced.
              </p>
            </div>
            <Link
              href="/drafts"
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium border border-border bg-secondary hover:bg-accent text-foreground transition-colors mt-2"
            >
              Back to Drafts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CreateDraftPage tournamentId={openTournament.id} />
  );
}
