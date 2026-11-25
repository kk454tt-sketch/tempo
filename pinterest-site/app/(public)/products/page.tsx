import type { Metadata } from 'next';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import CategoryChips from '@/components/product/CategoryChips';
import ProductGrid from '@/components/product/ProductGrid';
import ProductSearch from '@/components/product/ProductSearch';
import EmptyState from '@/components/ui/EmptyState';
import { ghostButtonClass } from '@/components/ui/ghost-button';
import { getVisitorCountry } from '@/lib/country';
import { pluralize } from '@/lib/plural';
import {
  buildProductsHref,
  hasActiveFilters,
  parseProductFilters,
  type SearchParamsInput,
} from '@/lib/product-filters';
import { getCategorySummaries, getProducts } from '@/lib/products';

type PageProps = {
  searchParams: Promise<SearchParamsInput>;
};

const TITLE = 'Products | AffHub';
const DESCRIPTION = "Browse curated Amazon finds, linked to your country's store.";

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = parseProductFilters(await searchParams);

  return {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    // Search result pages are not worth indexing.
    robots: q ? { index: false, follow: true } : undefined,
    openGraph: { title: TITLE, description: DESCRIPTION, type: 'website' },
    twitter: { card: 'summary', title: TITLE, description: DESCRIPTION },
  };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const filters = parseProductFilters(await searchParams);
  const country = await getVisitorCountry();

  const [{ products, total, hasMore }, categories] = await Promise.all([
    getProducts(filters),
    getCategorySummaries(),
  ]);

  const filtersActive = hasActiveFilters(filters);

  // No filters and no products means the catalog itself is empty.
  if (products.length === 0 && !filtersActive) {
    return (
      <PageContainer>
        <h1 className="text-headline-lg text-primary">Products</h1>
        <EmptyState icon="inventory_2" title="No products yet" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-headline-lg text-primary">Products</h1>
        {filtersActive && (
          <p className="text-body-sm text-on-surface-variant" aria-live="polite">
            {pluralize(total, 'result')}
          </p>
        )}
      </div>

      <div className="mt-6 space-y-4 md:mt-8">
        <ProductSearch />
        {categories.length > 0 && (
          <CategoryChips categories={categories} activeSlug={filters.category} q={filters.q} />
        )}
      </div>

      <div className="mt-6 md:mt-8">
        {products.length === 0 ? (
          <EmptyState
            icon="search_off"
            title="No products found"
            action={
              <Link href={buildProductsHref()} className={ghostButtonClass}>
                Clear filters
              </Link>
            }
          />
        ) : (
          <>
            <ProductGrid products={products} country={country} />
            {hasMore && (
              <div className="mt-10 flex justify-center md:mt-14">
                <Link
                  href={buildProductsHref({ ...filters, page: filters.page + 1 })}
                  scroll={false}
                  className={ghostButtonClass}
                >
                  Load more
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}
