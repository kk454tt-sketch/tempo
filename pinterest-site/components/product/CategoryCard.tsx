import Image from 'next/image';
import Link from 'next/link';
import { pluralize } from '@/lib/plural';
import { buildProductsHref } from '@/lib/product-filters';
import type { CategorySummary } from '@/lib/products';

/** 3 columns desktop, 2 tablet, 1 mobile. */
export const CATEGORY_GRID_CLASS = 'grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8';

export const CATEGORY_CARD_HEIGHT_CLASS = 'min-h-[176px] md:min-h-[208px]';

/**
 * Category card: name, product count and a north_east arrow, linking to the
 * filtered product list. The newest product's image is used as a cover with a
 * soft overlay; without an image the card falls back to a neutral surface.
 */
export default function CategoryCard({
  category,
  priority = false,
}: {
  category: CategorySummary;
  priority?: boolean;
}) {
  const { name, slug, productCount, coverImageUrl } = category;
  const hasCover = Boolean(coverImageUrl);

  return (
    <Link
      href={buildProductsHref({ category: slug })}
      className={`group relative flex ${CATEGORY_CARD_HEIGHT_CLASS} flex-col justify-end overflow-hidden rounded-[16px] border border-[#E2E8F0] p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 md:p-6 ${
        hasCover ? 'bg-[#0F172A]' : 'bg-surface-container'
      }`}
    >
      {coverImageUrl && (
        <>
          {/* Decorative: the visible category name already describes the card. */}
          <Image
            src={coverImageUrl}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/75 via-[#0F172A]/30 to-[#0F172A]/5"
          />
        </>
      )}

      <span
        aria-hidden="true"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-sm"
      >
        <span className="material-symbols-outlined text-[20px] leading-none">north_east</span>
      </span>

      <div className="relative min-w-0">
        <h2 className={`truncate text-headline-sm ${hasCover ? 'text-white' : 'text-primary'}`}>{name}</h2>
        <p className={`mt-1 text-body-sm ${hasCover ? 'text-white/80' : 'text-on-surface-variant'}`}>
          {pluralize(productCount, 'product')}
        </p>
      </div>
    </Link>
  );
}
