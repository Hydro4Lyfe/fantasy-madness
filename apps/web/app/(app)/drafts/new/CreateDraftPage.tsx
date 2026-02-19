"use client";

import { useActionState, useRef, useState, type MouseEvent } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO, startOfDay } from "date-fns";
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

interface Tournament {
  id: string;
  seasonYear: number;
  name: string;
  startDate: string | null;
}

interface CreateDraftPageProps {
  tournaments: Tournament[];
}

// ---------------------------------------------------------------------------
// SpotlightCard — matches the pattern used across the app
// ---------------------------------------------------------------------------
function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.06]",
        "bg-gradient-to-b from-white/[0.08] to-white/[0.02]",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)]",
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(300px circle at ${position.x}px ${position.y}px, rgba(94,106,210,0.12), transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section divider with monospace label
// ---------------------------------------------------------------------------
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-xs font-mono tracking-widest uppercase text-[#8A8F98]">
        {label}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
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
        "border border-white/[0.06] bg-white/[0.02]",
        "transition-colors duration-150 hover:bg-white/[0.04] hover:border-white/[0.10]",
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            "border border-white/[0.08]",
            checked
              ? "bg-[#5E6AD2]/15 border-[#5E6AD2]/30"
              : "bg-white/[0.04]",
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#EDEDEF] leading-tight">
            {label}
          </p>
          <p className="text-xs text-[#8A8F98] mt-0.5 leading-snug">
            {description}
          </p>
        </div>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="flex-shrink-0 data-[state=checked]:bg-[#5E6AD2]"
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
    <div className="mt-2 ml-11 pl-4 border-l border-[#5E6AD2]/20">
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
        "bg-[#5E6AD2] hover:bg-[#6872D9]",
        "shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]",
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
        "bg-[#0F0F12] border border-white/[0.10]",
        "text-[#EDEDEF] placeholder:text-[#8A8F98]",
        "focus:outline-none focus:border-[#5E6AD2] focus:ring-2 focus:ring-[#5E6AD2]/20",
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
export function CreateDraftPage({ tournaments }: CreateDraftPageProps) {
  const initialState: CreateDraftFormState = { success: false };
  const [state, formAction] = useActionState(createDraftAction, initialState);

  const [isPrivate, setIsPrivate] = useState(true);
  const [showTimer, setShowTimer] = useState(false);
  const [showStartAt, setShowStartAt] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("12:00");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedTournamentId, setSelectedTournamentId] = useState(
    tournaments[0]?.id ?? ""
  );

  const selectedTournament = tournaments.find((t) => t.id === selectedTournamentId);
  // End of allowed range — the day the tournament starts (inclusive)
  const tournamentStartDate = selectedTournament?.startDate
    ? startOfDay(parseISO(selectedTournament.startDate))
    : undefined;

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Back link */}
      <Link
        href="/drafts"
        className="inline-flex items-center gap-1.5 text-sm text-[#8A8F98] hover:text-[#EDEDEF] transition-colors duration-150"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Drafts
      </Link>

      {/* Page title */}
      <div>
        <h1
          className={cn(
            "text-3xl font-semibold tracking-tight",
            "bg-gradient-to-b from-[#EDEDEF] to-[#EDEDEF]/70 bg-clip-text text-transparent",
          )}
        >
          New Draft
        </h1>
        <p className="mt-1 text-sm text-[#8A8F98]">
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
      <SpotlightCard>
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

          {/* ── BASICS ────────────────────────────────────────────── */}
          <section className="space-y-4">
            <SectionLabel label="Basics" />

            {/* Draft name */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-medium text-[#8A8F98] mb-1.5"
              >
                Draft Name
                <span className="text-[#5E6AD2] ml-0.5">*</span>
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

            {/* Tournament select */}
            <div>
              <label
                htmlFor="tournamentId"
                className="block text-xs font-medium text-[#8A8F98] mb-1.5"
              >
                Tournament
                <span className="text-[#5E6AD2] ml-0.5">*</span>
              </label>
              {tournaments.length === 0 ? (
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl",
                    "bg-amber-500/[0.06] border border-amber-500/20",
                  )}
                >
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <p className="text-sm text-amber-400">
                    No tournaments available yet. A tournament must be synced before drafts can be created.
                  </p>
                </div>
              ) : (
                <select
                  id="tournamentId"
                  name="tournamentId"
                  value={selectedTournamentId}
                  onChange={(e) => {
                    setSelectedTournamentId(e.target.value);
                    setSelectedDate(undefined); // reset date when tournament changes
                  }}
                  className={cn(
                    "w-full h-10 px-3 rounded-lg text-sm appearance-none",
                    "bg-[#0F0F12] border border-white/[0.10]",
                    "text-[#EDEDEF]",
                    "focus:outline-none focus:border-[#5E6AD2] focus:ring-2 focus:ring-[#5E6AD2]/20",
                    "transition-colors duration-150",
                    state.fieldErrors?.tournamentId
                      ? "border-red-500/60"
                      : undefined,
                  )}
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

            {/* Static Snake Draft row */}
            <div
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl",
                "border border-[#5E6AD2]/20 bg-[#5E6AD2]/[0.04]",
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-[#5E6AD2]/15 border border-[#5E6AD2]/30 flex items-center justify-center flex-shrink-0">
                <Repeat className="w-4 h-4 text-[#5E6AD2]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#EDEDEF] leading-tight">
                  Snake Draft
                </p>
                <p className="text-xs text-[#8A8F98] mt-0.5">
                  Pick order reverses each round (1–8, 8–1, …)
                </p>
              </div>
              <div className="ml-auto flex-shrink-0">
                <span className="inline-flex items-center gap-1 rounded-full border border-[#5E6AD2]/30 bg-[#5E6AD2]/10 px-2.5 py-0.5 text-xs font-mono text-[#5E6AD2]">
                  <CheckCircle className="w-3 h-3" />
                  Selected
                </span>
              </div>
            </div>
          </section>

          {/* ── SETTINGS ──────────────────────────────────────────── */}
          <section className="space-y-3">
            <SectionLabel label="Settings" />

            {/* Private toggle */}
            <ToggleRow
              id="isPrivate-toggle"
              icon={
                isPrivate ? (
                  <Lock className="w-4 h-4 text-[#5E6AD2]" />
                ) : (
                  <Globe className="w-4 h-4 text-[#8A8F98]" />
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
                      showTimer ? "text-[#5E6AD2]" : "text-[#8A8F98]",
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
                    className="block text-xs font-medium text-[#8A8F98] mb-1.5"
                  >
                    Seconds per pick
                    <span className="ml-1 text-[#8A8F98]/60">(30 – 300)</span>
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
                      showStartAt ? "text-[#5E6AD2]" : "text-[#8A8F98]",
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
                  <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">
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
                            "bg-[#0F0F12] border border-white/[0.10]",
                            "flex items-center gap-2",
                            "focus:outline-none focus:border-[#5E6AD2] focus:ring-2 focus:ring-[#5E6AD2]/20",
                            "hover:border-white/[0.16]",
                            "transition-colors duration-150",
                            selectedDate ? "text-[#EDEDEF]" : "text-[#8A8F98]",
                          )}
                        >
                          <CalendarIcon className="w-4 h-4 text-[#8A8F98] flex-shrink-0" />
                          <span className="truncate">
                            {selectedDate ? formatLongDate(selectedDate) : "Pick a date"}
                          </span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 border border-white/[0.08] rounded-2xl bg-[#0F0F12] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)]"
                        align="start"
                      >
                        {/* Override CSS variables so the calendar renders with our accent color
                            instead of the dark theme's --primary (#00FF66 neon green). */}
                        <div
                          style={{
                            "--primary": "#5E6AD2",
                            "--primary-foreground": "#ffffff",
                            "--ring": "#5E6AD2",
                          } as React.CSSProperties}
                        >
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(d) => {
                              setSelectedDate(d);
                              setCalendarOpen(false);
                            }}
                            disabled={(date) => {
                              if (date < startOfDay(new Date())) return true;
                              if (tournamentStartDate && date > tournamentStartDate) return true;
                              return false;
                            }}
                            fromDate={startOfDay(new Date())}
                            toDate={tournamentStartDate}
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
                        "bg-[#0F0F12] border border-white/[0.10]",
                        "text-[#EDEDEF]",
                        "focus:outline-none focus:border-[#5E6AD2] focus:ring-2 focus:ring-[#5E6AD2]/20",
                        "hover:border-white/[0.16]",
                        "transition-colors duration-150",
                        "[color-scheme:dark]",
                      )}
                    />
                  </div>

                  {/* Validation hint — shown only when no date is selected yet */}
                  {!selectedDate && (
                    <p className="mt-1.5 text-xs text-[#8A8F98]">
                      Select a date and time for the draft to begin.
                    </p>
                  )}

                  <FieldError error={state.fieldErrors?.startAt} />
                </div>
              </RevealPanel>
            </div>
          </section>

          {/* ── INFO CALLOUT ──────────────────────────────────────── */}
          <div
            className={cn(
              "flex gap-3 px-4 py-3.5 rounded-xl",
              "bg-[#5E6AD2]/[0.06] border border-[#5E6AD2]/20",
            )}
          >
            <Info className="w-4 h-4 text-[#5E6AD2] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#8A8F98] leading-relaxed">
              After creating, you&apos;ll receive an invite code to share with
              participants. They can join via the Drafts page or a direct link.
              A minimum of 8 participants is required to start.
            </p>
          </div>

          {/* ── ACTIONS ───────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-white/[0.06]">
            <Link
              href="/drafts"
              className={cn(
                "flex-1 inline-flex items-center justify-center h-10 px-5 rounded-lg",
                "text-sm font-medium text-[#8A8F98]",
                "bg-white/[0.03] border border-white/[0.08]",
                "hover:bg-white/[0.06] hover:text-[#EDEDEF] hover:border-white/[0.12]",
                "transition-colors duration-150",
              )}
            >
              Cancel
            </Link>
            <SubmitButton />
          </div>
        </form>
      </SpotlightCard>

      {/* Subtle users hint beneath card */}
      <div className="flex items-center justify-center gap-2 pb-8">
        <Users className="w-3.5 h-3.5 text-[#8A8F98]" />
        <p className="text-xs text-[#8A8F98]">
          Requires 8 participants to begin drafting
        </p>
      </div>

    </div>
  );
}
