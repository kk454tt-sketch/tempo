import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AreaChart } from "@/components/admin/AreaChart";
import { BarRow } from "@/components/admin/BarRow";
import { CampaignsCard } from "@/components/admin/CampaignsCard";
import { Card, EmptyNote } from "@/components/admin/Card";
import { DeviceSplit } from "@/components/admin/DeviceSplit";
import { ProductDetailPanel } from "@/components/admin/ProductDetailPanel";
import { ProductFilter } from "@/components/admin/ProductFilter";
import { ProductStatsTable } from "@/components/admin/ProductStatsTable";
import { RangeToggle } from "@/components/admin/RangeToggle";
import { StatCard } from "@/components/admin/StatCard";
import { requireAdmin } from "@/lib/admin/auth";
import {
  getAnalyticsData,
  getCampaignCountries,
  getCampaigns,
  getProductOptions,
} from "@/lib/admin/analytics-data";
import {
  ANALYTICS_RANGES,
  RANGE_DAYS,
  analyticsHref,
  isUuid,
  parseRange,
} from "@/lib/admin/analytics-params";
import { countryName, formatNumber, formatPercent, toChartPoints } from "@/lib/admin/format";

export const metadata = { title: "Analytics" };

type AnalyticsPageProps = {
  searchParams: Promise<{
    range?: string | string[];
    product?: string | string[];
    campaign?: string | string[];
  }>;
};

export default async function AdminAnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const range = parseRange(params.range, ANALYTICS_RANGES);
  const days = RANGE_DAYS[range];

  // Validate the product from the URL against real products before filtering by it.
  const rawProduct = Array.isArray(params.product) ? params.product[0] : params.product;
  const productOptions = await getProductOptions(supabase);
  const selected =
    rawProduct && isUuid(rawProduct)
      ? (productOptions.find((option) => option.id === rawProduct) ?? null)
      : null;

  const rawCampaign = Array.isArray(params.campaign) ? params.campaign[0] : params.campaign;
  const selectedCampaign = rawCampaign?.trim() ? rawCampaign.trim() : null;

  const [{ summary, series, sources, devices, products, productCountries }, campaigns, campaignCountries] =
    await Promise.all([
      getAnalyticsData(supabase, days, selected?.id ?? null),
      getCampaigns(supabase, days),
      selectedCampaign ? getCampaignCountries(supabase, selectedCampaign, days) : Promise.resolve([]),
    ]);

  const hint = `Last ${days} days`;
  const points = toChartPoints(series, range, true);
  const hasActivity = summary.totalClicks > 0 || summary.totalViews > 0;

  const sourceBase = sources.reduce((sum, source) => sum + source.views, 0) > 0 ? "views" : "clicks";
  const largestSource = Math.max(0, ...sources.map((source) => source[sourceBase]));
  const sourcesTotal = sources.reduce((sum, source) => sum + source.views + source.clicks, 0);

  const toggleItems = ANALYTICS_RANGES.map((option) => ({
    label: option,
    href: analyticsHref(option, selected?.id),
    active: option === range,
  }));

  return (
    <>
      <AdminPageHeader
        title="Analytics"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <ProductFilter range={range} options={productOptions} selectedId={selected?.id ?? null} />
            <RangeToggle ariaLabel="Date range" items={toggleItems} />
          </div>
        }
      />

      {selected ? (
        <p className="-mt-4 mb-6 text-body-sm text-[#64748B]">
          Showing data for <span className="font-semibold text-[#0F172A]">{selected.name}</span>.{" "}
          <Link
            href={analyticsHref(range, null)}
            scroll={false}
            className="font-semibold text-[#B45309] hover:underline"
          >
            Show all products
          </Link>
        </p>
      ) : null}

      <div className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Views" value={formatNumber(summary.totalViews)} hint={hint} />
          <StatCard label="Clicks" value={formatNumber(summary.totalClicks)} hint={hint} />
          <StatCard
            label="Click rate"
            value={formatPercent(summary.totalClicks, summary.totalViews)}
            hint={hint}
          />
          <StatCard label="Top country" value={countryName(summary.topCountry)} hint={hint} />
        </div>

        <Card
          title="Clicks over time"
          actions={
            <ul className="flex items-center gap-4 text-body-sm text-[#475569]">
              <li className="flex items-center gap-2">
                <span aria-hidden="true" className="h-0.5 w-4 rounded-full bg-[#F59E0B]" />
                Clicks
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden="true" className="h-0.5 w-4 rounded-full bg-[#94A3B8]" />
                Views
              </li>
            </ul>
          }
        >
          {!hasActivity ? <EmptyNote className="mb-2">No activity yet</EmptyNote> : null}
          <AreaChart
            points={points}
            valueName="clicks"
            secondaryName="views"
            ariaLabel={`Clicks and views per day, last ${days} days`}
          />
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Traffic sources">
            {sourcesTotal === 0 ? (
              <EmptyNote>No traffic yet</EmptyNote>
            ) : (
              <ul className="space-y-5">
                {sources.map((source) => (
                  <BarRow
                    key={source.label}
                    label={source.label}
                    valueText={`${formatNumber(source.views)} views, ${formatNumber(source.clicks)} clicks`}
                    ratio={largestSource > 0 ? source[sourceBase] / largestSource : 0}
                  />
                ))}
              </ul>
            )}
          </Card>

          <Card title="Devices">
            <DeviceSplit devices={devices} />
          </Card>
        </div>

        <Card title="Products">
          {products.length === 0 ? (
            <EmptyNote>No product activity yet</EmptyNote>
          ) : (
            <ProductStatsTable
              rows={products}
              variant="full"
              selectedId={selected?.id ?? null}
              hrefFor={(row) => analyticsHref(range, row.productId, { toDetail: true })}
            />
          )}
        </Card>

        <CampaignsCard
          campaigns={campaigns}
          selectedCampaign={selectedCampaign}
          campaignCountries={campaignCountries}
          range={range}
          productId={selected?.id ?? null}
        />

        {selected ? <ProductDetailPanel product={selected} rows={productCountries} range={range} /> : null}
      </div>
    </>
  );
}
