import { describe, it, expect } from "vitest";
import {
  formatDateTime,
  formatTime,
  formatDateTimeInput,
  formatShortDate,
  formatMediumDate,
  formatLongDate,
} from "./date";

// ---------------------------------------------------------------------------
// formatDateTime — should include timezone abbreviation
// ---------------------------------------------------------------------------
describe("formatDateTime", () => {
  it("returns 'Not scheduled' for null/undefined", () => {
    expect(formatDateTime(null)).toBe("Not scheduled");
    expect(formatDateTime(undefined)).toBe("Not scheduled");
    expect(formatDateTime("")).toBe("Not scheduled");
  });

  it("formats a Date object with timezone abbreviation", () => {
    const d = new Date("2026-03-20T18:30:00Z");
    const result = formatDateTime(d, "UTC");
    // Node ICU may produce "UTC" or "GMT+0" depending on build
    expect(result).toMatch(/^Mar 20, 2026, 6:30 PM (UTC|GMT\+0)$/);
  });

  it("formats an ISO string with a specific timezone", () => {
    const result = formatDateTime("2026-03-20T18:30:00Z", "UTC");
    expect(result).toMatch(/^Mar 20, 2026, 6:30 PM (UTC|GMT\+0)$/);
  });

  it("converts to the requested timezone", () => {
    // 18:30 UTC = 14:30 US Eastern (EDT in March)
    const result = formatDateTime("2026-03-20T18:30:00Z", "America/New_York");
    expect(result).toMatch(/Mar 20, 2026, 2:30 PM/);
    // Timezone abbreviation varies: "EDT", "EST", or "GMT-4"
    expect(result).toMatch(/EDT|EST|GMT-4/);
  });

  it("includes timezone abbreviation when no tz is explicitly passed", () => {
    const result = formatDateTime("2026-03-20T18:30:00Z");
    // Should contain some timezone abbreviation (varies by env)
    expect(result).toMatch(/\d{1,2}:\d{2}\s[AP]M\s\S+/);
  });
});

// ---------------------------------------------------------------------------
// formatTime — should include timezone abbreviation
// ---------------------------------------------------------------------------
describe("formatTime", () => {
  it("returns 'TBD' for null/undefined", () => {
    expect(formatTime(null)).toBe("TBD");
    expect(formatTime(undefined)).toBe("TBD");
  });

  it("formats time with timezone when tz is passed", () => {
    const result = formatTime("2026-03-20T18:30:00Z", "UTC");
    expect(result).toMatch(/^6:30 PM (UTC|GMT\+0)$/);
  });

  it("formats time in another timezone", () => {
    const result = formatTime("2026-03-20T18:30:00Z", "America/New_York");
    expect(result).toMatch(/2:30 PM/);
    expect(result).toMatch(/EDT|EST|GMT-4/);
  });
});

// ---------------------------------------------------------------------------
// formatDateTimeInput — for datetime-local <input> values
// ---------------------------------------------------------------------------
describe("formatDateTimeInput", () => {
  it("returns empty string for null/undefined", () => {
    expect(formatDateTimeInput(null)).toBe("");
    expect(formatDateTimeInput(undefined)).toBe("");
  });

  it("produces yyyy-MM-ddTHH:mm format", () => {
    // Use a date that we can predict in local time
    const d = new Date(2026, 2, 20, 14, 30); // March 20, 2:30 PM local
    const result = formatDateTimeInput(d);
    expect(result).toBe("2026-03-20T14:30");
  });
});

// ---------------------------------------------------------------------------
// Date-only formatters
// ---------------------------------------------------------------------------
describe("formatShortDate", () => {
  it("returns 'TBD' for null", () => {
    expect(formatShortDate(null)).toBe("TBD");
  });

  it("formats as 'MMM d'", () => {
    const d = new Date(2026, 2, 15); // March 15
    expect(formatShortDate(d)).toBe("Mar 15");
  });
});

describe("formatMediumDate", () => {
  it("returns 'TBD' for null", () => {
    expect(formatMediumDate(null)).toBe("TBD");
  });

  it("formats as 'MMM d, yyyy'", () => {
    const d = new Date(2026, 2, 15);
    expect(formatMediumDate(d)).toBe("Mar 15, 2026");
  });
});

describe("formatLongDate", () => {
  it("returns 'TBD' for null", () => {
    expect(formatLongDate(null)).toBe("TBD");
  });

  it("formats as 'MMMM d, yyyy'", () => {
    const d = new Date(2026, 2, 15);
    expect(formatLongDate(d)).toBe("March 15, 2026");
  });
});
