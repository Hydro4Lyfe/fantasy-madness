import { z } from "zod";

export const USERNAME_REGEX = /^[A-Za-z0-9][A-Za-z0-9_]{4,19}$/;

export const UsernameSchema = z
  .string()
  .trim()
  .min(5, "Username must be at least 5 characters")
  .max(20, "Username must be 20 characters or less")
  .regex(
    USERNAME_REGEX,
    "Username must start with a letter or number and use only letters, numbers, and underscores"
  );

export const UpdateUserProfileInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .optional(),
  username: UsernameSchema.optional(),
});

export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileInputSchema>;
