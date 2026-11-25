import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DeleteProductCard } from '@/components/admin/DeleteProductCard';
import { ProductForm } from '@/components/admin/ProductForm';
import { ProductFormHeader } from '@/components/admin/ProductFormHeader';
import { requireAdminPage } from '@/lib/admin/guard';
import { getCategories, getProductForEdit } from '@/lib/admin/products';
import { isUuid } from '@/lib/admin/product-schema';

export const metadata: Metadata = { title: 'Edit product | AffHub Admin' };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdminPage();
  if (!isUuid(id)) notFound();

  const [product, categories] = await Promise.all([getProductForEdit(supabase, id), getCategories(supabase)]);
  if (!product) notFound();

  return (
    <>
      <ProductFormHeader mode="edit" name={product.name} />
      <ProductForm key={id} mode="edit" initial={product.values} categories={categories} />
      <DeleteProductCard id={id} name={product.name} />
    </>
  );
}
