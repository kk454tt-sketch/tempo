import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { PreviewModal } from '@/components/templates/PreviewModal';
import { templatesRegistry } from '@/templates/registry';
import { eventCategories } from '@/config/categories';
import { TemplateMetadata, EventCategory } from '@/types/template';

export const TemplatesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPreview, setSelectedPreview] = useState<TemplateMetadata | null>(null);

  const query = searchParams.get('q') || '';
  const categoryParam = (searchParams.get('category') as EventCategory) || 'all';
  const priceParam = searchParams.get('price') || 'all'; // 'all' | 'free' | 'premium'
  const sortParam = searchParams.get('sort') || 'popular'; // 'popular' | 'newest' | 'price-low' | 'price-high'

  const [searchInputValue, setSearchInputValue] = useState(query);

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

  // Filter & Sort Logic
  const filteredTemplates = useMemo(() => {
    return templatesRegistry.filter((template) => {
      // Category filter
      if (categoryParam !== 'all' && template.category !== categoryParam) {
        return false;
      }
      // Price filter
      if (priceParam === 'free' && !template.isFree && template.price !== 0) {
        return false;
      }
      if (priceParam === 'premium' && (template.isFree || template.price === 0)) {
        return false;
      }
      // Search query filter
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const matchesName = template.name.toLowerCase().includes(q);
        const matchesDesc = template.description.toLowerCase().includes(q);
        const matchesCategory = template.categoryLabel.toLowerCase().includes(q);
        const matchesAuthor = (template.author || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCategory && !matchesAuthor) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortParam === 'price-low') {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortParam === 'price-high') {
        return (b.price || 0) - (a.price || 0);
      }
      if (sortParam === 'newest') {
        return (b.id.localeCompare(a.id));
      }
      // Default: popular / rating
      return (b.rating || 0) - (a.rating || 0);
    });
  }, [categoryParam, priceParam, query, sortParam]);

  const isFreeView = priceParam === 'free';

  return (
    <div className="min-h-screen bg-surface flex flex-col antialiased">
      <Navbar />

      <main className="w-full pt-28 bg-surface flex-1">
        <div className="flex flex-col w-full">
          {/* ========================================================================= */}
          {/* DISCOVERY HERO HEADER                                                     */}
          {/* ========================================================================= */}
          <section className="w-full max-w-[1440px] mx-auto px-margin-sm md:px-margin lg:px-margin-lg pt-space-lg pb-space-md">
            {isFreeView ? (
              /* Curated Free Archive Banner Header */
              <div className="relative bg-surface-container-lowest rounded-2xl p-space-lg md:p-space-xl shadow-sm overflow-hidden border border-surface-container-high/60">
                <div className="absolute -right-24 -top-24 w-96 h-96 bg-tertiary-fixed-dim/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 max-w-3xl space-y-space-sm">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface">
                    <span className="w-2 h-2 rounded-full bg-on-tertiary-container"></span>
                    <span>CURATED FREE ARCHIVE</span>
                  </div>
                  <h1 className="font-headline-xl text-headline-xl md:text-display-hero md:font-display-hero text-on-surface tracking-tight">
                    Free Templates
                  </h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                    Beautiful, production-ready templates you can start using immediately without paying a cent. Handcrafted layouts engineered with typographic discipline and clean modular code.
                  </p>
                  <div className="pt-space-sm flex flex-wrap items-center gap-space-sm">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md shadow-sm">
                      <span className="material-symbols-outlined text-[18px] text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                      <span>No credit card required</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md shadow-sm">
                      <span className="material-symbols-outlined text-[18px] text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                      <span>Personal & Commercial use</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md shadow-sm">
                      <span className="material-symbols-outlined text-[18px] text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                      <span>Figma & Code included</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Standard Discovery Header */
              <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-space-sm">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container"></span>
                  <span>Curated Release • Studio Collection</span>
                </div>
                <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                  Explore Templates
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                  Discover curated website templates, invitations, and digital experiences crafted with architectural precision.
                </p>

                {/* Main Search Input */}
                <div className="w-full pt-space-sm">
                  <form
                    onSubmit={handleSearchSubmit}
                    className="relative flex items-center w-full shadow-sm rounded-xl bg-surface-container-lowest border border-surface-container-high transition-all focus-within:shadow-md focus-within:border-on-surface"
                  >
                    <span className="material-symbols-outlined absolute left-4 text-on-surface-variant text-[22px] pointer-events-none">
                      search
                    </span>
                    <input
                      value={searchInputValue}
                      onChange={(e) => setSearchInputValue(e.target.value)}
                      className="w-full h-12 pl-12 pr-24 rounded-xl bg-transparent font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none"
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
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      )}
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm pointer-events-none">
                        ⌘K
                      </span>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>

          {/* ========================================================================= */}
          {/* HORIZONTAL CATEGORY PILLS BAR                                             */}
          {/* ========================================================================= */}
          <section className="w-full max-w-[1440px] mx-auto px-margin-sm md:px-margin lg:px-margin-lg py-space-sm">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
              {eventCategories.map((cat) => {
                const isSelected = categoryParam === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`px-4 py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap shadow-sm transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-primary text-on-primary border-primary font-medium'
                        : 'bg-surface-container-lowest text-on-surface-variant border-surface-container-high hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    {cat.label} {cat.count ? `(${cat.count})` : ''}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SUB-CONTROLS BAR: Count & Filters/Sort                                     */}
          {/* ========================================================================= */}
          <section className="w-full max-w-[1440px] mx-auto px-margin-sm md:px-margin lg:px-margin-lg pt-space-xs pb-space-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm pb-space-xs border-b border-surface-container-high/40">
              <div className="flex items-center gap-space-xs">
                <span className="font-body-sm text-body-sm text-on-surface font-semibold">
                  Showing {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'}
                </span>
                {query && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      for "{query}"
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-space-sm w-full sm:w-auto justify-between sm:justify-end">
                {/* Price Filter Dropdown */}
                <div className="relative">
                  <select
                    value={priceParam}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="appearance-none h-9 pl-3 pr-8 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm border border-surface-container-high cursor-pointer hover:bg-surface-container transition-colors focus:outline-none"
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
                    className="appearance-none h-9 pl-3 pr-8 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm border border-surface-container-high cursor-pointer hover:bg-surface-container transition-colors focus:outline-none"
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

          {/* ========================================================================= */}
          {/* TEMPLATE GRID                                                             */}
          {/* ========================================================================= */}
          <section className="w-full max-w-[1440px] mx-auto px-margin-sm md:px-margin lg:px-margin-lg py-space-md mb-space-xl">
            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter-lg">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onPreviewClick={(t) => setSelectedPreview(t)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-space-xl text-center bg-surface-container-lowest rounded-2xl p-space-xl border border-surface-container-high shadow-sm max-w-lg mx-auto">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant/60 mb-space-sm">
                  search_off
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface">No templates found</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-sm mx-auto">
                  We couldn't find any templates matching your search criteria. Try adjusting your filters or search keyword.
                </p>
                <div className="mt-space-md flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      clearSearch();
                      handleCategorySelect('all');
                      handlePriceChange('all');
                    }}
                    className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container transition-all cursor-pointer"
                  >
                    Reset all filters
                  </button>
                </div>
              </div>
            )}
          </section>
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
