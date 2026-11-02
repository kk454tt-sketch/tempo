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
    <div className="w-full overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex items-center gap-2 min-w-max py-1" id="category-pills">
        {eventCategories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-full font-label-md text-xs sm:text-sm transition-all duration-200 cursor-pointer select-none whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-on-primary font-semibold shadow-sm scale-[1.02]'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-medium'
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
