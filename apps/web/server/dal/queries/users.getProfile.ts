import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";

export type UserProfileDTO = {
  id: string;
  email: string | null;
  name: string | null;
  username: string | null;
  image: string | null;
  usernameChangedAt: string | null;
  nextUsernameChangeAt: string | null;
};

const USERNAME_COOLDOWN_DAYS = 30;

export async function getUserProfile(args: {
  db?: DbClient;
  userId: string;
}): Promise<UserProfileDTO> {
  const db = (args.db ?? prisma) as any;

  const user = await db.user.findUnique({
    where: { id: args.userId },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      image: true,
      usernameChangedAt: true,
    },
  });

  if (!user) throw new DomainError("NOT_FOUND", "User not found");

  const nextUsernameChangeAt = user.usernameChangedAt
    ? new Date(
        user.usernameChangedAt.getTime() +
          USERNAME_COOLDOWN_DAYS * 24 * 60 * 60 * 1000
      ).toISOString()
    : null;

  return {
    id: user.id,
    email: user.email ?? null,
    name: user.name ?? null,
    username: user.username ?? null,
    image: user.image ?? null,
    usernameChangedAt: user.usernameChangedAt?.toISOString() ?? null,
    nextUsernameChangeAt,
  };
}
