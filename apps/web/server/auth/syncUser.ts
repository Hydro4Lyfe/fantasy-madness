import { prisma } from "@fantasy-madness/db";
import type { User } from "@supabase/supabase-js";

const USERNAME_REGEX = /^[A-Za-z0-9][A-Za-z0-9_]{4,19}$/;

function parseMetadataUsername(authUser: User): {
  username: string;
} | null {
  const raw = authUser.user_metadata?.username;
  if (typeof raw !== "string") return null;

  const username = raw.trim();
  if (!USERNAME_REGEX.test(username)) return null;

  return { username };
}

/**
 * Ensures the Supabase auth user exists in our Prisma User table.
 * Creates the user if they don't exist, updates if they do.
 */
export async function syncUserToDatabase(authUser: User): Promise<void> {
  const existing = await (prisma as any).user.findUnique({
    where: { id: authUser.id },
    select: { id: true, name: true, username: true, image: true },
  });

  const metadataName =
    authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? null;
  const metadataUsername = parseMetadataUsername(authUser);

  if (existing) {
    const updateData: any = {
      email: authUser.email,
      emailVerified: authUser.email_confirmed_at
        ? new Date(authUser.email_confirmed_at)
        : null,
    };

    if (!existing.name && metadataName) {
      updateData.name = metadataName;
    }

    if (!existing.username && metadataUsername) {
      updateData.username = metadataUsername.username;
    }

    if (!existing.image) {
      updateData.image =
        authUser.user_metadata?.avatar_url ?? authUser.user_metadata?.picture ?? null;
    }

    await (prisma as any).user.update({
      where: { id: authUser.id },
      data: updateData,
    });
  } else {
    await (prisma as any).user.create({
      data: {
        id: authUser.id,
        email: authUser.email,
        name: metadataName,
        username: metadataUsername?.username ?? null,
        usernameChangedAt: metadataUsername ? new Date() : null,
        image: authUser.user_metadata?.avatar_url ?? authUser.user_metadata?.picture ?? null,
        emailVerified: authUser.email_confirmed_at ? new Date(authUser.email_confirmed_at) : null,
      },
    });
  }
}
