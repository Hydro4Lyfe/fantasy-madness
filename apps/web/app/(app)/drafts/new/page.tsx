import { requireUserId } from "@/server/auth/guards";
import { getOpenTournament, listTournaments } from "@fantasy-madness/dal";
import { CreateDraftForm } from "@/components/features/drafts/CreateDraftForm";

export default async function NewDraftPage() {
  await requireUserId();

  const openTournament = await getOpenTournament();
  const tournaments = openTournament ? null : await listTournaments({ limit: 10 });

  return (
    <main className="grid gap-6 max-w-xl">
      <div>
        <h1 className="m-0 text-2xl font-bold">Create Draft</h1>
        <p className="mt-2 mb-0 text-white/70">
          Set up a new draft for your friends to join.
        </p>
      </div>
      {openTournament ? (
        <CreateDraftForm tournament={openTournament} />
      ) : tournaments && tournaments.length > 0 ? (
        <CreateDraftForm tournaments={tournaments} />
      ) : (
        <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-white/70">
          No tournaments available. Check back later.
        </div>
      )}
    </main>
  );
}
