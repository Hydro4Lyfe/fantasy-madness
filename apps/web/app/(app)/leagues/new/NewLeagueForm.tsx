"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Users, Lock, AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createLeagueAction,
  type CreateLeagueFormState,
} from "@/server/actions/leagues";

interface NewLeagueFormProps {
  tournamentId: string;
  tournamentLabel: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Creating...
        </>
      ) : (
        "Create League"
      )}
    </Button>
  );
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;

  return (
    <p className="text-red-400 text-sm mt-1">
      {error}
    </p>
  );
}

export function NewLeagueForm({ tournamentId, tournamentLabel }: NewLeagueFormProps) {
  const initialState: CreateLeagueFormState = { success: false };
  const [state, formAction] = useActionState(createLeagueAction, initialState);
  const [privacy, setPrivacy] = useState<"public" | "private">("public");

  return (
    <Card className="max-w-2xl bg-card border-border">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">Create New League</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tournament: {tournamentLabel}
        </p>
      </div>

      <form action={formAction} className="p-6 space-y-6">
        {state.error && !state.fieldErrors && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
            <div className="flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="w-4 h-4" />
              {state.error}
            </div>
          </div>
        )}

        <input type="hidden" name="tournamentId" value={tournamentId} />
        <input
          type="hidden"
          name="isPrivate"
          value={privacy === "private" ? "on" : ""}
        />

        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">League Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter league name"
            className="bg-background border-border"
          />
          <FieldError error={state.fieldErrors?.name} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxParticipants" className="text-foreground inline-flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            Max Participants
          </Label>
          <Input
            id="maxParticipants"
            name="maxParticipants"
            type="number"
            min={2}
            max={100}
            defaultValue={10}
            className="bg-background border-border"
          />
          <FieldError error={state.fieldErrors?.maxParticipants} />
        </div>

        <div className="space-y-3">
          <Label className="text-foreground inline-flex items-center gap-1.5">
            <Lock className="w-4 h-4" />
            Privacy
          </Label>

          <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background/50 hover:bg-background transition-colors cursor-pointer">
            <input
              type="radio"
              name="privacy"
              value="public"
              checked={privacy === "public"}
              onChange={() => setPrivacy("public")}
              className="w-4 h-4"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Public</p>
              <p className="text-xs text-muted-foreground">Anyone can find and join</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background/50 hover:bg-background transition-colors cursor-pointer">
            <input
              type="radio"
              name="privacy"
              value="private"
              checked={privacy === "private"}
              onChange={() => setPrivacy("private")}
              className="w-4 h-4"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Private</p>
              <p className="text-xs text-muted-foreground">Invite-only access</p>
            </div>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button type="button" variant="outline" asChild className="flex-1">
            <Link href="/leagues">Cancel</Link>
          </Button>
          <SubmitButton />
        </div>
      </form>
    </Card>
  );
}
