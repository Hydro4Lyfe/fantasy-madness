"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Users,
  Shuffle,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2,
  Clock,
  Calendar,
} from "lucide-react";
import {
  createDraftAction,
  type CreateDraftFormState,
} from "@/server/actions/createDraft";

interface Tournament {
  id: string;
  seasonYear: number;
  name: string;
}

interface CreateDraftPageProps {
  tournaments: Tournament[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          Create Draft
        </>
      )}
    </Button>
  );
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <div className="flex items-center gap-2 text-red-400 text-sm">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      {error}
    </div>
  );
}

export function CreateDraftPage({ tournaments }: CreateDraftPageProps) {
  const initialState: CreateDraftFormState = { success: false };
  const [state, formAction] = useActionState(createDraftAction, initialState);
  const [draftType, setDraftType] = useState("SNAKE");
  const [showTimer, setShowTimer] = useState(false);
  const [showStartAt, setShowStartAt] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          <Link href="/drafts">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Drafts
          </Link>
        </Button>
      </div>

      {/* Server error banner */}
      {state.error && !state.fieldErrors && (
        <Card className="p-4 bg-red-500/10 border-red-500/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-sm text-red-400">{state.error}</p>
          </div>
        </Card>
      )}

      {/* Form Card */}
      <Card className="bg-card border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Create New Draft
              </h1>
              <p className="text-sm text-muted-foreground">
                Set up a draft competition with up to 8 participants
              </p>
            </div>
          </div>
        </div>

        <form action={formAction} className="p-6 space-y-8">
          {/* Draft Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-semibold text-foreground">
                Draft Details
              </h2>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                Draft Name *
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Office Champions League"
                className={`bg-background border-border ${state.fieldErrors?.name ? "border-red-500" : ""}`}
              />
              <FieldError error={state.fieldErrors?.name} />
            </div>

            {/* Tournament */}
            <div className="space-y-2">
              <Label
                htmlFor="tournamentId"
                className="text-sm font-medium text-foreground"
              >
                Tournament *
              </Label>
              {tournaments.length === 0 ? (
                <Card className="p-4 bg-yellow-500/5 border-yellow-500/20">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <p className="text-sm text-yellow-400">
                      No tournaments available. Drafts can be created once a
                      tournament is synced.
                    </p>
                  </div>
                </Card>
              ) : (
                <select
                  id="tournamentId"
                  name="tournamentId"
                  defaultValue={tournaments[0]?.id}
                  className={`w-full h-9 px-3 rounded-md bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${state.fieldErrors?.tournamentId ? "border-red-500" : ""}`}
                >
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.seasonYear}
                    </option>
                  ))}
                </select>
              )}
              <FieldError error={state.fieldErrors?.tournamentId} />
            </div>
          </div>

          {/* Draft Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Shuffle className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-semibold text-foreground">
                Draft Settings
              </h2>
            </div>

            {/* Draft Type — hidden input + toggle cards */}
            <input type="hidden" name="draftType" value={draftType} />
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                Pick Order Style
              </Label>
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDraftType("SNAKE")}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    draftType === "SNAKE"
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-border bg-background hover:border-border/80"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground">
                      Snake Draft
                    </h3>
                    {draftType === "SNAKE" && (
                      <CheckCircle className="w-5 h-5 text-orange-400" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Order reverses each round (1-8, 8-1, 1-8, etc.)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDraftType("LINEAR")}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    draftType === "LINEAR"
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-border bg-background hover:border-border/80"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground">
                      Linear Draft
                    </h3>
                    {draftType === "LINEAR" && (
                      <CheckCircle className="w-5 h-5 text-orange-400" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Same pick order every round (1-8, 1-8, etc.)
                  </p>
                </button>
              </div>
              <FieldError error={state.fieldErrors?.draftType} />
            </div>

            {/* Private toggle */}
            <div className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
              <div className="space-y-0.5">
                <Label
                  htmlFor="isPrivate"
                  className="text-sm font-medium text-foreground"
                >
                  Private Draft
                </Label>
                <p className="text-xs text-muted-foreground">
                  Private drafts require an invite code to join
                </p>
              </div>
              <Switch id="isPrivate" name="isPrivate" defaultChecked />
            </div>

            {/* Pick Timer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-foreground">
                      Pick Timer
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Auto-pick when time runs out
                    </p>
                  </div>
                </div>
                <Switch
                  checked={showTimer}
                  onCheckedChange={setShowTimer}
                />
              </div>
              {showTimer && (
                <div className="space-y-2 pl-4">
                  <Label
                    htmlFor="pickTimerSec"
                    className="text-sm font-medium text-foreground"
                  >
                    Seconds per pick (30–300)
                  </Label>
                  <Input
                    id="pickTimerSec"
                    name="pickTimerSec"
                    type="number"
                    min={30}
                    max={300}
                    defaultValue={90}
                    className="bg-background border-border w-32"
                  />
                  <FieldError error={state.fieldErrors?.pickTimerSec} />
                </div>
              )}
            </div>

            {/* Schedule Start Time */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-orange-400" />
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-foreground">
                      Schedule Start Time
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Let participants know when to show up
                    </p>
                  </div>
                </div>
                <Switch
                  checked={showStartAt}
                  onCheckedChange={setShowStartAt}
                />
              </div>
              {showStartAt && (
                <div className="space-y-2 pl-4">
                  <Label
                    htmlFor="startAt"
                    className="text-sm font-medium text-foreground"
                  >
                    Start Date & Time
                  </Label>
                  <Input
                    id="startAt"
                    name="startAt"
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
                    className="bg-background border-border w-64"
                  />
                  <FieldError error={state.fieldErrors?.startAt} />
                </div>
              )}
            </div>
          </div>

          {/* Info about invite codes */}
          <Card className="p-4 bg-blue-500/5 border-blue-500/20">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm text-blue-400">
                  After creating, you&apos;ll get an invite code to share with
                  participants. They can join from the Drafts page or via a
                  direct link.
                </p>
              </div>
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border text-foreground hover:bg-muted"
              asChild
            >
              <Link href="/drafts">Cancel</Link>
            </Button>
            <SubmitButton />
          </div>
        </form>
      </Card>
    </div>
  );
}
