import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { EmptyState } from '@/components/admin/EmptyState';
import { Icon } from '@/components/admin/Icon';
import { Pagination } from '@/components/admin/Pagination';
import { ProductsTable } from '@/components/admin/ProductsTable';
import { ProductsToolbar } from '@/components/admin/ProductsToolbar';
import { ui } from '@/components/admin/styles';
import { buildProductsHref, parseFilters } from '@/lib/admin/filters';
import { requireAdminPage } from '@/lib/admin/guard';
import { getAdminProducts } from '@/lib/admin/products';

export const metadata: Metadata = { title: 'Products | AffHub Admin' };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireAdminPage(); // re-checked here, never only in middleware
  const filters = parseFilters(await searchParams);
  const { rows, total } = await getAdminProducts(supabase, filters);

  if (rows.length === 0 && filters.page > 1) redirect(buildProductsHref({ ...filters, page: 1 }));

  // the country dropdown only changes how stock is shown, so it does not count as a filter
  const filtersActive = filters.q !== '' || filters.stock !== null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-headline-md text-primary">Products</h1>
        <ProductsToolbar filters={filters} />
      </div>

      {rows.length > 0 ? (
        <div className={`${ui.card} overflow-hidden`}>
          <ProductsTable rows={rows} country={filters.country} />
          <Pagination filters={filters} total={total} />
        </div>
      ) : filtersActive ? (
        <EmptyState icon="search_off" title="No products match your filters">
          <Link href="/admin/products" className={`${ui.btn} ${ui.btnGhost}`}>
            Clear filters
          </Link>
        </EmptyState>
      ) : (
        <EmptyState icon="inventory_2" title="No products yet">
          <Link href="/admin/products/new" className={`${ui.btn} ${ui.btnPrimary}`}>
            <Icon name="add" className="text-[20px]" />
            Add product
          </Link>
        </EmptyState>
      )}
    </div>
  );
}
