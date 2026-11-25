import type { Metadata } from 'next';
import PageContainer from '@/components/layout/PageContainer';
import CategoryCard, { CATEGORY_GRID_CLASS } from '@/components/product/CategoryCard';
import EmptyState from '@/components/ui/EmptyState';
import { getCategorySummaries } from '@/lib/products';

const TITLE = 'Categories | AffHub';
const DESCRIPTION = 'Browse curated Amazon finds by category.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website' },
  twitter: { card: 'summary', title: TITLE, description: DESCRIPTION },
};

export default async function CategoriesPage() {
  const categories = await getCategorySummaries();

  return (
    <PageContainer>
      <h1 className="text-headline-lg text-primary">Categories</h1>

      {categories.length === 0 ? (
        <EmptyState icon="category" title="No categories yet" />
      ) : (
        <ul className={`mt-6 md:mt-8 ${CATEGORY_GRID_CLASS}`}>
          {categories.map((category, index) => (
            <li key={category.id} className="min-w-0">
              <CategoryCard category={category} priority={index < 3} />
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}
