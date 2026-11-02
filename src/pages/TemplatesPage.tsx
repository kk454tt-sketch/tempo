import { universalTemplateSearch, POPULAR_SEARCH_PILLS } from '@/utils/searchHelper';
import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { PreviewModal } from '@/components/templates/PreviewModal';
import { CategoryFilter } from '@/components/templates/CategoryFilter';
import { templatesRegistry } from '@/templates/registry';
import { TemplateMetadata, EventCategory } from '@/types/template';

export const TemplatesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPreview, setSelectedPreview] = useState<TemplateMetadata | null>(null);

  const query = searchParams.get('q') || '';
  const categoryParam = (searchParams.get('category') as EventCategory) || 'all';
  const priceParam = searchParams.get('price') || 'all'; // 'all' | 'free' | 'premium'
  const sortParam = searchParams.get('sort') || 'popular'; // 'popular' | 'newest' | 'price-low' | 'price-high'

  const [searchInputValue, setSearchInputValue] = useState(query);

  // Whether any filter/search is active
  const hasActiveFilter = !!(query || categoryParam !== 'all' || priceParam !== 'all');

  // Per-category template lists for explore sections (shown when no filter active)
  const birthdayTemplates = useMemo(() => templatesRegistry.filter((t) => t.category === 'birthday').slice(0, 4), []);
  const weddingTemplates = useMemo(() => templatesRegistry.filter((t) => t.category === 'wedding').slice(0, 4), []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInputValue.trim()) {
      newParams.set('q', searchInputValue.trim());
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  const clearSearch = () => {
    setSearchInputValue('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('q');
    setSearchParams(newParams);
  };

  const handleCategorySelect = (cat: EventCategory) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  const handlePriceChange = (price: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (price === 'all') {
      newParams.delete('price');
    } else {
      newParams.set('price', price);
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (sort: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (sort === 'popular') {
      newParams.delete('sort');
    } else {
      newParams.set('sort', sort);
    }
    setSearchParams(newParams);
  };

    // Universal Search with Typo Tolerance and Multi-Category Lookup
  const searchOutcome = useMemo(() => {
    return universalTemplateSearch(templatesRegistry, query, categoryParam);
  }, [query, categoryParam]);

  // Filter & Sort Logic
  const filteredTemplates = useMemo(() => {
    let list = searchOutcome.results;

    // Price filter
    if (priceParam === 'free') {
      list = list.filter((t) => t.isFree || t.price === 0);
    } else if (priceParam === 'premium') {
      list = list.filter((t) => !t.isFree && t.price !== 0);
    }

    // Sort
    return [...list].sort((a, b) => {
      if (sortParam === 'price-low') {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortParam === 'price-high') {
        return (b.price || 0) - (a.price || 0);
      }
      if (sortParam === 'newest') {
        return b.id.localeCompare(a.id);
      }
      return (b.rating || 0) - (a.rating || 0);
    });
  }, [searchOutcome, priceParam, sortParam]);

  return (
    <div className="min-h-screen bg-surface flex flex-col antialiased">
      <Navbar />

      <main className="w-full pt-20 bg-surface flex-1">
        <div className="flex flex-col w-full">
          {/* Header & Search Bar & Category Filter */}
          <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-margin md:px-margin lg:px-margin-lg pt-4 pb-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="font-headline-xl text-2xl sm:text-3xl text-on-surface font-semibold tracking-tight">
                  Explore Templates
                </h1>
                <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-0.5">
                  Handcrafted digital experiences for birthdays and weddings.
                </p>
              </div>

              <div className="w-full md:max-w-md">
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex items-center w-full shadow-sm rounded-xl bg-surface-container-lowest border border-surface-container-high transition-all focus-within:shadow-md focus-within:border-on-surface"
                >
                  <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
                    search
                  </span>
                  <input
                    value={searchInputValue}
                    onChange={(e) => setSearchInputValue(e.target.value)}
                    className="w-full h-11 sm:h-12 pl-10 sm:pl-12 pr-20 rounded-xl bg-transparent font-body-md text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none"
                    placeholder="Search templates by name, style, or tag..."
                    type="text"
                  />
                  <div className="absolute right-3 flex items-center gap-1.5">
                    {query && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                        title="Clear search"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    )}
                    <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-[11px] pointer-events-none">
                      ⌘K
                    </span>
                  </div>
                                </form>

                {/* Popular Keywords & Quick Suggestion Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 scrollbar-none text-xs">
                  <span className="text-on-surface-variant text-[11px] whitespace-nowrap shrink-0">Try:</span>
                  {POPULAR_SEARCH_PILLS.map((pill) => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => {
                        setSearchInputValue(pill);
                        const p = new URLSearchParams(searchParams);
                        p.set('q', pill);
                        setSearchParams(p);
                      }}
                      className="px-2.5 py-0.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface text-[11px] whitespace-nowrap transition-colors cursor-pointer border border-surface-container-high/60"
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Filter Pills (smooth horizontal scroll, no lines) */}
            <CategoryFilter
              activeCategory={categoryParam}
              onSelectCategory={handleCategorySelect}
            />
          </section>

          {/* Sub-controls Bar: Count & Filters/Sort (NO top/bottom line) */}
          <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-margin md:px-margin lg:px-margin-lg pt-2 pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-body-sm text-xs sm:text-sm text-on-surface font-semibold">
                  Showing {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'}
                </span>
                {query && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                    <span className="font-body-sm text-xs sm:text-sm text-on-surface-variant">
                      for "{query}"
                    </span>
                  </>
                )}
                {categoryParam !== 'all' && (
                  <button
                    onClick={() => handleCategorySelect('all')}
                    className="ml-2 inline-flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer font-medium"
                  >
                    <span>Clear category</span>
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                {/* Price Filter Dropdown */}
                <div className="relative">
                  <select
                    value={priceParam}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="appearance-none h-9 pl-3 pr-8 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-xs sm:text-sm shadow-sm border border-surface-container-high cursor-pointer hover:bg-surface-container transition-colors focus:outline-none"
                  >
                    <option value="all">All Prices</option>
                    <option value="free">Free Only</option>
                    <option value="premium">Premium Only</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-2.5 text-on-surface-variant pointer-events-none text-[16px]">
                    expand_more
                  </span>
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortParam}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none h-9 pl-3 pr-8 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-xs sm:text-sm shadow-sm border border-surface-container-high cursor-pointer hover:bg-surface-container transition-colors focus:outline-none"
                  >
                    <option value="popular">Sort by: Most Popular</option>
                    <option value="newest">Sort by: Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-2.5 text-on-surface-variant pointer-events-none text-[16px]">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* MAIN TEMPLATES GRID (2 cols mobile, 2 col tablet, 3 col desktop) */}
          <section className="w-full max-w-[1440px] mx-auto px-3 sm:px-margin md:px-margin lg:px-margin-lg pb-10">
            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onPreviewClick={(t) => setSelectedPreview(t)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-surface-container-lowest rounded-2xl p-8 border border-surface-container-high shadow-sm max-w-lg mx-auto">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant/60 mb-2">
                  search_off
                </span>
                <h3 className="font-headline-md text-lg font-semibold text-on-surface">No templates found</h3>
                <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1 max-w-sm mx-auto">
                  We couldn't find any templates matching your criteria. Try adjusting your filters or search keyword.
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      clearSearch();
                      handleCategorySelect('all');
                      handlePriceChange('all');
                    }}
                    className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-xs sm:text-sm font-medium hover:bg-primary/90 transition-all cursor-pointer"
                  >
                    Reset all filters
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* DEDICATED TOPIC EXPLORE SECTIONS (shown when browsing all templates) */}
          {!hasActiveFilter && (
            <div className="w-full flex flex-col gap-12 bg-surface-container-low/40 py-12">
              {/* Birthday Explore Section (Single row 2 templates on mobile) */}
              {birthdayTemplates.length > 0 && (
                <section className="w-full" id="birthday-section">
                  <div className="max-w-[1440px] mx-auto px-3 sm:px-margin md:px-margin lg:px-margin-lg">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4 sm:mb-6">
                      <div>
                        <h2 className="font-headline-lg text-lg sm:text-2xl font-bold text-on-surface tracking-tight">
                          Birthday Templates
                        </h2>
                        <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant mt-0.5">
                          Celebrate milestone birthdays with vibrant, personalized digital invitations, route maps, and music.
                        </p>
                      </div>
                      <button
                        onClick={() => handleCategorySelect('birthday')}
                        className="font-label-md text-xs sm:text-sm text-primary flex items-center gap-1 hover:underline whitespace-nowrap font-semibold cursor-pointer"
                      >
                        View all Birthday Templates →
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                      {birthdayTemplates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onPreviewClick={(t) => setSelectedPreview(t)}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Wedding Explore Section (Single row 2 templates on mobile) */}
              {weddingTemplates.length > 0 && (
                <section className="w-full" id="wedding-section">
                  <div className="max-w-[1440px] mx-auto px-3 sm:px-margin md:px-margin lg:px-margin-lg">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4 sm:mb-6">
                      <div>
                        <h2 className="font-headline-lg text-lg sm:text-2xl font-bold text-on-surface tracking-tight">
                          Wedding &amp; Union Templates
                        </h2>
                        <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant mt-0.5">
                          Timeless digital invitations, gift registries, and story pages designed for unforgettable moments.
                        </p>
                      </div>
                      <button
                        onClick={() => handleCategorySelect('wedding')}
                        className="font-label-md text-xs sm:text-sm text-primary flex items-center gap-1 hover:underline whitespace-nowrap font-semibold cursor-pointer"
                      >
                        View all Wedding Templates →
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                      {weddingTemplates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onPreviewClick={(t) => setSelectedPreview(t)}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              )}

              
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Interactive Modal Preview */}
      <PreviewModal
        template={selectedPreview}
        isOpen={selectedPreview !== null}
        onClose={() => setSelectedPreview(null)}
      />
    </div>
  );
};
