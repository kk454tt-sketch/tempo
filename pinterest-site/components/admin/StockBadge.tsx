export type StockSummary = 'in' | 'partly' | 'out' | 'none';

export function summarizeStock(inCount: number, outCount: number): StockSummary {
  if (inCount + outCount === 0) return 'none';
  if (outCount === 0) return 'in';
  return inCount === 0 ? 'out' : 'partly';
}

const LOOK: Record<StockSummary, { dot: string | null; label: string }> = {
  in: { dot: 'bg-[#22C55E]', label: 'In stock' },
  partly: { dot: 'bg-[#F59E0B]', label: 'Partly' },
  out: { dot: 'bg-[#94A3B8]', label: 'Out of stock' },
  none: { dot: null, label: 'No links' },
};

export function StockBadge({ summary }: { summary: StockSummary }) {
  const { dot, label } = LOOK[summary];
  return (
    <span className={`inline-flex items-center gap-2 text-body-sm ${dot ? 'text-on-surface' : 'text-on-surface-variant'}`}>
      {dot && <span aria-hidden="true" className={`h-2 w-2 rounded-full ${dot}`} />}
      {label}
    </span>
  );
}
