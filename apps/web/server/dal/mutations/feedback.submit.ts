import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";

export type SubmitFeedbackInput = {
  userId: string;
  category: "BUG" | "FEATURE" | "OTHER";
  title: string;
  message: string;
};

export async function submitFeedback(args: {
  db?: DbClient;
  input: SubmitFeedbackInput;
}): Promise<{ id: string }> {
  const db = (args.db ?? prisma) as any;
  const { userId, category, title, message } = args.input;

  // Check for existing submission in the last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const recentSubmission = await db.feedback.findFirst({
    where: {
      userId,
      createdAt: { gte: oneDayAgo },
    },
    select: { createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  if (recentSubmission) {
    const nextAllowed = new Date(
      recentSubmission.createdAt.getTime() + 24 * 60 * 60 * 1000
    );
    const hoursLeft = Math.ceil(
      (nextAllowed.getTime() - Date.now()) / (1000 * 60 * 60)
    );
    throw new DomainError(
      "RATE_LIMITED",
      `You can submit feedback again in ${hoursLeft} hour${hoursLeft === 1 ? "" : "s"}.`
    );
  }

  const feedback = await db.feedback.create({
    data: {
      userId,
      category,
      title: title.trim().slice(0, 100),
      message: message.trim().slice(0, 1000),
    },
    select: { id: true },
  });

  return { id: feedback.id };
}
