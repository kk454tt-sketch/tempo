import { HomeStack } from "@/components/home/HomeStack";
import { PublicShell } from "@/components/layout/PublicShell";
import { CountryProvider } from "@/components/providers/CountryProvider";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { PRODUCT_GRID_CLASS } from "@/components/product/product-grid";
import { Container } from "@/components/ui/Container";

const PULSE = "animate-pulse rounded-[12px] bg-surface-container motion-reduce:animate-none";

export default function Loading() {
  return (
    <CountryProvider initialCountry="US" initialDetected={null} initialChosen={true} initialBannerDismissed={true}>
      <PublicShell>
        <HomeStack>
          <Container aria-busy="true">
            <span className="sr-only" role="status">
              Loading
            </span>
            <div aria-hidden="true" className="flex flex-col items-start gap-4">
              <div className={`h-9 w-56 lg:h-[104px] lg:w-80 ${PULSE}`} />
              <div className={`h-5 w-64 ${PULSE}`} />
              <div className={`mt-2 h-12 w-full lg:w-44 ${PULSE}`} />
            </div>
          </Container>
          <Container>
            <ul className={PRODUCT_GRID_CLASS} aria-hidden="true">
              {Array.from({ length: 8 }, (_, i) => (
                <li key={i}>
                  <ProductCardSkeleton />
                </li>
              ))}
            </ul>
          </Container>
        </HomeStack>
      </PublicShell>
    </CountryProvider>
  );
}
