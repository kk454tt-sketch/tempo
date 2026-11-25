"use client";

import { usePathname } from "next/navigation";
import { useCountry } from "@/components/providers/CountryProvider";
import { Icon } from "@/components/ui/Icon";
import { countryNotice } from "@/lib/storefront";

/**
 * Slim notice above the header. Visible only when the country was auto-detected,
 * the visitor has not picked one, and has not dismissed it (all decided by the
 * provider). Never shown in /admin.
 */
export function CountryBanner() {
  const { country, bannerVisible, openCountryModal, dismissBanner } = useCountry();
  const pathname = usePathname() ?? "";
  if (!bannerVisible || pathname.startsWith("/admin")) return null;

  return (
    <div role="region" aria-label="Country notice" className="relative bg-[rgba(245,158,11,0.10)]">
      <div className="mx-auto flex min-h-10 max-w-[1360px] items-center justify-center px-12 py-1.5 text-center">
        <p className="text-body-sm text-primary">
          {countryNotice(country)}{" "}
          <button
            type="button"
            onClick={openCountryModal}
            className="rounded-[4px] font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Change country
          </button>
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          dismissBanner();
          // The focused button is about to disappear: hand focus to the header chip.
          requestAnimationFrame(() => document.querySelector<HTMLElement>("[data-country-chip]")?.focus());
        }}
        aria-label="Dismiss country notice"
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-primary transition-colors hover:bg-[rgba(245,158,11,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Icon name="close" className="text-[18px]" />
      </button>
    </div>
  );
}
