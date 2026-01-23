import { requireUserId } from "@/server/auth/guards";

export default async function JoinDraftByInvitePage({ params }: { params: Promise<{ inviteCode: string }> }) {
  const { inviteCode } = await params;
  const userId = requireUserId();

  return (
    <main style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <h1 style={{ margin: 0 }}>Join Draft</h1>
      <p style={{ margin: 0, opacity: 0.85 }}>
        Invite code: <code>{inviteCode}</code>
      </p>
      <p style={{ margin: 0, opacity: 0.85 }}>
        TODO: resolve invite {'->'} draftId {'->'} joinDraft action. User: <code>{userId}</code>
      </p>
    </main>
  );
}
