import Link from "next/link";
import { DraftHeader } from "@/components/features/drafts/DraftHeader";
import { getDraftByIdQuery } from "@/server/queries/drafts.queries";
import { requireUserId } from "@/server/auth/guards";

export default async function DraftPage({ params }: { params: Promise<{ draftId: string }> }) {
  const { draftId } = await params;
  requireUserId();

  const draft = await getDraftByIdQuery(draftId);

  return (
    <main style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <DraftHeader vm={{ title: draft.title, statusLabel: draft.status }} />

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href={`/drafts/${draftId}/lobby`}>Lobby</Link>
        <Link href={`/drafts/${draftId}/room`}>Draft room</Link>
        <Link href={`/drafts/${draftId}/results`}>Results</Link>
      </div>

      <pre style={{ whiteSpace: "pre-wrap", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 12, opacity: 0.9 }}>
        {JSON.stringify(draft, null, 2)}
      </pre>
    </main>
  );
}
