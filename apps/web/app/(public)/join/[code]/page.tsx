import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOptionalUser } from "@/server/auth/guards";
import { getDraftByInviteCode } from "@/server/dal";
import { getLeagueByInviteCode } from "@/server/dal";
import { JoinDraftCard } from "./JoinDraftCard";
import { JoinLeagueCard } from "./JoinLeagueCard";
import { LoginPrompt } from "./LoginPrompt";

type Props = {
  params: Promise<{ code: string }>;
};

async function lookupInvite(code: string) {
  const draft = await getDraftByInviteCode({ inviteCode: code.trim() });
  if (draft) return { type: "draft" as const, data: draft };

  const league = await getLeagueByInviteCode({ inviteCode: code.trim() });
  if (league) return { type: "league" as const, data: league };

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const invite = await lookupInvite(code);

  if (!invite) {
    return {
      title: "Invalid Invite",
      description: "This invite code doesn't match any draft or league.",
    };
  }

  if (invite.type === "draft") {
    const { data } = invite;
    const title = `Join "${data.name}" on Fantasy Madness`;
    const description = `${data.hostName ? `${data.hostName} invited you to draft!` : "You've been invited to a draft!"} ${data.participantCount}/${data.rosterSize} players joined. ${data.tournamentName}.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  }

  // League invite
  const { data } = invite;
  const spots = data.maxParticipants
    ? `${data.participantCount}/${data.maxParticipants} players joined`
    : `${data.participantCount} players joined`;
  const title = `Join "${data.name}" on Fantasy Madness`;
  const description = `${data.hostName ? `${data.hostName} invited you to a league!` : "You've been invited to a league!"} ${spots}. ${data.tournamentName}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function JoinByCodePage({ params }: Props) {
  const { code } = await params;
  const user = await getOptionalUser();

  // Look up what this code belongs to
  const invite = await lookupInvite(code);

  if (!invite) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            Invalid Invite Code
          </h1>
          <p className="text-muted-foreground">
            The code &quot;{code}&quot; doesn&apos;t match any draft or league.
            Check the link and try again.
          </p>
        </div>
      </div>
    );
  }

  // Not logged in — show a login prompt with context about what they're joining
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <LoginPrompt invite={invite} code={code} />
      </div>
    );
  }

  // Logged in — check membership and show the appropriate join card
  if (invite.type === "draft") {
    const draft = await getDraftByInviteCode({
      inviteCode: code.trim(),
      userId: user.id,
    });

    if (draft?.isAlreadyJoined) {
      redirect(`/drafts/${draft.id}`);
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-lg w-full py-12">
          <JoinDraftCard draft={draft!} inviteCode={code} />
        </div>
      </div>
    );
  }

  // League
  const league = await getLeagueByInviteCode({
    inviteCode: code.trim(),
    userId: user.id,
  });

  if (league?.isAlreadyJoined) {
    redirect(`/leagues/${league.id}`);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-lg w-full py-12">
        <JoinLeagueCard league={league!} inviteCode={code} />
      </div>
    </div>
  );
}
