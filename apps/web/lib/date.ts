import { format, parseISO, startOfDay } from "date-fns";
import { TZDate } from "@date-fns/tz";

type DateInput = Date | string | null | undefined;

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
 * "Mar 15, 2026, 2:30 PM" — date + time in local timezone.
 * Pass `tz` (e.g. "America/New_York") to pin to a specific timezone.
 */
export function formatDateTime(value: DateInput, tz?: string): string {
  const d = toDate(value);
  if (!d) return "Not scheduled";
  if (tz) return format(new TZDate(d, tz), "MMM d, yyyy, h:mm a zzz");
  return format(d, "MMM d, yyyy, h:mm a");
}

/**
 * "2:30 PM" in local timezone.
 * Pass `tz` (e.g. "America/New_York") for a specific timezone — shows abbreviation.
 */
export function formatTime(value: DateInput, tz?: string): string {
  const d = toDate(value);
  if (!d) return "TBD";
  if (tz) return format(new TZDate(d, tz), "h:mm a zzz");
  return format(d, "h:mm a");
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
