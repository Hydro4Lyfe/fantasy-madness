"use client";

import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { getTeamLogoCandidates } from "@/lib/team-logos";

type TeamLogoProps = {
  teamId?: number | null;
  label: string;
  className?: string;
};

function getInitials(label: string): string {
  const parts = label
    .split(" ")
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "?";
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export function TeamLogo({ teamId, label, className }: TeamLogoProps) {
  const [attempt, setAttempt] = useState(0);
  const sources = useMemo(() => getTeamLogoCandidates(teamId), [teamId]);
  const src = sources[attempt] ?? null;
  const fallbackText = useMemo(() => getInitials(label), [label]);

  useEffect(() => {
    setAttempt(0);
  }, [teamId]);

  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded bg-muted text-[10px] font-semibold text-muted-foreground",
          className,
        )}
        aria-label={`${label} logo fallback`}
      >
        {fallbackText}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${label} logo`}
      className={cn("rounded object-contain", className)}
      loading="lazy"
      decoding="async"
      onError={() => setAttempt((v) => v + 1)}
    />
  );
}
