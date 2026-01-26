import { prisma } from "@fantasy-madness/db";
import type { User } from "@supabase/supabase-js";

/**
 * Ensures the Supabase auth user exists in our Prisma User table.
 * Creates the user if they don't exist, updates if they do.
 */
export async function syncUserToDatabase(authUser: User): Promise<void> {
  const existing = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true },
  });

  if (existing) {
    // Update user info if needed
    await prisma.user.update({
      where: { id: authUser.id },
      data: {
        email: authUser.email,
        name: authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? null,
        image: authUser.user_metadata?.avatar_url ?? authUser.user_metadata?.picture ?? null,
        emailVerified: authUser.email_confirmed_at ? new Date(authUser.email_confirmed_at) : null,
      },
    });
  } else {
    // Create new user
    await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? null,
        image: authUser.user_metadata?.avatar_url ?? authUser.user_metadata?.picture ?? null,
        emailVerified: authUser.email_confirmed_at ? new Date(authUser.email_confirmed_at) : null,
      },
    });
  }
}
