import { listTournaments } from "@/server/dal";
import { CreateDraftPage } from "./CreateDraftPage";

export default async function NewDraftPage() {
  const tournaments = await listTournaments({ limit: 10 });

  return (
    <CreateDraftPage
      tournaments={tournaments.map((t) => ({
        id: t.id,
        seasonYear: t.seasonYear,
        name: t.name,
        startDate: t.startDate ? t.startDate.toISOString() : null,
      }))}
    />
  );
}
