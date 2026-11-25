import type { ComponentProps } from "react";
import Link from "next/link";
import TrendingGrid from "@/components/product/TrendingGrid";
import type { ProductWithLinks } from "@/lib/products";

/**
 * "Trending" row of related products with a "View all" link. Renders nothing
 * when there are no products.
 *
 * The section reuses id="curated-grid" so the home page's "Shop by country"
 * pills, which scroll to that id, land here on the product page too.
 */
export default function TrendingRow({
  products,
  country,
}: {
  products: ProductWithLinks[];
  country: ComponentProps<typeof TrendingGrid>["country"];
}) {
  if (products.length === 0) return null;

  return (
    <section id="curated-grid" aria-labelledby="trending-heading">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 id="trending-heading" className="text-headline-md text-primary">
          Trending
        </h2>
        <Link
          href="/products"
          className="text-body-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
        >
          View all
        </Link>
      </div>
      <TrendingGrid products={products} country={country} priority={false} />
    </section>
  );
}
