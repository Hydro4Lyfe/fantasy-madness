import { GlobalPicksClient } from "./GlobalPicksClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUserId } from "@/server/auth/guards";
import { getGlobalContestPicksState } from "@/server/dal";

export default async function GlobalPicksPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const params = await searchParams;
  const isPreviewEmpty =
    process.env.NODE_ENV !== "production" && params.preview === "empty";
  const userId = await requireUserId();
  const picksState = isPreviewEmpty
    ? null
    : await getGlobalContestPicksState({ userId });

  if (!picksState) {
    return (
      <Card className="p-10 text-center space-y-4">
        <h1 className="text-2xl font-bold">Global Picks Unavailable</h1>
        <p className="text-muted-foreground">
          There is no open global contest right now, so picks cannot be edited.
        </p>
        <Button asChild>
          <Link href="/global-contest">Back to Global Contest</Link>
        </Button>
      </Card>
    );
  }

  return <GlobalPicksClient picksState={picksState} />;
}
