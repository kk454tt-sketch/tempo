'use client';

import { Flag } from '@/components/ui/Flag';
import type { LinkValue } from '@/lib/admin/product-schema';
import { STORES, type StoreCode } from '@/lib/admin/stores';
import { InputGroup } from './InputGroup';
import { Switch } from './Switch';
import { ui } from './styles';

interface LinkRowProps {
  code: StoreCode;
  value: LinkValue;
  urlError?: string;
  priceError?: string;
  onChange: (patch: Partial<LinkValue>) => void;
}

/** One Amazon store: link, price (with currency symbol) and an In stock switch. */
export function LinkRow({ code, value, urlError, priceError, onChange }: LinkRowProps) {
  const store = STORES[code];
  const empty = value.url.trim() === '';

  return (
    <div className="rounded-[12px] border border-[#E2E8F0] p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Flag code={code} />
          <span className="text-body-sm font-semibold text-primary">{code}</span>
          <span className={ui.muted}>{store.name}</span>
        </div>
        <label className="flex items-center gap-2 text-body-sm text-on-surface">
          <Switch checked={value.inStock} disabled={empty} onChange={(inStock) => onChange({ inStock })} />
          In stock
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_128px]">
        <div>
          <input
            id={`link-${code}`}
            type="url"
            inputMode="url"
            value={value.url}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder={store.placeholder}
            aria-label={`${store.name} Amazon link`}
            aria-invalid={!!urlError || undefined}
            aria-describedby={urlError ? `link-${code}-error` : undefined}
            autoComplete="off"
            className={ui.input}
          />
          {urlError && (
            <p id={`link-${code}-error`} role="alert" className={`mt-1.5 ${ui.error}`}>
              {urlError}
            </p>
          )}
        </div>
        <div>
          <InputGroup prefix={store.symbol} invalid={!!priceError}>
            <input
              id={`price-${code}`}
              inputMode="decimal"
              value={value.price}
              onChange={(e) => onChange({ price: e.target.value })}
              placeholder="0.00"
              aria-label={`${store.name} price in ${store.currency}`}
              aria-invalid={!!priceError || undefined}
              aria-describedby={priceError ? `price-${code}-error` : undefined}
              autoComplete="off"
              className={ui.inputInner}
            />
          </InputGroup>
          {priceError && (
            <p id={`price-${code}-error`} role="alert" className={`mt-1.5 ${ui.error}`}>
              {priceError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
