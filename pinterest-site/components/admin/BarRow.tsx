import type { ReactNode } from "react";

type BarRowProps = {
  label: ReactNode;
  /** Text on the right, e.g. "1,234". */
  valueText: string;
  /** 0 to 1, scaled by the caller to the largest value. */
  ratio: number;
};

/** Label on the left, value on the right, amber progress bar (track #E2E8F0) underneath. */
export function BarRow({ label, valueText, ratio }: BarRowProps) {
  const percent = Math.max(0, Math.min(1, ratio)) * 100;
  return (
    <li>
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-body-sm">
        <span className="font-semibold text-[#0F172A]">{label}</span>
        <span className="tabular-nums text-[#475569]">{valueText}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]" aria-hidden="true">
        <div className="h-full rounded-full bg-[#F59E0B]" style={{ width: `${percent}%` }} />
      </div>
    </li>
  );
}
