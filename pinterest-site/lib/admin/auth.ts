import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_LOGIN } from "./paths";

/**
 * Returns the signed-in admin (verified with Supabase Auth + is_admin()) or null.
 * Cached per request, so the layout and the page can both call it cheaply.
 */
export const getAdminSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) return null;

  return { supabase, user, email: user.email ?? "" };
});

/**
 * Call at the top of EVERY admin server component and server action.
 * Never rely on middleware alone.
 */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect(ADMIN_LOGIN);
  return session;
}
