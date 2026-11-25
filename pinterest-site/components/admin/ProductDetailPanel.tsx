import Link from "next/link";
import type { ProductCountryStat, ProductOption } from "@/lib/admin/analytics-types";
import { analyticsHref, type RangeKey } from "@/lib/admin/analytics-params";
import { countryName, formatNumber } from "@/lib/admin/format";
import { Card, EmptyNote } from "./Card";
import { StockStatus } from "./StockStatus";

type ProductDetailPanelProps = {
  product: ProductOption;
  rows: readonly ProductCountryStat[];
  range: RangeKey;
};

const TH = "pb-3 pr-4 text-label-sm font-semibold uppercase tracking-wide text-[#64748B]";
const TD = "py-3 pr-4 align-middle";
const LINK = "text-body-sm font-semibold text-[#B45309] hover:underline";

function linkLabel(row: ProductCountryStat): string {
  if (!row.hasLink) return "No";
  // Indonesia without its own link, and any other country, are sent to the US link.
  return row.linkStore && row.linkStore !== row.visitorCountry ? `Yes, ${row.linkStore} link` : "Yes";
}

/** Which countries sent this product traffic, and whether each country has a working link. */
export function ProductDetailPanel({ product, rows, range }: ProductDetailPanelProps) {
  const hasTraffic = rows.some((row) => row.views > 0 || row.clicks > 0);

  return (
    <Card
      id="product-detail"
      title={product.name}
      actions={
        <div className="flex items-center gap-4">
          <Link href={`/admin/products/${product.id}`} className={LINK}>
            Edit product
          </Link>
          <Link href={analyticsHref(range, null)} scroll={false} className={LINK}>
            Clear
          </Link>
        </div>
      }
    >
      {!hasTraffic ? <EmptyNote className="mb-4">No views or clicks for this product in this range.</EmptyNote> : null}
      <div className="-mx-6 overflow-x-auto px-6">
        <table className="w-full min-w-[560px] text-left text-body-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0]">
              <th scope="col" className={TH}>Country</th>
              <th scope="col" className={`${TH} text-right`}>Views</th>
              <th scope="col" className={`${TH} text-right`}>Clicks</th>
              <th scope="col" className={`${TH} pl-4`}>Link set</th>
              <th scope="col" className={`${TH} pr-0`}>Stock</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.visitorCountry} className="border-b border-[#F1F5F9] last:border-0">
                <td className={TD}>
                  <span className="font-semibold text-[#0F172A]">
                    {row.visitorCountry === "OTHER" ? "Other" : row.visitorCountry}
                  </span>{" "}
                  <span className="text-[#64748B]">{row.visitorCountry === "OTHER" ? "" : countryName(row.visitorCountry)}</span>
                </td>
                <td className={`${TD} text-right tabular-nums`}>{formatNumber(row.views)}</td>
                <td className={`${TD} text-right font-semibold tabular-nums text-[#0F172A]`}>{formatNumber(row.clicks)}</td>
                <td className={`${TD} pl-4 ${row.hasLink ? "text-[#475569]" : "font-semibold text-[#B45309]"}`}>
                  {linkLabel(row)}
                </td>
                <td className={`${TD} pr-0`}>
                  {row.hasLink ? <StockStatus status={row.inStock === false ? "out_of_stock" : "in_stock"} /> : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
