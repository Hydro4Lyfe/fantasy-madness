"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Users, Lock, AlertCircle, Loader2, Globe, Shield } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
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
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "flex-1 inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg text-sm font-medium text-white",
        "bg-[#F59E0B] hover:bg-[#F59E0B]/90",
        "transition-colors duration-150",
        "disabled:opacity-50 disabled:cursor-not-allowed"
      )}
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Creating...
        </>
      ) : (
        "Create League"
      )}
    </button>
  );
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;

  return <p className="text-[#F85149] text-sm mt-1">{error}</p>;
}

export function NewLeagueForm({
  tournamentId,
  tournamentLabel,
}: NewLeagueFormProps) {
  const initialState: CreateLeagueFormState = { success: false };
  const [state, formAction] = useActionState(createLeagueAction, initialState);
  const [privacy, setPrivacy] = useState<"public" | "private">("public");

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="bg-card border border-border rounded-lg px-5 py-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold uppercase tracking-tight text-foreground">
              Create New League
            </h1>
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              {tournamentLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-lg">
        <form action={formAction} className="p-6 space-y-6">
          {state.error && !state.fieldErrors && (
            <div className="rounded-lg border border-[#F85149]/30 bg-[#F85149]/10 p-3">
              <div className="flex items-center gap-2 text-sm text-[#F85149]">
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
            <Label
              htmlFor="name"
              className="text-foreground text-sm font-medium"
            >
              League Name
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter league name"
              className="bg-input border-border h-10 focus-visible:border-[#F59E0B] focus-visible:ring-[#F59E0B]/30"
            />
            <FieldError error={state.fieldErrors?.name} />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="maxParticipants"
              className="text-foreground text-sm font-medium inline-flex items-center gap-1.5"
            >
              <Users className="w-4 h-4 text-muted-foreground" />
              Max Participants
            </Label>
            <Input
              id="maxParticipants"
              name="maxParticipants"
              type="number"
              min={2}
              max={100}
              defaultValue={10}
              className="bg-input border-border h-10 focus-visible:border-[#F59E0B] focus-visible:ring-[#F59E0B]/30"
            />
            <FieldError error={state.fieldErrors?.maxParticipants} />
          </div>

          <div className="space-y-3">
            <Label className="text-foreground text-sm font-medium inline-flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-muted-foreground" />
              Privacy
            </Label>

            <label
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                privacy === "public"
                  ? "border-[#F59E0B]/30 bg-[#F59E0B]/5"
                  : "border-border bg-card hover:bg-accent"
              )}
            >
              <input
                type="radio"
                name="privacy"
                value="public"
                checked={privacy === "public"}
                onChange={() => setPrivacy("public")}
                className="w-4 h-4 accent-[#F59E0B]"
              />
              <Globe className="w-4 h-4 text-[#F59E0B]" />
              <div>
                <p className="text-sm font-medium text-foreground">Public</p>
                <p className="text-xs text-muted-foreground">
                  Anyone can find and join
                </p>
              </div>
            </label>

            <label
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                privacy === "private"
                  ? "border-[#F59E0B]/30 bg-[#F59E0B]/5"
                  : "border-border bg-card hover:bg-accent"
              )}
            >
              <input
                type="radio"
                name="privacy"
                value="private"
                checked={privacy === "private"}
                onChange={() => setPrivacy("private")}
                className="w-4 h-4 accent-[#F59E0B]"
              />
              <Lock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Private</p>
                <p className="text-xs text-muted-foreground">
                  Invite-only access
                </p>
              </div>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
            <Link
              href="/leagues"
              className="flex-1 inline-flex items-center justify-center h-10 px-5 rounded-lg text-sm font-medium border border-border bg-secondary hover:bg-accent text-foreground transition-colors"
            >
              Cancel
            </Link>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
