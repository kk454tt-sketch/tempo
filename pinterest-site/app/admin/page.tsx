import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AreaChart } from "@/components/admin/AreaChart";
import { BarRow } from "@/components/admin/BarRow";
import { Card, EmptyNote } from "@/components/admin/Card";
import { ProductStatsTable } from "@/components/admin/ProductStatsTable";
import { RangeToggle } from "@/components/admin/RangeToggle";
import { StatCard } from "@/components/admin/StatCard";
import { requireAdmin } from "@/lib/admin/auth";
import { getDashboardData } from "@/lib/admin/analytics-data";
import {
  DASHBOARD_RANGES,
  RANGE_DAYS,
  dashboardHref,
  parseRange,
} from "@/lib/admin/analytics-params";
import {
  countryName,
  formatNumber,
  groupCountryClicks,
  toChartPoints,
} from "@/lib/admin/format";

export const metadata = { title: "Dashboard" };

type DashboardPageProps = {
  searchParams: Promise<{ range?: string | string[] }>;
};

export default async function AdminDashboardPage({ searchParams }: DashboardPageProps) {
  const { supabase } = await requireAdmin();
  const { range: rawRange } = await searchParams;
  const range = parseRange(rawRange, DASHBOARD_RANGES);
  const days = RANGE_DAYS[range];

  const { summary, series, countries, topProducts } = await getDashboardData(supabase, days);

  const hint = `Last ${days} days`;
  const points = toChartPoints(series, range);
  const countryRows = groupCountryClicks(countries);
  const largestCountry = Math.max(0, ...countryRows.map((row) => row.clicks));
  const toggleItems = DASHBOARD_RANGES.map((option) => ({
    label: option,
    href: dashboardHref(option),
    active: option === range,
  }));

  return (
    <>
      <AdminPageHeader title="Dashboard" />

      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard label="Total clicks" value={formatNumber(summary.totalClicks)} hint={hint} />
          <StatCard label="Top country" value={countryName(summary.topCountry)} hint={hint} />
          <StatCard
            label="Out of stock"
            value={formatNumber(summary.outOfStockProducts)}
            href="/admin/products?stock=out"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <Card title="Clicks" actions={<RangeToggle ariaLabel="Date range" items={toggleItems} />}>
            {summary.totalClicks === 0 ? <EmptyNote className="mb-2">No clicks yet</EmptyNote> : null}
            <AreaChart
              points={points}
              valueName="clicks"
              ariaLabel={`Clicks per day, last ${days} days`}
            />
          </Card>

          <Card title="Clicks by country">
            {summary.totalClicks === 0 ? (
              <EmptyNote>No clicks yet</EmptyNote>
            ) : (
              <ul className="space-y-5">
                {countryRows.map((row) => (
                  <BarRow
                    key={row.code}
                    label={
                      <>
                        {row.code}
                        {row.code !== "Other" ? <span className="sr-only"> {row.name}</span> : null}
                      </>
                    }
                    valueText={formatNumber(row.clicks)}
                    ratio={largestCountry > 0 ? row.clicks / largestCountry : 0}
                  />
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card title="Top products">
          {topProducts.length === 0 ? (
            <EmptyNote>No clicks yet</EmptyNote>
          ) : (
            <ProductStatsTable
              rows={topProducts}
              variant="top"
              hrefFor={(row) => `/admin/products/${row.productId}`}
            />
          )}
        </Card>
      </div>
    </>
  );
}
