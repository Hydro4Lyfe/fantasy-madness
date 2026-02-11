import { z } from "zod";

export const CreateLeagueInputSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  tournamentId: z.string().min(1, "Tournament is required"),
  isPrivate: z.boolean().default(true),
  maxParticipants: z.coerce
    .number()
    .int()
    .min(2, "Must have at least 2 participants")
    .optional(),
});

export type CreateLeagueInput = z.infer<typeof CreateLeagueInputSchema>;
export type CreateLeagueFormInput = z.input<typeof CreateLeagueInputSchema>;

export const UpdateLeagueInputSchema = z.object({
  leagueId: z.string().uuid(),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .optional(),
  isPrivate: z.boolean().optional(),
  maxParticipants: z.coerce
    .number()
    .int()
    .min(2, "Must have at least 2 participants")
    .nullish(),
});

export type UpdateLeagueInput = z.infer<typeof UpdateLeagueInputSchema>;

export const SaveLeaguePicksInputSchema = z.object({
  leagueId: z.string().uuid(),
  slotIds: z
    .array(z.string().uuid())
    .length(8, "Must select exactly 8 bracket slots"),
});

export type SaveLeaguePicksInput = z.infer<typeof SaveLeaguePicksInputSchema>;

export const JoinLeagueInputSchema = z.object({
  leagueId: z.string().uuid(),
});

export type JoinLeagueInput = z.infer<typeof JoinLeagueInputSchema>;

export const JoinLeagueByInviteInputSchema = z.object({
  inviteCode: z.string().min(1, "Invite code is required"),
});

export type JoinLeagueByInviteInput = z.infer<
  typeof JoinLeagueByInviteInputSchema
>;

export const LeagueParticipantActionInputSchema = z.object({
  leagueId: z.string().uuid(),
  userId: z.string().min(1),
  reason: z.string().max(500).optional(),
});

export type LeagueParticipantActionInput = z.infer<
  typeof LeagueParticipantActionInputSchema
>;
