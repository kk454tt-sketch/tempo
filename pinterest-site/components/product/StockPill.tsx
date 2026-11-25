/**
 * Out of stock: small gray pill. In stock: white pill with a green dot, shown
 * only where asked (`showInStock`), e.g. on the hero card.
 */
export function StockPill({
  inStock,
  showInStock = false,
  className = "",
}: {
  inStock: boolean;
  showInStock?: boolean;
  className?: string;
}) {
  if (!inStock) {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-slate-200 px-2.5 py-1 text-label-sm font-semibold text-slate-700 ${className}`}
      >
        Out of stock
      </span>
    );
  }
  if (!showInStock) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-label-sm font-semibold text-on-surface shadow-[0_2px_8px_rgba(15,23,42,0.12)] ${className}`}
    >
      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-green-500" />
      In stock
    </span>
  );
}
