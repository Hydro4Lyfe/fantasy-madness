import { requireUserId } from "@/server/auth/guards";

export default async function AccountSettingsPage() {
  const userId = requireUserId();
  return (
    <main style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <h1 style={{ margin: 0 }}>Settings</h1>
      <p style={{ margin: 0, opacity: 0.85 }}>TODO: profile settings for <code>{userId}</code></p>
    </main>
  );
}
