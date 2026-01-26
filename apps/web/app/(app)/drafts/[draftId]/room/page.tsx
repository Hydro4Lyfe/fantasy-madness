import { requireUserId } from "@/server/auth/guards";

export default async function DraftRoomPage({ params }: { params: Promise<{ draftId: string }> }) {
  const { draftId } = await params;
  await requireUserId();

  return (
    <main style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <h1 style={{ margin: 0 }}>Draft Room</h1>
      <p style={{ margin: 0, opacity: 0.85 }}>Draft: <code>{draftId}</code></p>
      <p style={{ margin: 0, opacity: 0.85 }}>
        MVP: poll <code>/api/drafts/{draftId}/state</code> every 2–3 seconds. Later: SSE/WebSockets.
      </p>
    </main>
  );
}
