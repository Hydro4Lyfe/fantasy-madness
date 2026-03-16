"use client";

import { useMemo, useState } from "react";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamLogo } from "@/components/team/TeamLogo";

/* ------------------------------------------------------------------ */
/*  Region definitions                                                 */
/* ------------------------------------------------------------------ */

const REGIONS = [
  { quadrant: 1, name: "East", color: "#3B82F6" },
  { quadrant: 2, name: "West", color: "#10B981" },
  { quadrant: 3, name: "South", color: "#F59E0B" },
  { quadrant: 4, name: "Midwest", color: "#F43F5E" },
] as const;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type PickerSlot = {
  slotId: string;
  displayName: string;
  abbreviation: string | null;
  logoTeamIds?: number[];
  seed: number;
  quadrant: number;
  isPlayIn: boolean;
};

type RegionPickerGridProps = {
  slots: PickerSlot[];
  selectedSlotIds: string[];
  onToggle: (slotId: string) => void;
  disabled?: boolean;
  maxPicks?: number;
  searchQuery?: string;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function RegionPickerGrid({
  slots,
  selectedSlotIds,
  onToggle,
  disabled = false,
  maxPicks = 8,
  searchQuery = "",
}: RegionPickerGridProps) {
  const [activeTab, setActiveTab] = useState(1);

  /* Group & sort slots by region */
  const slotsByRegion = useMemo(() => {
    const grouped = new Map<number, PickerSlot[]>();
    for (const r of REGIONS) grouped.set(r.quadrant, []);
    for (const slot of slots) {
      grouped.get(slot.quadrant)?.push(slot);
    }
    for (const [, group] of grouped) {
      group.sort((a, b) => a.seed - b.seed);
    }
    return grouped;
  }, [slots]);

  /* Search match counts per region (for tab badges) */
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const matchCounts = useMemo(() => {
    if (!normalizedSearch) return null;
    const counts = new Map<number, number>();
    for (const [q, group] of slotsByRegion) {
      counts.set(
        q,
        group.filter(
          (s) =>
            s.displayName.toLowerCase().includes(normalizedSearch) ||
            s.abbreviation?.toLowerCase().includes(normalizedSearch)
        ).length
      );
    }
    return counts;
  }, [slotsByRegion, normalizedSearch]);

  const isAtLimit = selectedSlotIds.length >= maxPicks;

  /* ---- Slot card renderer ---- */
  const renderSlotCard = (slot: PickerSlot, regionColor: string) => {
    const isSelected = selectedSlotIds.includes(slot.slotId);
    const canSelect = !disabled && (!isAtLimit || isSelected);
    const matchesSearch =
      !normalizedSearch ||
      slot.displayName.toLowerCase().includes(normalizedSearch) ||
      slot.abbreviation?.toLowerCase().includes(normalizedSearch);

    const hasLogos = slot.logoTeamIds && slot.logoTeamIds.length > 0;
    const isPlayInDual =
      slot.isPlayIn && slot.logoTeamIds && slot.logoTeamIds.length >= 2;
    const teamNames = isPlayInDual
      ? slot.displayName.split(" / ")
      : [slot.displayName];

    return (
      <div
        key={slot.slotId}
        onClick={() => canSelect && onToggle(slot.slotId)}
        className={cn(
          "relative overflow-hidden rounded-2xl border p-3 transition-all duration-200",
          "bg-gradient-to-b from-white/[0.08] to-white/[0.02]",
          !matchesSearch && normalizedSearch && "opacity-20",
          isSelected
            ? "border-[#5E6AD2]/50 ring-1 ring-[#5E6AD2]/40 shadow-[0_0_20px_rgba(94,106,210,0.15)]"
            : canSelect
              ? "border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.10] cursor-pointer shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4)]"
              : "border-white/[0.06] opacity-50 cursor-not-allowed shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4)]"
        )}
        style={
          isSelected
            ? { background: `${regionColor}10` }
            : undefined
        }
      >
        {/* Top: Logo + Name + Checkmark */}
        <div className="flex items-start justify-between mb-2.5 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {hasLogos &&
              (isPlayInDual ? (
                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/[0.10] bg-white/[0.12] flex-shrink-0">
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
                  >
                    <TeamLogo
                      teamId={slot.logoTeamIds![0]}
                      label={teamNames[0] ?? "TBD"}
                      className="w-7 h-7 -translate-x-0.5 -translate-y-0.5"
                    />
                  </div>
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
                    }}
                  >
                    <TeamLogo
                      teamId={slot.logoTeamIds![1]}
                      label={teamNames[1] ?? "TBD"}
                      className="w-7 h-7 translate-x-0.5 translate-y-0.5"
                    />
                  </div>
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(135deg, transparent calc(50% - 0.5px), rgba(255,255,255,0.15) calc(50% - 0.5px), rgba(255,255,255,0.15) calc(50% + 0.5px), transparent calc(50% + 0.5px))",
                    }}
                  />
                </div>
              ) : (
                <TeamLogo
                  teamId={slot.logoTeamIds![0]}
                  label={slot.displayName}
                  className="w-10 h-10 border border-white/[0.10] bg-white/[0.12]"
                />
              ))}
            <div className="min-w-0">
              {isPlayInDual ? (
                <>
                  <div className="flex items-center gap-1.5 leading-tight">
                    <span className="font-bold text-sm text-[#EDEDEF] truncate">
                      {teamNames[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="text-[9px] font-bold tracking-wider uppercase flex-shrink-0 px-1 py-px rounded"
                      style={{
                        color: "rgba(245,158,11,0.85)",
                        background: "rgba(245,158,11,0.08)",
                        border: "1px solid rgba(245,158,11,0.15)",
                      }}
                    >
                      vs
                    </span>
                    <span className="font-bold text-sm text-[#EDEDEF] truncate">
                      {teamNames[1]}
                    </span>
                  </div>
                </>
              ) : (
                <h3 className="font-bold text-sm leading-tight line-clamp-1 text-[#EDEDEF]">
                  {slot.displayName}
                </h3>
              )}
            </div>
          </div>
          {isSelected && (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{ background: regionColor }}
            >
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Badges: Seed + First Four */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
              slot.seed <= 4
                ? "border-[#5E6AD2]/50 text-[#5E6AD2]"
                : slot.seed <= 8
                  ? "border-white/[0.20] text-[#8A8F98]"
                  : "border-white/[0.10] text-[#8A8F98]"
            )}
          >
            #{slot.seed}
          </span>
          {slot.isPlayIn && (
            <span className="inline-flex items-center rounded-md border border-amber-500/30 px-2 py-0.5 text-xs text-amber-300">
              First Four
            </span>
          )}
        </div>

        {/* Footer: Seed value + select hint */}
        <div className="flex items-center justify-between text-xs text-[#8A8F98]">
          <span>Seed value: {slot.seed}</span>
          {canSelect && !isSelected && (
            <span style={{ color: regionColor }}>Click to select</span>
          )}
          {!canSelect && !isSelected && (
            <span className="text-[#8A8F98]">Max reached</span>
          )}
        </div>
      </div>
    );
  };

  /* ---- Region column renderer ---- */
  const renderRegionColumn = (
    quadrant: number,
    regionName: string,
    regionColor: string
  ) => {
    const regionSlots = slotsByRegion.get(quadrant) ?? [];
    const pickedCount = regionSlots.filter((s) =>
      selectedSlotIds.includes(s.slotId)
    ).length;

    return (
      <div className="flex flex-col" key={quadrant}>
        {/* Region header */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-t-xl border border-b-0"
          style={{
            background: `linear-gradient(180deg, ${regionColor}15 0%, ${regionColor}08 100%)`,
            borderColor: `${regionColor}25`,
          }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: regionColor }}
          />
          <span
            className="text-xs font-bold tracking-wider uppercase"
            style={{ color: regionColor }}
          >
            {regionName}
          </span>
          {pickedCount > 0 && (
            <span
              className="text-[10px] ml-auto font-mono font-bold"
              style={{ color: regionColor }}
            >
              {pickedCount} picked
            </span>
          )}
        </div>

        {/* Slot cards */}
        <div
          className="flex flex-col gap-2 p-2 rounded-b-xl border border-t-0 bg-white/[0.02]"
          style={{ borderColor: `${regionColor}18` }}
        >
          {regionSlots.map((slot) => renderSlotCard(slot, regionColor))}
          {regionSlots.length === 0 && (
            <div className="py-8 text-center text-sm text-[#8A8F98]">
              No teams in this region
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Mobile: Region tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-4 md:hidden">
        {REGIONS.map((r) => {
          const count = matchCounts?.get(r.quadrant);
          return (
            <button
              key={r.quadrant}
              onClick={() => setActiveTab(r.quadrant)}
              className="flex-1 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-200 relative"
              style={
                activeTab === r.quadrant
                  ? {
                      background: `${r.color}18`,
                      color: r.color,
                      boxShadow: `0 0 0 1px ${r.color}30`,
                    }
                  : { color: "#8A8F98" }
              }
            >
              {r.name}
              {count != null && count > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                  style={{ background: r.color }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile: Show active region only */}
      <div className="md:hidden">
        {REGIONS.filter((r) => r.quadrant === activeTab).map((r) =>
          renderRegionColumn(r.quadrant, r.name, r.color)
        )}
      </div>

      {/* Tablet: 2 columns */}
      <div className="hidden md:grid md:grid-cols-2 lg:hidden gap-3">
        {REGIONS.map((r) =>
          renderRegionColumn(r.quadrant, r.name, r.color)
        )}
      </div>

      {/* Desktop: 4 columns */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-3">
        {REGIONS.map((r) =>
          renderRegionColumn(r.quadrant, r.name, r.color)
        )}
      </div>
    </div>
  );
}
