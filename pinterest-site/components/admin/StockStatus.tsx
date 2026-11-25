import type { StockState } from "@/lib/admin/analytics-types";

const STATES: Record<StockState, { label: string; dot: string; text: string }> = {
  in_stock: { label: "In stock", dot: "bg-[#16A34A]", text: "text-[#15803D]" },
  partly: { label: "Partly in stock", dot: "bg-[#F59E0B]", text: "text-[#B45309]" },
  out_of_stock: { label: "Out of stock", dot: "bg-[#94A3B8]", text: "text-[#64748B]" },
  no_links: { label: "No links", dot: "bg-[#94A3B8]", text: "text-[#64748B]" },
};

export function StockStatus({ status }: { status: StockState }) {
  const state = STATES[status];
  return (
    <span className={`inline-flex items-center gap-2 text-body-sm font-semibold ${state.text}`}>
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${state.dot}`} />
      {state.label}
    </span>
  );
}
