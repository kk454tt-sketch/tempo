"use client";

import { useCountry } from "@/components/providers/CountryProvider";
import { buttonClass } from "@/components/ui/button-styles";
import { storeHomeUrl } from "@/lib/storefront";

/** Fixed bottom bar, below 1024px only. Opens the visitor's Amazon store home. */
export function MobileShopBar() {
  const { country } = useCountry();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-surface/80 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-[12px] lg:hidden">
      <a
        href={storeHomeUrl(country)}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={buttonClass("primary", "md", "w-full")}
      >
        Shop on Amazon
      </a>
    </div>
  );
}
