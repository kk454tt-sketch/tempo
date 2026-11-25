'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type MouseEvent } from 'react';
import { toggleStockAction } from '@/app/admin/products/actions';
import type { ProductRowView } from '@/lib/admin/filters';
import { STORES, type CountryCode } from '@/lib/admin/stores';
import { useNotify } from './adapters';
import { Icon } from './Icon';
import { SafeImage } from './SafeImage';
import { StockBadge, summarizeStock } from './StockBadge';
import { Switch } from './Switch';
import { ui } from './styles';

const stop = (e: MouseEvent) => e.stopPropagation();
const editHref = (row: ProductRowView) => `/admin/products/${row.id}`;
const omit = (map: Record<string, boolean>, key: string) => Object.fromEntries(Object.entries(map).filter(([k]) => k !== key));

export function ProductsTable({ rows, country }: { rows: ProductRowView[]; country: CountryCode | null }) {
  const router = useRouter();
  const notify = useNotify();
  // optimistic values, dropped as soon as fresh rows arrive from the server
  const [seenRows, setSeenRows] = useState(rows);
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  if (rows !== seenRows) {
    setSeenRows(rows);
    setPending({});
  }

  async function toggle(row: ProductRowView, next: boolean) {
    if (!country) return;
    const key = `${row.id}:${country}`;
    setPending((p) => ({ ...p, [key]: next }));
    setBusy((b) => ({ ...b, [key]: true }));
    try {
      const result = await toggleStockAction(row.id, country, next);
      if (!result.ok) throw new Error(result.message);
      notify.success(`${row.name} is now ${next ? 'in stock' : 'out of stock'} in ${STORES[country].name}.`);
    } catch (error) {
      setPending((p) => omit(p, key)); // roll back
      notify.error(error instanceof Error ? error.message : 'Could not update stock. Try again.');
    } finally {
      setBusy((b) => omit(b, key));
    }
  }

  function stock(row: ProductRowView) {
    if (!country) return <StockBadge summary={summarizeStock(row.inCountries.length, row.outCountries.length)} />;
    const hasLink = row.inCountries.includes(country) || row.outCountries.includes(country);
    if (!hasLink) return <span className={ui.muted}>No link</span>;
    const key = `${row.id}:${country}`;
    const checked = pending[key] ?? row.inCountries.includes(country);
    return (
      <span className="inline-flex items-center gap-3" onClick={stop}>
        <Switch
          checked={checked}
          disabled={busy[key]}
          onChange={(next) => void toggle(row, next)}
          label={`${row.name}: in stock in ${STORES[country].name}`}
        />
        <span className="text-body-sm text-on-surface">{checked ? 'In stock' : 'Out of stock'}</span>
      </span>
    );
  }

  const nameCell = (row: ProductRowView) => (
    <div className="flex min-w-0 items-center gap-2">
      <Link href={editHref(row)} onClick={stop} className={`truncate text-body-md font-semibold text-primary hover:underline ${ui.focusRing} rounded`}>
        {row.name}
      </Link>
      {row.isFeatured && (
        <span className="inline-flex shrink-0" title="Featured on home">
          <Icon name="star" filled className="text-[18px] text-[#F59E0B]" />
          <span className="sr-only">Featured</span>
        </span>
      )}
      {!row.isPublished && (
        <span className="shrink-0 rounded-full bg-[#F1F5F9] px-2 py-0.5 text-label-sm text-on-surface-variant">Draft</span>
      )}
    </div>
  );

  const editButton = (row: ProductRowView) => (
    <Link href={editHref(row)} onClick={stop} aria-label={`Edit ${row.name}`} className={ui.iconButton}>
      <Icon name="edit" className="text-[20px]" />
    </Link>
  );

  return (
    <>
      {/* 768px and up: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#E2E8F0] text-label-sm uppercase text-on-surface-variant">
              <th scope="col" className="px-6 py-3 font-semibold">Product</th>
              <th scope="col" className="px-6 py-3 font-semibold">Stock</th>
              <th scope="col" className="px-6 py-3 font-semibold">Clicks</th>
              <th scope="col" className="px-6 py-3 font-semibold">Updated</th>
              <th scope="col" className="px-6 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => router.push(editHref(row))}
                className="h-[72px] cursor-pointer border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC]"
              >
                <td className="max-w-[320px] px-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <SafeImage src={row.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-[10px]" />
                    {nameCell(row)}
                  </div>
                </td>
                <td className="px-6">{stock(row)}</td>
                <td className="px-6 text-body-md tabular-nums text-on-surface">{row.clicks.toLocaleString('en-US')}</td>
                <td className="whitespace-nowrap px-6 text-body-sm text-on-surface-variant">
                  <span title={row.updatedExact}>{row.updatedAgo}</span>
                </td>
                <td className="px-6 text-right">{editButton(row)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* under 768px: one card per product */}
      <ul className="md:hidden">
        {rows.map((row) => (
          <li key={row.id} className="flex items-start gap-3 border-b border-[#E2E8F0] p-4 last:border-b-0">
            <SafeImage src={row.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-[10px]" />
            <div className="min-w-0 flex-1">
              {nameCell(row)}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                {stock(row)}
                <span className="text-body-sm text-on-surface-variant">{row.clicks.toLocaleString('en-US')} clicks</span>
              </div>
              <p className="mt-1 text-body-sm text-on-surface-variant" title={row.updatedExact}>
                Updated {row.updatedAgo}
              </p>
            </div>
            {editButton(row)}
          </li>
        ))}
      </ul>
    </>
  );
}
