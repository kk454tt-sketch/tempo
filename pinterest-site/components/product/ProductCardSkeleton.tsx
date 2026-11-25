/** Same outer dimensions as ProductCard so the page does not jump when data arrives. */
export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="aspect-square animate-pulse rounded-[12px] bg-surface-container motion-reduce:animate-none" />
      <div className="mt-2 flex flex-col gap-1.5 md:mt-3 md:flex-row md:justify-between md:gap-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-surface-container motion-reduce:animate-none md:w-1/2" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-surface-container motion-reduce:animate-none md:w-1/5" />
      </div>
    </div>
  );
}
