import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/button-styles";
import { CountryChip } from "@/components/layout/CountryChip";
import { NavLinks } from "@/components/layout/NavLinks";

/**
 * Shared by all public pages. `backHref` shows the mobile back arrow and is
 * only passed on inner pages; the home page never passes it.
 */
export function Header({ backHref }: { backHref?: string }) {
  return (
    <header className="sticky top-0 z-40 bg-surface/80 pt-[env(safe-area-inset-top)] shadow-[0_1px_3px_rgba(15,23,42,0.05)] backdrop-blur-[12px]">
      <Container className="flex h-14 items-center justify-between lg:h-16">
        <div className="flex items-center gap-2 lg:gap-10">
          {backHref && (
            <Link
              href={backHref}
              aria-label="Go back"
              className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
            >
              <Icon name="arrow_back" />
            </Link>
          )}
          <Link
            href="/"
            className="rounded-[8px] text-headline-sm font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            AffHub
          </Link>
          <NavLinks />
        </div>
        <div className="flex items-center gap-3">
          <CountryChip />
          <Link href="/products" className={`${buttonClass("primary", "sm")} hidden lg:inline-flex`}>
            Browse
          </Link>
          <Link
            href="/admin/login"
            aria-label="Admin login"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Icon name="person" className="text-[22px]" />
          </Link>
        </div>
      </Container>
    </header>
  );
}
