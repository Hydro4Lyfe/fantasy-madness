import { MyDraftsClient } from "./MyDraftsClient";
import { requireUserId } from "@/server/auth/guards";
import { listDraftsForUser, type DraftListRow } from "@/server/dal";

function mapStatus(dalStatus: string): "OPEN" | "DRAFTING" | "LOCKED" | "COMPLETE" {
  switch (dalStatus) {
    case "OPEN":
    case "LOBBY":
      return "OPEN";
    case "DRAFTING":
    case "LIVE":
      return "DRAFTING";
    case "LOCKED":
      return "LOCKED";
    case "COMPLETE":
      return "COMPLETE";
    default:
      return "OPEN";
  }
}

function transformDraft(row: DraftListRow) {
  return {
    id: row.id,
    name: row.name,
    isPrivate: row.isPrivate,
    participants: row.participantCount,
    maxParticipants: row.rosterSize,
    status: mapStatus(row.status),
    tournamentName: row.tournamentName,
    tournamentYear: row.tournamentYear,
    pickTimerSec: row.pickTimerSec,
    lockAt: row.lockAt?.toISOString() ?? null,
  };
}

export default async function DraftsPage() {
  const userId = await requireUserId();

  const draftRows = await listDraftsForUser({ userId });
  const allDrafts = draftRows.map(transformDraft);

  return <MyDraftsClient drafts={allDrafts} />;
}
