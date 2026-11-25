import type { ReactNode } from "react";
import { CountryBanner } from "@/components/layout/CountryBanner";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileShopBar } from "@/components/layout/MobileShopBar";

/**
 * Country banner + header + main + footer (+ mobile Amazon bar) for every public page.
 * page.tsx, loading.tsx and error.tsx all render inside it, so the chrome
 * never disappears while loading or after an error.
 */
export function PublicShell({
  children,
  backHref,
  showShopBar = true,
}: {
  children: ReactNode;
  backHref?: string;
  showShopBar?: boolean;
}) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-[12px] focus:bg-white focus:px-4 focus:py-2 focus:text-primary focus:shadow-lg"
      >
        Skip to content
      </a>
      <CountryBanner />
      <Header backHref={backHref} />
      <main id="main">{children}</main>
      <Footer />
      {showShopBar && (
        <>
          {/* Keeps the footer clear of the fixed bar. */}
          <div aria-hidden="true" className="h-[calc(5.5rem+env(safe-area-inset-bottom))] lg:hidden" />
          <MobileShopBar />
        </>
      )}
    </>
  );
}
