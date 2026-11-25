import Link from 'next/link';
import { EmptyState } from '@/components/admin/EmptyState';
import { ui } from '@/components/admin/styles';

export default function ProductNotFound() {
  return (
    <EmptyState icon="search_off" title="Product not found">
      <p className={ui.muted}>It may have been deleted, or the link is wrong.</p>
      <Link href="/admin/products" className={`${ui.btn} ${ui.btnPrimary}`}>
        Back to products
      </Link>
    </EmptyState>
  );
}
