import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { PreviewModal } from '@/components/templates/PreviewModal';
import { templatesRegistry } from '@/templates/registry';
import { momentCategories } from '@/config/categories';
import { TemplateMetadata } from '@/types/template';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPreview, setSelectedPreview] = useState<TemplateMetadata | null>(null);

  const featuredTemplates = templatesRegistry.slice(0, 3);
  const birthdayTemplates = templatesRegistry.filter((t) => t.category === 'birthday');
  const weddingTemplates = templatesRegistry.filter((t) => t.category === 'wedding');
  const portfolioTemplates = templatesRegistry.filter((t) => t.category === 'portfolio');
  const restaurantTemplates = templatesRegistry.filter((t) => t.category === 'restaurant');

  return (
    <div className="min-h-screen bg-surface flex flex-col antialiased">
      <Navbar />

      <main className="w-full pt-28 bg-surface flex-1">
        {/* ========================================================================= */}
        {/* SECTION 1: HERO (Asymmetric Architectural Gallery Montage)                */}
        {/* ========================================================================= */}
        <section className="relative w-full overflow-hidden bg-surface pb-space-xl border-b border-surface-container-high/40">
          <div className="max-w-[1440px] mx-auto px-margin-sm md:px-margin lg:px-margin-lg pt-space-lg lg:pt-space-xl">
            {/* Typographic Header Block */}
            <div className="max-w-3xl flex flex-col items-start gap-space-sm mb-space-xl">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm tracking-widest uppercase shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container"></span>
                <span>Curated Web Artifacts</span>
              </div>

              <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight leading-[1.05]">
                Templates made to be yours.
              </h1>

              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
                Discover beautiful templates for every idea, occasion, and business. Impeccably crafted digital foundations engineered for effortless customization.
              </p>

              <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
                <Link
                  to="/templates"
                  className="h-10 px-6 rounded-lg bg-primary text-on-primary font-label-md text-label-md inline-flex items-center justify-center hover:bg-primary-container transition-all shadow-sm font-medium"
                >
                  Explore Templates
                </Link>
                <Link
                  to="/templates?price=free"
                  className="h-10 px-5 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md inline-flex items-center justify-center hover:bg-surface-container transition-all shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-surface-container-high/60"
                >
                  Browse Free Templates
                </Link>
              </div>
            </div>

            {/* Asymmetric Overlapping Montage Stage (Desktop) */}
            <div className="relative w-full h-[620px] lg:h-[700px] hidden md:block select-none">
              {/* Card 4: Floating Top-Right (Studio 24) */}
              <div
                onClick={() => navigate('/templates/confetti-co')}
                className="absolute right-4 top-2 w-[340px] z-10 rounded-xl overflow-hidden bg-surface-container-lowest shadow-md transition-transform duration-300 hover:scale-[1.02] border border-surface-container-high cursor-pointer"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover"
                    alt="Studio 24"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAWQkr4FFuZQ3Xl6IdvurpLP3ZcAUT1cCkUfFgQwbxDDDSH7jdbLldjU6dSe6xVdFfmWKc8VTFJzkJxWuYelHwUAGEeoXHtLqEXa2VcBK7YW6qrlmeMdz8XVTQYmspIzDszPp7BBBBopi6BvwZVVceRcRLYkJa7j9e0nfOJ8pKrUd9B5pkNFpsCjPGhxVXUMh5SmMf4AfsJHrQO1wx4v4Yobt_ITRPUfc_eHXok5VluYH_nECs6bo"
                  />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm">
                    Birthday · RSVP
                  </span>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <p className="font-headline-sm text-headline-sm text-on-surface leading-tight">Studio 24</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Party & Gathering Hub</p>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">$18</span>
                </div>
              </div>

              {/* Card 2: Overlapping Left (Solstice & Sage) */}
              <div
                onClick={() => navigate('/templates/solstice-sage')}
                className="absolute left-0 top-16 w-[410px] z-20 rounded-xl overflow-hidden bg-surface-container-lowest shadow-lg transition-transform duration-300 hover:scale-[1.02] border border-surface-container-high cursor-pointer"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover"
                    alt="Solstice & Sage"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmt5RIs_yPTnRUJB9sHcya3AfXqxgfwcjSW7zGr2e3p3GLMI1Zoxq4PnoI2IPJUH6Q5cKyfJo3Fb0-lNoLsjAEM3ssCE5z20YF74vEbUcDcncs259oPsDWuMokiyLPLCRQebSbJXbhIoB1_NhfFp7u7gnOojIfZlldKKHV2lXA9isJ7hmqzkyS82GVKZP5jctWFtz6AyWKnNI2wCPGbX0aJi7ZDyLrAEblaHfLLF7MvpwT63CdNTA"
                  />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm">
                    Wedding · Ceremony
                  </span>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-headline-sm text-headline-sm text-on-surface leading-tight">Solstice & Sage</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Editorial Wedding Suite</p>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">$29</span>
                </div>
              </div>

              {/* Card 1: CENTERPIECE (Atelier Nord) */}
              <div
                onClick={() => navigate('/templates/atelier-nord')}
                className="absolute left-1/2 -translate-x-1/2 top-4 w-[540px] z-30 rounded-xl overflow-hidden bg-surface-container-lowest shadow-2xl transition-transform duration-300 hover:scale-[1.01] border border-surface-container-high cursor-pointer"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover"
                    alt="Atelier Nord"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6d_r6FNo0j_g9-iXt4B1Gb-gBv-i7LBjIrgo1ykS-NE7hAyPYhcfTpgwZDzOY-Z4xx_26ZEY5kk2yIy0FLR3ELrSSAM7e8lpqTZUpx6n2iknHVs1BeDBkDpAjGjeR6sEQOpign2N-53iCDulP1g4hOUBvCCCXsIThi-1VuTenEZehqUYoslI6McRsgxMVLlOzS97z1l0zl_UgngHwEzdI2HlYacqJpLQudwNPYuAzIuhUmqILdFQ"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-md bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                      Curator's Choice
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm">
                      Architecture & Design
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-surface-container-lowest flex items-center justify-between">
                  <div>
                    <p className="font-headline-md text-headline-md text-on-surface leading-snug">Atelier Nord</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Comprehensive Studio & Archive Monograph
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">$38</span>
                    <p className="font-label-sm text-label-sm text-on-tertiary-container font-medium">Commercial Ready</p>
                  </div>
                </div>
              </div>

              {/* Card 3: Overlapping Right (Komorebi Eatery) */}
              <div
                onClick={() => navigate('/templates/komorebi-eatery')}
                className="absolute right-8 bottom-14 w-[430px] z-20 rounded-xl overflow-hidden bg-surface-container-lowest shadow-lg transition-transform duration-300 hover:scale-[1.02] border border-surface-container-high cursor-pointer"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover"
                    alt="Komorebi Eatery"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDi2XOK7vCTiCGviozLgg-AGlUOHngekg7Shx5BvmCyRh9bxu1BtR5VItHqNozogBCSE2PonNuR4i5O29F3xcCYS2uzb4McKLQLO_r72zJDPmWvN9uCxlje6tlvYf2sunCzGqtxYLjTXB42mUbzUd36BeDNTgTi5fuaaJGXq7QTCKjXqPDJ73aICLNisA11_0TxPbQpBUVREuzj32bQv4qbG0VNwGCHFSrltnfnIrHLrYw6oPLgBrE"
                  />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm">
                    Culinary & Hospitality
                  </span>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-headline-sm text-headline-sm text-on-surface leading-tight">Komorebi Eatery</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Editorial Dining & Reservations</p>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">$34</span>
                </div>
              </div>

              {/* Card 5: Floating Bottom-Left (Vertex Studio) */}
              <div
                onClick={() => navigate('/templates/vertex-cloud')}
                className="absolute left-16 bottom-4 w-[360px] z-10 rounded-xl overflow-hidden bg-surface-container-lowest shadow-md transition-transform duration-300 hover:scale-[1.02] border border-surface-container-high cursor-pointer"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover"
                    alt="Vertex Studio"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBE4FvltJcAvmtJ4w8varSb8qt3AwF5g8NJDU_8J6_empDyOsooioWsqs7RCBTCCI9Cagl8bp9WWQHjlFBo1RDats8dcHG2lVxxpQ56DiTn5rvaiIaqDT992BpG-GeR4QKMwYuhD_y0zgXNym2qL5PJSmr_oFJU4YQQ1rI6hU7WHXubni5FhiUGxPb78rxnvI3CxZSXAhNJhQwZ_xIrOrjiATTV2_GWpuqt48hYS8a7yUYkOUBw2M4"
                  />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm">
                    Agency · Commerce
                  </span>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <p className="font-headline-sm text-headline-sm text-on-surface leading-tight">Vertex Studio</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Brand & Product Showcase</p>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">$24</span>
                </div>
              </div>
            </div>

            {/* Mobile Hero Card Fallback */}
            <div className="block md:hidden w-full rounded-xl overflow-hidden bg-surface-container-lowest shadow-md border border-surface-container-high">
              <div className="aspect-[16/10] w-full overflow-hidden bg-surface-container relative">
                <img
                  className="w-full h-full object-cover"
                  alt="Atelier Nord"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6d_r6FNo0j_g9-iXt4B1Gb-gBv-i7LBjIrgo1ykS-NE7hAyPYhcfTpgwZDzOY-Z4xx_26ZEY5kk2yIy0FLR3ELrSSAM7e8lpqTZUpx6n2iknHVs1BeDBkDpAjGjeR6sEQOpign2N-53iCDulP1g4hOUBvCCCXsIThi-1VuTenEZehqUYoslI6McRsgxMVLlOzS97z1l0zl_UgngHwEzdI2HlYacqJpLQudwNPYuAzIuhUmqILdFQ"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-primary text-on-primary font-label-sm text-label-sm uppercase font-semibold">
                  Curator's Choice
                </span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-headline-sm text-headline-sm text-on-surface">Atelier Nord</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Architecture & Monograph</p>
                </div>
                <span className="font-label-md text-label-md text-on-surface font-semibold">$38</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: FEATURED / TRENDING (Large Visual Editorial Cards)             */}
        {/* ========================================================================= */}
        <section className="w-full bg-surface-container-low py-space-xl border-b border-surface-container-high/60" id="featured">
          <div className="max-w-[1440px] mx-auto px-margin-sm md:px-margin lg:px-margin-lg">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm mb-space-lg">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container"></span>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                    Weekly Selection
                  </p>
                </div>
                <h2 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                  Featured Releases
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Curated templates selected by our editorial team this week.
                </p>
              </div>

              <Link
                to="/templates"
                className="font-label-md text-label-md text-on-surface flex items-center gap-1 hover:text-on-surface-variant transition-colors group font-semibold"
              >
                <span>View all 240+ items</span>
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </Link>
            </div>

            {/* Grid of 3 Large Editorial Template Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {featuredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onPreviewClick={(t) => setSelectedPreview(t)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: BROWSE BY DISCIPLINE (6 Visual Rich Category Cards)             */}
        {/* ========================================================================= */}
        <section className="w-full bg-surface py-space-xl border-b border-surface-container-high/40" id="categories">
          <div className="max-w-[1440px] mx-auto px-margin-sm md:px-margin lg:px-margin-lg">
            <div className="flex items-center justify-between mb-space-lg">
              <div>
                <h2 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                  Explore by Discipline
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                  Architected layouts tailored precisely for your industry requirements.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {momentCategories.map((cat) => (
                <button
                  key={cat.number}
                  onClick={() => navigate(`/templates?category=${cat.category}`)}
                  className="group relative h-48 rounded-xl overflow-hidden bg-surface-container shadow-sm flex flex-col justify-end p-space-md transition-all duration-300 hover:shadow-md text-left cursor-pointer border border-surface-container-high"
                >
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      src={cat.imageUrl}
                      alt={cat.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent"></div>
                  </div>
                  <div className="relative z-10 text-on-primary">
                    <span className="font-label-sm text-label-sm tracking-wider uppercase opacity-80">
                      {cat.count}
                    </span>
                    <h3 className="font-headline-md text-headline-md font-semibold mt-0.5">
                      {cat.title}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: TOPIC-BASED TEMPLATE GROUPS                                     */}
        {/* ========================================================================= */}
        <div className="w-full flex flex-col gap-space-xl bg-surface-container-low/40 py-space-xl">
          {/* Group 1: Birthday Templates */}
          {birthdayTemplates.length > 0 && (
            <section className="w-full" id="birthday-section">
              <div className="max-w-[1440px] mx-auto px-margin-sm md:px-margin lg:px-margin-lg">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-xs mb-space-md">
                  <div>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                      Birthday Templates
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Celebrate milestone birthdays with vibrant, personalized digital invitations and event hubs.
                    </p>
                  </div>
                  <Link
                    to="/templates?category=birthday"
                    className="font-label-md text-label-md text-on-surface flex items-center gap-1 hover:text-on-surface-variant transition-colors whitespace-nowrap font-medium"
                  >
                    View all Birthday Templates →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
                  {birthdayTemplates.slice(0, 4).map((template) => (
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

          {/* Group 2: Wedding Templates */}
          {weddingTemplates.length > 0 && (
            <section className="w-full" id="wedding-section">
              <div className="max-w-[1440px] mx-auto px-margin-sm md:px-margin lg:px-margin-lg">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-xs mb-space-md">
                  <div>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                      Wedding & Union Templates
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Timeless digital invitations, gift registries, and story pages designed for unforgettable moments.
                    </p>
                  </div>
                  <Link
                    to="/templates?category=wedding"
                    className="font-label-md text-label-md text-on-surface flex items-center gap-1 hover:text-on-surface-variant transition-colors whitespace-nowrap font-medium"
                  >
                    View all Wedding Templates →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
                  {weddingTemplates.slice(0, 4).map((template) => (
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

          {/* Group 3: Portfolio Templates */}
          {portfolioTemplates.length > 0 && (
            <section className="w-full" id="portfolio-section">
              <div className="max-w-[1440px] mx-auto px-margin-sm md:px-margin lg:px-margin-lg">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-xs mb-space-md">
                  <div>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                      Portfolios & Creative Monographs
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Showcase architectural case studies, photography collections, and design systems with quiet luxury.
                    </p>
                  </div>
                  <Link
                    to="/templates?category=portfolio"
                    className="font-label-md text-label-md text-on-surface flex items-center gap-1 hover:text-on-surface-variant transition-colors whitespace-nowrap font-medium"
                  >
                    View all Portfolio Templates →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
                  {portfolioTemplates.slice(0, 4).map((template) => (
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

          {/* Group 4: Restaurant & Hospitality Templates */}
          {restaurantTemplates.length > 0 && (
            <section className="w-full" id="restaurant-section">
              <div className="max-w-[1440px] mx-auto px-margin-sm md:px-margin lg:px-margin-lg">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-xs mb-space-md">
                  <div>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                      Culinary, Hospitality & Cafés
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Atmospheric digital menus, tasting journals, and reservation hubs for dining destinations.
                    </p>
                  </div>
                  <Link
                    to="/templates?category=restaurant"
                    className="font-label-md text-label-md text-on-surface flex items-center gap-1 hover:text-on-surface-variant transition-colors whitespace-nowrap font-medium"
                  >
                    View all Culinary Templates →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
                  {restaurantTemplates.slice(0, 4).map((template) => (
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
