import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { syncUserToDatabase } from "./syncUser";

/**
 * Requires an authenticated user. Returns the user ID.
 * Redirects to login if not authenticated.
 * Also syncs the user to the database if needed.
 */
export async function requireUserId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ensure user exists in our database
  await syncUserToDatabase(user);

  return user.id;
}

/**
 * Gets the current user if authenticated, otherwise returns null.
 */
export async function getOptionalUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await syncUserToDatabase(user);
  }

  return user;
}

/**
 * Requires admin access. Currently checks for a specific admin email list.
 * You can customize this based on your needs (user metadata, database role, etc.)
 */
export async function requireAdmin(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await syncUserToDatabase(user);

  // Check if user is admin - customize this logic as needed
  const adminEmails = process.env.ADMIN_EMAILS?.split(",") ?? [];
  const isAdmin = adminEmails.includes(user.email ?? "");

  if (!isAdmin) {
    redirect("/");
  }
}
