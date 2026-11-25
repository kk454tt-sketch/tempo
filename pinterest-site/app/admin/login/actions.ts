"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/admin/paths";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export type LoginState = { error: string | null; email: string };

export async function signInAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""));

  const rl = await checkRateLimit(RATE_LIMITS.adminLogin, await headers());
  if (!rl.success) {
    return {
      email,
      error: `Too many failed attempts. Try again in ${rl.retryAfterSeconds} seconds.`,
    };
  }

  if (!email || !password) {
    return { email, error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.status === 400 || error.status === 401) {
      return { email, error: "Incorrect email or password." };
    }
    return { email, error: "Could not sign in right now. Please try again." };
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return { email, error: "This account does not have admin access." };
  }

  redirect(next);
}
