import PageContainer from '@/components/layout/PageContainer';
import { CATEGORY_CARD_HEIGHT_CLASS, CATEGORY_GRID_CLASS } from '@/components/product/CategoryCard';

export default function CategoriesLoading() {
  return (
    <PageContainer>
      <span role="status" className="sr-only">
        Loading categories
      </span>

      <div aria-hidden="true" className="animate-pulse">
        <div className="h-10 w-48 rounded-[12px] bg-surface-container" />
        <ul className={`mt-6 md:mt-8 ${CATEGORY_GRID_CLASS}`}>
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <li
              key={item}
              className={`${CATEGORY_CARD_HEIGHT_CLASS} rounded-[16px] bg-surface-container`}
            />
          ))}
        </ul>
      </div>
    </PageContainer>
  );
}
