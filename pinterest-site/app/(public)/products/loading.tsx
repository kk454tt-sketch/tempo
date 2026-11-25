import PageContainer from '@/components/layout/PageContainer';
import ProductGridSkeleton from '@/components/product/ProductGridSkeleton';

export default function ProductsLoading() {
  return (
    <PageContainer>
      <span role="status" className="sr-only">
        Loading products
      </span>

      <div aria-hidden="true" className="animate-pulse">
        <div className="h-10 w-44 rounded-[12px] bg-surface-container" />
        <div className="mt-6 space-y-4 md:mt-8">
          <div className="h-14 w-full rounded-[16px] bg-surface-container" />
          <div className="flex gap-2 overflow-hidden">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-10 w-24 shrink-0 rounded-full bg-surface-container" />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 md:mt-8">
        <ProductGridSkeleton count={12} />
      </div>
    </PageContainer>
  );
}
