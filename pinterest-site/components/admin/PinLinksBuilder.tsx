"use client";

import { useMemo, useState } from "react";
import { SafeImage } from "@/components/admin/SafeImage";
import { Icon } from "@/components/ui/Icon";
import { ui } from "@/components/ui/classes";

export type PinProductOption = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
};

function sanitizeCampaign(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+/, "")
    .slice(0, 80);
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function PinLinksBuilder({
  products,
  baseUrl,
}: {
  products: PinProductOption[];
  baseUrl: string;
}) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [campaign, setCampaign] = useState("");
  const [content, setContent] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q),
    );
  }, [products, search]);

  const cleanCampaign = campaign.trim().replace(/-+$/, "");
  const cleanContent = content.trim();

  const generated = useMemo(() => {
    if (!cleanCampaign) return [];
    const selectedSet = new Set(selectedIds);
    return products
      .filter((p) => selectedSet.has(p.id))
      .map((p) => {
        const params = new URLSearchParams({
          utm_source: "pinterest",
          utm_medium: "social",
          utm_campaign: cleanCampaign,
        });
        if (cleanContent) params.set("utm_content", cleanContent);
        const url = `${baseUrl.replace(/\/+$/, "")}/products/${p.slug}?${params.toString()}`;
        return { id: p.id, name: p.name, url };
      });
  }, [baseUrl, cleanCampaign, cleanContent, products, selectedIds]);

  function toggleProduct(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  async function copyText(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((curr) => (curr === key ? null : curr)), 1800);
    } catch {
      // Clipboard API unavailable
    }
  }

  function downloadCsv() {
    if (generated.length === 0) return;
    const lines = [
      "product_name,url",
      ...generated.map((row) => `${csvCell(row.name)},${csvCell(row.url)}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pinterest-links-${cleanCampaign}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      {/* Left card: product picker & UTM inputs */}
      <section className={`${ui.card} space-y-5`}>
        <div>
          <h2 className="text-headline-sm font-bold text-[#0F172A]">1. Choose products & campaign</h2>
          <p className="mt-1 text-body-sm text-[#64748B]">
            Only published products appear here.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pin-campaign" className={ui.label}>
              Campaign <span className="text-[#DC2626]">*</span>
            </label>
            <input
              id="pin-campaign"
              value={campaign}
              onChange={(e) => setCampaign(sanitizeCampaign(e.target.value))}
              placeholder="e.g. spring-office"
              autoComplete="off"
              required
              className={ui.input}
            />
            <p className="mt-1 text-label-sm text-[#64748B]">
              Letters, numbers and hyphens (auto-lowercased).
            </p>
          </div>
          <div>
            <label htmlFor="pin-content" className={ui.label}>
              Content <span className="font-normal text-[#64748B]">(optional)</span>
            </label>
            <input
              id="pin-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. hero-pin-1"
              maxLength={100}
              autoComplete="off"
              className={ui.input}
            />
          </div>
        </div>

        <div>
          <label htmlFor="pin-product-search" className={ui.label}>
            Products ({selectedIds.length} selected)
          </label>
          <input
            id="pin-product-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search published products..."
            className={ui.input}
          />
          <ul className="mt-3 max-h-[360px] divide-y divide-[#F1F5F9] overflow-y-auto rounded-[12px] border border-[#E2E8F0]">
            {filteredProducts.length === 0 ? (
              <li className="px-4 py-8 text-center text-body-sm text-[#64748B]">
                No published products match your search.
              </li>
            ) : (
              filteredProducts.map((product) => {
                const checked = selectedIds.includes(product.id);
                return (
                  <li key={product.id}>
                    <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-[#F8FAFC]">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleProduct(product.id)}
                        className="h-4 w-4 rounded border-[#CBD5E1] text-[#0F172A] focus:ring-[#F59E0B]"
                      />
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC]">
                        {product.image_url ? (
                          <SafeImage
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full"
                          />
                        ) : null}
                      </div>
                      <span className="min-w-0 flex-1 truncate text-body-sm font-medium text-[#0F172A]">
                        {product.name}
                      </span>
                    </label>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </section>

      {/* Right card: generated links */}
      <div className="space-y-3">
        <section className={`${ui.card} space-y-4`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-headline-sm font-bold text-[#0F172A]">2. Generated pin links</h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={generated.length === 0}
                onClick={() =>
                  void copyText(
                    "all",
                    generated.map((row) => row.url).join("\n"),
                  )
                }
                className={ui.btnGhost}
              >
                <Icon name={copiedKey === "all" ? "check" : "content_copy"} className="text-[18px]" />
                {copiedKey === "all" ? "Copied all" : "Copy all"}
              </button>
              <button
                type="button"
                disabled={generated.length === 0}
                onClick={downloadCsv}
                className={ui.btnPrimary}
              >
                <Icon name="download" className="text-[18px]" />
                Download CSV
              </button>
            </div>
          </div>

          {generated.length === 0 ? (
            <p className="rounded-[12px] border border-dashed border-[#E2E8F0] px-4 py-10 text-center text-body-sm text-[#64748B]">
              {!cleanCampaign
                ? "Enter a campaign name and select one or more products."
                : "Select at least one product to generate its pin link."}
            </p>
          ) : (
            <ul className="divide-y divide-[#F1F5F9] rounded-[12px] border border-[#E2E8F0]">
              {generated.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 px-3.5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-sm font-semibold text-[#0F172A]">{row.name}</p>
                    <p className="mt-0.5 truncate font-mono text-label-sm text-[#64748B]">
                      {row.url}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void copyText(row.id, row.url)}
                    className={`${ui.btnGhost} h-9 shrink-0 px-3 text-label-md`}
                  >
                    <Icon name={copiedKey === row.id ? "check" : "content_copy"} className="text-[16px]" />
                    {copiedKey === row.id ? "Copied" : "Copy"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <p className="px-1 text-label-sm text-[#64748B]">
          Links open the product in the visitor&apos;s own country store.
        </p>
      </div>
    </div>
  );
}
