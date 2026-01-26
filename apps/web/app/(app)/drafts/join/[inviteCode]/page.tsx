import { requireUserId } from "@/server/auth/guards";
import { getDraftByInviteCode } from "@fantasy-madness/dal";
import { GlassCard } from "@/components/ui/GlassCard";
import { JoinDraftButton } from "./JoinDraftButton";
import Link from "next/link";

export default async function JoinDraftByInvitePage({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}) {
  const { inviteCode } = await params;
  const userId = await requireUserId();

  const draft = await getDraftByInviteCode({ inviteCode, userId });

  if (!draft) {
    return (
      <main className="grid gap-6 max-w-xl">
        <GlassCard>
          <div className="text-center py-8">
            <h1 className="text-xl font-bold mb-2">Invalid Invite Link</h1>
            <p className="text-white/70 mb-4">
              This invite link is invalid or has expired.
            </p>
            <Link href="/drafts" className="text-indigo-400 hover:text-indigo-300">
              Go to my drafts
            </Link>
          </div>
        </GlassCard>
      </main>
    );
  }

  if (draft.isAlreadyJoined) {
    return (
      <main className="grid gap-6 max-w-xl">
        <GlassCard>
          <div className="text-center py-8">
            <h1 className="text-xl font-bold mb-2">Already Joined</h1>
            <p className="text-white/70 mb-4">
              You&apos;re already a participant in this draft.
            </p>
            <Link
              href={`/drafts/${draft.id}`}
              className="text-indigo-400 hover:text-indigo-300"
            >
              Go to draft
            </Link>
          </div>
        </GlassCard>
      </main>
    );
  }

  const isFull = draft.participantCount >= draft.rosterSize;
  const isOpen = draft.status === "OPEN";

  return (
    <main className="grid gap-6 max-w-xl">
      <div>
        <h1 className="m-0 text-2xl font-bold">Join Draft</h1>
        <p className="mt-2 mb-0 text-white/70">
          You&apos;ve been invited to join a draft
        </p>
      </div>

      <GlassCard>
        <div className="grid gap-4">
          <div>
            <h2 className="text-xl font-semibold m-0">{draft.name}</h2>
            <p className="text-white/60 text-sm m-0 mt-1">
              Hosted by {draft.hostName ?? "Unknown"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-white/5">
              <p className="text-white/60 m-0">Tournament</p>
              <p className="font-medium m-0 mt-1">
                {draft.tournamentName} ({draft.tournamentYear})
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <p className="text-white/60 m-0">Draft Type</p>
              <p className="font-medium m-0 mt-1">{draft.draftType}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <p className="text-white/60 m-0">Participants</p>
              <p className="font-medium m-0 mt-1">
                {draft.participantCount} / {draft.rosterSize}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <p className="text-white/60 m-0">Status</p>
              <p className="font-medium m-0 mt-1">{draft.status}</p>
            </div>
          </div>

          {!isOpen ? (
            <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-500 text-sm">
              This draft is no longer accepting participants.
            </div>
          ) : isFull ? (
            <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-500 text-sm">
              This draft is full.
            </div>
          ) : (
            <JoinDraftButton inviteCode={inviteCode} />
          )}
        </div>
      </GlassCard>
    </main>
  );
}
