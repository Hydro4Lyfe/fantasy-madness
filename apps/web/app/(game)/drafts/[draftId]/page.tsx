import { prisma } from "@fantasy-madness/db";
import { getDraftById } from "@fantasy-madness/dal";
import { DraftHeader } from "@/components/features/drafts/DraftHeader";

type DraftVM = { id: string; title: string; statusLabel: string };

function toDraftVM(dto: Awaited<ReturnType<typeof getDraftById>>): DraftVM {
  return {
    id: dto.id,
    title: `Draft ${dto.inviteCode}`,
    statusLabel: dto.status === "LOBBY" ? "Lobby" : dto.status === "LIVE" ? "Live" : "Complete",
  };
}

type PageProps = { params: Promise<{ draftId: string }> };

export default async function DraftPage({ params }: PageProps) {
  const { draftId } = await params;
  const dto = await getDraftById({ db: prisma, draftId: draftId });
  const vm = toDraftVM(dto);

  return (
    <main>
      <DraftHeader vm={vm} />
      <p style={{ opacity: 0.8, marginTop: 12 }}>Draft view (stub).</p>
    </main>
  );
}
