import { createBrowserClient } from "@supabase/ssr";
import { requirePublicEnv } from "@/lib/env";

/** Supabase client for client components (anon key, RLS applies). */
export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = requirePublicEnv();
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
