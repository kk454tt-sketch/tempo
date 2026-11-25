import Link from "next/link";
import type { ProductStat } from "@/lib/admin/analytics-types";
import { countryName, formatNumber, formatPercent } from "@/lib/admin/format";
import { ui } from "@/components/ui/classes";
import { StockStatus } from "./StockStatus";

type ProductStatsTableProps = {
  rows: readonly ProductStat[];
  /** "top": Product, Clicks, Country, Status. "full": adds Views and Click rate. */
  variant: "top" | "full";
  hrefFor: (row: ProductStat) => string;
  selectedId?: string | null;
};

const TH = "pb-3 pr-4 text-label-sm font-semibold uppercase tracking-wide text-[#64748B]";
const TD = "py-3 pr-4 align-middle";
const NUMERIC = "text-right tabular-nums";

export function ProductStatsTable({ rows, variant, hrefFor, selectedId = null }: ProductStatsTableProps) {
  const full = variant === "full";

  return (
    <div className="-mx-6 overflow-x-auto px-6">
      <table className={`w-full text-left text-body-sm ${full ? "min-w-[680px]" : "min-w-[520px]"}`}>
        <thead>
          <tr className="border-b border-[#E2E8F0]">
            <th scope="col" className={TH}>Product</th>
            {full ? <th scope="col" className={`${TH} ${NUMERIC}`}>Views</th> : null}
            <th scope="col" className={`${TH} ${NUMERIC}`}>Clicks</th>
            {full ? <th scope="col" className={`${TH} ${NUMERIC}`}>Click rate</th> : null}
            <th scope="col" className={`${TH} pl-4`}>{full ? "Top country" : "Country"}</th>
            <th scope="col" className={`${TH} pr-0 text-right`}>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const selected = row.productId === selectedId;
            return (
              <tr
                key={row.productId}
                className={`relative border-b border-[#F1F5F9] last:border-0 ${
                  selected ? "bg-[rgba(245,158,11,0.10)]" : "hover:bg-[#F8FAFC]"
                }`}
              >
                <td className={`${TD} max-w-[280px]`}>
                  <Link
                    href={hrefFor(row)}
                    aria-current={selected ? "true" : undefined}
                    className={`block truncate rounded font-semibold text-[#0F172A] after:absolute after:inset-0 ${ui.focusRing}`}
                  >
                    {row.name}
                  </Link>
                </td>
                {full ? <td className={`${TD} ${NUMERIC}`}>{formatNumber(row.views)}</td> : null}
                <td className={`${TD} ${NUMERIC} font-semibold text-[#0F172A]`}>{formatNumber(row.clicks)}</td>
                {full ? <td className={`${TD} ${NUMERIC}`}>{formatPercent(row.clicks, row.views)}</td> : null}
                <td className={`${TD} pl-4 text-[#475569]`}>{countryName(row.topCountry)}</td>
                <td className={`${TD} pr-0 text-right`}>
                  <StockStatus status={row.stockStatus} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
