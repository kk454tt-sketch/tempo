import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { PreviewModal } from '@/components/templates/PreviewModal';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { getTemplateById, templatesRegistry } from '@/templates/registry';
import { TemplateMetadata } from '@/types/template';

export const TemplateDetailPage: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [relatedPreview, setRelatedPreview] = useState<TemplateMetadata | null>(null);

  const template = getTemplateById(templateId || '') || templatesRegistry[0];

  // Default gallery images if none configured
  const galleryImages = template.galleryImages && template.galleryImages.length > 0
    ? template.galleryImages
    : [
        template.previewImage,
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAfkVwa9t-n1dR0Ds4Dx2v1Yz5BCE2AsokeX5b2CTFQxsMGKCMbXBY_qSy1USKxz_fEHtO1mbNJiueuH1RQnSXNo6g1jAaH60q3LHTbUcmgUFgCg6HLGOLR8GtkDK0_u86WQmnxyLth8jeiQ4L7GUG8ufoTXE9sL9RNjnG98gKgqafxMWiwJ_ONP6F2TNOH8K2NtLU9IHyRyvlsACJwwATS-DZ5rnJhUOGJBUJ0pXkoP_GPXwyLz4c',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA0I1mfYgDtL9YpudVifuEPjIXgaV2wdrOLO8XqU-B9mj_Li0qCw0BrB6MfnNzAITa0v-V3NRptJPM9r_ZmkDHWz6XNlG2VJ5AQqYkLdHVN76OLMEzL9XXgLUWjQdcalwmCehApYOz21n-bJtzPE0HcZedXiCb2vqKrtgp5Stmd1p_JPwkAmrShqJBLkQYvo7jv69jTqwLPbvm5wtbpS4Zr_mJRMDGgerbvMOJMVN65dKnV9RsDoKg',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBCh4ErbmxyLCCOUSo9LUJjpyYI9Sx62z404fC5woq9ZaxGgmpak8WzGUyYy3vKG0DiM_jhxkrtbRdC9srl8l99CGwGoLTMr1jS4nzD1ni4lh15JUBzHbNhH12SXpRLrs5VPpIeeELr4Hgh028ezGpL-ETHPUpQo57tvHdF-ZvNW1FyQ-Y-wp5ywnivo_rpz_h4SSBp5Sy60BL6McR2Dr-JK0RUwgfR3fVOHqqgF0S3o5Wk-B0RWKQ',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBZw3kf9dyT6cpRtjJRqh6Tq4FGEOmQzgE5cw60HcFRY99nzRd4Yc6qerSIC2SMQkohAHdu8H07XH0vz-d7fO8Q6CCqNk24CFeS53zFjRvNZ9XR1LWF8hPcidzhVx9-E9zd7RPJS8pk6ns8rZNPWMVpivagDQY5HuLtkxh7UsaxwFNZXhscqmmpX9saywxH66efZnfehHgS7hL-eAOgvX7couIwmodJME7OsP5M2GDBp0H2I4IIB4A',
      ];

  const galleryLabels = ['Desktop', 'Mobile', 'RSVP Flow', 'Schedule', 'Registry'];

  const relatedTemplates = templatesRegistry
    .filter((t) => t.id !== template.id && (t.category === template.category || t.isFeatured))
    .slice(0, 3);

  const isFree = template.isFree || template.price === 0;

  return (
    <div className="min-h-screen bg-surface flex flex-col antialiased">
      <Navbar />

      <main className="w-full pt-28 bg-surface flex-1">
        <div className="relative w-full max-w-[1440px] mx-auto px-margin-sm md:px-margin lg:px-margin-lg pt-space-md pb-space-xl">
          {/* Subtle Ambient Top Glow */}
          <div className="absolute -top-12 left-1/3 w-96 h-96 bg-surface-container rounded-full blur-3xl opacity-60 -z-10 pointer-events-none"></div>

          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md mb-space-lg select-none">
            <Link to="/" className="hover:text-on-surface transition-colors">
              Home
            </Link>
            <span className="text-outline-variant font-normal">/</span>
            <Link to="/templates" className="hover:text-on-surface transition-colors">
              Explore
            </Link>
            <span className="text-outline-variant font-normal">/</span>
            <Link to={`/templates?category=${template.category}`} className="hover:text-on-surface transition-colors capitalize">
              {template.categoryLabel}
            </Link>
            <span className="text-outline-variant font-normal">/</span>
            <span className="text-on-surface font-semibold tracking-tight">{template.name}</span>
          </nav>

          {/* ========================================================================= */}
          {/* TOP PRODUCT HERO (2-Column Asymmetric Curated Split)                      */}
          {/* ========================================================================= */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-gutter-lg items-start mb-space-xl">
            {/* Left Column: Visual Showcase Gallery (7 cols on lg) */}
            <div className="lg:col-span-7 flex flex-col gap-space-md">
              {/* Primary Canvas Frame */}
              <div className="relative w-full aspect-[16/10] bg-surface-container-lowest rounded-xl overflow-hidden shadow-xl border border-surface-container-high group">
                <img
                  src={galleryImages[activeGalleryIndex] || template.previewImage}
                  alt={template.name}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.015]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent pointer-events-none opacity-40"></div>

                {/* Top-Right Badge */}
                <div className="absolute top-4 right-4 flex items-center gap-space-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm shadow-md border border-surface-container-high/60">
                    <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
                    <span>Live Architecture</span>
                  </span>
                </div>

                {/* Bottom Left Tag */}
                <div className="absolute bottom-4 left-4">
                  <div className="px-3.5 py-1.5 rounded-lg bg-surface-container-lowest/90 backdrop-blur-md shadow-md text-on-surface font-label-sm text-label-sm flex items-center gap-2 border border-surface-container-high/60">
                    <span className="material-symbols-outlined text-[15px] text-on-surface-variant">devices</span>
                    <span>Retina 4K Canvas · 60fps Transitions</span>
                  </div>
                </div>
              </div>

              {/* Thumbnail Gallery Switcher Strip */}
              <div className="grid grid-cols-5 gap-space-sm pt-space-xs">
                {galleryImages.slice(0, 5).map((img, idx) => {
                  const isActive = activeGalleryIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveGalleryIndex(idx)}
                      className={`relative aspect-[16/10] rounded-lg overflow-hidden bg-surface-container-lowest shadow-sm transition-all border cursor-pointer ${
                        isActive
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface opacity-100 border-primary'
                          : 'opacity-70 hover:opacity-100 border-surface-container-high'
                      }`}
                    >
                      <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
                      <span className="absolute inset-x-0 bottom-0 bg-primary/80 backdrop-blur-[2px] text-on-primary font-label-sm text-[10px] text-center py-0.5">
                        {galleryLabels[idx] || `View ${idx + 1}`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* External Staging Sandbox Launch Bar */}
              <div className="flex items-center justify-between p-space-md rounded-xl bg-surface-container-low shadow-sm border border-surface-container-high/60">
                <div className="flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface">
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface font-semibold">
                      Staging Sandbox Online
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Experience forms, live mockups, and responsive viewport sizing.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm border border-surface-container-high hover:bg-surface-container hover:shadow transition-all group cursor-pointer"
                >
                  <span>Explore Sandbox</span>
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                    open_in_new
                  </span>
                </button>
              </div>
            </div>

            {/* Right Column: Editorial Commercial Sidebar (5 cols on lg) */}
            <div className="lg:col-span-5 flex flex-col gap-space-md">
              {/* Primary Commerce Artifact Card */}
              <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-xl border border-surface-container-high flex flex-col">
                {/* Category & Star Rating */}
                <div className="flex items-center justify-between mb-space-sm">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed font-label-sm text-label-sm tracking-wide">
                    {template.categoryLabel} · Full Website
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    <span>{template.rating || 4.98} ({template.reviewsCount || 42} reviews)</span>
                  </span>
                </div>

                {/* Title & Description */}
                <h1 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight mb-space-xs">
                  {template.name}
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-lg">
                  {template.description}
                </p>

                {/* Pricing Row */}
                <div className="flex items-baseline justify-between py-space-sm mb-space-md border-b border-surface-container">
                  <div>
                    <div className="flex items-baseline gap-space-xs">
                      <span className="font-display-hero text-headline-xl text-on-surface font-medium tracking-tight">
                        {isFree ? 'FREE' : template.priceLabel || `$${template.price}`}
                      </span>
                      {!isFree && <span className="font-body-sm text-body-sm text-on-surface-variant">USD</span>}
                    </div>
                    <p className="font-label-sm text-label-sm text-on-tertiary-container font-medium mt-0.5">
                      {isFree ? 'Free license · Instant clone' : 'One-time purchase · Lifetime source updates'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container font-label-sm text-label-sm text-on-surface">
                      <span className="material-symbols-outlined text-[13px]">shield</span>
                      <span>Commercial Guarantee</span>
                    </span>
                  </div>
                </div>

                {/* Conversion Actions Stack */}
                <div className="flex flex-col gap-space-sm mb-space-lg">
                  <button
                    onClick={() => navigate(`/create/${template.id}`)}
                    className="w-full h-11 px-6 rounded-lg bg-primary text-on-primary font-headline-sm text-label-md flex items-center justify-center gap-2 shadow-md hover:bg-primary-container active:scale-[0.99] transition-all cursor-pointer font-medium"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isFree ? 'auto_fix_high' : 'shopping_bag'}
                    </span>
                    <span>
                      {isFree ? 'Use Free Template' : `Customize Template — ${template.priceLabel || `$${template.price}`}`}
                    </span>
                  </button>

                  <button
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="w-full h-10 px-4 rounded-lg bg-surface-container-low text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm hover:bg-surface-container transition-all cursor-pointer border border-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-[17px]">preview</span>
                    <span>Open Live Interactive Demo</span>
                  </button>
                </div>

                {/* Delivery Manifest Notice */}
                <div className="p-space-sm rounded-lg bg-surface-container-low flex items-start gap-space-sm mb-space-lg border border-surface-container-high/60">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0 mt-0.5">
                    download_done
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                    <strong className="text-on-surface font-medium">Instant asset unlock:</strong> Includes complete HTML5/Tailwind production code, customizable Figma design tokens, and SVG icons.
                  </p>
                </div>

                {/* Creator Profile Card */}
                <div className="pt-space-md border-t border-surface-container flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-surface-container shadow-sm border border-surface-container-high">
                      {template.authorAvatar ? (
                        <img src={template.authorAvatar} alt={template.author} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-semibold">
                          {(template.author || 'SF').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full ring-2 ring-surface-container-lowest flex items-center justify-center text-[7px] text-on-primary font-bold">
                        ✓
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-label-md text-label-md text-on-surface font-medium">
                          {template.author || 'Studio Forma'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-[10px]">
                          Verified
                        </span>
                      </div>
                      <p className="font-body-sm text-[12px] text-on-surface-variant">
                        Milan & Kyoto · 38 Templates
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => alert(`Following ${template.author || 'Studio Forma'}`)}
                    className="px-3 py-1 rounded-md bg-surface-container-low text-on-surface font-label-sm text-label-sm hover:bg-surface-container transition-colors cursor-pointer border border-surface-container-high/60"
                  >
                    Follow Studio
                  </button>
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm border border-surface-container-high/60">
                <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-space-sm font-semibold">
                  Technical Specifications
                </p>
                <div className="grid grid-cols-2 gap-space-sm">
                  <div className="p-space-sm rounded-lg bg-surface-container-lowest shadow-sm border border-surface-container-high/40">
                    <span className="font-body-sm text-[11px] text-on-surface-variant block mb-0.5">Last Release</span>
                    <span className="font-label-md text-label-md text-on-surface font-medium">
                      {template.releaseDate || 'October 2024'}
                    </span>
                  </div>
                  <div className="p-space-sm rounded-lg bg-surface-container-lowest shadow-sm border border-surface-container-high/40">
                    <span className="font-body-sm text-[11px] text-on-surface-variant block mb-0.5">Current Version</span>
                    <span className="font-label-md text-label-md text-on-surface font-medium">
                      {template.version || 'v2.1 Stable'}
                    </span>
                  </div>
                  <div className="p-space-sm rounded-lg bg-surface-container-lowest shadow-sm border border-surface-container-high/40">
                    <span className="font-body-sm text-[11px] text-on-surface-variant block mb-0.5">Primary Tech Stack</span>
                    <span className="font-label-md text-label-md text-on-surface font-medium truncate block">
                      {template.techStack || 'HTML · Tailwind · Figma'}
                    </span>
                  </div>
                  <div className="p-space-sm rounded-lg bg-surface-container-lowest shadow-sm border border-surface-container-high/40">
                    <span className="font-body-sm text-[11px] text-on-surface-variant block mb-0.5">Responsiveness</span>
                    <span className="font-label-md text-label-md text-on-surface font-medium">
                      Fluid Retina & Mobile
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* DELIVERY MANIFEST BENTO BOX                                               */}
          {/* ========================================================================= */}
          <section className="mb-space-xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-sm">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
                  Delivery Manifest
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight mt-1">
                  What's Included in the Box
                </h2>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                A comprehensive digital production kit built with rigorous attention to typography, modularity, and rapid deployment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {/* Item 1 */}
              <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-md flex flex-col justify-between border border-surface-container-high/60">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface mb-space-md border border-surface-container-high">
                    <span className="material-symbols-outlined text-[20px]">auto_stories</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-medium mb-space-xs">
                    6 Pre-built Pages
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-space-sm">
                    Comprehensive turnkey layouts carefully sculpted for high conversion and visual elegance.
                  </p>
                </div>
                <ul className="space-y-1.5 pt-space-sm border-t border-surface-container text-on-surface font-body-sm text-body-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    <span>Editorial Homepage & Story</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    <span>Interactive Guest RSVP</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    <span>Weekend Schedule & Maps</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    <span>Visual Gallery & Keepsakes</span>
                  </li>
                </ul>
              </div>

              {/* Item 2 */}
              <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-md flex flex-col justify-between border border-surface-container-high/60">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface mb-space-md border border-surface-container-high">
                    <span className="material-symbols-outlined text-[20px]">palette</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-medium mb-space-xs">
                    Figma Design System
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-space-sm">
                    Fully tokenized, component-driven Figma master file with auto-layout v5, variables, and typography styles.
                  </p>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-container-low border border-surface-container-high/60">
                  <div className="flex items-center justify-between text-on-surface font-label-sm text-label-sm mb-1.5">
                    <span>Token Styles</span>
                    <span className="font-semibold">32 Variables</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <p className="font-body-sm text-[11px] text-on-surface-variant mt-2">
                    Includes global color primitives, typographic scales, and responsive variants.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-md flex flex-col justify-between border border-surface-container-high/60">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface mb-space-md border border-surface-container-high">
                    <span className="material-symbols-outlined text-[20px]">code</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-medium mb-space-xs">
                    Production Source Code
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-space-sm">
                    Clean semantic HTML5 structured with utility-first Tailwind CSS. Modular, highly annotated, zero framework lock-in.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-on-surface font-body-sm text-body-sm">
                    <span className="material-symbols-outlined text-[16px] text-on-tertiary-container">check_circle</span>
                    <span>100% Lighthouse Performance</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface font-body-sm text-body-sm">
                    <span className="material-symbols-outlined text-[16px] text-on-tertiary-container">check_circle</span>
                    <span>ARIA accessible forms</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface font-body-sm text-body-sm">
                    <span className="material-symbols-outlined text-[16px] text-on-tertiary-container">check_circle</span>
                    <span>Zero bloated dependencies</span>
                  </div>
                </div>
              </div>

              {/* Item 4 */}
              <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-md flex flex-col justify-between border border-surface-container-high/60">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface mb-space-md border border-surface-container-high">
                    <span className="material-symbols-outlined text-[20px]">menu_book</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-medium mb-space-xs">
                    Guides & Video Setup
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-space-sm">
                    Step-by-step written documentation accompanied by an HD 24-minute video guide taking you from download to custom domain launch.
                  </p>
                </div>
                <div className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container-low border border-surface-container-high/60">
                  <span className="material-symbols-outlined text-primary text-[24px]">smart_display</span>
                  <div className="text-left">
                    <p className="font-label-sm text-label-sm text-on-surface font-medium">Video Walkthrough</p>
                    <p className="font-body-sm text-[11px] text-on-surface-variant">Hosting & deployment configuration</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SIGNATURE CRAFT FEATURES                                                  */}
          {/* ========================================================================= */}
          <section className="mb-space-xl p-space-lg md:p-space-xl rounded-2xl bg-surface-container-low shadow-sm border border-surface-container-high/60">
            <div className="max-w-2xl mb-space-lg">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
                Signature Craft
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight mt-1">
                Built for Memory, Built for Motion
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed">
                Every micro-interaction is weighted with quiet luxury. Engineered to make guests feel welcomed before they even set foot at the venue.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
              <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col border border-surface-container-high/40">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface mb-space-sm">
                  <span className="material-symbols-outlined text-[20px]">fact_check</span>
                </div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface font-medium mb-1">Instant RSVP Validation</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Client-side meal restriction validation, plus-one logic, and optional automated webhook to Google Sheets or database.
                </p>
              </div>

              <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col border border-surface-container-high/40">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface mb-space-sm">
                  <span className="material-symbols-outlined text-[20px]">schedule</span>
                </div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface font-medium mb-1">Dynamic Countdown</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Live timezone-aware event countdown clock ticker aligned to venue coordinates with calendar export.
                </p>
              </div>

              <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col border border-surface-container-high/40">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface mb-space-sm">
                  <span className="material-symbols-outlined text-[20px]">phonelink</span>
                </div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface font-medium mb-1">Mobile-First Gestures</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Natural swipe gestures for photo galleries, one-tap directions opening natively in Apple Maps or Google Maps.
                </p>
              </div>

              <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col border border-surface-container-high/40">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface mb-space-sm">
                  <span className="material-symbols-outlined text-[20px]">motion_photos_on</span>
                </div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface font-medium mb-1">Whisper-Soft Transitions</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  CSS GPU-accelerated page morphing and scroll reveals calibrated to feel like thumbing through a linen publication.
                </p>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SIMPLE TRANSPARENT LICENSING                                              */}
          {/* ========================================================================= */}
          <section className="mb-space-xl grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center p-space-lg md:p-space-xl rounded-2xl bg-surface-container-lowest shadow-md border border-surface-container-high/60">
            <div className="lg:col-span-4 flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
                Clarity & Terms
              </span>
              <h3 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight mt-1 mb-space-xs">
                Simple, Transparent Licensing
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Crafted for personal celebrations or client studio commissions without convoluted royalties or recurring subscription traps.
              </p>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between border border-surface-container-high/60">
                <div>
                  <div className="flex items-center justify-between mb-space-xs">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">Standard Creative License</span>
                    <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container-highest text-on-surface">Included</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
                    Ideal for creators building their own bespoke website or solo freelancers delivering a singular client project.
                  </p>
                  <ul className="space-y-1.5 text-on-surface font-body-sm text-[13px]">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-on-tertiary-container">check</span>
                      <span>1 end live commercial or personal site</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-on-tertiary-container">check</span>
                      <span>Full code modification & styling rights</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-on-tertiary-container">check</span>
                      <span>Lifetime bug fixes and update patches</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between border border-surface-container-high/60">
                <div>
                  <div className="flex items-center justify-between mb-space-xs">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">Restrictions</span>
                    <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-error-container text-on-error-container font-semibold">Strict</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
                    We protect our independent creators rigorously to ensure unique aesthetics remain distinguished.
                  </p>
                  <ul className="space-y-1.5 text-on-surface font-body-sm text-[13px]">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-error">close</span>
                      <span>No re-selling or sub-licensing source files</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-error">close</span>
                      <span>Cannot redistribute in website-builder stores</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-error">close</span>
                      <span>Figma components cannot be re-packaged</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* RELATED TEMPLATES ROW                                                     */}
          {/* ========================================================================= */}
          {relatedTemplates.length > 0 && (
            <section className="mb-space-lg">
              <div className="flex items-center justify-between mb-space-lg">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
                    Editorial Curation
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight mt-1">
                    Related Curated Templates
                  </h2>
                </div>
                <Link
                  to="/templates"
                  className="font-label-md text-label-md text-on-surface hover:text-on-surface-variant flex items-center gap-1 group font-medium"
                >
                  <span>View all marketplace artifacts</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter lg:gap-gutter-lg">
                {relatedTemplates.map((rel) => (
                  <TemplateCard
                    key={rel.id}
                    template={rel}
                    onPreviewClick={(t) => setRelatedPreview(t)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />

      {/* Main Sandbox Preview Modal */}
      <PreviewModal
        template={template}
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
      />

      {/* Related Preview Modal */}
      <PreviewModal
        template={relatedPreview}
        isOpen={relatedPreview !== null}
        onClose={() => setRelatedPreview(null)}
      />
    </div>
  );
};
