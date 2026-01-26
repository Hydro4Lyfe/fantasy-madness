import Link from "next/link";
import { requireUserId } from "@/server/auth/guards";

export default async function AccountPage() {
  const userId = await requireUserId();
  return (
    <main style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <h1 style={{ margin: 0 }}>Account</h1>
      <p style={{ margin: 0, opacity: 0.85 }}>User: <code>{userId}</code></p>
      <div style={{ display: "flex", gap: 12 }}>
        <Link href="/account/entries">My entries</Link>
        <Link href="/account/settings">Settings</Link>
      </div>
    </main>
  );
}
