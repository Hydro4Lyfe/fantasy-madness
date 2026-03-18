import { describe, it, expect } from "vitest";
import { parse24h, to24h, buildLocalISOString } from "./time-utils";

// ---------------------------------------------------------------------------
// parse24h — convert "HH:mm" (24h) → 12h components
// ---------------------------------------------------------------------------
describe("parse24h", () => {
  it("parses midnight (00:00) as 12:00 AM", () => {
    expect(parse24h("00:00")).toEqual({ hour12: 12, minute: 0, period: "AM" });
  });

  it("parses 00:30 as 12:30 AM", () => {
    expect(parse24h("00:30")).toEqual({ hour12: 12, minute: 30, period: "AM" });
  });

  it("parses morning hours (1-11) as AM", () => {
    expect(parse24h("01:00")).toEqual({ hour12: 1, minute: 0, period: "AM" });
    expect(parse24h("09:15")).toEqual({ hour12: 9, minute: 15, period: "AM" });
    expect(parse24h("11:59")).toEqual({ hour12: 11, minute: 59, period: "AM" });
  });

  it("parses noon (12:00) as 12:00 PM", () => {
    expect(parse24h("12:00")).toEqual({ hour12: 12, minute: 0, period: "PM" });
  });

  it("parses 12:30 as 12:30 PM", () => {
    expect(parse24h("12:30")).toEqual({ hour12: 12, minute: 30, period: "PM" });
  });

  it("parses afternoon hours (13-23) as PM", () => {
    expect(parse24h("13:00")).toEqual({ hour12: 1, minute: 0, period: "PM" });
    expect(parse24h("18:30")).toEqual({ hour12: 6, minute: 30, period: "PM" });
    expect(parse24h("23:45")).toEqual({ hour12: 11, minute: 45, period: "PM" });
  });

  it("defaults minute to 0 when missing", () => {
    expect(parse24h("14")).toEqual({ hour12: 2, minute: 0, period: "PM" });
  });
});

// ---------------------------------------------------------------------------
// to24h — convert 12h components → "HH:mm" (24h)
// ---------------------------------------------------------------------------
describe("to24h", () => {
  it("converts 12:00 AM → 00:00 (midnight)", () => {
    expect(to24h(12, 0, "AM")).toBe("00:00");
  });

  it("converts 12:30 AM → 00:30", () => {
    expect(to24h(12, 30, "AM")).toBe("00:30");
  });

  it("converts AM hours (1-11) directly", () => {
    expect(to24h(1, 0, "AM")).toBe("01:00");
    expect(to24h(9, 15, "AM")).toBe("09:15");
    expect(to24h(11, 59, "AM")).toBe("11:59");
  });

  it("converts 12:00 PM → 12:00 (noon)", () => {
    expect(to24h(12, 0, "PM")).toBe("12:00");
  });

  it("converts PM hours (1-11) by adding 12", () => {
    expect(to24h(1, 0, "PM")).toBe("13:00");
    expect(to24h(6, 30, "PM")).toBe("18:30");
    expect(to24h(11, 45, "PM")).toBe("23:45");
  });

  it("zero-pads single-digit minutes", () => {
    expect(to24h(3, 5, "PM")).toBe("15:05");
    expect(to24h(8, 0, "AM")).toBe("08:00");
  });
});

// ---------------------------------------------------------------------------
// Roundtrip: parse24h ↔ to24h
// ---------------------------------------------------------------------------
describe("parse24h ↔ to24h roundtrip", () => {
  const cases = [
    "00:00", "00:30", "01:00", "06:30", "11:59",
    "12:00", "12:30", "13:00", "18:30", "23:45",
  ];

  it.each(cases)("roundtrips %s", (time24) => {
    const { hour12, minute, period } = parse24h(time24);
    expect(to24h(hour12, minute, period)).toBe(time24);
  });
});

// ---------------------------------------------------------------------------
// buildLocalISOString — combines date + time into UTC ISO string
// ---------------------------------------------------------------------------
describe("buildLocalISOString", () => {
  it("produces a valid ISO string", () => {
    const date = new Date(2026, 2, 20); // March 20, 2026
    const result = buildLocalISOString(date, "18:30");
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
  });

  it("sets the correct local hours and minutes", () => {
    const date = new Date(2026, 2, 20); // March 20, 2026
    const result = buildLocalISOString(date, "18:30");
    // Parse back to verify the local time matches
    const parsed = new Date(result);
    expect(parsed.getHours()).toBe(18);
    expect(parsed.getMinutes()).toBe(30);
    expect(parsed.getSeconds()).toBe(0);
    expect(parsed.getMilliseconds()).toBe(0);
  });

  it("handles midnight correctly", () => {
    const date = new Date(2026, 2, 20);
    const result = buildLocalISOString(date, "00:00");
    const parsed = new Date(result);
    expect(parsed.getHours()).toBe(0);
    expect(parsed.getMinutes()).toBe(0);
  });

  it("does not mutate the input date", () => {
    const date = new Date(2026, 2, 20, 10, 0, 0);
    const originalTime = date.getTime();
    buildLocalISOString(date, "18:30");
    expect(date.getTime()).toBe(originalTime);
  });

  it("preserves the correct date even for late-night times", () => {
    const date = new Date(2026, 2, 20);
    const result = buildLocalISOString(date, "23:59");
    const parsed = new Date(result);
    expect(parsed.getDate()).toBe(20);
    expect(parsed.getHours()).toBe(23);
    expect(parsed.getMinutes()).toBe(59);
  });
});
