import type { DeviceStat } from "@/lib/admin/analytics-types";
import { formatNumber } from "@/lib/admin/format";
import { EmptyNote } from "./Card";

const emptyDevice = (device: DeviceStat["device"]): DeviceStat => ({ device, clicks: 0, views: 0 });

/** Mobile vs desktop split bar. Uses views (visitors); falls back to clicks if there are no views. */
export function DeviceSplit({ devices }: { devices: readonly DeviceStat[] }) {
  const mobile = devices.find((entry) => entry.device === "mobile") ?? emptyDevice("mobile");
  const desktop = devices.find((entry) => entry.device === "desktop") ?? emptyDevice("desktop");

  const base = mobile.views + desktop.views > 0 ? "views" : "clicks";
  const total = mobile[base] + desktop[base];
  if (total === 0) return <EmptyNote>No traffic yet</EmptyNote>;

  const mobilePercent = Math.round((mobile[base] / total) * 100);
  const desktopPercent = 100 - mobilePercent;

  const legend = [
    { name: "Mobile", percent: mobilePercent, stat: mobile, swatch: "bg-[#F59E0B]" },
    { name: "Desktop", percent: desktopPercent, stat: desktop, swatch: "bg-[#0F172A]" },
  ];

  return (
    <div>
      <div
        role="img"
        aria-label={`Mobile ${mobilePercent}%, desktop ${desktopPercent}%`}
        className="flex h-3 overflow-hidden rounded-full bg-[#E2E8F0]"
      >
        <div className="h-full bg-[#F59E0B]" style={{ width: `${mobilePercent}%` }} />
        <div className="h-full bg-[#0F172A]" style={{ width: `${desktopPercent}%` }} />
      </div>
      <ul className="mt-5 grid grid-cols-2 gap-4">
        {legend.map((item) => (
          <li key={item.name}>
            <div className="flex items-center gap-2 text-body-sm font-semibold text-[#0F172A]">
              <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${item.swatch}`} />
              {item.name}
              <span className="tabular-nums text-[#475569]">{item.percent}%</span>
            </div>
            <p className="mt-1 text-body-sm text-[#64748B]">
              {formatNumber(item.stat.views)} views, {formatNumber(item.stat.clicks)} clicks
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
