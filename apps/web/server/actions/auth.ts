"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { prisma } from "@fantasy-madness/db";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signInWithGoogle(redirectTo?: string) {
  const supabase = await createClient();
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${baseUrl}/auth/callback?next=${redirectTo ?? "/"}`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signInWithEmailPassword(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signUpWithEmailPassword(
  email: string,
  password: string,
  name: string,
  username: string,
  redirectTo?: string
) {
  const sanitizedUsername = username.trim();
  const usernameValid = /^[A-Za-z0-9][A-Za-z0-9_]{4,19}$/.test(sanitizedUsername);

  if (!usernameValid) {
    return {
      error:
        "Username must be 5-20 chars, start with a letter or number, and use only letters, numbers, and underscores",
    };
  }

  const existingUsername = await (prisma as any).user.findFirst({
    where: { username: sanitizedUsername },
    select: { id: true },
  });

  if (existingUsername) {
    return { error: "Username is already taken" };
  }

  // Use admin API to create the user as pre-confirmed (no confirmation email).
  // This lets the user sign in immediately; email verification can happen later.
  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      full_name: name,
      username: sanitizedUsername,
    },
  });

  if (createError) {
    // Supabase returns "A user with this email address has already been registered"
    if (createError.message?.toLowerCase().includes("already been registered")) {
      return { error: "An account with this email already exists. Try signing in instead." };
    }
    return { error: createError.message };
  }

  // Immediately sign the user in so they get a session cookie
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { error: signInError.message };
  }

  // Sync the new user to our database
  if (created.user) {
    const { syncUserToDatabase } = await import("@/server/auth/syncUser");
    await syncUserToDatabase(created.user);
  }

  return { success: true, autoConfirmed: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
