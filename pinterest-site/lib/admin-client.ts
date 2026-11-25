import { createClient } from "@/lib/supabase/server";

/**
 * The signed-in user's Supabase client, but only if they are an admin
 * (is_admin() in the database). RLS is the real guard; this gives a clear
 * "not allowed" before any write is attempted. Never uses the service role.
 */
export async function getAdminClient() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_admin");
  return !error && data === true ? supabase : null;
}
