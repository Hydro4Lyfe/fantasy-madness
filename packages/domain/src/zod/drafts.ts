import { z } from "zod";

export const JoinDraftInputSchema = z.object({
  draftId: z.string().uuid(),
  userId: z.string().uuid(),
  idempotencyKey: z.string().min(10).max(100).optional(),
});

export type JoinDraftInput = z.infer<typeof JoinDraftInputSchema>;
