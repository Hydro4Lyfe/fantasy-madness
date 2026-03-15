"use server";

import { createClient } from "@/lib/supabase/server";
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
  username: string
) {
  const supabase = await createClient();
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

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

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        full_name: name,
        username: sanitizedUsername,
      },
      emailRedirectTo: `${baseUrl}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Check your email to confirm your account!" };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
