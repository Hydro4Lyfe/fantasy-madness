import { listPublicDrafts } from "@/server/dal";
import { PublicDraftsClient } from "./PublicDraftsClient";

export default async function PublicDraftsPage() {
  const rows = await listPublicDrafts({});

  const drafts = rows.map((d) => ({
    ...d,
    startAt: d.startAt?.toISOString() ?? null,
    createdAt: d.createdAt.toISOString(),
  }));

  return <PublicDraftsClient drafts={drafts} />;
}
