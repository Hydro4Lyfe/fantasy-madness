/** Parse "HH:mm" (24h) → { hour12, minute, period } */
export function parse24h(time24: string): {
  hour12: number;
  minute: number;
  period: "AM" | "PM";
} {
  const [h, m] = time24.split(":").map(Number);
  const minute = m ?? 0;
  if (h === 0) return { hour12: 12, minute, period: "AM" };
  if (h === 12) return { hour12: 12, minute, period: "PM" };
  if (h > 12) return { hour12: h - 12, minute, period: "PM" };
  return { hour12: h, minute, period: "AM" };
}

/** Convert { hour12, minute, period } → "HH:mm" (24h) */
export function to24h(
  hour12: number,
  minute: number,
  period: "AM" | "PM",
): string {
  let h = hour12;
  if (period === "AM" && h === 12) h = 0;
  else if (period === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * Build a UTC ISO string from a local date + "HH:mm" time string.
 * This is what the create-draft form uses to submit startAt.
 */
export function buildLocalISOString(
  date: Date,
  time24: string,
): string {
  const [hours, minutes] = time24.split(":").map(Number);
  const dt = new Date(date);
  dt.setHours(hours, minutes, 0, 0);
  return dt.toISOString();
}
