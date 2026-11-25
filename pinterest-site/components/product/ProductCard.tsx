import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductPrice } from "@/components/product/ProductPrice";
import { StockPill } from "@/components/product/StockPill";
import { PRODUCT_CARD_SIZES } from "@/components/product/product-grid";
import type { ProductSummary } from "@/lib/products";
import { resolveOffer } from "@/lib/storefront";

/**
 * Mobile: image, then name, then price (stacked).
 * Tablet and up: arrow button on the image, name and price on one row.
 * The whole card is the link; the arrow is decoration.
 */
export function ProductCard({
  product,
  country,
  priority = false,
}: {
  product: ProductSummary;
  country: string;
  priority?: boolean;
}) {
  const offer = resolveOffer(product.product_links, country);
  const outOfStock = offer ? !offer.inStock : false;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-[12px] transition-transform duration-300 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:hover:-translate-y-0.5"
    >
      <div className="relative aspect-square overflow-hidden rounded-[12px] bg-surface-container shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-shadow duration-300 motion-reduce:transition-none lg:group-hover:shadow-[0_12px_24px_-8px_rgba(15,23,42,0.18)]">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          sizes={PRODUCT_CARD_SIZES}
          priority={priority}
          dimmed={outOfStock}
        />
        {outOfStock && (
          <StockPill
            inStock={false}
            className="absolute left-2 top-2 md:left-3 md:top-3 md:uppercase md:tracking-wider"
          />
        )}
        <span
          aria-hidden="true"
          className="absolute bottom-3 right-3 hidden h-9 w-9 items-center justify-center rounded-full bg-white text-primary shadow-[0_2px_8px_rgba(15,23,42,0.15)] md:flex"
        >
          <Icon name="north_east" className="text-[18px]" />
        </span>
      </div>
      <div className="mt-2 flex flex-col gap-0.5 md:mt-3 md:flex-row md:items-baseline md:justify-between md:gap-3">
        <p className="min-w-0 truncate text-body-md font-medium text-on-surface">{product.name}</p>
        <ProductPrice
          label={offer?.priceLabel ?? null}
          outOfStock={outOfStock}
          className="shrink-0"
        />
      </div>
    </Link>
  );
}
