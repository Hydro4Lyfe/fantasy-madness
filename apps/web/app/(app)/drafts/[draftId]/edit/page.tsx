import { requireUserId } from "@/server/auth/guards";
import { getDraftForEdit } from "@fantasy-madness/dal";
import { redirect } from "next/navigation";
import { DraftEditForm } from "./DraftEditForm";
import { DraftHeader } from "@/components/features/drafts/DraftHeader";
import Link from "next/link";

export default async function DraftEditPage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;
  const userId = await requireUserId();

  const draft = await getDraftForEdit({ draftId, userId });

  // Only host can access edit page
  if (!draft.isHost) {
    redirect(`/drafts/${draftId}`);
  }

  // Can't edit after draft starts
  if (draft.status !== "OPEN") {
    redirect(`/drafts/${draftId}`);
  }

  return (
    <main className="grid gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <DraftHeader vm={{ title: draft.name, statusLabel: draft.status }} />
        <Link
          href={`/drafts/${draftId}`}
          className="px-4 py-2 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
        >
          Back to Draft
        </Link>
      </div>

      <DraftEditForm draft={draft} />
    </main>
  );
}
