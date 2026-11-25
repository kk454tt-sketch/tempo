/** Renders nothing when there is no price. Out of stock: gray with a line-through. */
export function ProductPrice({
  label,
  outOfStock = false,
  className = "",
}: {
  label: string | null;
  outOfStock?: boolean;
  className?: string;
}) {
  if (!label) return null;
  return (
    <p
      className={`text-body-md font-bold ${
        outOfStock ? "text-slate-500 line-through" : "text-on-surface"
      } ${className}`}
    >
      {label}
    </p>
  );
}
