"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";

/**
 * Round navy person icon for the public header.
 * Links to /admin/login, or to /admin when an admin is signed in.
 * Visitors without a session cost zero network calls (the session is read from the cookie).
 */
export function AdminLink({ className = "" }: { className?: string }) {
  const [href, setHref] = useState("/admin/login");

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        if (!data.session) return;
        const { data: isAdmin } = await supabase.rpc("is_admin");
        if (!cancelled && isAdmin === true) setHref("/admin");
      } catch {
        // Keep the login link if anything fails.
      }
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Link
      href={href}
      aria-label={href === "/admin" ? "Open admin" : "Admin sign in"}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-[#0F172A] text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] focus-visible:ring-offset-2 ${className}`}
    >
      <Icon name="person" className="text-[20px]" />
    </Link>
  );
}
