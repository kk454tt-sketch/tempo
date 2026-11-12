import React, { useState } from 'react';
import { EventData, PortfolioData, TemplateDefinition } from '@/types';
import { DeveloperPortfolioTemplate } from '@/templates/components/DeveloperPortfolioTemplate';
import { StitchMinimalPortfolioEditor } from './StitchMinimalPortfolioEditor';
import {
  DEFAULT_PORTFOLIO_CARD_1,
  DEFAULT_PORTFOLIO_CARD_2,
} from '@/templates/components/portfolioAssets';
import { getPortfolioSiteConfig } from './portfolioSiteDefaults';

interface PortfolioStudioViewProps {
  template: TemplateDefinition;
  eventData: EventData;
  portfolioData?: PortfolioData;
  onChangePortfolioData: (data: PortfolioData) => void;
  onSave: (publishNow: boolean) => Promise<void>;
  isSaving: boolean;
  isPublishing: boolean;
  publishStatus: 'draft' | 'published';
  subdomain: string;
  onChangeSubdomain?: (slug: string) => void;
  onToast: (msg: string) => void;
  onBack: () => void;
}

export const PortfolioStudioView: React.FC<PortfolioStudioViewProps> = ({
  template,
  eventData,
  portfolioData,
  onChangePortfolioData,
  onSave,
  isSaving,
  isPublishing,
  publishStatus,
  subdomain,
  onToast,
  onBack,
}) => {
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const siteConfig = getPortfolioSiteConfig(template.id);

  // Generate and download standalone clean HTML
  const handleDownloadHtml = () => {
    const htmlFileMap: Record<string, string> = {
      'design-gallery-portfolio': '/html-templates/design-gallery-portfolio.html',
      '3d-in-motion-portfolio': '/html-templates/3d-in-motion-portfolio.html',
      'emiway-minecraft-portfolio': '/html-templates/emiway-minecraft-portfolio.html',
      'alex-3d-designer-portfolio': '/html-templates/alex-3d-designer-portfolio.html',
      'motion-designer-portfolio': '/html-templates/motion-designer-portfolio.html',
      'web-developer-portfolio': '/html-templates/web-developer-portfolio.html',
      'editorial-evelyn-30th': '/html-templates/editorial-evelyn-30th.html',
      'midnight-party-sarah-25th': '/html-templates/midnight-party-sarah-25th.html',
      'valentin-speculative-noir': '/html-templates/valentin-speculative-noir.html',
      'interactive-modern-invite': '/html-templates/interactive-modern-invite.html',
      'enchanted-whispering-pines': '/html-templates/enchanted-whispering-pines.html',
      'royal-luxury-envelope': '/html-templates/royal-luxury-envelope.html',
      'janamdin-mubarak-hindi': '/html-templates/janamdin-mubarak-hindi.html',
    };

    const targetUrl = htmlFileMap[template.id];
    if (targetUrl) {
      fetch(targetUrl)
        .then((res) => res.text())
        .then((rawHtml) => {
          const blob = new Blob([rawHtml], { type: 'text/html;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${template.id}.html`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          onToast('Portfolio HTML exported successfully!');
        })
        .catch(() => {
          onToast('Exporting current portfolio build...');
        });
      return;
    }
  };

  const handleResetValues = () => {
    onChangePortfolioData({
      templateId: template.id,
      creatorName: siteConfig.creatorName,
      brand: siteConfig.creatorName,
      discipline: siteConfig.discipline,
      title: siteConfig.defaultTexts.heroTitle || siteConfig.defaultTexts.heroHeading || siteConfig.name,
      statusNote: siteConfig.defaultTexts.heroYearTag || siteConfig.defaultTexts.headerDate || siteConfig.defaultTexts.statusNote || '',
      creatorRole: siteConfig.discipline,
      defaultTexts: { ...siteConfig.defaultTexts },
      hire: {
        mode: 'whatsapp',
        whatsapp: '919876543210',
        waText: 'Hi! I saw your portfolio and would like to discuss an opportunity.',
        email: siteConfig.defaultTexts.contactEmail || siteConfig.defaultTexts.emailAddress || 'hello@yourname.com',
        phone: '+91 98765 43210',
        label: siteConfig.defaultTexts.btnViewWork || siteConfig.defaultTexts.btnExploreWorld || 'Work With Me',
        fallback: siteConfig.defaultTexts.contactEmail ? `mailto:${siteConfig.defaultTexts.contactEmail}` : 'mailto:hello@yourname.com',
      },
      nav: {
        l1: 'Projects',
        u1: '#work',
        l2: siteConfig.defaultTexts.btnContact || siteConfig.defaultTexts.btnWatchGameplay || 'Contact',
        u2: '#contact',
      },
      socialLinks: {
        instagram: 'https://instagram.com/',
        behance: 'https://behance.net/',
        artstation: 'https://artstation.com/',
        linkedin: 'https://linkedin.com/',
        github: 'https://github.com/',
        twitter: 'https://twitter.com/',
        youtube: 'https://youtube.com/',
        discord: 'https://discord.gg/',
      },
    });
    onToast('Reset values to template original defaults.');
  };

  // Guard against mismatched portfolio data from other templates
  React.useEffect(() => {
    if (portfolioData?.templateId && portfolioData.templateId !== template.id) {
      handleResetValues();
    }
  }, [template.id, portfolioData?.templateId]);

  const isWebDeveloper = template.id === 'web-developer-portfolio';
  const activeCardIdx = portfolioData?.activeCardIndex === 1 ? 1 : 0;

  // Listen for inline edits from the iframe canvas (two-way live binding)
  React.useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'TEMPO_CANVAS_INLINE_EDIT') {
        const { key, value } = e.data;
        if (key && typeof value === 'string') {
          const currentP = portfolioData || {};
          const updatedDefaultTexts = {
            ...(currentP.defaultTexts || {}),
            [key]: value,
          };
          const patch: Partial<PortfolioData> = {
            templateId: template.id,
            defaultTexts: updatedDefaultTexts,
          };
          if (key === 'heroTitle' || key === 'heroHeading' || key === 'heroName') {
            patch.title = value;
          }
          if (key === 'heroSubtitle' || key === 'discipline') {
            patch.discipline = value;
          }
          if (key === 'brandName' || key === 'creatorName') {
            patch.creatorName = value;
            patch.brand = value;
          }
          if (key === 'heroYearTag' || key === 'headerDate' || key === 'statusNote') {
            patch.statusNote = value;
          }
          if (key === 'contactEmail' || key === 'emailAddress') {
            patch.hire = {
              mode: currentP.hire?.mode || 'whatsapp',
              whatsapp: currentP.hire?.whatsapp || '',
              waText: currentP.hire?.waText || '',
              subject: currentP.hire?.subject || 'Project Inquiry',
              phone: currentP.hire?.phone || '',
              label: currentP.hire?.label || 'Contact',
              fallback: `mailto:${value}`,
              ...(currentP.hire || {}),
              email: value,
            };
          }
          if (key === 'contactPhone' || key === 'whatsappNumber') {
            patch.hire = {
              mode: currentP.hire?.mode || 'whatsapp',
              whatsapp: value,
              waText: currentP.hire?.waText || '',
              email: currentP.hire?.email || '',
              subject: currentP.hire?.subject || 'Project Inquiry',
              label: currentP.hire?.label || 'Contact',
              fallback: currentP.hire?.fallback || '',
              ...(currentP.hire || {}),
              phone: value,
            };
          }
          onChangePortfolioData({
            ...currentP,
            ...patch,
          });
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [portfolioData, onChangePortfolioData]);

  // Real-time synchronized live event data for instant preview updates
  const liveEventData: EventData = React.useMemo(() => {
    return {
      ...eventData,
      title: portfolioData?.title !== undefined ? portfolioData.title : eventData.title,
      tagline: portfolioData?.discipline !== undefined ? portfolioData.discipline : eventData.tagline,
      note: portfolioData?.statusNote !== undefined ? portfolioData.statusNote : eventData.note,
      portfolioData: portfolioData,
    };
  }, [eventData, portfolioData]);

  // Responsive frame sizing
  const getContainerMaxWidth = () => {
    if (viewportMode === 'mobile') return 'max-w-[390px] h-[780px]';
    if (viewportMode === 'tablet') return 'max-w-[768px] h-[860px]';
    return 'w-full max-w-[1140px] h-full max-h-[88vh]';
  };

  // Fullscreen edge-to-edge preview
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black overflow-hidden select-none">
        {template.component ? (
          <template.component data={eventData} isLivePreview={false} />
        ) : (
          <DeveloperPortfolioTemplate data={eventData} isLivePreview={false} />
        )}

        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="px-4 py-2 rounded-md bg-white/90 hover:bg-white text-zinc-900 text-xs font-semibold shadow-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <span>Exit Fullscreen</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] text-zinc-900 font-sans antialiased min-h-screen lg:h-screen overflow-y-auto lg:overflow-hidden flex flex-col selection:bg-zinc-900 selection:text-white">
      {/* BEGIN: TopNavigationBar (Matching stitch_minimal_website_builder_panel/code.html) */}
      <header className="bg-white border-b border-zinc-200/80 z-20 shrink-0 flex flex-col">
        {/* Top Primary Global Bar */}
        <div className="min-h-14 py-2 sm:py-0 px-4 sm:px-6 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 border-b border-zinc-100">
          {/* Left Logo */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={onBack}
              className="font-bold text-xl tracking-tight text-zinc-900 flex items-center gap-0.5 focus:outline-none cursor-pointer"
            >
              <span>tempo</span>
              <span className="text-emerald-500 font-black text-2xl leading-none">.</span>
            </button>
          </div>

          {/* Center Search Bar */}
          <div className="flex-1 max-w-xl mx-2 sm:mx-8 order-3 sm:order-2 w-full sm:w-auto min-w-[200px]">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <input
                className="w-full text-xs pl-10 pr-12 py-2 bg-zinc-50/70 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-800 focus:border-zinc-800 placeholder-zinc-400 text-zinc-800 transition"
                placeholder="Search templates by name, style, topic..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                <kbd className="text-[11px] font-sans px-1.5 py-0.5 bg-white border border-zinc-200 rounded text-zinc-400 font-medium">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right Navigation Links & Profile */}
          <div className="flex items-center space-x-3 sm:space-x-5 text-xs text-zinc-700 font-normal order-2 sm:order-3 shrink-0">
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="hidden md:inline-flex items-center gap-1 hover:text-black transition cursor-pointer text-zinc-600"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Export HTML</span>
            </button>
            <span className="hidden sm:inline-block text-zinc-300">|</span>
            <div className="w-7 h-7 rounded-full bg-zinc-200 text-zinc-800 flex items-center justify-center text-xs font-medium cursor-pointer ring-1 ring-zinc-300/80">
              ST
            </div>
          </div>
        </div>

        {/* Secondary Project Sub-bar */}
        <div className="min-h-12 py-2 sm:py-0 px-4 sm:px-6 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 bg-white text-xs overflow-x-auto">
          {/* Left: Breadcrumb / Title with Draft tag */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onBack}
              className="text-zinc-500 font-normal hover:text-zinc-900 transition flex items-center gap-1 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>Templates</span>
            </button>
            <span className="text-zinc-300">/</span>
            <span className="font-medium text-zinc-900 text-[13px]">{template.name}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-normal bg-amber-50 text-amber-700 border border-amber-200/80 ml-1.5">
              <span className="w-1.5 h-1.5 rounded-full border border-amber-600 border-dashed" />
              {publishStatus === 'published' ? 'Published' : 'Draft'}
            </span>

            {/* Optional Card Switcher Pill for Web Developer Portfolio */}
            {isWebDeveloper && (
              <div className="flex items-center gap-1 ml-3 bg-zinc-100 p-0.5 rounded-md border border-zinc-200">
                <button
                  type="button"
                  onClick={() => {
                    const baseCard = portfolioData?.card1 || DEFAULT_PORTFOLIO_CARD_1;
                    onChangePortfolioData({
                      ...(portfolioData || {}),
                      activeCardIndex: 0,
                      discipline: baseCard.role || 'Full-stack web developer',
                      creatorName: baseCard.name || 'Alex Rivers',
                    });
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    activeCardIdx === 0
                      ? 'bg-white text-zinc-900 shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Card 1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const baseCard = portfolioData?.card2 || DEFAULT_PORTFOLIO_CARD_2;
                    onChangePortfolioData({
                      ...(portfolioData || {}),
                      activeCardIndex: 1,
                      discipline: baseCard.role || 'Creative frontend developer',
                      creatorName: baseCard.name || 'Kai Vance',
                    });
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    activeCardIdx === 1
                      ? 'bg-white text-zinc-900 shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Card 2
                </button>
              </div>
            )}
          </div>

          {/* Right: Secondary Actions */}
          <div className="flex items-center space-x-2 shrink-0 overflow-x-auto max-w-full">
            <a
              href={subdomain ? `/e/${subdomain}` : `/templates/${template.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 rounded-md transition focus:outline-none cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>Open Live Link</span>
            </a>

            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 rounded-md transition focus:outline-none cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>Preview Site</span>
            </button>

            <button
              type="button"
              onClick={() => onSave(false)}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 rounded-md transition focus:outline-none cursor-pointer disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
            </button>

            <button
              type="button"
              onClick={() => onSave(true)}
              disabled={isPublishing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-black hover:bg-zinc-800 rounded-md shadow-sm transition focus:outline-none cursor-pointer disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>{isPublishing ? 'Publishing...' : 'Publish to Web'}</span>
            </button>
          </div>
        </div>
      </header>
      {/* END: TopNavigationBar */}

      {/* BEGIN: MainWorkspaceLayout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden min-h-0">
        {/* BEGIN: LeftInspectorColumn (Matching stitch_minimal_website_builder_panel/code.html) */}
        <aside
          className="w-full lg:w-[460px] shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-zinc-200 flex flex-col h-auto lg:h-full overflow-hidden z-10"
          data-purpose="content-inspector"
        >
          {/* Subheader / Live Sync Indicator */}
          <div className="px-5 py-4 border-b border-zinc-100 bg-white shrink-0">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-xs uppercase tracking-wider font-semibold text-zinc-900">Content Editor</h1>
              <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 font-normal">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Syncing live
              </span>
            </div>
            <p className="text-xs text-zinc-500">Edit key copy and contact links for this template</p>
          </div>

          {/* Scrollable Form Container with 3 Accordions */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            <StitchMinimalPortfolioEditor
              templateId={template.id}
              title={portfolioData?.title || ''}
              tagline={portfolioData?.discipline || ''}
              note={portfolioData?.statusNote || ''}
              venue={eventData.venue || ''}
              address={eventData.address || ''}
              date={eventData.date || ''}
              photos={eventData.photos || []}
              portfolioData={portfolioData}
              onChangeTitle={(t) => {
                onChangePortfolioData({ ...(portfolioData || {}), title: t });
              }}
              onChangeTagline={(tg) => {
                onChangePortfolioData({ ...(portfolioData || {}), discipline: tg });
              }}
              onChangeNote={(n) => {
                onChangePortfolioData({ ...(portfolioData || {}), statusNote: n });
              }}
              onChangePhotos={() => {
                onChangePortfolioData({ ...(portfolioData || {}) });
              }}
              onChangePortfolioData={onChangePortfolioData}
              onToast={onToast}
            />
          </div>

          {/* Left Inspector Footer Status Bar */}
          <div className="px-5 py-3 border-t border-zinc-200 bg-white flex items-center justify-between text-[11px] text-zinc-400 shrink-0">
            <span>Draft auto-saved 1m ago</span>
            <button
              type="button"
              onClick={handleResetValues}
              className="text-zinc-700 hover:text-black font-medium underline underline-offset-2 cursor-pointer"
            >
              Reset values
            </button>
          </div>
        </aside>
        {/* END: LeftInspectorColumn */}

        {/* BEGIN: RightCanvasPreview (Matching stitch_minimal_website_builder_panel/code.html) */}
        <section
          className="flex-1 bg-zinc-100/80 flex flex-col min-h-[600px] lg:h-full overflow-hidden relative"
          data-purpose="live-canvas-preview-workspace"
        >
          {/* Canvas Top Control Bar */}
          <div className="min-h-12 py-2 sm:py-0 border-b border-zinc-200 bg-white/95 px-4 sm:px-6 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 shrink-0">
            {/* Live status */}
            <div className="flex items-center space-x-2">
              <span className="inline-flex w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-700">Live Canvas</span>
              <span className="text-zinc-300">|</span>
              <span className="text-[11px] text-zinc-400 font-mono">100% Scale · Read-only preview</span>
            </div>

            {/* Viewport Switcher Toggles (Mobile, Tablet, Desktop) */}
            <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
              <button
                type="button"
                onClick={() => setViewportMode('mobile')}
                className={`p-1.5 rounded transition cursor-pointer ${
                  viewportMode === 'mobile'
                    ? 'bg-white text-zinc-900 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-white'
                }`}
                title="Mobile Viewport"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => setViewportMode('tablet')}
                className={`p-1.5 rounded transition cursor-pointer ${
                  viewportMode === 'tablet'
                    ? 'bg-white text-zinc-900 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-white'
                }`}
                title="Tablet Viewport"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => setViewportMode('desktop')}
                className={`p-1.5 rounded transition cursor-pointer ${
                  viewportMode === 'desktop'
                    ? 'bg-white text-zinc-900 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-white'
                }`}
                title="Desktop Viewport"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </button>

              <div className="h-3 w-px bg-zinc-300 mx-1" />

              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="p-1.5 rounded text-zinc-500 hover:text-zinc-900 transition hover:bg-white cursor-pointer"
                title="Full Screen Canvas"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Canvas Viewport Surface */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex items-center justify-center">
            {/* Live Rendered Web Page Frame (Browser Mockup Frame from code.html & Screenshot 2) */}
            <article
              className={`w-full bg-white border border-zinc-200/90 rounded-lg shadow-sm transition-all duration-300 overflow-hidden flex flex-col my-auto ${getContainerMaxWidth()}`}
              id="preview-viewport-container"
            >
              {/* Web Browser Mock Header */}
              <div className="h-8 border-b border-zinc-100 bg-zinc-50/70 px-3 flex items-center justify-between select-none shrink-0">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                </div>
                <div className="text-[11px] font-mono text-zinc-500 bg-white px-3 py-0.5 rounded border border-zinc-200/60 truncate max-w-xs flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{template.id}.canvas.design/live</span>
                </div>
                <div className="w-10" />
              </div>

              {/* RENDERED WEBSITE CONTENT (Clean Live Preview with 100% fidelity) */}
              <div className="flex-1 w-full h-full relative overflow-hidden bg-white">
                {template.component ? (
                  <template.component data={liveEventData} isLivePreview={true} {...({ viewportMode } as any)} />
                ) : (
                  <DeveloperPortfolioTemplate data={liveEventData} isLivePreview={true} viewportMode={viewportMode} />
                )}
              </div>
            </article>
          </div>
        </section>
        {/* END: RightCanvasPreview */}
      </main>
      {/* END: MainWorkspaceLayout */}
    </div>
  );
};
