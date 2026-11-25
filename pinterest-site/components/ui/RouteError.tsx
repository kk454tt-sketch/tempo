'use client';

import { useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import { ghostButtonClass } from '@/components/ui/ghost-button';

/**
 * Error state for a route segment: "Something went wrong" plus a Retry button.
 * Use it from a segment's error.tsx:
 *   'use client';
 *   import RouteError from '@/components/ui/RouteError';
 *   export default RouteError;
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [isRetrying, startTransition] = useTransition();

  useEffect(() => {
    console.error(error);
  }, [error]);

  function retry() {
    // Server-side failures need a fresh server render, not just a client reset.
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <PageContainer>
      <div role="alert" className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <span
          className="material-symbols-outlined text-[48px] leading-none text-on-surface-variant"
          aria-hidden="true"
        >
          error
        </span>
        <p className="text-headline-sm text-primary">Something went wrong</p>
        <button type="button" onClick={retry} disabled={isRetrying} className={ghostButtonClass}>
          {isRetrying ? 'Retrying…' : 'Retry'}
        </button>
      </div>
    </PageContainer>
  );
}
