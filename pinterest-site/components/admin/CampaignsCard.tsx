import Link from "next/link";
import { Card, EmptyNote } from "@/components/admin/Card";
import type { CampaignCountryStat, CampaignStat } from "@/lib/admin/analytics-types";
import { analyticsHref, type RangeKey } from "@/lib/admin/analytics-params";
import { countryName, formatNumber } from "@/lib/admin/format";

export function CampaignsCard({
  campaigns,
  selectedCampaign,
  campaignCountries,
  range,
  productId,
}: {
  campaigns: CampaignStat[];
  selectedCampaign: string | null;
  campaignCountries: CampaignCountryStat[];
  range: RangeKey;
  productId: string | null;
}) {
  return (
    <Card
      title="Campaigns"
      actions={
        selectedCampaign ? (
          <Link
            href={analyticsHref(range, productId)}
            scroll={false}
            className="text-body-sm font-semibold text-[#B45309] hover:underline"
          >
            Clear campaign selection
          </Link>
        ) : undefined
      }
    >
      <div id="campaigns-card">
        {campaigns.length === 0 ? (
          <EmptyNote>No campaign traffic yet. Create pin links to start tracking.</EmptyNote>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-body-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-label-sm uppercase tracking-wider text-[#64748B]">
                    <th className="py-2.5 pr-4 font-semibold">Campaign</th>
                    <th className="py-2.5 pr-4 font-semibold">Content</th>
                    <th className="py-2.5 pr-4 font-semibold text-right">Views</th>
                    <th className="py-2.5 pr-4 font-semibold text-right">Clicks</th>
                    <th className="py-2.5 pr-4 font-semibold text-right">Click rate</th>
                    <th className="py-2.5 font-semibold">Top country</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {campaigns.map((row) => {
                    const active = selectedCampaign === row.campaign;
                    return (
                      <tr
                        key={`${row.campaign}:${row.content ?? ""}`}
                        className={active ? "bg-[#FEF3C7]/40" : "hover:bg-[#F8FAFC]"}
                      >
                        <td className="py-2.5 pr-4 font-semibold text-[#0F172A]">
                          <Link
                            href={analyticsHref(range, productId, {
                              campaign: active ? null : row.campaign,
                            })}
                            scroll={false}
                            className="underline-offset-2 hover:underline"
                          >
                            {row.campaign}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-4 text-[#475569]">{row.content ?? "—"}</td>
                        <td className="py-2.5 pr-4 text-right tabular-nums text-[#0F172A]">
                          {formatNumber(row.views)}
                        </td>
                        <td className="py-2.5 pr-4 text-right tabular-nums font-semibold text-[#0F172A]">
                          {formatNumber(row.clicks)}
                        </td>
                        <td className="py-2.5 pr-4 text-right tabular-nums text-[#475569]">
                          {row.clickRate.toFixed(1)}%
                        </td>
                        <td className="py-2.5 text-[#475569]">
                          {row.topCountry ? countryName(row.topCountry) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {selectedCampaign ? (
              <div className="mt-5 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <h3 className="text-body-sm font-bold text-[#0F172A]">
                  Countries for campaign &ldquo;{selectedCampaign}&rdquo;
                </h3>
                {campaignCountries.length === 0 ? (
                  <p className="mt-2 text-body-sm text-[#64748B]">No country breakdown for this range.</p>
                ) : (
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {campaignCountries.map((c) => (
                      <li
                        key={c.country}
                        className="flex items-center justify-between rounded-[10px] border border-[#E2E8F0] bg-white px-3 py-2 text-body-sm"
                      >
                        <span className="font-medium text-[#0F172A]">{countryName(c.country)}</span>
                        <span className="tabular-nums text-[#64748B]">
                          {formatNumber(c.views)}v / <strong className="text-[#0F172A]">{formatNumber(c.clicks)}c</strong>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </>
        )}
      </div>
    </Card>
  );
}
