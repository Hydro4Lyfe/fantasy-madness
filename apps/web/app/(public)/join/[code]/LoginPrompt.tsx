"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Users, LogIn } from "lucide-react";

type InviteData =
  | {
      type: "draft";
      data: {
        name: string;
        hostName: string | null;
        participantCount: number;
        rosterSize: number;
        tournamentName: string;
      };
    }
  | {
      type: "league";
      data: {
        name: string;
        hostName: string | null;
        participantCount: number;
        maxParticipants: number | null;
        tournamentName: string;
      };
    };

export function LoginPrompt({
  invite,
  code,
}: {
  invite: InviteData;
  code: string;
}) {
  const isDraft = invite.type === "draft";
  const { name, hostName, participantCount, tournamentName } = invite.data;
  const spots = isDraft
    ? `${participantCount}/${invite.data.rosterSize}`
    : invite.data.maxParticipants
      ? `${participantCount}/${invite.data.maxParticipants}`
      : `${participantCount}`;

  const returnUrl = `/join/${code}`;

  return (
    <Card className="max-w-lg w-full p-6 bg-card border-border space-y-6">
      <div className="text-center space-y-2">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
            isDraft
              ? "bg-orange-500/10 border border-orange-500/30"
              : "bg-blue-500/10 border border-blue-500/30"
          }`}
        >
          {isDraft ? (
            <Trophy className="w-7 h-7 text-orange-400" />
          ) : (
            <Crown className="w-7 h-7 text-blue-400" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-foreground">{name}</h1>

        <p className="text-sm text-muted-foreground">{tournamentName}</p>

        {hostName && (
          <p className="text-sm text-muted-foreground">
            {hostName} invited you to this {isDraft ? "draft" : "league"}
          </p>
        )}
      </div>

      <div className="flex justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{spots} players</span>
        </div>
      </div>

      <div className="border-t border-border pt-6 space-y-3">
        <p className="text-center text-sm text-muted-foreground">
          Sign in or create an account to join
        </p>

        <div className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href={`/login?redirect=${encodeURIComponent(returnUrl)}`}>
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href={`/signup?redirect=${encodeURIComponent(returnUrl)}`}>
              Create Account
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
