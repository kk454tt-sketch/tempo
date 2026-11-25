import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminSession } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: { default: "Admin | AffHub", template: "%s | AffHub Admin" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * The shell only renders for a verified admin. Signed-out visitors (the login
 * page) get the bare children. Every admin page and server action still calls
 * requireAdmin() itself, so nothing depends on this layout alone.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();
  if (!session) return <div className="font-sans">{children}</div>;
  return <AdminShell email={session.email}>{children}</AdminShell>;
}
