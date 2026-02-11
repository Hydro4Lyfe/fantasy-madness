"use server";

import { revalidatePath } from "next/cache";
import { DomainError } from "@fantasy-madness/domain";
import { z } from "zod";

import { updateUserProfile } from "@/server/dal";
import { requireUserId } from "@/server/auth/guards";

const updateUserProfileInputSchema = z.object({
  name: z.preprocess(
    value => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(100, "Name must be 100 characters or less")
      .optional()
  ),
  username: z.preprocess(
    value => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z
      .string()
      .trim()
      .min(5, "Username must be at least 5 characters")
      .max(20, "Username must be 20 characters or less")
      .regex(
        /^[A-Za-z0-9][A-Za-z0-9_]{4,19}$/,
        "Username must start with a letter or number and use only letters, numbers, and underscores"
      )
      .optional()
  ),
  image: z.preprocess(
    value => (typeof value === "string" ? value.trim() : value),
    z.union([z.string().url("Image must be a valid URL"), z.literal("")]).optional()
  ),
});

export type UpdateProfileFormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  profile?: {
    name: string | null;
    username: string | null;
    image: string | null;
    nextUsernameChangeAt: string | null;
  };
};

export async function updateProfileAction(
  _prevState: UpdateProfileFormState,
  formData: FormData
): Promise<UpdateProfileFormState> {
  const userId = await requireUserId();

  const rawData = {
    name: formData.get("name"),
    username: formData.get("username"),
    image: formData.get("image"),
  };

  const parsed = updateUserProfileInputSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field) fieldErrors[String(field)] = issue.message;
    }
    return { success: false, error: "Validation failed", fieldErrors };
  }

  try {
    const profile = await updateUserProfile({
      input: {
        userId,
        name: parsed.data.name,
        username: parsed.data.username,
        image:
          parsed.data.image === ""
            ? null
            : parsed.data.image,
      },
    });

    revalidatePath("/settings");

    return {
      success: true,
      profile: {
        name: profile.name,
        username: profile.username,
        image: profile.image,
        nextUsernameChangeAt: profile.nextUsernameChangeAt,
      },
    };
  } catch (e: unknown) {
    if (e instanceof DomainError) {
      if (e.code === "CONFLICT") {
        return {
          success: false,
          error: e.message,
          fieldErrors: { username: e.message },
        };
      }

      if (e.code === "INVALID_STATE") {
        return {
          success: false,
          error: e.message,
          fieldErrors: { username: e.message },
        };
      }

      return { success: false, error: e.message };
    }

    return { success: false, error: "Failed to update profile" };
  }
}
