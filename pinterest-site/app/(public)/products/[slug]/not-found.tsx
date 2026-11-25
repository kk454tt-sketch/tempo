import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import { ghostButtonClass } from '@/components/ui/ghost-button';

/** Shown for an unknown or unpublished product slug. */
export default function ProductNotFound() {
  return (
    <PageContainer>
      <EmptyState
        icon="search_off"
        title="Product not found"
        action={
          <Link href="/products" className={ghostButtonClass}>
            Browse products
          </Link>
        }
      />
    </PageContainer>
  );
}
