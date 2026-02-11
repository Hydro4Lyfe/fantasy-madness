import { z } from "zod";

export const DraftTypeSchema = z.enum(["SNAKE", "LINEAR", "AUCTION"]);
export type DraftType = z.infer<typeof DraftTypeSchema>;

export const CreateDraftInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  tournamentId: z.string().min(1, "Tournament is required"),
  draftType: DraftTypeSchema.default("SNAKE"),
  isPrivate: z.boolean().default(true),
  pickTimerSec: z.coerce.number().int().min(30).max(300).optional(),
  startAt: z.coerce.date().optional(),
});

export type CreateDraftInput = z.infer<typeof CreateDraftInputSchema>;
export type CreateDraftFormInput = z.input<typeof CreateDraftInputSchema>;

export const JoinDraftInputSchema = z.object({
  draftId: z.string().uuid(),
  userId: z.string().uuid(),
  idempotencyKey: z.string().min(10).max(100).optional(),
});

export type JoinDraftInput = z.infer<typeof JoinDraftInputSchema>;
