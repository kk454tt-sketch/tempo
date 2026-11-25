import React, { useState } from 'react';
import { TemplateProps } from '@/types/template';

type StoreCode = 'US' | 'IN' | 'BR' | 'MX' | 'ID';

const STORE_META: Record<StoreCode, { label: string; amazonName: string; currency: string; rate: number }> = {
  US: { label: 'United States', amazonName: 'Amazon US', currency: '$', rate: 1 },
  IN: { label: 'India', amazonName: 'Amazon India', currency: '₹', rate: 84 },
  BR: { label: 'Brazil', amazonName: 'Amazon Brazil', currency: 'R$', rate: 5.7 },
  MX: { label: 'Mexico', amazonName: 'Amazon Mexico', currency: 'MX$', rate: 20 },
  ID: { label: 'Indonesia (US fallback)', amazonName: 'Amazon US', currency: '$', rate: 1 },
};

const DEMO_PRODUCTS = [
  { id: 'p-1', name: 'Solid Walnut Monitor Stand', baseUsd: 89, category: 'Workspace', inStock: true },
  { id: 'p-2', name: 'Matte Ceramic Catchall Tray', baseUsd: 29, category: 'Minimal Decor', inStock: true },
  { id: 'p-3', name: 'Woven Linen Throw Blanket', baseUsd: 54, category: 'Living', inStock: true },
  { id: 'p-4', name: 'Bamboo Cable Organizer Box', baseUsd: 34, category: 'Workspace', inStock: false },
];

export const PinterestSiteTemplate: React.FC<TemplateProps> = ({ data }) => {
  const [country, setCountry] = useState<StoreCode>('US');
  const [tab, setTab] = useState<'storefront' | 'admin'>('storefront');
  const [campaign, setCampaign] = useState('spring-home-finds');
  const [selectedSlug, setSelectedSlug] = useState('solid-walnut-monitor-stand');

  const meta = STORE_META[country];
  const siteTitle = data?.title && data.title !== 'Untitled Event' ? data.title : 'AffHub × Amazon';
  const siteTagline =
    data?.tagline || 'Curated Amazon finds, localized to your country store with Pinterest campaign tracking.';

  const formatPrice = (usd: number) => {
    const val = Math.round(usd * meta.rate);
    return `${meta.currency}${val.toLocaleString('en-US')}`;
  };

  return (
    <div className="min-h-full bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
      {/* Top Country Banner */}
      <div className="bg-[#0F172A] text-white text-xs py-2 px-4 flex flex-wrap items-center justify-between gap-2">
        <span>
          Showing <strong>{meta.amazonName}</strong> ({meta.label}) · Next.js 15 + Supabase source in{' '}
          <code className="bg-white/10 px-1.5 py-0.5 rounded">pinterest-site/</code>
        </span>
        <div className="flex items-center gap-1.5">
          {(['US', 'IN', 'BR', 'MX', 'ID'] as StoreCode[]).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setCountry(code)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                country === code ? 'bg-[#F59E0B] text-[#0F172A]' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-[#E60023]" />
          <span className="font-bold text-lg tracking-tight">{siteTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab('storefront')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              tab === 'storefront' ? 'bg-[#0F172A] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Storefront
          </button>
          <button
            type="button"
            onClick={() => setTab('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              tab === 'admin' ? 'bg-[#0F172A] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Admin &amp; Pin Links
          </button>
        </div>
      </header>

      {tab === 'storefront' ? (
        <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">
          {/* Hero */}
          <section className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm">
            <span className="inline-block px-3 py-1 rounded-full bg-rose-50 text-[#E60023] text-xs font-bold tracking-wide uppercase">
              Pinterest Affiliate Hub
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A]">
              Curated finds, linked to {meta.amazonName}.
            </h1>
            <p className="mt-3 text-slate-600 max-w-2xl">{siteTagline}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F59E0B] text-[#0F172A] text-sm font-bold">
                Buy on {meta.amazonName}
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-[#0F172A]">
                Save to Pinterest
              </span>
            </div>
          </section>

          {/* Product Grid */}
          <section>
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="text-xl font-bold">Trending Picks</h2>
              <span className="text-xs text-slate-500">Cached 60s · /go/[id] click tracking</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {DEMO_PRODUCTS.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl bg-white border border-slate-200 p-4 flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="aspect-square rounded-lg bg-slate-100 flex items-center justify-center relative mb-3">
                      <span className="material-symbols-outlined text-[40px] text-slate-400">inventory_2</span>
                      <span
                        className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {item.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                      </span>
                    </div>
                    <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      {item.category}
                    </p>
                    <h3 className="font-bold text-sm mt-0.5 text-[#0F172A]">{item.name}</h3>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className={`font-bold text-sm ${item.inStock ? 'text-[#0F172A]' : 'text-slate-400 line-through'}`}>
                      {formatPrice(item.baseUsd)}
                    </span>
                    <span className="text-xs font-semibold text-amber-700">
                      {item.inStock ? `/go/${item.id}` : 'Unavailable'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      ) : (
        <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
              <h2 className="text-lg font-bold">Pin Links Generator (/admin/pin-links)</h2>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Campaign</label>
                <input
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Product</label>
                <select
                  value={selectedSlug}
                  onChange={(e) => setSelectedSlug(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="solid-walnut-monitor-stand">Solid Walnut Monitor Stand</option>
                  <option value="matte-ceramic-catchall-tray">Matte Ceramic Catchall Tray</option>
                  <option value="woven-linen-throw-blanket">Woven Linen Throw Blanket</option>
                </select>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
              <h2 className="text-lg font-bold">Generated Pin URL</h2>
              <p className="rounded-lg bg-slate-900 text-slate-100 p-3 font-mono text-xs break-all">
                {`https://yoursite.com/products/${selectedSlug}?utm_source=pinterest&utm_medium=social&utm_campaign=${campaign || 'campaign'}`}
              </p>
              <p className="text-xs text-slate-500">
                Includes sharp WebP resizing, CSP nonce headers, Upstash/memory rate limiting, RLS verification, and campaign analytics in{' '}
                <code>pinterest-site/</code>.
              </p>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};
