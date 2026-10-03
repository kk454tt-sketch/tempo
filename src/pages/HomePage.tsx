import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { CategoryFilter } from '@/components/templates/CategoryFilter';
import { TemplateGrid } from '@/components/templates/TemplateGrid';
import { getTemplatesByCategory, getFeaturedTemplate } from '@/templates/registry';
import { momentCategories } from '@/config/categories';
import { EventCategory } from '@/types/template';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>('all');
  const templates = getTemplatesByCategory(selectedCategory);
  const featuredTemplate = getFeaturedTemplate();

  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Navbar />

      <main className="w-full pt-[72px] min-h-screen bg-surface flex-1">
        <div className="flex flex-col w-full">
          {/* 1. COMPACT IMAGE-LED HERO */}
          <section className="w-full max-w-[1280px] mx-auto px-margin md:px-margin-desktop py-12 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-center">
              {/* Left Column: Typography & CTAs */}
              <div className="lg:col-span-5 flex flex-col items-start space-y-space-md">
                <div className="inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Free Keepsakes &amp; Pro Community Sites
                </div>

                <h1 className="font-display-xl text-display-lg md:text-display-xl text-on-surface tracking-tight leading-none text-balance">
                  Create a website for your moment.
                </h1>

                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md text-balance leading-relaxed">
                  Birthdays, weddings, student portals, openings, and milestone gatherings. Choose a design and toggle modular interactive functions as you wish.
                </p>

                <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
                  <Link
                    to="/create"
                    className="inline-flex items-center justify-center font-label-md text-label-md bg-primary text-on-primary hover:bg-primary-container transition-all duration-200 px-space-xl py-3 rounded-xl shadow-sm hover:shadow-md tracking-wide"
                  >
                    Create a site
                  </Link>
                  <a
                    href="#templates-explorer"
                    className="inline-flex items-center justify-center font-label-md text-label-md bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-all duration-200 px-space-lg py-3 rounded-xl shadow-sm gap-space-xs group border border-surface-container"
                  >
                    Explore templates
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:translate-x-0.5 transition-transform">
                      arrow_forward
                    </span>
                  </a>
                </div>

                {/* Social Proof Pill */}
                <div className="pt-space-xs flex items-center gap-space-sm text-on-surface-variant">
                  <div className="flex -space-x-2 overflow-hidden">
                    <span className="inline-block h-7 w-7 rounded-full ring-2 ring-surface bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center text-[10px] font-bold">
                      ED
                    </span>
                    <span className="inline-block h-7 w-7 rounded-full ring-2 ring-surface bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-[10px] font-bold">
                      RP
                    </span>
                    <span className="inline-block h-7 w-7 rounded-full ring-2 ring-surface bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center text-[10px] font-bold">
                      EM
                    </span>
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant">
                    Loved by over 14,000 celebrants &amp; campus cohorts
                  </p>
                </div>
              </div>

              {/* Right Column: Realistic Browser Frame Mockup */}
              <div className="lg:col-span-7 w-full relative">
                <div className="relative rounded-2xl overflow-hidden shadow-lg bg-surface-container-lowest transition-all duration-300 hover:shadow-xl border border-surface-container">
                  {/* Browser Titlebar */}
                  <div className="h-10 bg-surface-container-high px-space-md flex items-center justify-between gap-space-md select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#E58273]" />
                      <span className="w-3 h-3 rounded-full bg-[#F3CA68]" />
                      <span className="w-3 h-3 rounded-full bg-[#8BC878]" />
                    </div>
                    {/* Address Bar */}
                    <div className="flex-1 max-w-[340px] mx-auto bg-surface-container-lowest py-1 px-space-md rounded text-center flex items-center justify-center gap-space-xs shadow-sm">
                      <span className="material-symbols-outlined text-on-surface-variant text-[14px]">lock</span>
                      <span className="font-caption text-caption text-on-surface tracking-tight font-mono">
                        tempo.com/e/enrolldesk-portal
                      </span>
                    </div>
                    <div className="flex items-center gap-space-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]">share</span>
                    </div>
                  </div>

                  {/* Browser Viewport Content (EnrollDesk Interactive Hub) */}
                  <div className="w-full bg-[#182449] text-white p-space-md md:p-space-lg flex flex-col items-center">
                    {/* Mini site navigation bar */}
                    <div className="w-full flex items-center justify-between py-2 border-b border-[#243464] mb-space-md text-gray-300 font-label-sm text-label-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-[#C9982F] text-[#182449] font-bold flex items-center justify-center text-[10px]">
                          ED
                        </span>
                        <span className="font-bold text-white text-xs">EnrollDesk Portal</span>
                      </div>
                      <div className="flex items-center gap-space-md text-xs">
                        <span className="text-[#C9982F] font-semibold">Classmates</span>
                        <span>Matchmaker</span>
                        <span>Notices</span>
                      </div>
                    </div>

                    {/* Header inside the sample site */}
                    <div className="text-center space-y-1 mb-space-sm">
                      <span className="px-2 py-0.5 rounded-full bg-[#C9982F]/20 text-[#C9982F] text-[10px] font-bold uppercase">
                        Class of 2027 Portal
                      </span>
                      <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                        Find Classmates by Shared Hobbies
                      </h2>
                      <p className="text-xs text-gray-300">
                        Search student roster, form study teams, and read urgent campus notices.
                      </p>
                    </div>

                    {/* Interactive Preview Teaser Card */}
                    <Link
                      to="/create/enrolldesk-01"
                      className="w-full max-w-[620px] bg-white rounded-xl shadow-md p-4 text-[#182449] space-y-3 group block hover:scale-[1.01] transition-transform"
                    >
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-xs font-bold text-[#182449] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-[#C9982F]">search</span>
                          <span>Search Classmates &amp; Hobbies</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF6B5B]/10 text-[#FF6B5B] font-bold">
                          95% Match
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-left">
                        <div className="p-2 rounded-lg bg-[#F5F6F9] border border-gray-100 flex items-center gap-2">
                          <img
                            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80"
                            alt="Aarav"
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-[#182449] truncate">Aarav Mehta</p>
                            <p className="text-[10px] text-gray-500">Coding · Gaming</p>
                          </div>
                        </div>

                        <div className="p-2 rounded-lg bg-[#F5F6F9] border border-gray-100 flex items-center gap-2">
                          <img
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                            alt="Zara"
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-[#182449] truncate">Zara Al-Mansoor</p>
                            <p className="text-[10px] text-gray-500">UI/UX · Music</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                        <span className="flex items-center gap-1 text-[#C9982F] font-semibold">
                          <span className="material-symbols-outlined text-[14px]">lock</span>
                          <span>Private WhatsApp Admin Guard</span>
                        </span>
                        <span className="font-bold text-primary">Customize this template →</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. TEMPLATE EXPLORATION SECTION */}
          <section className="w-full bg-surface-container-low py-16 md:py-24" id="templates-explorer">
            <div className="max-w-[1280px] mx-auto px-margin md:px-margin-desktop flex flex-col space-y-space-xl">
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                    Curated Gallery
                  </span>
                  <h2 className="font-headline-lg text-headline-lg md:text-headline-lg text-on-surface tracking-tight mt-1">
                    Made for your moment
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mt-1">
                    Choose a design. Standard templates are free; Pro community portals allow custom interactive functions.
                  </p>
                </div>
                <div className="flex items-center gap-space-xs text-on-surface-variant">
                  <span className="font-label-sm text-label-sm">{templates.length} templates &amp; hubs available</span>
                </div>
              </div>

              {/* Category Filter Pills */}
              <CategoryFilter
                activeCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />

              {/* 2-Card Editorial Template Grid */}
              <TemplateGrid templates={templates} />
            </div>
          </section>

          {/* 3. FEATURED TEMPLATE SPLIT SECTION */}
          {featuredTemplate && (
            <section className="w-full py-16 md:py-24 bg-surface">
              <div className="max-w-[1280px] mx-auto px-margin md:px-margin-desktop">
                <div className="bg-surface-container rounded-3xl p-space-lg md:p-space-xl overflow-hidden shadow-sm border border-surface-container">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-center">
                    {/* Left: Large Featured Preview */}
                    <div className="lg:col-span-7">
                      <div className="relative rounded-2xl overflow-hidden shadow-md bg-surface-container-lowest p-space-md md:p-space-lg border border-surface-container">
                        {/* Frame Header */}
                        <div className="flex items-center justify-between pb-space-sm border-b border-surface-container mb-space-md">
                          <span className="font-label-sm text-label-sm tracking-wider uppercase text-on-surface-variant">
                            Live Interactive Template
                          </span>
                          <span className="font-caption text-caption text-secondary flex items-center gap-1 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-600" /> Modular Functions Enabled
                          </span>
                        </div>

                        {/* Inner preview content */}
                        <div className="space-y-space-md">
                          <div className="aspect-[16/10] rounded-xl overflow-hidden relative shadow-sm">
                            <img
                              className="w-full h-full object-cover"
                              alt={featuredTemplate.name}
                              src={featuredTemplate.previewImage}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-space-lg text-white">
                              <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#C9982F]">
                                {featuredTemplate.categoryLabel}
                              </span>
                              <h4 className="font-headline-lg text-headline-lg font-bold">
                                {featuredTemplate.name}
                              </h4>
                              <p className="font-body-sm text-body-sm text-gray-200">
                                {featuredTemplate.subtitle}
                              </p>
                            </div>
                          </div>

                          {/* Mini features bar inside preview */}
                          <div className="grid grid-cols-3 gap-space-sm pt-space-xs text-center">
                            <div className="bg-surface-container-low p-space-sm rounded-xl">
                              <p className="font-caption text-caption text-on-surface-variant uppercase">
                                Classmate Search
                              </p>
                              <p className="font-label-md text-label-md text-on-surface font-semibold">Live Filter</p>
                            </div>
                            <div className="bg-surface-container-low p-space-sm rounded-xl">
                              <p className="font-caption text-caption text-on-surface-variant uppercase">
                                Matchmaker
                              </p>
                              <p className="font-label-md text-label-md text-on-surface font-semibold">By Hobbies</p>
                            </div>
                            <div className="bg-surface-container-low p-space-sm rounded-xl">
                              <p className="font-caption text-caption text-on-surface-variant uppercase">
                                Admin Copy Desk
                              </p>
                              <p className="font-label-md text-label-md text-on-surface font-semibold">1-Click Action</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Details & Call to Action */}
                    <div className="lg:col-span-5 flex flex-col space-y-space-md">
                      <div className="inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-[#182449] text-[#C9982F] font-label-sm text-label-sm uppercase tracking-wider self-start font-bold border border-[#C9982F]/30">
                        Flagship Pro Template
                      </div>
                      <h3 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                        {featuredTemplate.name}
                      </h3>
                      <p className="font-headline-sm text-headline-sm text-primary font-semibold">
                        {featuredTemplate.featuredDetails?.subheadline || 'A modern interactive portal.'}
                      </p>
                      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                        {featuredTemplate.featuredDetails?.description ||
                          'A dedicated digital lounge where students and classmates connect by shared hobbies, organize teams, view announcements, and fill dynamic custom forms.'}
                      </p>

                      <div className="space-y-space-xs pt-space-xs">
                        {(featuredTemplate.featuredDetails?.features || []).map((f, idx) => (
                          <div key={idx} className="flex items-center gap-space-sm text-body-sm text-on-surface">
                            <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-space-sm pt-space-sm">
                        <Link
                          to={`/create/${featuredTemplate.id}`}
                          className="inline-flex items-center justify-center font-label-md text-label-md bg-primary text-on-primary hover:bg-primary-container transition-colors px-space-lg py-3 rounded-xl shadow-sm"
                        >
                          Use this template
                        </Link>
                        <Link
                          to={`/templates/${featuredTemplate.id}`}
                          className="inline-flex items-center justify-center font-label-md text-label-md bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors px-space-lg py-3 rounded-xl shadow-sm border border-surface-container"
                        >
                          Explore details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 4. "WHAT ARE YOU CELEBRATING?" EVENT CATEGORY CARDS */}
          <section className="w-full py-16 md:py-24 bg-surface-container-low">
            <div className="max-w-[1280px] mx-auto px-margin md:px-margin-desktop space-y-space-xl">
              <div className="text-center max-w-xl mx-auto space-y-space-xs">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                  Moments &amp; Communities
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                  What are you creating?
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Every milestone, cohort, or community deserves a dedicated home that people will keep returning to.
                </p>
              </div>

              {/* 8-Card Responsive Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md md:gap-gutter">
                {momentCategories.map((item) => (
                  <button
                    key={item.number}
                    onClick={() => {
                      setSelectedCategory(item.category);
                      const el = document.getElementById('templates-explorer');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-surface-container shadow-sm hover:shadow-lg transition-all duration-300 text-left cursor-pointer"
                  >
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={item.imageUrl}
                      alt={item.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                    <div className="absolute bottom-0 inset-x-0 p-space-md text-white">
                      <span className="font-label-sm text-label-sm tracking-widest uppercase text-[#C9982F] font-bold">
                        {item.number}
                      </span>
                      <h3 className="font-headline-sm text-headline-sm font-semibold text-white">{item.title}</h3>
                      <p className="font-caption text-caption text-gray-300 mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 5. "HOW TEMPO WORKS" SECTION */}
          <section className="w-full py-16 md:py-24 bg-surface" id="how-it-works">
            <div className="max-w-[1280px] mx-auto px-margin md:px-margin-desktop space-y-space-xl">
              <div className="text-center max-w-xl mx-auto space-y-space-xs">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                  Modular by Design
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                  Choose a design. Add any function.
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Free templates include classic keepsake sections. Pro sites let you add classmate finders, notices, polls, and custom forms with one click.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                {/* Step 01 */}
                <div className="bg-surface-container-low rounded-2xl p-space-lg flex flex-col justify-between space-y-space-lg shadow-sm hover:shadow transition-shadow">
                  <div className="space-y-space-sm">
                    <div className="w-10 h-10 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center font-display-lg text-headline-sm font-bold shadow-sm">
                      01
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Choose a starting template</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Pick from curated keepsake designs or interactive student &amp; community spaces tailored with bespoke layouts.
                    </p>
                  </div>
                </div>

                {/* Step 02 */}
                <div className="bg-surface-container-low rounded-2xl p-space-lg flex flex-col justify-between space-y-space-lg shadow-sm hover:shadow transition-shadow">
                  <div className="space-y-space-sm">
                    <div className="w-10 h-10 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center font-display-lg text-headline-sm font-bold shadow-sm">
                      02
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Add or remove functions</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Toggle built-in modules in the editor: classmate directory, hobby matchmaker, notices board, custom forms, or RSVP questions.
                    </p>
                  </div>
                </div>

                {/* Step 03 */}
                <div className="bg-surface-container-low rounded-2xl p-space-lg flex flex-col justify-between space-y-space-lg shadow-sm hover:shadow transition-shadow">
                  <div className="space-y-space-sm">
                    <div className="w-10 h-10 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center font-display-lg text-headline-sm font-bold shadow-sm">
                      03
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Share &amp; manage from admin desk</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Publish instantly and copy WhatsApp invitations, export CSV rosters, and broadcast announcements to your classmates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 6. FINAL EDITORIAL CTA BANNER */}
          <section className="w-full py-16 md:py-24 bg-surface-container">
            <div className="max-w-[960px] mx-auto px-margin md:px-margin-desktop text-center space-y-space-md">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">
                Begin your creation
              </span>
              <h2 className="font-headline-lg text-headline-lg md:text-headline-lg text-on-surface tracking-tight text-balance">
                Start crafting your moment or classmate space today.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mx-auto text-balance">
                Create a living website with interactive functions that your peers and guests will cherish.
              </p>
              <div className="pt-space-sm flex flex-col sm:flex-row items-center justify-center gap-space-sm">
                <button
                  onClick={() => navigate('/create')}
                  className="w-full sm:w-auto inline-flex items-center justify-center font-label-md text-label-md bg-primary text-on-primary hover:bg-primary-container transition-colors px-space-xl py-3 rounded-xl shadow-sm cursor-pointer"
                >
                  Create a site now
                </button>
                <a
                  href="#templates-explorer"
                  className="w-full sm:w-auto inline-flex items-center justify-center font-label-md text-label-md bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors px-space-xl py-3 rounded-xl shadow-sm cursor-pointer border border-surface-container"
                >
                  View all templates
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};
