import PageContainer from '@/components/layout/PageContainer';

/**
 * Detail-page skeleton. Without this file the product LIST skeleton from
 * app/products/loading.tsx would show while a product page loads.
 */
export default function ProductDetailLoading() {
  return (
    <PageContainer>
      <span role="status" className="sr-only">
        Loading product
      </span>

      <div aria-hidden="true" className="mx-auto grid max-w-[1100px] animate-pulse gap-8 md:grid-cols-2 md:items-start md:gap-12">
        <div>
          <div className="aspect-[4/3] rounded-[16px] bg-surface-container" />
          <div className="mt-3 hidden grid-cols-3 gap-3 md:grid">
            {[0, 1, 2].map((item) => (
              <div key={item} className="aspect-[4/3] rounded-[12px] bg-surface-container" />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-4 w-24 rounded bg-surface-container" />
          <div className="h-10 w-3/4 rounded-[12px] bg-surface-container" />
          <div className="h-8 w-32 rounded-[12px] bg-surface-container" />
          <div className="space-y-2 pt-2">
            <div className="h-4 w-full rounded bg-surface-container" />
            <div className="h-4 w-full rounded bg-surface-container" />
            <div className="h-4 w-2/3 rounded bg-surface-container" />
          </div>
          <div className="grid grid-cols-4 gap-2 pt-4 md:gap-3">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-12 rounded-[16px] bg-surface-container" />
            ))}
          </div>
          <div className="hidden h-14 rounded-[16px] bg-surface-container md:block" />
        </div>
      </div>
    </PageContainer>
  );
}
