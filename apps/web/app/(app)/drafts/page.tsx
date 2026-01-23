import Link from "next/link";
import { requireUserId } from "@/server/auth/guards";
import { listDraftsForUserQuery } from "@/server/queries/drafts.queries";

export default async function DraftsPage() {
  const userId = requireUserId();
  const drafts = await listDraftsForUserQuery(userId);

  return (
    <main style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <h1 style={{ margin: 0 }}>Drafts</h1>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/drafts/new">Create draft</Link>
      </div>

      {drafts.length === 0 ? (
        <p style={{ opacity: 0.85 }}>No drafts yet.</p>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {drafts.map((d) => (
            <li key={d.id}>
              <Link href={`/drafts/${d.id}`}>{d.title}</Link> <span style={{ opacity: 0.7 }}>({d.status})</span>
            </li>
          ))}
        </ul>
      )}

      <p style={{ margin: 0, opacity: 0.7, fontSize: 13 }}>
        Logged in as <code>{userId}</code> (DEV). Replace with real auth.
      </p>
    </main>
  );
}
