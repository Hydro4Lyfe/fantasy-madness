import Link from "next/link";
import { requireUserId } from "@/server/auth/guards";
import { listDraftsForUserQuery } from "@/server/queries/drafts.queries";
import { DraftCard } from "@/components/features/drafts/DraftCard";

export default async function DraftsPage() {
  const userId = await requireUserId();
  const drafts = await listDraftsForUserQuery(userId);

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Hero section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Draft Lobby</h1>
            <p className="text-gray-400">Join an existing draft or create your own tournament</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/drafts/new"
            className="px-8 py-4 gradient-create text-white font-bold rounded-xl transition glow-border flex items-center gap-2 no-underline"
          >
            <span className="text-lg">+</span>
            <span>Create Draft</span>
          </Link>
        </div>
      </section>

      {/* Draft cards grid */}
      {drafts.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">You haven&apos;t joined any drafts yet.</p>
          <Link
            href="/drafts/new"
            className="inline-block px-6 py-3 gradient-primary text-white font-semibold rounded-lg no-underline"
          >
            Create Your First Draft
          </Link>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {drafts.map((draft) => (
            <DraftCard
              key={draft.id}
              id={draft.id}
              name={draft.name}
              status={draft.status as "OPEN" | "DRAFTING" | "LOCKED" | "COMPLETE"}
              tournamentName={draft.tournamentName}
              tournamentYear={draft.tournamentYear}
              isPrivate={draft.isPrivate}
              participantCount={draft.participantCount}
              rosterSize={draft.rosterSize}
              pickTimerSec={draft.pickTimerSec}
              isParticipant={true}
            />
          ))}
        </section>
      )}
    </main>
  );
}
