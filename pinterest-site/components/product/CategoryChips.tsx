import Chip from '@/components/ui/Chip';
import { buildProductsHref } from '@/lib/product-filters';

type ChipCategory = { slug: string; name: string };

/**
 * "All" plus one chip per category, in sort_order. Selecting a chip keeps the
 * current search text and resets pagination. Scrolls horizontally on mobile.
 */
export default function CategoryChips({
  categories,
  activeSlug,
  q,
}: {
  categories: ChipCategory[];
  activeSlug: string;
  q: string;
}) {
  return (
    <nav aria-label="Filter by category">
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
        <li className="shrink-0">
          <Chip href={buildProductsHref({ q })} selected={activeSlug === ''}>
            All
          </Chip>
        </li>
        {categories.map((category) => (
          <li key={category.slug} className="shrink-0">
            <Chip
              href={buildProductsHref({ q, category: category.slug })}
              selected={activeSlug === category.slug}
            >
              {category.name}
            </Chip>
          </li>
        ))}
      </ul>
    </nav>
  );
}
