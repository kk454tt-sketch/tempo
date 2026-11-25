import type { Metadata } from 'next';
import { randomUUID } from 'node:crypto';
import { ProductForm } from '@/components/admin/ProductForm';
import { ProductFormHeader } from '@/components/admin/ProductFormHeader';
import { requireAdminPage } from '@/lib/admin/guard';
import { getCategories } from '@/lib/admin/products';
import { emptyProductInput } from '@/lib/admin/product-schema';

export const metadata: Metadata = { title: 'Add product | AffHub Admin' };

export default async function NewProductPage() {
  const { supabase } = await requireAdminPage();
  const categories = await getCategories(supabase);
  // the id is created here so images can be uploaded to products/{id}/ before the first save
  return (
    <>
      <ProductFormHeader mode="create" />
      <ProductForm mode="create" initial={emptyProductInput(randomUUID())} categories={categories} />
    </>
  );
}
