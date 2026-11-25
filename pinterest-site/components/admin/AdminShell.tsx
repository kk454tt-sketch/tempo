"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { signOutAction } from "@/app/admin/actions";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { ToastProvider } from "@/components/ui/Toast";
import { ui } from "@/components/ui/classes";
import { ADMIN_NAV, isNavActive } from "./nav";

function SignOutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex h-9 items-center gap-2 rounded-lg px-2 text-body-sm font-semibold text-[#0F172A] transition hover:bg-[#F1F5F9] disabled:opacity-60 ${ui.focusRing}`}
    >
      {pending ? <Spinner className="h-[18px] w-[18px]" /> : <Icon name="logout" className="text-[18px]" />}
      Sign out
    </button>
  );
}

type SidebarContentProps = {
  email: string;
  onNavigate?: () => void;
  /** Renders a close button (drawer only). */
  onClose?: () => void;
};

function SidebarContent({ email, onNavigate, onClose }: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between px-6">
        <Link
          href="/admin"
          onClick={onNavigate}
          className={`rounded-lg text-headline-sm font-bold text-[#0F172A] ${ui.focusRing}`}
        >
          AffHub
        </Link>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className={`-mr-2 flex h-10 w-10 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#F1F5F9] ${ui.focusRing}`}
          >
            <Icon name="close" />
          </button>
        ) : null}
      </div>

      <nav aria-label="Admin" className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {ADMIN_NAV.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex h-11 items-center gap-3 rounded-xl px-3 text-body-sm font-semibold transition ${ui.focusRing} ${
                active
                  ? "bg-[rgba(245,158,11,0.10)] text-[#B45309]"
                  : "text-[#475569] hover:bg-[#F1F5F9]"
              }`}
            >
              <Icon name={item.icon} filled={active} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-3 border-t border-[#E2E8F0] p-4">
        <p className="truncate text-body-sm text-[#64748B]" title={email}>
          {email}
        </p>
        <div className="flex items-center justify-between gap-2">
          <form action={signOutAction}>
            <SignOutButton />
          </form>
          <Link
            href="/"
            target="_blank"
            rel="noopener"
            className={`inline-flex h-9 items-center gap-1 rounded-lg px-2 text-body-sm text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#0F172A] ${ui.focusRing}`}
          >
            View site
            <Icon name="open_in_new" className="text-[16px]" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // If the window grows to desktop width while the drawer is open, close it.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (query.matches) setDrawerOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <ToastProvider>
      <div className="min-h-screen font-sans">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-[#E2E8F0] bg-white lg:block">
          <SidebarContent email={email} />
        </aside>

        {/* Mobile and tablet top bar */}
        <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white pt-[env(safe-area-inset-top)] lg:hidden">
          <div className="flex h-14 items-center gap-3 px-4">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
              className={`-ml-2 flex h-10 w-10 items-center justify-center rounded-lg text-[#0F172A] transition hover:bg-[#F1F5F9] ${ui.focusRing}`}
            >
              <Icon name="menu" />
            </button>
            <Link
              href="/admin"
              className={`rounded-lg text-headline-sm font-bold text-[#0F172A] ${ui.focusRing}`}
            >
              AffHub
            </Link>
          </div>
        </header>

        {/* Drawer (native dialog: focus trap, Escape, focus return) */}
        <Dialog
          open={drawerOpen}
          onClose={closeDrawer}
          labelledBy="admin-drawer-title"
          className="m-0 h-full max-h-none w-72 max-w-[85vw] border-r border-[#E2E8F0] bg-white p-0 shadow-[0_24px_48px_-12px_rgba(15,23,42,0.25)] lg:hidden"
        >
          <h2 id="admin-drawer-title" className="sr-only">
            Navigation
          </h2>
          <SidebarContent email={email} onNavigate={closeDrawer} onClose={closeDrawer} />
        </Dialog>

        <main className="lg:pl-60">
          <div className="mx-auto w-full max-w-[1200px] p-4 sm:p-8">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
