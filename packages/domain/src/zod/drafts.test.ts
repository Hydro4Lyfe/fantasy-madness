import { describe, it, expect } from "vitest";
import { CreateDraftInputSchema } from "./drafts";

describe("CreateDraftInputSchema", () => {
  const validBase = {
    name: "Test Draft",
    tournamentId: "abc-123",
    draftType: "SNAKE" as const,
    isPrivate: true,
  };

  it("accepts valid input without optional fields", () => {
    const result = CreateDraftInputSchema.safeParse(validBase);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Test Draft");
      expect(result.data.startAt).toBeUndefined();
      expect(result.data.pickTimerSec).toBeUndefined();
    }
  });

  // -------------------------------------------------------------------------
  // startAt parsing — this is the field most critical to the UTC bug fix
  // -------------------------------------------------------------------------
  describe("startAt date coercion", () => {
    it("accepts a full ISO string with timezone (Z)", () => {
      const result = CreateDraftInputSchema.safeParse({
        ...validBase,
        startAt: "2026-03-20T18:30:00.000Z",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.startAt).toBeInstanceOf(Date);
        expect(result.data.startAt!.toISOString()).toBe(
          "2026-03-20T18:30:00.000Z",
        );
      }
    });

    it("accepts an ISO string with offset", () => {
      const result = CreateDraftInputSchema.safeParse({
        ...validBase,
        startAt: "2026-03-20T18:30:00-06:00",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        // -06:00 means 18:30 CDT = 00:30 next day UTC
        expect(result.data.startAt!.toISOString()).toBe(
          "2026-03-21T00:30:00.000Z",
        );
      }
    });

    it("accepts a Date object directly", () => {
      const date = new Date("2026-03-20T18:30:00Z");
      const result = CreateDraftInputSchema.safeParse({
        ...validBase,
        startAt: date,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.startAt!.getTime()).toBe(date.getTime());
      }
    });

    it("accepts startAt as undefined (omitted)", () => {
      const result = CreateDraftInputSchema.safeParse(validBase);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.startAt).toBeUndefined();
      }
    });

    it("rejects invalid date strings", () => {
      const result = CreateDraftInputSchema.safeParse({
        ...validBase,
        startAt: "not-a-date",
      });
      expect(result.success).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // pickTimerSec validation
  // -------------------------------------------------------------------------
  describe("pickTimerSec", () => {
    it("coerces string to number", () => {
      const result = CreateDraftInputSchema.safeParse({
        ...validBase,
        pickTimerSec: "90",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.pickTimerSec).toBe(90);
      }
    });

    it("rejects values below 30", () => {
      const result = CreateDraftInputSchema.safeParse({
        ...validBase,
        pickTimerSec: 10,
      });
      expect(result.success).toBe(false);
    });

    it("rejects values above 300", () => {
      const result = CreateDraftInputSchema.safeParse({
        ...validBase,
        pickTimerSec: 500,
      });
      expect(result.success).toBe(false);
    });

    it("accepts boundary values (30 and 300)", () => {
      expect(
        CreateDraftInputSchema.safeParse({
          ...validBase,
          pickTimerSec: 30,
        }).success,
      ).toBe(true);

      expect(
        CreateDraftInputSchema.safeParse({
          ...validBase,
          pickTimerSec: 300,
        }).success,
      ).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // name validation
  // -------------------------------------------------------------------------
  describe("name", () => {
    it("rejects empty name", () => {
      const result = CreateDraftInputSchema.safeParse({
        ...validBase,
        name: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects name over 100 characters", () => {
      const result = CreateDraftInputSchema.safeParse({
        ...validBase,
        name: "a".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("accepts name at 100 characters", () => {
      const result = CreateDraftInputSchema.safeParse({
        ...validBase,
        name: "a".repeat(100),
      });
      expect(result.success).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // draftType defaults
  // -------------------------------------------------------------------------
  describe("draftType", () => {
    it("defaults to SNAKE when omitted", () => {
      const { draftType, ...withoutType } = validBase;
      const result = CreateDraftInputSchema.safeParse(withoutType);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.draftType).toBe("SNAKE");
      }
    });

    it("rejects invalid draft types", () => {
      const result = CreateDraftInputSchema.safeParse({
        ...validBase,
        draftType: "RANDOM",
      });
      expect(result.success).toBe(false);
    });
  });
});
