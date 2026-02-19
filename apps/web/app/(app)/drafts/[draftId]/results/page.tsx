import { notFound } from "next/navigation";
import { DomainError } from "@fantasy-madness/domain";

import { requireUserId } from "@/server/auth/guards";
import { getDraftResults } from "@/server/dal";

import { DraftResultsClient } from "./DraftResultsClient";

export default async function DraftResultsPage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;
  const userId = await requireUserId();

  try {
    const results = await getDraftResults({ draftId });
    return <DraftResultsClient results={results} currentUserId={userId} />;
  } catch (error) {
    if (error instanceof DomainError && error.code === "NOT_FOUND") notFound();
    throw error;
  }
}
