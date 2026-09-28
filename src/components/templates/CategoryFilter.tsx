import React from 'react';
import { EventCategory } from '@/types/template';
import { eventCategories } from '@/config/categories';

interface CategoryFilterProps {
  activeCategory: EventCategory;
  onSelectCategory: (category: EventCategory) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full overflow-x-auto pb-2 -mx-margin px-margin md:mx-0 md:px-0 no-scrollbar">
      <div className="flex items-center gap-2 min-w-max" id="category-pills">
        {eventCategories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`cat-pill px-space-md py-2 rounded-full font-label-md text-label-md transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
