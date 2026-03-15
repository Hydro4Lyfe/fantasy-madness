"use client";

import { Calendar, ChevronRight, Globe, Lock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";

export interface League {
  id: string;
  name: string;
  currentSize: number;
  capacity: number;
  status: "open" | "closed" | "full";
  closeDateTime: Date | null;
  isPrivate?: boolean;
  isHost?: boolean;
}

function TypeBadge({ type }: { type: "private" | "public" }) {
  if (type === "private") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
        <Lock className="w-3 h-3" />
        Private
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#F59E0B]/30 px-2 py-0.5 text-xs text-[#F59E0B]">
      <Globe className="w-3 h-3" />
      Public
    </span>
  );
}

export function LeagueCard({ league }: { league: League }) {
  const fillPercent = Math.round(
    (league.currentSize / league.capacity) * 100
  );

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const statusMap: Record<League["status"], "open" | "locked" | "complete"> = {
    open: "open",
    closed: "locked",
    full: "locked",
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-5 flex flex-col gap-4">
        {/* Top row: name + badges */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-foreground leading-tight line-clamp-2 flex-1">
            {league.name}
          </h3>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <StatusBadge status={statusMap[league.status]} />
            <TypeBadge type={league.isPrivate ? "private" : "public"} />
          </div>
        </div>

        {/* Close date */}
        {league.closeDateTime && (
          <p className="text-xs text-muted-foreground">
            Closes {formatDateTime(league.closeDateTime)}
          </p>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-1">
              Players
            </p>
            <p className="text-base font-semibold text-foreground">
              {league.currentSize}
              <span className="text-muted-foreground text-xs">
                /{league.capacity}
              </span>
            </p>
            <div className="mt-1.5 h-1 rounded-full bg-secondary/50">
              <div
                className="h-1 rounded-full bg-[#F59E0B]"
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-1">
              Status
            </p>
            <p className="text-base font-semibold text-foreground capitalize">
              {league.status}
            </p>
          </div>
        </div>

        {/* Footer CTA hint */}
        <div className="border-t border-border pt-3 flex items-center justify-between">
          <span className="text-xs text-[#F59E0B]">View League</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#F59E0B]" />
        </div>
      </div>
    </div>
  );
}
