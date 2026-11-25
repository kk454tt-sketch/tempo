import type { ComponentProps } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductWithLinks } from "@/lib/products";

/** Same columns as the home page: 2 (mobile, 8px gap), 3 (tablet), 4 (desktop, 32px gap). */
export const PRODUCT_GRID_CLASS =
  "grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8";

type ProductCardProps = ComponentProps<typeof ProductCard>;

/**
 * Used by TrendingRow below the fold on product detail pages.
 */
export default function TrendingGrid({
  products,
  country,
  priority = true,
}: {
  products: ProductWithLinks[];
  country: ProductCardProps["country"];
  priority?: boolean;
}) {
  return (
    <ul className={PRODUCT_GRID_CLASS}>
      {products.map((product, index) => (
        <li key={product.id} className="min-w-0">
          <ProductCard product={product} country={country} priority={priority && index < 4} />
        </li>
      ))}
    </ul>
  );
}
