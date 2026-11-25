import Link from 'next/link';
import { PAGE_SIZE, buildProductsHref, type ProductFilters } from '@/lib/admin/filters';
import { ui } from './styles';

export function Pagination({ filters, total }: { filters: ProductFilters; total: number }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = total === 0 ? 0 : (filters.page - 1) * PAGE_SIZE + 1;
  const end = Math.min(filters.page * PAGE_SIZE, total);
  const button = `${ui.btn} ${ui.btnGhost} h-9 px-4`;

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] px-4 py-3 sm:px-6">
      <p className={ui.muted}>
        Showing {start.toLocaleString('en-US')}–{end.toLocaleString('en-US')} of {total.toLocaleString('en-US')}
      </p>
      <div className="flex gap-2">
        {filters.page > 1 ? (
          <Link href={buildProductsHref({ ...filters, page: filters.page - 1 })} className={button}>
            Previous
          </Link>
        ) : (
          <span aria-disabled="true" className={`${button} cursor-not-allowed opacity-50`}>
            Previous
          </span>
        )}
        {filters.page < pages ? (
          <Link href={buildProductsHref({ ...filters, page: filters.page + 1 })} className={button}>
            Next
          </Link>
        ) : (
          <span aria-disabled="true" className={`${button} cursor-not-allowed opacity-50`}>
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
