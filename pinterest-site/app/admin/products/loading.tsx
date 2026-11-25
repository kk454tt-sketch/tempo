import { ui } from '@/components/admin/styles';

export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="h-8 w-40 animate-pulse rounded-[8px] bg-[#F1F5F9]" />
        <div className="h-11 w-full animate-pulse rounded-[16px] bg-[#F1F5F9] sm:w-[560px]" />
      </div>
      <div className={`${ui.card} overflow-hidden`}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex h-[72px] items-center gap-4 border-b border-[#E2E8F0] px-6 last:border-b-0">
            <div className="h-10 w-10 animate-pulse rounded-[10px] bg-[#F1F5F9]" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-[#F1F5F9]" />
            <div className="ml-auto h-4 w-24 animate-pulse rounded bg-[#F1F5F9]" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading products</span>
    </div>
  );
}
