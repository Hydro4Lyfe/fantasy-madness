import { getDraftById, listDraftsForUser } from "@fantasy-madness/dal";

export type DraftListRow = { id: string; title: string; status: string };

export type DraftPageDTO = {
  id: string;
  title: string;
  status: string;
  inviteCode: string | null;
  draftType: string;
  rosterSize: number;
  participantCount: number;
  isPrivate: boolean;
};

/**
 * Query used by /drafts
 */
export async function listDraftsForUserQuery(userId: string): Promise<DraftListRow[]> {
  const drafts = await listDraftsForUser({ userId });
  return (drafts ?? []).map((d: any) => ({
    id: d.id,
    title: d.name ?? d.title ?? `Draft ${String(d.id).slice(0, 6)}`,
    status: d.status ?? "UNKNOWN",
  }));
}

/**
 * Query used by /drafts/[draftId]
 */
export async function getDraftByIdQuery(draftId: string): Promise<DraftPageDTO> {
  const d: any = await getDraftById({ draftId });
  return {
    id: d.id,
    title: d.name ?? d.title ?? `Draft ${String(d.id).slice(0, 6)}`,
    status: d.status ?? "UNKNOWN",
    inviteCode: d.inviteCode ?? null,
    draftType: d.draftType ?? "SNAKE",
    rosterSize: d.rosterSize ?? 8,
    participantCount: d.participantCount ?? 0,
    isPrivate: d.isPrivate ?? true,
  };
}
