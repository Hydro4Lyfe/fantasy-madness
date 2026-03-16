"use server";

import { DomainError } from "@fantasy-madness/domain";
import { z } from "zod";
import { submitFeedback } from "@/server/dal";
import { requireUserId } from "@/server/auth/guards";

const feedbackSchema = z.object({
  category: z.enum(["BUG", "FEATURE", "OTHER"]),
  title: z.string().trim().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  message: z.string().trim().min(10, "Please provide at least 10 characters").max(1000, "Message must be 1000 characters or less"),
});

export type FeedbackFormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitFeedbackAction(
  _prevState: FeedbackFormState,
  formData: FormData
): Promise<FeedbackFormState> {
  const userId = await requireUserId();

  const raw = {
    category: formData.get("category"),
    title: formData.get("title"),
    message: formData.get("message"),
  };

  const parsed = feedbackSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field) fieldErrors[String(field)] = issue.message;
    }
    return { success: false, error: "Please fix the errors below.", fieldErrors };
  }

  try {
    await submitFeedback({
      input: {
        userId,
        category: parsed.data.category,
        title: parsed.data.title,
        message: parsed.data.message,
      },
    });
    return { success: true };
  } catch (e: unknown) {
    if (e instanceof DomainError) {
      return { success: false, error: e.message };
    }
    return { success: false, error: "Something went wrong. Please try again later." };
  }
}
