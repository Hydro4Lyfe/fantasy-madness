import Link from "next/link";
import { DraftHeader } from "@/components/features/drafts/DraftHeader";
import { InviteLinkCard } from "@/components/features/drafts/InviteLinkCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { getDraftByIdQuery } from "@/server/queries/drafts.queries";
import { requireUserId } from "@/server/auth/guards";

export default async function DraftPage({ params }: { params: Promise<{ draftId: string }> }) {
  const { draftId } = await params;
  await requireUserId();

  const draft = await getDraftByIdQuery(draftId);

  return (
    <main className="grid gap-6 max-w-2xl">
      <DraftHeader vm={{ title: draft.title, statusLabel: draft.status }} />

      <div className="flex gap-3 flex-wrap">
        <Link
          href={`/drafts/${draftId}/lobby`}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
        >
          Lobby
        </Link>
        <Link
          href={`/drafts/${draftId}/room`}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
        >
          Draft Room
        </Link>
        <Link
          href={`/drafts/${draftId}/results`}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
        >
          Results
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard title="Draft Info">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Type</span>
              <span>{draft.draftType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Participants</span>
              <span>{draft.participantCount} / {draft.rosterSize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Status</span>
              <span>{draft.status}</span>
            </div>
          </div>
        </GlassCard>

        {draft.inviteCode && draft.status === "OPEN" && (
          <InviteLinkCard inviteCode={draft.inviteCode} />
        )}
      </div>
    </main>
  );
}
