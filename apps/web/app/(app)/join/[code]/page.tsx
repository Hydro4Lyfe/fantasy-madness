import { requireUserId } from "@/server/auth/guards";
import { getDraftByInviteCode } from "@/server/dal";
import { redirect } from "next/navigation";
import { JoinDraftCard } from "./JoinDraftCard";

export default async function JoinByCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const userId = await requireUserId();

  const draft = await getDraftByInviteCode({
    inviteCode: code.trim(),
    userId,
  });

  // If already joined, go straight to the draft
  if (draft?.isAlreadyJoined) {
    redirect(`/drafts/${draft.id}`);
  }

  return (
    <div className="max-w-lg mx-auto py-12 space-y-6">
      {!draft ? (
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            Invalid Invite Code
          </h1>
          <p className="text-muted-foreground">
            The code &quot;{code}&quot; doesn&apos;t match any draft. Check the
            code and try again.
          </p>
        </div>
      ) : (
        <JoinDraftCard draft={draft} inviteCode={code} />
      )}
    </div>
  );
}
