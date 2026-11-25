import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCard } from "@/components/product/ProductCard";
import { PRODUCT_GRID_CLASS } from "@/components/product/product-grid";
import type { ProductSummary } from "@/lib/products";

/**
 * #curated-grid always exists so "Browse products" has a target; with no
 * products the header is hidden and only the empty state shows.
 */
export function ProductGrid({
  products,
  country,
}: {
  products: ProductSummary[];
  country: string;
}) {
  return (
    <section id="curated-grid" aria-label="Trending products" className="scroll-mt-20">
      <Container>
        {products.length === 0 ? (
          <EmptyState icon="inventory_2" title="No products yet" />
        ) : (
          <>
            <div className="mb-6 flex items-baseline justify-between gap-4">
              <h2 className="text-headline-md font-bold text-primary">Trending</h2>
              <Link
                href="/products"
                className="rounded-[8px] text-label-md font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                View all
              </Link>
            </div>
            <ul className={PRODUCT_GRID_CLASS}>
              {products.map((product, index) => (
                <li key={product.id}>
                  <ProductCard product={product} country={country} priority={index < 4} />
                </li>
              ))}
            </ul>
          </>
        )}
      </Container>
    </section>
  );
}
