'use client';

import { EmptyState } from '@/components/admin/EmptyState';
import { ui } from '@/components/admin/styles';

export default function ProductsError({ reset }: { reset: () => void }) {
  return (
    <EmptyState icon="error" title="Something went wrong">
      <button type="button" onClick={reset} className={`${ui.btn} ${ui.btnPrimary}`}>
        Retry
      </button>
    </EmptyState>
  );
}
