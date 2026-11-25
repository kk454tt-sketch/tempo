import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/** Returns the signed-in admin's Supabase client, or null. Every action and page calls this itself. */
export async function getAdminContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: isAdmin } = await supabase.rpc('is_admin');
  return isAdmin === true ? { supabase, user } : null;
}

export async function requireAdminPage() {
  const ctx = await getAdminContext();
  if (!ctx) redirect('/admin/login');
  return ctx;
}
