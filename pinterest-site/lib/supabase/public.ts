import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-free anon client for public data (sitemap). Sees exactly what any
 * visitor sees: RLS only exposes published products.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.");
  return createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
}
