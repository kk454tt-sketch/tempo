import "server-only";
import { createClient } from "@supabase/supabase-js";
import { requirePublicEnv, requireServiceRoleKey } from "@/lib/env";

/**
 * Service-role client. Bypasses RLS: use only on the server, for event inserts and
 * the affiliate-tag lookup. Never import this from a client component.
 */
export function createAdminClient() {
  const { supabaseUrl } = requirePublicEnv();
  return createClient(supabaseUrl, requireServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
