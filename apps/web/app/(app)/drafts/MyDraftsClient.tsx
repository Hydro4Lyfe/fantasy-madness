"use client";

import { useRef, useState, useTransition, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { joinDraftByInviteAction } from "@/server/actions/drafts";
import {
  Plus,
  KeyRound,
  Calendar,
  Lock,
  Globe,
  Archive,
  Loader2,
  ChevronRight,
  Users,
} from "lucide-react";

interface Draft {
  id: string;
  name: string;
  type: "private" | "public";
  participants: number;
  maxParticipants: number;
  status: "active" | "draft" | "completed";
  draftDate: string;
  startTime: string;
  myRank: number | null;
  totalPoints: number;
  thumbnail: string;
}

interface MyDraftsClientProps {
  drafts: Draft[];
}

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

function TypeBadge({ type }: { type: "private" | "public" }) {
  if (type === "private") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.10] px-2 py-0.5 text-xs text-[#8A8F98]">
        <Lock className="w-3 h-3" />
        Private
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#5E6AD2]/30 px-2 py-0.5 text-xs text-[#5E6AD2]">
      <Globe className="w-3 h-3" />
      Public
    </span>
  );
}

function DraftCard({ draft }: { draft: Draft }) {
  const isActive = draft.status === "active";
  const fillPercent = Math.round((draft.participants / draft.maxParticipants) * 100);

  return (
    <Link href={`/drafts/${draft.id}`} className="block group">
      <SpotlightCard>
        <div className="p-5 flex flex-col gap-4">
          {/* Top row: name + badges (stacked) */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-[#EDEDEF] leading-tight line-clamp-2 flex-1">
              {draft.name}
            </h3>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              {isActive && (
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                  </span>
                  <span className="text-xs font-mono text-emerald-400">Live</span>
                </div>
              )}
              <TypeBadge type={draft.type} />
            </div>
          </div>

          {/* Tournament label / draft date */}
          <p className="text-xs text-[#8A8F98]">{draft.draftDate}</p>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-mono tracking-widest uppercase text-[#8A8F98] mb-1">
                Players
              </p>
              <p className="text-base font-semibold text-[#EDEDEF]">
                {draft.participants}
                <span className="text-[#8A8F98] text-xs">/{draft.maxParticipants}</span>
              </p>
              <div className="mt-1.5 h-1 rounded-full bg-white/[0.06]">
                <div
                  className="h-1 rounded-full bg-[#5E6AD2]"
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-mono tracking-widest uppercase text-[#8A8F98] mb-1">
                Start Time
              </p>
              <p className="text-base font-semibold text-[#EDEDEF]">{draft.startTime}</p>
            </div>
          </div>

          {/* Footer CTA hint */}
          <div className="border-t border-white/[0.06] pt-3 flex items-center justify-between">
            <span className="text-xs text-[#5E6AD2]">
              {isActive ? "Join Live Draft" : "View Details"}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#5E6AD2]" />
          </div>
        </div>
      </SpotlightCard>
    </Link>
  );
}

function SectionHeader({
  label,
  count,
  variant,
}: {
  label: string;
  count: number;
  variant: "live" | "scheduled" | "finished";
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      {variant === "live" && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
      )}
      {variant === "scheduled" && (
        <Calendar className="w-4 h-4 text-[#5E6AD2]" />
      )}
      {variant === "finished" && (
        <Archive className="w-4 h-4 text-[#8A8F98]" />
      )}
      <h2 className="text-sm font-semibold text-[#EDEDEF] tracking-tight">{label}</h2>
      <span className="bg-white/[0.06] text-[#8A8F98] rounded-full px-2 py-0.5 text-xs font-mono">
        {count}
      </span>
    </div>
  );
}

export function MyDraftsClient({ drafts }: MyDraftsClientProps) {
  const [joinCode, setJoinCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleJoinWithCode = () => {
    if (!joinCode.trim()) {
      toast.error("Please enter an invite code");
      return;
    }

    startTransition(async () => {
      const result = await joinDraftByInviteAction(joinCode.trim());

      if (result.success && result.draftId) {
        setJoinCode("");
        if (result.alreadyJoined) {
          toast.info("You're already a member of this draft");
        } else {
          toast.success("Successfully joined the draft!");
        }
        router.push(`/drafts/${result.draftId}`);
      } else {
        toast.error(result.error ?? "Failed to join draft");
      }
    });
  };

  const activeDrafts = drafts.filter((d) => d.status === "active");
  const upcomingDrafts = drafts.filter((d) => d.status === "draft");
  const completedDrafts = drafts.filter((d) => d.status === "completed");

  const subtitleParts: string[] = [];
  if (activeDrafts.length > 0)
    subtitleParts.push(`${activeDrafts.length} active`);
  if (upcomingDrafts.length > 0)
    subtitleParts.push(`${upcomingDrafts.length} scheduled`);
  if (completedDrafts.length > 0)
    subtitleParts.push(`${completedDrafts.length} completed`);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1
          className={cn(
            "text-3xl font-bold tracking-tight",
            "bg-gradient-to-b from-[#EDEDEF] to-[#EDEDEF]/70 bg-clip-text text-transparent",
          )}
        >
          Drafts
        </h1>
        {subtitleParts.length > 0 ? (
          <p className="mt-1 text-sm text-[#8A8F98]">{subtitleParts.join(" · ")}</p>
        ) : (
          <p className="mt-1 text-sm text-[#8A8F98]">No drafts yet</p>
        )}
      </div>

      {/* Action bar */}
      <SpotlightCard>
        <div className="p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Create Draft */}
          <Link
            href="/drafts/new"
            className={cn(
              "inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-sm font-medium text-white",
              "bg-[#5E6AD2] hover:bg-[#6872D9]",
              "shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]",
              "transition-colors duration-150 flex-shrink-0",
            )}
          >
            <Plus className="w-4 h-4" />
            Create New Draft
          </Link>

          {/* Divider */}
          <div className="hidden sm:block w-px bg-white/[0.06] self-stretch" />

          {/* Join with code */}
          <div className="flex-1 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#5E6AD2] flex-shrink-0" />
            <Input
              placeholder="Invite code..."
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleJoinWithCode();
              }}
              className="flex-1 h-9 bg-white/[0.04] border-white/[0.10] focus-visible:border-[#5E6AD2] focus-visible:ring-0 text-[#EDEDEF] placeholder:text-[#8A8F98] font-mono text-sm"
            />
            <button
              onClick={handleJoinWithCode}
              disabled={isPending}
              className={cn(
                "h-9 px-4 rounded-lg bg-[#5E6AD2] hover:bg-[#6872D9] text-white text-sm font-medium flex-shrink-0",
                "shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]",
                "transition-colors duration-150",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "inline-flex items-center gap-1.5",
              )}
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Join"
              )}
            </button>
          </div>
        </div>
      </SpotlightCard>

      {/* Empty state */}
      {drafts.length === 0 && (
        <SpotlightCard>
          <div className="py-16 px-8 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-[#5E6AD2]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#EDEDEF] mb-1">No Drafts Yet</h3>
              <p className="text-sm text-[#8A8F98] max-w-xs">
                Create a new draft or join one with an invite code to get started.
              </p>
            </div>
            <Link
              href="/drafts/new"
              className={cn(
                "inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium text-white mt-2",
                "bg-[#5E6AD2] hover:bg-[#6872D9]",
                "shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]",
                "transition-colors duration-150",
              )}
            >
              <Plus className="w-4 h-4" />
              Create New Draft
            </Link>
          </div>
        </SpotlightCard>
      )}

      {/* Live Now section */}
      {activeDrafts.length > 0 && (
        <section>
          <SectionHeader label="Live Now" count={activeDrafts.length} variant="live" />
          <div className="grid sm:grid-cols-2 gap-4">
            {activeDrafts.map((draft) => (
              <DraftCard key={draft.id} draft={draft} />
            ))}
          </div>
        </section>
      )}

      {/* Scheduled section */}
      {upcomingDrafts.length > 0 && (
        <section>
          <SectionHeader label="Scheduled" count={upcomingDrafts.length} variant="scheduled" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingDrafts.map((draft) => (
              <DraftCard key={draft.id} draft={draft} />
            ))}
          </div>
        </section>
      )}

      {/* Finished section — compact row list */}
      {completedDrafts.length > 0 && (
        <section>
          <SectionHeader label="Finished" count={completedDrafts.length} variant="finished" />
          <SpotlightCard>
            <div className="divide-y divide-white/[0.04]">
              {completedDrafts.map((draft) => (
                <Link
                  key={draft.id}
                  href={`/drafts/${draft.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.04] transition-colors"
                >
                  {/* Archive icon */}
                  <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                    <Archive className="w-3.5 h-3.5 text-[#8A8F98]" />
                  </div>

                  {/* Name + date */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#EDEDEF] truncate">{draft.name}</p>
                    <p className="text-xs text-[#8A8F98]">{draft.draftDate}</p>
                  </div>

                  {/* Type badge */}
                  <div className="hidden sm:block flex-shrink-0">
                    <TypeBadge type={draft.type} />
                  </div>

                  {/* Players */}
                  <div className="text-right hidden sm:block flex-shrink-0">
                    <p className="text-xs text-[#8A8F98] font-mono">
                      {draft.participants}/{draft.maxParticipants}
                    </p>
                  </div>

                  {/* Chevron */}
                  <ChevronRight className="w-4 h-4 text-[#8A8F98] flex-shrink-0" />
                </Link>
              ))}
            </div>
          </SpotlightCard>
        </section>
      )}
    </div>
  );
}
