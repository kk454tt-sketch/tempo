'use client';

import { useRef, useState } from 'react';
import { Flag } from '@/components/ui/Flag';
import { STORE_CODES, STORES, formatPrice, type StoreCode, type StoreView } from '@/lib/stores';

type Props = {
  productId: string;
  name: string;
  description: string | null;
  categoryName: string | null;
  /** One entry per selectable store; null when the product has no link for it. */
  views: Record<StoreCode, StoreView | null>;
  /** The store chosen on the server for this request. */
  initialView: StoreView | null;
  /** Pinterest Save URL when the product has a main image; null otherwise. */
  pinterestSaveUrl?: string | null;
};

function PinSaveButton({ href, className = '' }: { href: string; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Save to Pinterest"
      className={`inline-flex h-12 items-center justify-center gap-1.5 rounded-[16px] border border-[#E2E8F0] bg-white px-4 text-body-sm font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4 shrink-0 fill-current text-[#E60023]"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.18-5.01 1.18-5.01s-.3-.6-.3-1.49c0-1.4.81-2.44 1.82-2.44.86 0 1.27.64 1.27 1.41 0 .86-.55 2.15-.83 3.34-.24 1 .5 1.81 1.48 1.81 1.78 0 3.14-1.88 3.14-4.58 0-2.4-1.72-4.07-4.18-4.07-2.85 0-4.52 2.14-4.52 4.34 0 .86.33 1.78.74 2.28.08.1.09.19.07.29-.08.31-.24 1-.28 1.14-.04.18-.15.22-.34.13-1.26-.59-2.05-2.43-2.05-3.91 0-3.18 2.31-6.11 6.67-6.11 3.5 0 6.22 2.49 6.22 5.83 0 3.48-2.19 6.28-5.23 6.28-1.02 0-1.98-.53-2.31-1.16l-.63 2.4c-.23.88-.84 1.98-1.25 2.65.94.29 1.94.45 2.98.45 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
      </svg>
      <span>Save</span>
    </a>
  );
}

const BUTTON_BASE =
  'flex h-14 w-full items-center justify-center gap-2 rounded-[16px] text-body-md font-bold';

/** The amber "Buy on Amazon" button (or the gray "Unavailable" one) with its captions. */
function BuyBlock({ productId, view }: { productId: string; view: StoreView | null }) {
  if (!view || !view.inStock) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        className={`${BUTTON_BASE} cursor-not-allowed bg-surface-container text-on-surface-variant`}
      >
        Unavailable
      </button>
    );
  }

  const store = STORES[view.storeCode];
  const href = `/go/${productId}${view.goStore ? `?store=${view.goStore}` : ''}`;

  return (
    <div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`${BUTTON_BASE} bg-[#F59E0B] text-primary transition-shadow hover:shadow-[0_8px_24px_rgba(245,158,11,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
      >
        Buy on Amazon {store.amazonName}
        <span className="material-symbols-outlined text-[20px] leading-none" aria-hidden="true">
          open_in_new
        </span>
      </a>
      <p className="mt-2 text-center text-label-sm text-on-surface-variant">Opens Amazon {store.amazonName}</p>
      {view.affiliate && (
        <p className="mt-1 text-center text-label-sm text-on-surface-variant">
          We may earn from qualifying purchases.
        </p>
      )}
    </div>
  );
}

/**
 * Right-hand column of the product page. Switching the store chip only changes
 * this component's state and the ?store= query (history.replaceState): no
 * cookie, no server render, no full reload, and so no extra product_view event.
 */
export default function ProductInfo({
  productId,
  name,
  description,
  categoryName,
  views,
  initialView,
  pinterestSaveUrl = null,
}: Props) {
  const [view, setView] = useState<StoreView | null>(initialView);
  const [highlighted, setHighlighted] = useState<StoreCode | null>(null);
  const chipRefs = useRef<Partial<Record<StoreCode, HTMLButtonElement | null>>>({});

  const activeCode = view?.storeCode ?? null;
  const store = activeCode ? STORES[activeCode] : null;
  const outOfStock = view !== null && !view.inStock;
  const firstInStock = STORE_CODES.find((code) => views[code]?.inStock) ?? null;
  const priceText = view && view.price !== null ? formatPrice(view.price, view.currency) : null;

  function selectStore(code: StoreCode) {
    const next = views[code];
    if (!next || code === activeCode) return;

    setView(next);
    setHighlighted(null);

    try {
      const url = new URL(window.location.href);
      url.searchParams.set('store', code);
      window.history.replaceState(null, '', url);
    } catch {
      // The URL is only a convenience; the selection already worked.
    }
  }

  function tryAnotherCountry() {
    if (!firstInStock) return;
    setHighlighted(firstInStock);
    chipRefs.current[firstInStock]?.focus();
  }

  return (
    <div className="flex flex-col">
      {categoryName && (
        <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">{categoryName}</p>
      )}

      {outOfStock && store && (
        <span className="mt-3 inline-flex w-fit items-center rounded-full bg-surface-container px-3 py-1 text-label-sm font-semibold text-on-surface-variant">
          Out of stock in {store.inLabel}
        </span>
      )}

      <h1 className="mt-2 text-headline-lg text-primary">{name}</h1>

      {priceText && (
        <p
          className={`mt-3 text-headline-md font-bold ${
            outOfStock ? 'text-on-surface-variant line-through' : 'text-primary'
          }`}
        >
          {priceText}
        </p>
      )}

      {description && (
        <p className="mt-4 whitespace-pre-line text-body-lg text-on-surface-variant">{description}</p>
      )}

      <div className="mt-6 md:mt-8 md:flex md:items-center md:gap-3">
        <div role="group" aria-label="Choose a store" className="grid flex-1 grid-cols-4 gap-2 md:gap-3">
          {STORE_CODES.map((code) => {
            const chipView = views[code];
            const available = chipView !== null;
            const isActive = activeCode === code;

            return (
              <button
                key={code}
                type="button"
                ref={(element) => {
                  chipRefs.current[code] = element;
                }}
                aria-pressed={isActive}
                aria-disabled={!available}
                title={available ? undefined : 'Not available'}
                onClick={() => selectStore(code)}
                onBlur={() => setHighlighted((current) => (current === code ? null : current))}
                className={`flex h-12 items-center justify-center gap-1.5 rounded-[16px] border px-2 text-body-sm font-semibold text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:gap-2 md:px-3 ${
                  isActive ? 'border-[#F59E0B] bg-[#F59E0B]/10' : 'border-[#E2E8F0] bg-white hover:border-primary/40'
                } ${available ? '' : 'cursor-not-allowed opacity-50 hover:border-[#E2E8F0]'} ${
                  highlighted === code ? 'ring-2 ring-[#F59E0B]/40' : ''
                }`}
              >
                <Flag code={code} />
                <span>{code}</span>
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 rounded-full ${chipView?.inStock ? 'bg-[#22C55E]' : 'bg-[#94A3B8]'}`}
                />
                <span className="sr-only">
                  {!available ? ', not available' : chipView.inStock ? ', in stock' : ', out of stock'}
                </span>
              </button>
            );
          })}
        </div>
        {pinterestSaveUrl && <PinSaveButton href={pinterestSaveUrl} className="hidden shrink-0 md:inline-flex" />}
      </div>

      {/* Desktop: inline buy button. */}
      <div className="mt-6 hidden md:mt-8 md:block">
        <BuyBlock productId={productId} view={view} />
      </div>

      {outOfStock && firstInStock && (
        <button
          type="button"
          onClick={tryAnotherCountry}
          className="mt-4 w-fit text-body-sm font-semibold text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
        >
          Try another country
        </button>
      )}

      {pinterestSaveUrl && (
        <div className="mt-4 md:hidden">
          <PinSaveButton href={pinterestSaveUrl} className="w-full" />
        </div>
      )}

      {/* Mobile: sticky bottom bar with the same button and captions. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E2E8F0] bg-surface/80 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-[12px] md:hidden">
        <BuyBlock productId={productId} view={view} />
      </div>
      {/* Keeps the end of the page (footer included) clear of the sticky bar on mobile. */}
      <style>{`@media (max-width: 767px) { body { padding-bottom: calc(8rem + env(safe-area-inset-bottom)); } }`}</style>
    </div>
  );
}
