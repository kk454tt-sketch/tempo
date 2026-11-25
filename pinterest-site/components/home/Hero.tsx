import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ScrollLink } from "@/components/ui/ScrollLink";
import { buttonClass } from "@/components/ui/button-styles";
import { ProductImage } from "@/components/product/ProductImage";
import { StockPill } from "@/components/product/StockPill";
import type { ProductSummary } from "@/lib/products";
import { resolveOffer } from "@/lib/storefront";

/**
 * Mobile: text + one full-width button.
 * Desktop (1024px+): two buttons, and a featured-product card on the right
 * when a featured product exists. No featured product means text only.
 */
export function Hero({
  featured,
  country,
}: {
  featured: ProductSummary | null;
  country: string;
}) {
  const offer = featured ? resolveOffer(featured.product_links, country) : null;

  return (
    <section aria-labelledby="hero-title">
      <Container className={featured ? "grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12" : ""}>
        <div className="flex flex-col items-start">
          <h1
            id="hero-title"
            className="text-headline-xl-mobile font-extrabold text-primary lg:text-headline-xl"
          >
            AffHub ×{" "}
            <br className="hidden lg:block" />
            Amazon
          </h1>
          <p className="mt-3 text-body-lg text-on-surface-variant lg:mt-4">
            Curated finds for your country.
          </p>
          <div className="mt-6 flex w-full flex-col gap-3 lg:mt-8 lg:w-auto lg:flex-row lg:gap-4">
            <ScrollLink targetId="curated-grid" className={buttonClass("primary", "md", "w-full lg:w-auto")}>
              Browse products
            </ScrollLink>
            <div className="hidden lg:block">
              <ScrollLink targetId="how-it-works" className={buttonClass("ghost")}>
                How it works
              </ScrollLink>
            </div>
          </div>
        </div>

        {featured && (
          <Link
            href={`/products/${featured.slug}`}
            className="group relative hidden aspect-[4/3] overflow-hidden rounded-[16px] bg-surface-container shadow-[0_4px_16px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:block"
          >
            <ProductImage src={featured.image_url} alt={featured.name} sizes="50vw" />
            <div className="absolute right-4 top-4">
              <StockPill inStock={offer?.inStock ?? true} showInStock />
            </div>
            {offer?.priceLabel && (
              <div className="absolute bottom-4 left-4 flex items-baseline gap-2 rounded-full bg-white px-4 py-2 shadow-[0_2px_8px_rgba(15,23,42,0.12)]">
                <span className="text-label-sm text-on-surface-variant">Price</span>
                <span className="text-body-md font-bold text-on-surface">{offer.priceLabel}</span>
              </div>
            )}
          </Link>
        )}
      </Container>
    </section>
  );
}
