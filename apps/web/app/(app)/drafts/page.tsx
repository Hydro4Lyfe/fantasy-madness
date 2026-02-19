import { MyDraftsClient } from "./MyDraftsClient";
import { requireUserId } from "@/server/auth/guards";
import { listDraftsForUser, type DraftListRow } from "@/server/dal";
import { formatTime } from "@/lib/date";

// Map DAL status to UI status
function mapStatus(dalStatus: string): "active" | "draft" | "completed" {
  switch (dalStatus) {
    case "LOBBY":
      return "draft";
    case "DRAFTING":
    case "LIVE":
      return "active";
    case "COMPLETE":
      return "completed";
    default:
      return "draft";
  }
}

// Format date for display
function formatDraftDate(
  tournamentName: string,
  tournamentYear: number
): string {
  return `${tournamentName} ${tournamentYear}`;
}

// Format lock time for display — pinned to ET since March Madness games are US-centric
function formatStartTime(lockAt: Date | null): string {
  if (!lockAt) return "TBD";
  return formatTime(lockAt, "America/New_York");
}

// Generate placeholder thumbnail based on draft id
function getPlaceholderThumbnail(draftId: string): string {
  const images = [
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400",
    "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400",
    "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400",
    "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=400",
    "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=400",
  ];
  // Use a hash of the draft ID to pick a consistent image
  const hash = draftId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return images[hash % images.length];
}

// Transform DAL data to UI interface
function transformDraft(row: DraftListRow) {
  return {
    id: row.id,
    name: row.name,
    type: row.isPrivate ? ("private" as const) : ("public" as const),
    participants: row.participantCount,
    maxParticipants: row.rosterSize,
    status: mapStatus(row.status),
    draftDate: formatDraftDate(row.tournamentName, row.tournamentYear),
    startTime: formatStartTime(row.lockAt),
    myRank: null, // Not available in list query - shown on detail page
    totalPoints: 0, // Not available in list query - shown on detail page
    thumbnail: getPlaceholderThumbnail(row.id),
  };
}

export default async function DraftsPage() {
  const userId = await requireUserId();

  const draftRows = await listDraftsForUser({ userId });
  const allDrafts = draftRows.map(transformDraft);

  return <MyDraftsClient drafts={allDrafts} />;
}
