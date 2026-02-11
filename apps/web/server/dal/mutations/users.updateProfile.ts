import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";
import { Prisma } from "@prisma/client";

const USERNAME_COOLDOWN_DAYS = 30;
const USERNAME_COOLDOWN_MS = USERNAME_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

export type UpdateUserProfileInput = {
  userId: string;
  name?: string;
  username?: string;
  image?: string | null;
};

export type UpdateUserProfileResult = {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  usernameChangedAt: string | null;
  nextUsernameChangeAt: string | null;
};

export async function updateUserProfile(args: {
  db?: DbClient;
  input: UpdateUserProfileInput;
}): Promise<UpdateUserProfileResult> {
  const db = (args.db ?? prisma) as any;
  const { userId, name, username, image } = args.input;

  const current = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      usernameChangedAt: true,
    },
  });

  if (!current) throw new DomainError("NOT_FOUND", "User not found");

  const now = new Date();
  const updateData: any = {};

  if (name !== undefined) {
    updateData.name = name.trim();
  }

  if (image !== undefined) {
    updateData.image = image;
  }

  if (username !== undefined) {
    const nextUsername = username.trim();
    const usernameChanged = current.username !== nextUsername;

    if (usernameChanged) {
      const hasPreviousUsername = Boolean(current.username);
      const cooldownActive =
        hasPreviousUsername &&
        current.usernameChangedAt &&
        now.getTime() - current.usernameChangedAt.getTime() < USERNAME_COOLDOWN_MS;

      if (cooldownActive) {
        const nextAllowedDate = new Date(
          current.usernameChangedAt.getTime() + USERNAME_COOLDOWN_MS
        );
        throw new DomainError(
          "INVALID_STATE",
          `You can change your username again on ${nextAllowedDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}`
        );
      }

      updateData.username = nextUsername;
      updateData.usernameChangedAt = now;
    }
  }

  if (Object.keys(updateData).length === 0) {
    const nextUsernameChangeAt = current.usernameChangedAt
      ? new Date(current.usernameChangedAt.getTime() + USERNAME_COOLDOWN_MS)
      : null;

    return {
      id: current.id,
      name: current.name ?? null,
      username: current.username ?? null,
      image: current.image ?? null,
      usernameChangedAt: current.usernameChangedAt?.toISOString() ?? null,
      nextUsernameChangeAt: nextUsernameChangeAt?.toISOString() ?? null,
    };
  }

  try {
    const updated = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        usernameChangedAt: true,
      },
    });

    const nextUsernameChangeAt = updated.usernameChangedAt
      ? new Date(updated.usernameChangedAt.getTime() + USERNAME_COOLDOWN_MS)
      : null;

    return {
      id: updated.id,
      name: updated.name ?? null,
      username: updated.username ?? null,
      image: updated.image ?? null,
      usernameChangedAt: updated.usernameChangedAt?.toISOString() ?? null,
      nextUsernameChangeAt: nextUsernameChangeAt?.toISOString() ?? null,
    };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new DomainError("CONFLICT", "This username is already taken");
    }
    throw e;
  }
}
