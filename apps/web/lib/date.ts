import { format, parseISO, startOfDay } from "date-fns";
import { TZDate } from "@date-fns/tz";

type DateInput = Date | string | null | undefined;

/** Get the user's IANA timezone (e.g. "America/Chicago"). Falls back to UTC. */
function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

/** Coerce any input to a Date, or return null. */
function toDate(value: DateInput): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  return parseISO(value);
}

/** "Mar 15" — month + day, no year. Local timezone. */
export function formatShortDate(value: DateInput): string {
  const d = toDate(value);
  if (!d) return "TBD";
  return format(d, "MMM d");
}

/** "Mar 15, 2026" — short month, day, year. Local timezone. */
export function formatMediumDate(value: DateInput): string {
  const d = toDate(value);
  if (!d) return "TBD";
  return format(d, "MMM d, yyyy");
}

/** "March 15, 2026" — full month name. Local timezone. */
export function formatLongDate(value: DateInput): string {
  const d = toDate(value);
  if (!d) return "TBD";
  return format(d, "MMMM d, yyyy");
}

/**
 * "Mar 15, 2026, 2:30 PM CST" — date + time with timezone abbreviation.
 * Auto-detects the user's timezone, or pass `tz` to pin to a specific one.
 */
export function formatDateTime(value: DateInput, tz?: string): string {
  const d = toDate(value);
  if (!d) return "Not scheduled";
  const timezone = tz ?? getUserTimezone();
  return format(new TZDate(d, timezone), "MMM d, yyyy, h:mm a zzz");
}

/**
 * "2:30 PM CST" in the user's local timezone.
 * Pass `tz` (e.g. "America/New_York") to pin to a specific timezone.
 */
export function formatTime(value: DateInput, tz?: string): string {
  const d = toDate(value);
  if (!d) return "TBD";
  const timezone = tz ?? getUserTimezone();
  return format(new TZDate(d, timezone), "h:mm a zzz");
}

/** "2026-03-15T14:30" — value string for datetime-local inputs. Local timezone. */
export function formatDateTimeInput(value: DateInput): string {
  const d = toDate(value);
  if (!d) return "";
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

/** Parse an ISO string to a millisecond timestamp. Safe alternative to `new Date(str).getTime()`. */
export function parseDeadlineMs(isoString: string): number {
  return parseISO(isoString).getTime();
}

/** Start of today in the local timezone — use for "disable past dates" checks in date pickers. */
export function todayStart(): Date {
  return startOfDay(new Date());
}
