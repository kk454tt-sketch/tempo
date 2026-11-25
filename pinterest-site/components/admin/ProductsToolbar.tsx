'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { buildProductsHref, type ProductFilters } from '@/lib/admin/filters';
import { ALL_CODES, STORES, isCountryCode } from '@/lib/admin/stores';
import { Icon } from './Icon';
import { ui } from './styles';

/** Search (debounced 300ms), country dropdown and "Add product". All state lives in the URL. */
export function ProductsToolbar({ filters }: { filters: ProductFilters }) {
  const router = useRouter();
  const [q, setQ] = useState(filters.q);
  const lastPushed = useRef(filters.q);

  // URL changed from outside (e.g. "Clear filters"): follow it, but never overwrite what is being typed.
  useEffect(() => {
    if (filters.q !== lastPushed.current) {
      lastPushed.current = filters.q;
      setQ(filters.q);
    }
  }, [filters.q]);

  useEffect(() => {
    const next = q.trim();
    if (next === lastPushed.current) return;
    const timer = setTimeout(() => {
      lastPushed.current = next;
      router.replace(buildProductsHref({ ...filters, q: next, page: 1 }), { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [q, filters, router]);

  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative sm:w-64">
        <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-primary" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products"
          aria-label="Search products"
          autoComplete="off"
          className={`${ui.input} rounded-[16px] pl-10`}
        />
      </div>

      <div className="relative sm:w-48">
        <select
          value={filters.country ?? ''}
          onChange={(e) => {
            const value = e.target.value;
            router.replace(buildProductsHref({ ...filters, country: isCountryCode(value) ? value : null, page: 1 }), { scroll: false });
          }}
          aria-label="Country"
          className={`${ui.input} appearance-none rounded-[16px] pr-9`}
        >
          <option value="">All countries</option>
          {ALL_CODES.map((code) => (
            <option key={code} value={code}>
              {STORES[code].name}
            </option>
          ))}
        </select>
        <Icon name="expand_more" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
      </div>

      {filters.stock && (
        <button
          type="button"
          onClick={() => router.replace(buildProductsHref({ ...filters, stock: null, page: 1 }), { scroll: false })}
          className={`${ui.btn} ${ui.btnGhost} h-9 px-3 text-body-sm`}
        >
          {filters.stock === 'out' ? 'Out of stock' : 'In stock'}
          <Icon name="close" className="text-[16px]" />
          <span className="sr-only">Remove stock filter</span>
        </button>
      )}

      <Link href="/admin/products/new" className={`${ui.btn} ${ui.btnPrimary}`}>
        <Icon name="add" className="text-[20px]" />
        Add product
      </Link>
    </div>
  );
}
