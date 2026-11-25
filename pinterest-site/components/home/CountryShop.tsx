"use client";

import { useCountry } from "@/components/providers/CountryProvider";
import { Container } from "@/components/ui/Container";
import { scrollToId } from "@/lib/scroll";
import { listCountries } from "@/lib/storefront";

/** Five equal pills on tablet and up; a snap-scrolling rail on mobile. */
export function CountryShop() {
  const { country, setCountry } = useCountry();

  return (
    <section aria-labelledby="country-title">
      <Container>
        <h2 id="country-title" className="mb-6 text-headline-md font-bold text-primary">
          Shop by country
        </h2>
        <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          {listCountries().map((c) => {
            const current = c.code === country;
            return (
              <li key={c.code} className="shrink-0 snap-start md:shrink md:snap-align-none">
                <button
                  type="button"
                  aria-pressed={current}
                  onClick={() => {
                    setCountry(c.code);
                    scrollToId("curated-grid");
                  }}
                  className={`flex h-14 w-[168px] items-center justify-center gap-2 rounded-[16px] border bg-white px-4 text-body-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:w-full ${
                    current ? "border-primary" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="font-bold text-on-surface">{c.code}</span>
                  <span className="truncate text-on-surface-variant">{c.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
