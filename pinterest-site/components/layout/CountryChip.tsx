"use client";

import { useCountry } from "@/components/providers/CountryProvider";
import { Flag } from "@/components/ui/Flag";
import { getCountry } from "@/lib/storefront";

/** White pill with flag + code. Opens the country selector modal. */
export function CountryChip() {
  const { country, openCountryModal } = useCountry();
  const info = getCountry(country);
  return (
    <button
      type="button"
      data-country-chip
      onClick={openCountryModal}
      aria-haspopup="dialog"
      aria-label={`Country: ${info.name}. Change country`}
      className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-3 shadow-[0_2px_8px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_4px_12px_rgba(15,23,42,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Flag code={info.code} />
      <span className="text-label-md font-semibold text-on-surface">{info.code}</span>
    </button>
  );
}
