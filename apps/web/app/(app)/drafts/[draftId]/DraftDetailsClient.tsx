"use client";

import { useState, useRef, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { startDraftAction } from "@/server/actions/drafts";
import { cn } from "@/lib/utils";
import { formatDateTime, formatDateTimeInput } from "@/lib/date";
import { parseISO } from "date-fns";
import {
  ArrowLeft,
  Users,
  Settings,
  Crown,
  MoreVertical,
  Copy,
  Check,
  UserX,
  Ban,
  Edit2,
  Trophy,
  Clock,
  Zap,
  Lock,
  Globe,
  AlertCircle,
  Play,
  Loader2,
  Save,
  X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Interfaces — preserved exactly as before
// ---------------------------------------------------------------------------

interface Participant {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isHost: boolean;
  isYou: boolean;
  status: "active" | "kicked" | "banned";
  joinedAt: string;
  totalPoints: number;
  rank: number;
  teamsCount: number;
}

interface DraftSettings {
  id: string;
  name: string;
  type: "private" | "public";
  status: "upcoming" | "drafting" | "active" | "completed";
  maxParticipants: number;
  startAt: string | null;
  pickTimeLimit: number;
  draftType: "snake" | "linear";
  visibility: "private" | "public";
  inviteCode: string;
  allowAutoQueue: boolean;
}

interface DraftDetailsClientProps {
  draft: DraftSettings;
  participants: Participant[];
  isHost: boolean;
}

// ---------------------------------------------------------------------------
// Helpers — preserved exactly as before
// ---------------------------------------------------------------------------

function formatStartAt(iso: string | null): string {
  if (!iso) return "Not scheduled";
  return formatDateTime(iso);
}

// ---------------------------------------------------------------------------
// SpotlightCard — mouse-tracking radial gradient (matches DashboardClient)
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
        "transition-shadow duration-300",
        "hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.08)]",
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
// Rank badge — gold/silver/bronze for top 3, muted for the rest
// ---------------------------------------------------------------------------

function RankBadge({ rank }: { rank: number }) {
  const base =
    "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0";
  if (rank === 1)
    return (
      <div className={cn(base, "bg-gradient-to-br from-yellow-400 to-yellow-600 text-[#050506]")}>
        1
      </div>
    );
  if (rank === 2)
    return (
      <div className={cn(base, "bg-gradient-to-br from-slate-300 to-slate-400 text-[#050506]")}>
        2
      </div>
    );
  if (rank === 3)
    return (
      <div className={cn(base, "bg-gradient-to-br from-amber-600 to-amber-700 text-white")}>3</div>
    );
  return <div className={cn(base, "bg-white/[0.06] text-[#8A8F98]")}>{rank}</div>;
}

// ---------------------------------------------------------------------------
// Status pill
// ---------------------------------------------------------------------------

function StatusPill({ status }: { status: DraftSettings["status"] }) {
  if (status === "upcoming") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-mono tracking-widest uppercase text-yellow-400">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
        Upcoming
      </span>
    );
  }
  if (status === "drafting") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5E6AD2]/40 bg-[#5E6AD2]/10 px-3 py-1 text-xs font-mono tracking-widest uppercase text-[#8A8F98]">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5E6AD2] opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#5E6AD2]" />
        </span>
        Drafting
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono tracking-widest uppercase text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-xs font-mono tracking-widest uppercase text-[#8A8F98]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#8A8F98]" />
      Completed
    </span>
  );
}

// ---------------------------------------------------------------------------
// Settings row — label / value pair
// ---------------------------------------------------------------------------

function SettingsRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
      <span className="text-xs font-mono tracking-widest uppercase text-[#8A8F98]">{label}</span>
      <span className="text-sm text-[#EDEDEF]">{children}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DraftDetailsClient({
  draft: initialDraft,
  participants: initialParticipants,
  isHost,
}: DraftDetailsClientProps) {
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [settings, setSettings] = useState(initialDraft);
  const [participants, setParticipants] = useState(initialParticipants);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const router = useRouter();

  // -- handlers (unchanged logic) --

  const handleCopyCode = () => {
    navigator.clipboard.writeText(settings.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleKickParticipant = (participantId: string) => {
    if (window.confirm("Are you sure you want to kick this participant?")) {
      setParticipants(participants.filter((p) => p.id !== participantId));
      setSelectedParticipant(null);
    }
  };

  const handleBanParticipant = (participantId: string) => {
    if (
      window.confirm(
        "Are you sure you want to ban this participant? They will not be able to rejoin."
      )
    ) {
      setParticipants(
        participants.map((p) =>
          p.id === participantId ? { ...p, status: "banned" as const } : p
        )
      );
      setSelectedParticipant(null);
    }
  };

  const handleStartDraft = async () => {
    if (!window.confirm("Start the draft now? All participants will begin picking.")) return;
    setIsStarting(true);
    setStartError(null);
    const result = await startDraftAction(settings.id);
    if (result.success) {
      router.refresh();
    } else {
      setStartError(result.error ?? "Failed to start draft");
      setIsStarting(false);
    }
  };

  // -- derived values --

  const activeParticipants = participants.filter((p) => p.status === "active");
  const spotsRemaining = settings.maxParticipants - activeParticipants.length;
  const showResults = settings.status === "active" || settings.status === "completed";

  const sortedForLeaderboard = [...activeParticipants].sort((a, b) => {
    // Rank 0 means no result yet — push to bottom
    if (a.rank === 0 && b.rank === 0) return 0;
    if (a.rank === 0) return 1;
    if (b.rank === 0) return -1;
    return a.rank - b.rank;
  });

  const leaderPoints =
    sortedForLeaderboard.length > 0 ? sortedForLeaderboard[0].totalPoints : 0;

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: back + title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/drafts"
            className={cn(
              "inline-flex items-center gap-1.5 text-sm text-[#8A8F98] hover:text-[#EDEDEF]",
              "transition-colors duration-200",
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <div className="w-px h-5 bg-white/[0.06]" />

          <div className="flex items-center gap-2 min-w-0">
            <h2
              className={cn(
                "text-2xl sm:text-3xl font-semibold tracking-tight truncate",
                "bg-gradient-to-b from-[#EDEDEF] to-[#EDEDEF]/70 bg-clip-text text-transparent",
              )}
            >
              {settings.name}
            </h2>
            {isHost && (
              <Crown className="w-5 h-5 flex-shrink-0 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]" />
            )}
          </div>

          <div className="hidden sm:block">
            <StatusPill status={settings.status} />
          </div>
        </div>

        {/* Right: CTA buttons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Show StatusPill on small screens here */}
          <div className="sm:hidden">
            <StatusPill status={settings.status} />
          </div>

          {isHost && settings.status === "upcoming" && (
            <button
              onClick={handleStartDraft}
              disabled={isStarting}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white",
                "bg-[#5E6AD2] hover:bg-[#6872D9]",
                "shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]",
                "active:scale-[0.98] transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Draft
                </>
              )}
            </button>
          )}

          {settings.status === "drafting" && (
            <Link
              href={`/drafts/${settings.id}/room`}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white",
                "bg-[#5E6AD2] hover:bg-[#6872D9]",
                "shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]",
                "active:scale-[0.98] transition-all duration-200",
              )}
            >
              <Zap className="w-4 h-4" />
              Join Draft
            </Link>
          )}
        </div>
      </div>

      {/* Error alert */}
      {startError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.08] p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <p className="text-sm text-red-400">{startError}</p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Main grid                                                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ---- Left column ---- */}
        <div className="lg:col-span-2 space-y-4">
          {/* Participants card */}
          <SpotlightCard className="p-6">
            {/* Section header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-[#5E6AD2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-[#EDEDEF]">Participants</h3>
                    <span className="text-xs rounded-full border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[#8A8F98] font-mono">
                      {activeParticipants.length}/{settings.maxParticipants}
                    </span>
                  </div>
                  {spotsRemaining > 0 && (
                    <p className="text-xs text-[#8A8F98] mt-0.5">
                      {spotsRemaining} {spotsRemaining === 1 ? "spot" : "spots"} remaining
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Participant rows */}
            <div className="space-y-1">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className={cn(
                    "relative flex items-center gap-4 rounded-xl px-4 py-3",
                    "transition-colors duration-200",
                    participant.isYou
                      ? "bg-[#5E6AD2]/[0.06] border border-[#5E6AD2]/10"
                      : "hover:bg-white/[0.04] border border-transparent",
                  )}
                >
                  {/* "You" accent bar */}
                  {participant.isYou && (
                    <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[#5E6AD2]/60" />
                  )}

                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/[0.10]">
                      <ImageWithFallback
                        src={participant.avatar}
                        alt={participant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {participant.isHost && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center">
                        <Crown className="w-2.5 h-2.5 text-yellow-400" />
                      </div>
                    )}
                  </div>

                  {/* Name + badges */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-[#EDEDEF] truncate">
                        {participant.name}
                      </span>
                      {participant.isYou && (
                        <span className="text-xs rounded-full border border-[#5E6AD2]/30 bg-[#5E6AD2]/10 text-[#5E6AD2] px-2 py-0.5">
                          You
                        </span>
                      )}
                      {participant.status === "banned" && (
                        <span className="text-xs rounded-full border border-red-500/30 bg-red-500/10 text-red-400 px-2 py-0.5">
                          Banned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#8A8F98] mt-0.5">
                      {participant.teamsCount} / 8 teams picked
                    </p>
                  </div>

                  {/* Pick count badge */}
                  <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs font-mono text-[#8A8F98]">
                      {participant.teamsCount}/8
                    </span>
                  </div>

                  {/* Host kebab menu */}
                  {isHost && !participant.isHost && participant.status === "active" && (
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() =>
                          setSelectedParticipant(
                            selectedParticipant === participant.id ? null : participant.id
                          )
                        }
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          "text-[#8A8F98] hover:text-[#EDEDEF]",
                          "hover:bg-white/[0.06] transition-all duration-200",
                        )}
                        aria-label="Participant actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {selectedParticipant === participant.id && (
                        <>
                          {/* Overlay to close */}
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setSelectedParticipant(null)}
                          />
                          <div
                            className={cn(
                              "absolute right-0 top-10 w-44 z-50",
                              "rounded-xl border border-white/[0.08] bg-[#0a0a0c]",
                              "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_32px_rgba(0,0,0,0.6)]",
                              "p-1.5 overflow-hidden",
                            )}
                          >
                            <button
                              onClick={() => handleKickParticipant(participant.id)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#EDEDEF] hover:bg-white/[0.06] rounded-lg transition-colors"
                            >
                              <UserX className="w-4 h-4 text-[#8A8F98]" />
                              Kick Player
                            </button>
                            <button
                              onClick={() => handleBanParticipant(participant.id)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/[0.08] rounded-lg transition-colors"
                            >
                              <Ban className="w-4 h-4" />
                              Ban Player
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Waiting for players empty state */}
            {spotsRemaining > 0 && (
              <div
                className={cn(
                  "mt-4 rounded-2xl border border-dashed border-white/[0.06]",
                  "p-8 text-center",
                )}
              >
                <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                  <Users className="w-5 h-5 text-[#8A8F98]" />
                </div>
                <p className="text-sm font-medium text-[#EDEDEF] mb-1">
                  Waiting for more players
                </p>
                <p className="text-xs text-[#8A8F98] mb-4">
                  {spotsRemaining} {spotsRemaining === 1 ? "spot" : "spots"} open — share the invite
                  code to fill them
                </p>
                <button
                  onClick={handleCopyCode}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm",
                    "bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06]",
                    "text-[#8A8F98] hover:text-[#EDEDEF] transition-all duration-200",
                  )}
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Invite Code
                    </>
                  )}
                </button>
              </div>
            )}
          </SpotlightCard>
        </div>

        {/* ---- Right column ---- */}
        <div className="space-y-4">
          {/* Draft Settings card */}
          <SpotlightCard className="p-6">
            {/* Ambient blob */}
            <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#5E6AD2]/10 blur-[60px]" />

            <div className="relative">
              {/* Section header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#5E6AD2]" />
                  <span className="text-xs font-mono tracking-widest uppercase text-[#8A8F98]">
                    Draft Settings
                  </span>
                </div>
                {isHost && !isEditingSettings && (
                  <button
                    onClick={() => setIsEditingSettings(true)}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5",
                      "bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06]",
                      "text-[#8A8F98] hover:text-[#EDEDEF] transition-all duration-200",
                    )}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>

              {/* Settings list */}
              <div className="divide-y divide-white/[0.04]">
                <SettingsRow label="Draft Type">
                  <span className="capitalize">{settings.draftType} Draft</span>
                </SettingsRow>

                <SettingsRow label="Pick Timer">
                  {settings.pickTimeLimit > 0 ? `${settings.pickTimeLimit}s` : "No limit"}
                </SettingsRow>

                <SettingsRow label="Max Players">
                  <span>{settings.maxParticipants} players</span>
                </SettingsRow>

                <SettingsRow label="Start Time">
                  {isEditingSettings ? (
                    <Input
                      type="datetime-local"
                      value={formatDateTimeInput(settings.startAt)}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          startAt: e.target.value
                            ? parseISO(e.target.value).toISOString()
                            : null,
                        })
                      }
                      className={cn(
                        "h-7 text-sm",
                        "bg-[#0F0F12] border-white/10 focus-visible:border-[#5E6AD2] focus-visible:ring-0",
                        "text-[#EDEDEF]",
                      )}
                    />
                  ) : (
                    <span>{formatStartAt(settings.startAt)}</span>
                  )}
                </SettingsRow>

                <SettingsRow label="Visibility">
                  <span className="flex items-center gap-1.5">
                    {settings.visibility === "private" ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-[#8A8F98]" />
                        Private
                      </>
                    ) : (
                      <>
                        <Globe className="w-3.5 h-3.5 text-[#5E6AD2]" />
                        Public
                      </>
                    )}
                  </span>
                </SettingsRow>
              </div>

              {/* Edit actions */}
              {isEditingSettings && (
                <div className="mt-5 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setSettings(initialDraft);
                      setIsEditingSettings(false);
                    }}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs rounded-lg px-3 py-1.5",
                      "bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06]",
                      "text-[#8A8F98] hover:text-[#EDEDEF] transition-all duration-200",
                    )}
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                  <button
                    onClick={() => setIsEditingSettings(false)}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs rounded-lg px-3 py-1.5",
                      "bg-[#5E6AD2] hover:bg-[#6872D9] text-white",
                      "shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]",
                      "active:scale-[0.98] transition-all duration-200",
                    )}
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save
                  </button>
                </div>
              )}
            </div>
          </SpotlightCard>

          {/* Invite Code card — private drafts only */}
          {settings.visibility === "private" && <SpotlightCard className="p-6">
            {/* Ambient blob */}
            <div className="pointer-events-none absolute -top-8 -right-8 w-36 h-36 rounded-full bg-[#5E6AD2]/10 blur-[40px]" />

            <div className="relative">
              <p
                className={cn(
                  "text-sm font-semibold tracking-tight mb-4",
                  "bg-gradient-to-b from-[#EDEDEF] to-[#EDEDEF]/70 bg-clip-text text-transparent",
                )}
              >
                Invite Code
              </p>

              {/* Code display */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={cn(
                    "flex-1 font-mono text-xl tracking-widest text-[#5E6AD2]",
                    "bg-[#5E6AD2]/10 rounded-xl px-4 py-2.5 border border-[#5E6AD2]/20",
                    "text-center select-all",
                  )}
                >
                  {settings.inviteCode}
                </div>
                <button
                  onClick={handleCopyCode}
                  aria-label="Copy invite code"
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    "bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06]",
                    "text-[#8A8F98] hover:text-[#EDEDEF] transition-all duration-200",
                    "active:scale-[0.95]",
                  )}
                >
                  {copiedCode ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <p className="text-xs text-[#8A8F98]">Share with friends to join this draft</p>
            </div>
          </SpotlightCard>}

          {/* Draft Room card */}
          <SpotlightCard
            className={cn(
              "p-6",
              settings.status === "drafting" && "border-[#5E6AD2]/20",
            )}
          >
            {/* Ambient blob */}
            <div className="pointer-events-none absolute -bottom-8 -right-8 w-36 h-36 rounded-full bg-[#5E6AD2]/10 blur-[40px]" />

            <div className="relative">
              {settings.status === "upcoming" && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-[#8A8F98]" />
                    <span className="text-xs font-mono tracking-widest uppercase text-[#8A8F98]">
                      Draft Room
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#EDEDEF] mb-2">Draft Starts Soon</p>
                  <p className="text-xs text-[#8A8F98]">
                    {settings.startAt
                      ? `Scheduled for ${formatStartAt(settings.startAt)}`
                      : "Not scheduled yet — start manually when ready"}
                  </p>
                </>
              )}

              {settings.status === "drafting" && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-[#5E6AD2] drop-shadow-[0_0_6px_rgba(94,106,210,0.6)]" />
                    <span className="text-xs font-mono tracking-widest uppercase text-[#5E6AD2]">
                      Draft Room
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#EDEDEF] mb-4">Draft In Progress</p>
                  <Link
                    href={`/drafts/${settings.id}/room`}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white",
                      "bg-[#5E6AD2] hover:bg-[#6872D9]",
                      "shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]",
                      "active:scale-[0.98] transition-all duration-200",
                    )}
                  >
                    <Zap className="w-4 h-4" />
                    Enter Draft Room
                  </Link>
                </>
              )}

              {(settings.status === "active" || settings.status === "completed") && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-4 h-4 text-[#5E6AD2]" />
                    <span className="text-xs font-mono tracking-widest uppercase text-[#8A8F98]">
                      Draft Room
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#EDEDEF] mb-2">
                    {settings.status === "completed" ? "Draft Complete" : "Draft Active"}
                  </p>
                  <Link
                    href={`/drafts/${settings.id}/results`}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs",
                      "text-[#8A8F98] hover:text-[#EDEDEF] transition-colors duration-200",
                    )}
                  >
                    View results &rarr;
                  </Link>
                </>
              )}
            </div>
          </SpotlightCard>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Leaderboard (active / completed only)                               */}
      {/* ------------------------------------------------------------------ */}
      {showResults && (
        <SpotlightCard className="p-6">
          {/* Ambient blobs */}
          <div className="pointer-events-none absolute -top-16 -left-16 w-64 h-64 rounded-full bg-[#5E6AD2]/10 blur-[80px]" />
          <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-indigo-500/[0.06] blur-[80px]" />

          <div className="relative">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-4 h-4 text-[#5E6AD2]" />
              </div>
              <h3
                className={cn(
                  "text-lg font-semibold tracking-tight",
                  "bg-gradient-to-b from-[#EDEDEF] to-[#EDEDEF]/70 bg-clip-text text-transparent",
                )}
              >
                Leaderboard
              </h3>
            </div>

            {sortedForLeaderboard.length === 0 ? (
              <div className="text-center py-10">
                <Trophy className="w-12 h-12 text-[#8A8F98]/30 mx-auto mb-3" />
                <p className="text-sm text-[#8A8F98]">No results yet</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {sortedForLeaderboard.map((participant) => {
                  const effectiveRank =
                    participant.rank > 0 ? participant.rank : sortedForLeaderboard.indexOf(participant) + 1;
                  const isLeader = effectiveRank === 1;
                  const delta = leaderPoints - participant.totalPoints;

                  return (
                    <div
                      key={participant.id}
                      className={cn(
                        "flex items-center gap-4 rounded-xl px-4 py-3",
                        "transition-colors duration-200",
                        isLeader
                          ? "bg-[#5E6AD2]/[0.06] border border-[#5E6AD2]/10"
                          : participant.isYou
                            ? "bg-[#5E6AD2]/[0.04] border border-[#5E6AD2]/[0.08]"
                            : "hover:bg-white/[0.04] border border-transparent",
                      )}
                    >
                      <RankBadge rank={effectiveRank} />

                      <div className="w-9 h-9 rounded-full overflow-hidden border border-white/[0.10] flex-shrink-0">
                        <ImageWithFallback
                          src={participant.avatar}
                          alt={participant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#EDEDEF] truncate">
                            {participant.name}
                          </span>
                          {participant.isYou && (
                            <span className="text-xs rounded-full border border-[#5E6AD2]/30 bg-[#5E6AD2]/10 text-[#5E6AD2] px-2 py-0.5">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#8A8F98]">
                          {participant.teamsCount} teams drafted
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        {isLeader ? (
                          <span
                            className={cn(
                              "text-xl font-semibold font-mono",
                              "bg-gradient-to-r from-[#5E6AD2] to-indigo-400 bg-clip-text text-transparent",
                            )}
                          >
                            {participant.totalPoints.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-xl font-semibold font-mono text-[#EDEDEF]">
                            {participant.totalPoints.toLocaleString()}
                          </span>
                        )}

                        {!isLeader && (
                          <p className="text-xs text-[#8A8F98] mt-0.5">
                            &minus;{delta.toLocaleString()} pts
                          </p>
                        )}
                        {isLeader && (
                          <p className="text-xs text-[#5E6AD2] mt-0.5">Leading</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </SpotlightCard>
      )}
    </div>
  );
}
