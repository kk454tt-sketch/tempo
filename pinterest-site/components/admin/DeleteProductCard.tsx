'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteProductAction, duplicateProductAction } from '@/app/admin/products/actions';
import { Confirm, useNotify } from './adapters';
import { Spinner } from './Spinner';
import { ui } from './styles';

export function DeleteProductCard({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const notify = useNotify();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  async function confirmDelete() {
    setDeleting(true);
    try {
      const result = await deleteProductAction(id);
      if (!result.ok) {
        notify.error(result.message);
        setDeleting(false);
        setOpen(false);
        return;
      }
      notify.success(`Deleted ${name}.`);
      router.push('/admin/products');
    } catch {
      notify.error('Something went wrong. Please try again.');
      setDeleting(false);
      setOpen(false);
    }
  }

  async function handleDuplicate() {
    setDuplicating(true);
    try {
      const result = await duplicateProductAction(id);
      if (!result.ok) {
        notify.error(result.message);
        setDuplicating(false);
        return;
      }
      notify.success('Duplicated as an unpublished draft.');
      router.push(`/admin/products/${result.id}`);
    } catch {
      notify.error('Could not duplicate product. Try again.');
      setDuplicating(false);
    }
  }

  return (
    <section aria-labelledby="danger-zone" className="mx-auto mt-8 max-w-[640px] rounded-[16px] border border-[#FCA5A5] bg-white p-5 sm:p-8">
      <h2 id="danger-zone" className="text-headline-sm text-[#DC2626]">
        Product actions
      </h2>
      <p className={`mt-1 ${ui.muted}`}>
        Duplicate creates an unpublished draft with the same links, or delete removes the product, its links, stats and images.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void handleDuplicate()}
          disabled={deleting || duplicating}
          className={`${ui.btn} ${ui.btnGhost}`}
        >
          {duplicating && <Spinner />}
          Duplicate
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={deleting || duplicating}
          className={`${ui.btn} ${ui.btnDanger}`}
        >
          {deleting && <Spinner />}
          Delete product
        </button>
      </div>
      <Confirm
        open={open}
        title="Delete product"
        message="Delete this product and its stats? This cannot be undone."
        confirmLabel="Delete product"
        destructive
        loading={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setOpen(false)}
      />
    </section>
  );
}
