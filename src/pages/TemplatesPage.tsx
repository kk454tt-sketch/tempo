import React, { useState } from 'react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { CategoryFilter } from '@/components/templates/CategoryFilter';
import { TemplateGrid } from '@/components/templates/TemplateGrid';
import { getTemplatesByCategory } from '@/templates/registry';
import { EventCategory } from '@/types/template';

export const TemplatesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>('all');
  const templates = getTemplatesByCategory(selectedCategory);

  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Navbar />

      <main className="w-full pt-[72px] min-h-screen bg-surface flex-1">
        <div className="max-w-[1280px] mx-auto px-margin md:px-margin-desktop py-space-xl flex flex-col space-y-space-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                Curated Gallery
              </span>
              <h1 className="font-display-lg text-headline-lg md:text-display-lg text-on-surface tracking-tight mt-1">
                Made for your moment
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mt-1">
                Choose an editorial starting design tailored with distinct typography, layout rhythms, and keepsake quality.
              </p>
            </div>
            <div className="flex items-center gap-space-xs text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-medium">
                {templates.length} bespoke templates available
              </span>
            </div>
          </div>

          <CategoryFilter
            activeCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* 2-Card Grid Layout */}
          <TemplateGrid templates={templates} />
        </div>
      </main>

      <Footer />
    </div>
  );
};
