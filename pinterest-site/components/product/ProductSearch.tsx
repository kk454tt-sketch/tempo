'use client';

import { useCallback, useEffect, useId, useRef, useState, useTransition, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { buildProductsHref } from '@/lib/product-filters';

const DEBOUNCE_MS = 300;

/**
 * Search bar (DESIGN.md): white, 16px radius, navy search icon, focus ring.
 * Typing updates ?q= in the URL after a 300ms pause; the server page then
 * re-queries. The selected category is kept and pagination is reset.
 */
export default function ProductSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputId = useId();
  const [isPending, startTransition] = useTransition();

  const urlQuery = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';

  const [value, setValue] = useState(urlQuery);
  // The last q value we know is (or is about to be) in the URL.
  const syncedQuery = useRef(urlQuery);

  // Follow external URL changes (e.g. the "Clear filters" button) without
  // fighting the visitor while they are typing.
  useEffect(() => {
    if (urlQuery !== syncedQuery.current) {
      syncedQuery.current = urlQuery;
      setValue(urlQuery);
    }
  }, [urlQuery]);

  const commit = useCallback(
    (next: string) => {
      if (next === syncedQuery.current) return;
      syncedQuery.current = next;
      startTransition(() => {
        router.replace(buildProductsHref({ q: next, category }), { scroll: false });
      });
    },
    [category, router],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => commit(value.trim()), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [value, commit]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    commit(value.trim());
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="relative" aria-busy={isPending}>
      <label htmlFor={inputId} className="sr-only">
        Search products
      </label>
      <span
        className="material-symbols-outlined pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-primary"
        aria-hidden="true"
      >
        search
      </span>
      <input
        id={inputId}
        name="q"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search products"
        autoComplete="off"
        enterKeyHint="search"
        maxLength={100}
        className="h-14 w-full rounded-[16px] border border-[#E2E8F0] bg-white pl-14 pr-12 text-body-md text-primary outline-none transition placeholder:text-on-surface-variant focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
      />
      {isPending && (
        <span
          className="material-symbols-outlined pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-on-surface-variant"
          aria-hidden="true"
        >
          progress_activity
        </span>
      )}
    </form>
  );
}
