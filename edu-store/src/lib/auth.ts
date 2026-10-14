import "server-only";
import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/env";

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

export async function getAdminUser() {
  const user = await getCurrentUser();
  return user && isAdminEmail(user.email) ? user : null;
}
