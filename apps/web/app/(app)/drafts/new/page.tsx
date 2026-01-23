import { requireUserId } from "@/server/auth/guards";

export default async function NewDraftPage() {
  const userId = requireUserId();
  return (
    <main style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <h1 style={{ margin: 0 }}>Create Draft</h1>
      <p style={{ margin: 0, opacity: 0.85 }}>
        TODO: server action createDraft(userId, settings). For now, you’re <code>{userId}</code>.
      </p>
    </main>
  );
}
