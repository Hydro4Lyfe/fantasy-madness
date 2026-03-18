"use client";

import * as React from "react";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { parse24h, to24h } from "@/lib/time-utils";

// ---------------------------------------------------------------------------
// Timezone helpers
// ---------------------------------------------------------------------------

function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

function getTimezoneAbbr(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZoneName: "short",
      timeZone: tz,
    }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value ?? tz;
  } catch {
    return tz;
  }
}

function getTimezoneLabel(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZoneName: "long",
      timeZone: tz,
    }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value ?? tz;
  } catch {
    return tz;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface TimePickerProps {
  /** Current value in "HH:mm" 24h format */
  value: string;
  /** Called with new "HH:mm" 24h string */
  onChange: (value: string) => void;
  /** Show timezone badge (default true) */
  showTimezone?: boolean;
  className?: string;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

export function TimePicker({
  value,
  onChange,
  showTimezone = true,
  className,
}: TimePickerProps) {
  const { hour12, minute, period } = parse24h(value);

  // Snap minute to nearest 5
  const snappedMinute = Math.round(minute / 5) * 5 === 60 ? 55 : Math.round(minute / 5) * 5;

  const tz = React.useMemo(() => getUserTimezone(), []);
  const tzAbbr = React.useMemo(() => getTimezoneAbbr(tz), [tz]);
  const tzLabel = React.useMemo(() => getTimezoneLabel(tz), [tz]);

  const handleHourChange = (h: string) => {
    onChange(to24h(Number(h), snappedMinute, period));
  };

  const handleMinuteChange = (m: string) => {
    onChange(to24h(hour12, Number(m), period));
  };

  const handlePeriodChange = (p: string) => {
    onChange(to24h(hour12, snappedMinute, p as "AM" | "PM"));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1.5">
        {/* Hour */}
        <Select value={String(hour12)} onValueChange={handleHourChange}>
          <SelectTrigger
            className={cn(
              "w-[4.5rem] h-10",
              "bg-input border-border text-foreground",
              "focus-visible:border-primary focus-visible:ring-primary/20",
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HOURS.map((h) => (
              <SelectItem key={h} value={String(h)}>
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-lg font-semibold text-muted-foreground select-none">:</span>

        {/* Minute */}
        <Select value={String(snappedMinute)} onValueChange={handleMinuteChange}>
          <SelectTrigger
            className={cn(
              "w-[4.5rem] h-10",
              "bg-input border-border text-foreground",
              "focus-visible:border-primary focus-visible:ring-primary/20",
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MINUTES.map((m) => (
              <SelectItem key={m} value={String(m)}>
                {String(m).padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* AM/PM */}
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger
            className={cn(
              "w-[4.5rem] h-10",
              "bg-input border-border text-foreground",
              "focus-visible:border-primary focus-visible:ring-primary/20",
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timezone badge */}
      {showTimezone && (
        <div className="flex items-center gap-1.5" title={tzLabel}>
          <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground">
            {tzAbbr} — {tzLabel}
          </span>
        </div>
      )}
    </div>
  );
}
