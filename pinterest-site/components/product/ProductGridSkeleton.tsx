import { PRODUCT_GRID_CLASS } from '@/components/product/ProductGrid';

/** Skeleton cards with the same footprint as real product cards. */
export default function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <ul aria-hidden="true" className={PRODUCT_GRID_CLASS}>
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="min-w-0 animate-pulse">
          <div className="aspect-square rounded-[12px] bg-surface-container" />
          <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-3">
            <div className="h-4 w-3/4 rounded bg-surface-container md:w-2/3" />
            <div className="h-4 w-1/3 rounded bg-surface-container md:w-1/5" />
          </div>
        </li>
      ))}
    </ul>
  );
}
