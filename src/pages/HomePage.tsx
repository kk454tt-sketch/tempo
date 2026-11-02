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

  const portfolioTemplates = templatesRegistry.filter((t) => t.category === 'portfolio');
  const featuredTemplates = portfolioTemplates.slice(0, 3);
  const birthdayTemplates = templatesRegistry.filter((t) => t.category === 'birthday');
  const weddingTemplates = templatesRegistry.filter((t) => t.category === 'wedding');

  return (
    <div className="min-h-screen bg-surface flex flex-col antialiased">
      <Navbar />

      <main className="w-full pt-20 bg-surface flex-1">
        {/* ========================================================================= */}
        {/* SECTION 1: HERO (Asymmetric Architectural Gallery Montage)                */}
        {/* ========================================================================= */}
        <section className="relative w-full overflow-hidden bg-surface pb-space-xl border-b border-surface-container-high/40">
          <div className="max-w-[1440px] mx-auto px-margin-sm md:px-margin lg:px-margin-lg pt-space-lg lg:pt-space-xl">
            {/* Typographic Header Block */}
            <div className="max-w-3xl flex flex-col items-start gap-space-sm mb-space-xl">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm tracking-widest uppercase shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Next-Gen 3D &amp; Creator Portfolios</span>
              </div>

              <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight leading-[1.05]">
                Portfolios made to command attention.
              </h1>

              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
                Showcase your engineering craft, 3D character art, Minecraft worlds, and motion reels. Featuring interactive 3D avatars, tilt physics, and instant WhatsApp inquiry contact.
              </p>

              <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
                <Link
                  to="/templates?category=portfolio"
                  className="h-10 px-6 rounded-lg bg-primary text-on-primary font-label-md text-label-md inline-flex items-center justify-center hover:bg-primary-container transition-all shadow-sm font-semibold"
                >
                  Explore Portfolios
                </Link>
                <Link
                  to="/templates"
                  className="h-10 px-5 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md inline-flex items-center justify-center hover:bg-surface-container transition-all shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-surface-container-high/60"
                >
                  Browse All Templates
                </Link>
              </div>
            </div>

            {/* Asymmetric Overlapping Montage Stage (Desktop) */}
            <div className="relative w-full h-[620px] lg:h-[700px] hidden md:block select-none">
              {/* Card 4: Floating Top-Right (2022 Design Gallery Portfolio) */}
              <div
                onClick={() => navigate('/templates/design-gallery-portfolio')}
                className="absolute right-4 top-2 w-[340px] z-10 rounded-xl overflow-hidden bg-surface-container-lowest shadow-md transition-transform duration-300 hover:scale-[1.02] border border-surface-container-high cursor-pointer"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover"
                    alt="2022 Design Gallery Portfolio"
                    src="/templates/design-gallery-portfolio-poster.png"
                  />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm font-bold text-primary">
                    Swiss Editorial · Brutalist
                  </span>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <p className="font-headline-sm text-headline-sm text-on-surface leading-tight font-bold">Design Gallery</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Editorial Archive &amp; Ribbons</p>
                  </div>
                  <span className="font-label-md text-label-md text-emerald-600 font-bold">FREE</span>
                </div>
              </div>

              {/* Card 2: Overlapping Left (3D in Motion Portfolio) */}
              <div
                onClick={() => navigate('/templates/3d-in-motion-portfolio')}
                className="absolute left-0 top-16 w-[410px] z-20 rounded-xl overflow-hidden bg-surface-container-lowest shadow-lg transition-transform duration-300 hover:scale-[1.02] border border-surface-container-high cursor-pointer"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover"
                    alt="3D in Motion Portfolio"
                    src="/templates/3d-in-motion-portfolio-poster.png"
                  />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm">
                    3D Motion · Character Art
                  </span>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-headline-sm text-headline-sm text-on-surface leading-tight">3D in Motion</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">3D Character Artist &amp; Animator</p>
                  </div>
                  <span className="font-label-md text-label-md text-emerald-600 font-bold">FREE</span>
                </div>
              </div>

              {/* Card 1: CENTERPIECE (3D Web Developer Portfolio) */}
              <div
                onClick={() => navigate('/templates/web-developer-portfolio')}
                className="absolute left-1/2 -translate-x-1/2 top-4 w-[540px] z-30 rounded-xl overflow-hidden bg-surface-container-lowest shadow-2xl transition-transform duration-300 hover:scale-[1.01] border border-surface-container-high cursor-pointer ring-2 ring-primary/20"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover"
                    alt="3D Web Developer Portfolio"
                    src="/templates/web-developer-portfolio-poster.png"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-md bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                      Featured Portfolio
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm">
                      3D Figurines · WhatsApp Hire
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-surface-container-lowest flex items-center justify-between">
                  <div>
                    <p className="font-headline-md text-headline-md text-on-surface leading-snug">3D Web Developer Portfolio</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Dual Collectible Avatars &amp; Stage Tilt Physics
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-label-md text-label-md text-emerald-600 font-bold">FREE</span>
                    <p className="font-label-sm text-label-sm text-on-tertiary-container font-medium">Interactive 3D</p>
                  </div>
                </div>
              </div>

              {/* Card 3: Overlapping Right (Alex 3D Designer Portfolio) */}
              <div
                onClick={() => navigate('/templates/alex-3d-designer-portfolio')}
                className="absolute right-8 bottom-14 w-[430px] z-20 rounded-xl overflow-hidden bg-surface-container-lowest shadow-lg transition-transform duration-300 hover:scale-[1.02] border border-surface-container-high cursor-pointer"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover"
                    alt="Alex 3D Designer Portfolio"
                    src="/templates/alex-3d-designer-portfolio-poster.png"
                  />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm">
                    Interactive 3D · Tilt Physics
                  </span>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-headline-sm text-headline-sm text-on-surface leading-tight">Alex 3D Designer</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Sensory Head-Tilt &amp; Ornaments</p>
                  </div>
                  <span className="font-label-md text-label-md text-emerald-600 font-bold">FREE</span>
                </div>
              </div>

              {/* Card 5: Floating Bottom-Left (Motion Graphics Designer Portfolio) */}
              <div
                onClick={() => navigate('/templates/motion-designer-portfolio')}
                className="absolute left-16 bottom-4 w-[360px] z-10 rounded-xl overflow-hidden bg-surface-container-lowest shadow-md transition-transform duration-300 hover:scale-[1.02] border border-surface-container-high cursor-pointer"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover"
                    alt="Motion Graphics Designer Portfolio"
                    src="/templates/motion-designer-portfolio-poster.png"
                  />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm">
                    Motion &amp; VFX Showreel
                  </span>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <p className="font-headline-sm text-headline-sm text-on-surface leading-tight">Motion Graphics</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Cinematic Reel &amp; Kinetic FX</p>
                  </div>
                  <span className="font-label-md text-label-md text-emerald-600 font-bold">FREE</span>
                </div>
              </div>
            </div>

            {/* Mobile Hero Card Fallback */}
            <div className="block md:hidden w-full rounded-xl overflow-hidden bg-surface-container-lowest shadow-md border border-surface-container-high">
              <div className="aspect-[16/10] w-full overflow-hidden bg-surface-container relative">
                <img
                  className="w-full h-full object-cover"
                  alt="3D Web Developer Portfolio"
                  src="/templates/web-developer-portfolio-poster.png"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-primary text-on-primary font-label-sm text-label-sm uppercase font-semibold">
                  Featured Portfolio
                </span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-headline-sm text-headline-sm text-on-surface font-bold">3D Web Developer Portfolio</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Interactive 3D Avatars &amp; Stage Tilt</p>
                </div>
                <span className="font-label-md text-label-md text-emerald-600 font-bold">FREE</span>
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
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                    Editor's Spotlight
                  </p>
                </div>
                <h2 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                  Featured Portfolios &amp; Showcases
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  High-impact portfolios engineered for engineers, designers, artists, and creators.
                </p>
              </div>

              <Link
                to="/templates?category=portfolio"
                className="font-label-md text-label-md text-on-surface flex items-center gap-1 hover:text-on-surface-variant transition-colors group font-semibold"
              >
                <span>View all portfolios</span>
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
        {/* SECTION 3: BROWSE BY CATEGORY (Full-bleed Editorial Photo Grid)           */}
        {/* ========================================================================= */}
        <section className="w-full bg-surface-container-low py-space-xl" id="categories">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-margin md:px-margin lg:px-margin-lg">
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container"></span>
                  <p className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                    Browse by Category
                  </p>
                </div>
                <h2 className="font-headline-xl text-2xl sm:text-3xl text-on-surface tracking-tight font-semibold">
                  Every occasion, covered.
                </h2>
              </div>
              <Link
                to="/templates"
                className="hidden sm:flex font-label-md text-sm text-primary items-center gap-1 hover:underline transition-colors group font-semibold"
              >
                <span>View all templates</span>
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
              {momentCategories.map((cat) => (
                <button
                  key={cat.number}
                  onClick={() => navigate(`/templates?category=${cat.category}`)}
                  className="group relative h-40 sm:h-48 rounded-xl overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm hover:shadow-md transition-all duration-300 text-left"
                >
                  {/* Full-bleed photo */}
                  <img
                    src={cat.imageUrl}
                    alt={cat.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  {/* Deep gradient for legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  {/* Hover scrim */}
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Bottom label */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col items-start z-10 text-left">
                    <span className="font-label-sm text-xs text-white/70 uppercase tracking-wider font-medium">
                      {cat.count}
                    </span>
                    <h3 className="font-headline-sm text-base sm:text-lg text-white font-semibold leading-snug line-clamp-2 mt-0.5">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-white/80 mt-0.5 line-clamp-1">{cat.subtitle}</p>
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
                    {/* Group 0: Developer Portfolio */}
          {portfolioTemplates.length > 0 && (
            <section className="w-full" id="portfolio-section">
              <div className="max-w-[1440px] mx-auto px-margin-sm md:px-margin lg:px-margin-lg">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-xs mb-space-md">
                  <div>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                      Developer &amp; Creator Portfolios
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Showcase high-impact engineering work with 3D figurines, interactive kinetic typography, and direct WhatsApp contact.
                    </p>
                  </div>
                  <Link
                    to="/templates?category=portfolio"
                    className="font-label-md text-label-md text-on-surface flex items-center gap-1 hover:text-on-surface-variant transition-colors whitespace-nowrap font-medium"
                  >
                    View all Portfolios &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
                  {portfolioTemplates.map((template) => (
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
                      Celebrate milestone birthdays with vibrant, personalized digital invitations, wax seals, and event hubs.
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
                      Wedding &amp; Union Templates
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Timeless digital invitations, cinematic 3D experiences, and botanical evening pages.
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
