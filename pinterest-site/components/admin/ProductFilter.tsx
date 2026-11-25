"use client";

import { useRouter } from "next/navigation";
import { useId } from "react";
import { analyticsHref, type RangeKey } from "@/lib/admin/analytics-params";
import type { ProductOption } from "@/lib/admin/analytics-types";
import { ui } from "@/components/ui/classes";

type ProductFilterProps = {
  range: RangeKey;
  options: readonly ProductOption[];
  selectedId: string | null;
};

/** "All products" by default. Choosing one filters the page and opens its detail panel. */
export function ProductFilter({ range, options, selectedId }: ProductFilterProps) {
  const router = useRouter();
  const selectId = useId();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={selectId} className="text-body-sm font-semibold text-[#0F172A]">
        Product
      </label>
      <select
        id={selectId}
        value={selectedId ?? ""}
        onChange={(event) => {
          const id = event.target.value;
          router.push(analyticsHref(range, id || null, { toDetail: Boolean(id) }));
        }}
        className={`h-10 w-full max-w-[220px] truncate rounded-xl border border-[#E2E8F0] bg-white pl-3 pr-8 text-body-sm font-semibold text-[#0F172A] ${ui.focusRing}`}
      >
        <option value="">All products</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}
