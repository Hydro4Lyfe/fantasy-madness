"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { formatLongDate } from "@/lib/date";
import {
  ArrowLeft,
  Users,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2,
  Clock,
  CalendarIcon,
  Lock,
  Globe,
  Repeat,
} from "lucide-react";
import {
  createDraftAction,
  type CreateDraftFormState,
} from "@/server/actions/createDraft";

interface CreateDraftPageProps {
  tournamentId: string;
  tournamentLabel: string;
}

// ---------------------------------------------------------------------------
// Section divider with monospace label
// ---------------------------------------------------------------------------
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground font-display">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Field error
// ---------------------------------------------------------------------------
function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <div className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toggle row — icon container + label/description + Switch on the right
// ---------------------------------------------------------------------------
function ToggleRow({
  icon,
  label,
  description,
  checked,
  onCheckedChange,
  id,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl cursor-pointer",
        "border border-border bg-card",
        "transition-colors duration-150 hover:bg-accent hover:border-border/80",
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            "border border-border",
            checked
              ? "bg-primary/15 border-primary/30"
              : "bg-secondary/50",
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground leading-tight">
            {label}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
            {description}
          </p>
        </div>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="flex-shrink-0 data-[state=checked]:bg-primary"
      />
    </label>
  );
}

// ---------------------------------------------------------------------------
// Conditional revealed panel beneath a toggle
// ---------------------------------------------------------------------------
function RevealPanel({
  visible,
  children,
}: {
  visible: boolean;
  children: React.ReactNode;
}) {
  if (!visible) return null;
  return (
    <div className="mt-2 ml-11 pl-4 border-l border-primary/20">
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Submit button — driven by useFormStatus
// ---------------------------------------------------------------------------
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "flex-1 inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg",
        "text-sm font-medium text-white",
        "bg-primary hover:bg-primary/90",
        "transition-colors duration-150 active:scale-[0.98]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
      )}
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Creating…
        </>
      ) : (
        <>
          <CheckCircle className="w-4 h-4" />
          Create Draft
        </>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Styled input — dark background, accent focus ring
// ---------------------------------------------------------------------------
function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full h-10 px-3 rounded-lg text-sm",
        "bg-input border border-border",
        "text-foreground placeholder:text-muted-foreground",
        "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
        "transition-colors duration-150",
        "[color-scheme:dark]",
        props.className,
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
export function CreateDraftPage({ tournamentId, tournamentLabel }: CreateDraftPageProps) {
  const initialState: CreateDraftFormState = { success: false };
  const [state, formAction] = useActionState(createDraftAction, initialState);

  const [isPrivate, setIsPrivate] = useState(true);
  const [showTimer, setShowTimer] = useState(false);
  const [showStartAt, setShowStartAt] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("12:00");
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Back link */}
      <Link
        href="/drafts"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Drafts
      </Link>

      {/* Page title */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight font-display uppercase tracking-wide text-foreground">
          New Draft
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure a snake draft for up to 8 participants
        </p>
      </div>

      {/* Server-level error banner */}
      {state.error && !state.fieldErrors && (
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl",
            "bg-red-500/[0.08] border border-red-500/20",
          )}
        >
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{state.error}</p>
        </div>
      )}

      {/* Form card */}
      <div className="bg-card border border-border rounded-lg">
        <form action={formAction} className="p-6 space-y-8">
          {/* Hidden: always SNAKE */}
          <input type="hidden" name="draftType" value="SNAKE" />

          {/* Controlled isPrivate hidden input */}
          {isPrivate && (
            <input type="hidden" name="isPrivate" value="on" />
          )}

          {/* Controlled startAt hidden input — only emitted when a date is chosen */}
          {showStartAt && selectedDate && (
            <input
              type="hidden"
              name="startAt"
              value={`${format(selectedDate, "yyyy-MM-dd")}T${selectedTime}`}
            />
          )}

          {/* -- BASICS -------------------------------------------------- */}
          <section className="space-y-4">
            <SectionLabel label="Basics" />

            {/* Draft name */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-medium text-muted-foreground mb-1.5"
              >
                Draft Name
                <span className="text-primary ml-0.5">*</span>
              </label>
              <StyledInput
                id="name"
                name="name"
                type="text"
                placeholder="e.g., Office Champions 2026"
                autoComplete="off"
                className={
                  state.fieldErrors?.name
                    ? "border-red-500/60 focus:border-red-500"
                    : undefined
                }
              />
              <FieldError error={state.fieldErrors?.name} />
            </div>

            {/* Tournament (auto-selected) */}
            <div>
              <label
                className="block text-xs font-medium text-muted-foreground mb-1.5"
              >
                Tournament
              </label>
              <input type="hidden" name="tournamentId" value={tournamentId} />
              <div
                className={cn(
                  "w-full h-10 px-3 rounded-lg text-sm",
                  "bg-input border border-border",
                  "text-foreground",
                  "flex items-center",
                )}
              >
                {tournamentLabel}
              </div>
            </div>

            {/* Static Snake Draft row */}
            <div
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl",
                "border border-primary/20 bg-primary/[0.04]",
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <Repeat className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground leading-tight">
                  Snake Draft
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pick order reverses each round (1–8, 8–1, …)
                </p>
              </div>
              <div className="ml-auto flex-shrink-0">
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-mono text-primary">
                  <CheckCircle className="w-3 h-3" />
                  Selected
                </span>
              </div>
            </div>
          </section>

          {/* -- SETTINGS ------------------------------------------------ */}
          <section className="space-y-3">
            <SectionLabel label="Settings" />

            {/* Private toggle */}
            <ToggleRow
              id="isPrivate-toggle"
              icon={
                isPrivate ? (
                  <Lock className="w-4 h-4 text-primary" />
                ) : (
                  <Globe className="w-4 h-4 text-muted-foreground" />
                )
              }
              label={isPrivate ? "Private Draft" : "Public Draft"}
              description={
                isPrivate
                  ? "An invite code will be generated for participants to join"
                  : "Anyone can find and join this draft from the public listing"
              }
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />

            {/* Pick Timer toggle + revealed input */}
            <div>
              <ToggleRow
                id="timer-toggle"
                icon={
                  <Clock
                    className={cn(
                      "w-4 h-4",
                      showTimer ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                }
                label="Pick Timer"
                description="Auto-pick when the clock runs out — keeps the draft moving"
                checked={showTimer}
                onCheckedChange={setShowTimer}
              />
              <RevealPanel visible={showTimer}>
                <div className="py-3">
                  <label
                    htmlFor="pickTimerSec"
                    className="block text-xs font-medium text-muted-foreground mb-1.5"
                  >
                    Seconds per pick
                    <span className="ml-1 text-muted-foreground/60">(30 – 300)</span>
                  </label>
                  <StyledInput
                    id="pickTimerSec"
                    name="pickTimerSec"
                    type="number"
                    min={30}
                    max={300}
                    defaultValue={90}
                    className="w-28"
                  />
                  <FieldError error={state.fieldErrors?.pickTimerSec} />
                </div>
              </RevealPanel>
            </div>

            {/* Schedule Start Time toggle + revealed input */}
            <div>
              <ToggleRow
                id="startAt-toggle"
                icon={
                  <CalendarIcon
                    className={cn(
                      "w-4 h-4",
                      showStartAt ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                }
                label="Schedule Start Time"
                description="Let participants know exactly when to show up"
                checked={showStartAt}
                onCheckedChange={setShowStartAt}
              />
              <RevealPanel visible={showStartAt}>
                <div className="py-3">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Start Date &amp; Time
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {/* Date picker trigger */}
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "flex-1 min-w-[180px] h-10 px-3 rounded-lg text-sm text-left",
                            "bg-input border border-border",
                            "flex items-center gap-2",
                            "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                            "hover:border-border/80",
                            "transition-colors duration-150",
                            selectedDate ? "text-foreground" : "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">
                            {selectedDate ? formatLongDate(selectedDate) : "Pick a date"}
                          </span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 border border-border rounded-2xl bg-card shadow-lg"
                        align="start"
                      >
                        {/* Override CSS variables so the calendar renders with our accent color */}
                        <div
                          style={{
                            "--primary": "#3B82F6",
                            "--primary-foreground": "#ffffff",
                            "--ring": "#3B82F6",
                          } as React.CSSProperties}
                        >
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(d) => {
                              setSelectedDate(d);
                              setCalendarOpen(false);
                            }}
                            disabled={(date) => date < startOfDay(new Date())}
                            fromDate={startOfDay(new Date())}
                            initialFocus
                          />
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Time input */}
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className={cn(
                        "w-32 h-10 px-3 rounded-lg text-sm",
                        "bg-input border border-border",
                        "text-foreground",
                        "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                        "hover:border-border/80",
                        "transition-colors duration-150",
                        "[color-scheme:dark]",
                      )}
                    />
                  </div>

                  {/* Validation hint — shown only when no date is selected yet */}
                  {!selectedDate && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Select a date and time for the draft to begin.
                    </p>
                  )}

                  <FieldError error={state.fieldErrors?.startAt} />
                </div>
              </RevealPanel>
            </div>
          </section>

          {/* -- INFO CALLOUT -------------------------------------------- */}
          <div
            className={cn(
              "flex gap-3 px-4 py-3.5 rounded-xl",
              "bg-primary/[0.06] border border-primary/20",
            )}
          >
            <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              After creating, you&apos;ll receive an invite code to share with
              participants. They can join via the Drafts page or a direct link.
              A minimum of 8 participants is required to start.
            </p>
          </div>

          {/* -- ACTIONS ------------------------------------------------- */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
            <Link
              href="/drafts"
              className={cn(
                "flex-1 inline-flex items-center justify-center h-10 px-5 rounded-lg",
                "text-sm font-medium text-muted-foreground",
                "bg-secondary/50 border border-border",
                "hover:bg-accent hover:text-foreground hover:border-border/80",
                "transition-colors duration-150",
              )}
            >
              Cancel
            </Link>
            <SubmitButton />
          </div>
        </form>
      </div>

      {/* Subtle users hint beneath card */}
      <div className="flex items-center justify-center gap-2 pb-8">
        <Users className="w-3.5 h-3.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Requires 8 participants to begin drafting
        </p>
      </div>

    </div>
  );
}
