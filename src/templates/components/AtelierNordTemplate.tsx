import React, { useState } from 'react';
import { TemplateProps } from '../types';
import { getThemeStyles } from '@/utils/themeHelper';

export const AtelierNordTemplate: React.FC<TemplateProps> = ({
  data,
  isLivePreview = false,
  onRsvpSubmit,
}) => {
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryType, setInquiryType] = useState('commission');
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const theme = getThemeStyles(data.appearance);

  const coverPhoto = data.photos && data.photos.length > 0
    ? data.photos[0].url
    : 'https://lh3.googleusercontent.com/aida-public/AB6AXuCL31z2z1a5u8D1o7pZ6j5j_6R78w6W2k0a6K_9e1z4z2v9y7q0f6e5d4c3b2a1';

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryEmail) return;
    try {
      await onRsvpSubmit?.({
        inquiryName,
        inquiryEmail,
        inquiryType,
        inquiryMsg,
      });
      setInquirySubmitted(true);
    } catch {
      setInquirySubmitted(true);
    }
  };

  const caseStudies = [
    {
      title: 'Haus am Wald',
      category: 'Residential Architecture',
      year: '2025',
      location: 'Zurich, Switzerland',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9392y6E2-h94s1JcW9uE4U69zM3m5Zk2y3w4v5u6t7s8r9q0p',
      description: 'Monolithic timber structure enveloped by alpine forestry, prioritizing passive solar orientation and raw granite textures.',
    },
    {
      title: 'Studio Monolith',
      category: 'Workspace Design',
      year: '2024',
      location: 'Copenhagen, Denmark',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9876543210-nordic-studio-preview',
      description: 'Minimalist creative workspace featuring brushed stainless steel partitions, acoustic felt ceilings, and low-emissivity glazed facades.',
    },
    {
      title: 'Galleri Kvadrat',
      category: 'Cultural Monograph',
      year: '2024',
      location: 'Stockholm, Sweden',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA111222333444-gallery-scandi',
      description: 'Adaptive reuse of a 19th-century shipyard brick warehouse transformed into a daylight-flooded contemporary art exhibition venue.',
    },
  ];

  return (
    <div
      style={theme.bgStyle}
      className={`w-full min-h-screen ${theme.fontBodyClass} ${theme.paletteClass} antialiased selection:bg-primary selection:text-white transition-colors duration-300 text-on-surface`}
    >
      {/* Editorial Header */}
      {!isLivePreview && (
        <header className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-md border-b border-surface-container-high/60">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-headline-md text-lg font-medium tracking-tight">
                {data.title}
              </span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-[11px] uppercase tracking-wider">
                {data.eventType || 'Monograph'}
              </span>
            </div>

            <nav className="flex items-center gap-6 font-label-md text-xs tracking-wider uppercase text-on-surface-variant">
              <a href="#work" className="hover:text-on-surface transition-colors">Selected Works</a>
              <a href="#about" className="hover:text-on-surface transition-colors">Discipline</a>
              <a href="#specifications" className="hover:text-on-surface transition-colors">Manifest</a>
              <a
                href="#contact"
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-medium hover:opacity-90 transition-opacity"
              >
                Inquire
              </a>
            </nav>
          </div>
        </header>
      )}

      {/* Hero Studio Banner */}
      <section className="pt-16 pb-20 px-6 lg:px-12 max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-6 max-w-4xl">
          <span className="font-label-sm text-xs uppercase tracking-[0.25em] text-on-surface-variant font-semibold">
            {data.tagline || 'Architectural Monograph & Spatial Practice'}
          </span>
          <h1 className="font-headline-lg text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-[1.05]">
            {data.note || 'Deliberate architecture rooted in Nordic restraint, material integrity, and spatial calm.'}
          </h1>
        </div>

        <div className="mt-12 relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-surface-container-low shadow-xl border border-surface-container-high/70">
          <img
            src={coverPhoto}
            alt={data.title}
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Selected Works Gallery */}
      <section id="work" className="py-20 px-6 lg:px-12 max-w-[1440px] mx-auto border-t border-surface-container-high/60">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="font-label-sm text-xs tracking-widest uppercase text-on-surface-variant font-semibold">
              Archive &amp; Projects
            </span>
            <h2 className="font-headline-lg text-3xl sm:text-4xl font-light tracking-tight mt-1">
              Selected Works
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {['all', 'architecture', 'workspace', 'monograph'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedDiscipline(category)}
                className={`px-3.5 py-1.5 rounded-full font-label-sm text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedDiscipline === category
                    ? 'bg-primary text-on-primary font-medium'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {caseStudies.map((project, i) => (
            <article
              key={i}
              className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden border border-surface-container-high/70 shadow-sm hover:shadow-md transition-all"
            >
              <div className="relative aspect-[4/3] bg-surface-container overflow-hidden">
                <img
                  src={data.photos && data.photos[i] ? data.photos[i].url : coverPhoto}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col gap-2 flex-1 justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-on-surface-variant font-mono">
                    <span>{project.category}</span>
                    <span>{project.year}</span>
                  </div>
                  <h3 className="font-headline-md text-xl font-medium mt-1">
                    {project.title}
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-surface-container text-xs font-mono text-on-surface-variant">
                  {project.location}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Bento Craft Specification */}
      <section id="specifications" className="py-20 px-6 lg:px-12 bg-surface-container-low/40 border-t border-surface-container-high/60">
        <div className="max-w-[1440px] mx-auto">
          <div className="max-w-xl mb-12">
            <span className="font-label-sm text-xs tracking-widest uppercase text-on-surface-variant font-semibold">
              Discipline &amp; Craft
            </span>
            <h2 className="font-headline-lg text-3xl sm:text-4xl font-light tracking-tight mt-1">
              Studio Specifications
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high/80 shadow-sm flex flex-col gap-3">
              <span className="material-symbols-outlined text-[28px] text-primary">architecture</span>
              <h3 className="font-headline-md text-lg font-medium">Spatial Architecture</h3>
              <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed">
                Full-scale structural monographs, passive environmental envelope designs, and bespoke residential sanctuaries.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high/80 shadow-sm flex flex-col gap-3">
              <span className="material-symbols-outlined text-[28px] text-primary">texture</span>
              <h3 className="font-headline-md text-lg font-medium">Material Research</h3>
              <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed">
                Tactile curation prioritizing circular timber construction, carbon-neutral aggregates, and weathered bronze fixtures.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high/80 shadow-sm flex flex-col gap-3">
              <span className="material-symbols-outlined text-[28px] text-primary">deployed_code</span>
              <h3 className="font-headline-md text-lg font-medium">Digital Craft</h3>
              <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed">
                Interactive project archives, typography design systems, and responsive architectural publications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry / Commission Form */}
      <section id="contact" className="py-24 px-6 lg:px-12 max-w-[800px] mx-auto">
        <div className="bg-surface-container-lowest p-8 sm:p-12 rounded-3xl border border-surface-container-high shadow-lg">
          {!inquirySubmitted ? (
            <>
              <div className="text-center max-w-md mx-auto mb-8">
                <span className="font-label-sm text-xs tracking-widest uppercase text-on-surface-variant font-semibold">
                  Start a Dialogue
                </span>
                <h2 className="font-headline-lg text-3xl font-light tracking-tight mt-1">
                  Commission Inquiry
                </h2>
                <p className="font-body-sm text-sm text-on-surface-variant mt-2">
                  We accept a deliberate number of commissions annually to preserve craft integrity.
                </p>
              </div>

              <form onSubmit={handleInquiry} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-xs uppercase tracking-wider font-medium">Name</label>
                    <input
                      type="text"
                      required
                      className="w-full h-11 px-3.5 rounded-lg bg-surface border border-surface-container-high text-sm focus:outline-none focus:border-primary"
                      placeholder="Principal / Client Name"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-xs uppercase tracking-wider font-medium">Email</label>
                    <input
                      type="email"
                      required
                      className="w-full h-11 px-3.5 rounded-lg bg-surface border border-surface-container-high text-sm focus:outline-none focus:border-primary"
                      placeholder="client@domain.com"
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-xs uppercase tracking-wider font-medium">Inquiry Discipline</label>
                  <select
                    className="w-full h-11 px-3.5 rounded-lg bg-surface border border-surface-container-high text-sm focus:outline-none focus:border-primary"
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                  >
                    <option value="commission">Architecture Commission</option>
                    <option value="interior">Interior &amp; Spatial Design</option>
                    <option value="digital">Digital Monograph / Web Platform</option>
                    <option value="press">Press &amp; Publication Inquiry</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-xs uppercase tracking-wider font-medium">Project Scope / Brief</label>
                  <textarea
                    rows={4}
                    required
                    className="w-full p-3.5 rounded-lg bg-surface border border-surface-container-high text-sm focus:outline-none focus:border-primary resize-none"
                    placeholder="Describe your site location, timeline expectations, and core functional aspirations..."
                    value={inquiryMsg}
                    onChange={(e) => setInquiryMsg(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-primary text-on-primary font-label-md font-medium text-xs uppercase tracking-widest hover:opacity-95 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Transmit Inquiry</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[32px]">check</span>
              </div>
              <h3 className="font-headline-lg text-2xl font-medium">
                Inquiry Received
              </h3>
              <p className="font-body-md text-on-surface-variant max-w-sm text-sm">
                Thank you, {inquiryName}. Our studio director will review your brief and respond within two business days.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Atelier Footer */}
      <footer className="py-12 px-6 lg:px-12 border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
        <span>© 2026 {data.title}. All rights reserved.</span>
        <span>Atelier Curated Canvas Edition</span>
      </footer>
    </div>
  );
};
