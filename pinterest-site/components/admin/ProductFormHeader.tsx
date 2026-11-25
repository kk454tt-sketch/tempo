import Link from 'next/link';
import { Icon } from './Icon';
import { ui } from './styles';

export function ProductFormHeader({ mode, name }: { mode: 'create' | 'edit'; name?: string }) {
  return (
    <header className="mx-auto mb-6 max-w-[640px]">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-body-sm text-on-surface-variant">
        <Link href="/admin/products" aria-label="Back to products" className={`${ui.iconButton} h-8 w-8`}>
          <Icon name="arrow_back" className="text-[20px]" />
        </Link>
        <Link href="/admin/products" className="hover:underline">
          Products
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="truncate text-primary">
          {mode === 'create' ? 'New entry' : name}
        </span>
      </nav>
      <h1 className="mt-3 text-headline-md text-primary">{mode === 'create' ? 'Add product' : 'Edit product'}</h1>
    </header>
  );
}
