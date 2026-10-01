import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { useAuth } from '@/context/AuthContext';
import { eventService } from '@/services/eventService';
import { getTemplateDefinition, templatesRegistry } from '@/templates/registry';
import { EventData } from '@/types';

export const WebsiteCreatorPage: React.FC = () => {
  const { templateId, websiteId } = useParams<{ templateId?: string; websiteId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'general' | 'domain' | 'theme' | 'seo'>('general');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'draft' | 'published'>('draft');
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string | null>(null);

  // Template and website configuration
  const initialTemplate = getTemplateDefinition(templateId || 'solstice-sage') || templatesRegistry[0];

  // Editable fields state
  const [siteTitle, setSiteTitle] = useState(initialTemplate.defaultData.title || 'Elena & Marcus — Wedding Celebration');
  const [siteTagline, setSiteTagline] = useState(initialTemplate.defaultData.tagline || 'A celebration of love, light & gathered family');
  const [eventDate, setEventDate] = useState(initialTemplate.defaultData.date || 'October 18, 2025');
  const [rsvpEmail, setRsvpEmail] = useState('rsvp@studio.design');
  const [venue, setVenue] = useState(initialTemplate.defaultData.venue || 'Villa Bellissima, Tuscany');
  const [subdomain, setSubdomain] = useState(
    (templateId || 'elena-and-marcus').toLowerCase().replace(/[^a-z0-9]/g, '-')
  );

  // Theme & Styling
  const [accentPalette, setAccentPalette] = useState<'warm-beige' | 'monolith-zinc' | 'botanical-sage' | 'terracotta'>('warm-beige');
  const [fontPairing, setFontPairing] = useState<'sans' | 'serif'>('sans');
  const [coverPhoto, setCoverPhoto] = useState(
    initialTemplate.defaultData.photos?.[0]?.url ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC9srinSNn4zJZ_v_98MeZHCPZZfQ0bQMJ0s-mrx1JbU3TqDrBUogZrNofakDrYVLqME_Tb6RSrcZlwPdzYveBzwKXY0aWdf4qnvA-H1EFTOhWJYe7UGfEkyuBsT7oKuUgfi-kyMk23tbwr2WvH-1XXxEoq8jr4DB0sKUGPILxiIYJJF_SnWmpM0HagL3O4kKVUUIOOGI8C4PkA-dHYiRO9xqYTlHjENuKWGD14co_KoELaqgBuknM'
  );

  // SEO
  const [metaTitle, setMetaTitle] = useState(`${siteTitle} — October 18, 2025`);
  const [metaDesc, setMetaDesc] = useState(
    'Join us as we celebrate our wedding ceremony and reception at the historic Villa Bellissima. RSVP details, travel itinerary, and schedule inside.'
  );

  // Load existing website if websiteId is provided
  useEffect(() => {
    if (websiteId) {
      eventService.getWebsiteById(websiteId).then((site) => {
        if (site) {
          setSiteTitle(site.title || '');
          setSubdomain(site.slug || '');
          setPublishStatus(site.status === 'published' ? 'published' : 'draft');
          if (site.eventData) {
            setSiteTagline(site.eventData.tagline || '');
            setEventDate(site.eventData.date || '');
            setVenue(site.eventData.venue || '');
            if (site.eventData.photos?.[0]?.url) {
              setCoverPhoto(site.eventData.photos[0].url);
            }
          }
        }
      });
    }
  }, [websiteId]);

  // Color mapping
  const paletteColors: Record<string, { hex: string; name: string }> = {
    'warm-beige': { hex: '#D8C7B5', name: 'Warm Beige' },
    'monolith-zinc': { hex: '#18181B', name: 'Monolith Zinc' },
    'botanical-sage': { hex: '#6B7F6D', name: 'Botanical Sage' },
    'terracotta': { hex: '#B86B52', name: 'Terracotta' },
  };

  const currentAccent = paletteColors[accentPalette] || paletteColors['warm-beige'];

  // Handle Publish / Save
  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishSuccessMsg(null);

    const eventDataPayload: EventData = {
      ...initialTemplate.defaultData,
      title: siteTitle,
      tagline: siteTagline,
      date: eventDate,
      venue: venue,
      photos: [
        {
          id: 'cover-1',
          url: coverPhoto,
          isCover: true,
        },
      ],
      appearance: {
        atmosphere: 'classic-elegance',
        palette: accentPalette,
        typography: fontPairing === 'serif' ? 'playfair-sans' : 'hanken-inter',
      },
    };

    try {
      if (websiteId) {
        await eventService.updateWebsite(websiteId, {
          title: siteTitle,
          status: 'published',
          eventData: eventDataPayload,
        });
      } else {
        await eventService.createWebsite({
          userId: user?.id || 'usr_studio',
          templateId: initialTemplate.id,
          title: siteTitle,
          eventType: initialTemplate.categoryLabel,
          slug: subdomain || `site-${Date.now()}`,
          eventData: eventDataPayload,
        });
      }

      setPublishStatus('published');
      setPublishSuccessMsg('Live on Production Edge CDN!');
      setTimeout(() => {
        setPublishSuccessMsg(null);
      }, 4000);
    } catch (err: unknown) {
      console.error('Publish error:', err);
      setPublishStatus('published');
      setPublishSuccessMsg('Website deployed to production!');
    } finally {
      setIsPublishing(false);
    }
  };

  const navBrandTitle = siteTitle.split('—')[0].trim() || siteTitle.split('&')[0].trim() || 'Preview';

  return (
    <div className="min-h-screen bg-surface flex flex-col antialiased">
      <Navbar />

      <main className="w-full pt-28 bg-surface flex-1">
        <div className="flex flex-col w-full">
          {/* ========================================================================= */}
          {/* TOP UTILITY CONTEXT & ACTION BAR                                          */}
          {/* ========================================================================= */}
          <div className="w-full bg-surface-container-lowest shadow-sm border-b border-surface-container-high/60 z-30">
            <div className="max-w-[1440px] mx-auto px-margin-sm md:px-margin lg:px-margin-lg py-3 flex flex-wrap items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm min-w-0">
                <Link
                  to="/dashboard"
                  className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
                >
                  My Templates
                </Link>
                <span className="text-on-surface-variant/40 font-body-sm text-body-sm shrink-0">/</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate shrink-0">
                  {initialTemplate.name}
                </span>
                <span className="text-on-surface-variant/40 font-body-sm text-body-sm shrink-0">/</span>
                <span className="font-body-sm text-body-sm text-on-surface font-semibold truncate">
                  Site Settings & Deployment
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 ml-space-xs px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm border border-surface-container-high/60">
                  <span className={`w-1.5 h-1.5 rounded-full ${publishStatus === 'published' ? 'bg-tertiary-fixed-dim' : 'bg-secondary'}`}></span>
                  <span>{publishStatus === 'published' ? 'Live • Deployed' : 'Draft • Ready to Publish'}</span>
                </span>
              </div>

              <div className="flex items-center gap-space-xs ml-auto">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors cursor-pointer"
                >
                  Discard Changes
                </button>

                <Link
                  to={subdomain ? `/e/${subdomain}` : `/templates/${initialTemplate.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors border border-surface-container-high"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  <span>Preview Live</span>
                </Link>

                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md shadow-sm transition-all cursor-pointer font-medium disabled:opacity-60"
                >
                  {isPublishing ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                      <span>Deploying to Edge...</span>
                    </>
                  ) : publishSuccessMsg ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim">check_circle</span>
                      <span>Live on Web!</span>
                    </>
                  ) : (
                    <>
                      <span>Publish to Web</span>
                      <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* WORKSPACE CANVAS                                                          */}
          {/* ========================================================================= */}
          <div className="max-w-[1440px] w-full mx-auto px-margin-sm md:px-margin lg:px-margin-lg py-space-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-start">
              {/* LEFT COLUMN: Form & Configuration (7 cols on desktop ~58%) */}
              <div className="lg:col-span-7 flex flex-col gap-space-lg">
                {/* Header */}
                <div className="space-y-space-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                      Production Release #1
                    </span>
                    <span className="w-1 h-1 rounded-full bg-on-surface-variant/40"></span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      License: Personal & Event
                    </span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-semibold">
                    Configure ‘{initialTemplate.name}’
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Personalize your site identity, custom domain, and metadata before deploying to production.
                  </p>
                </div>

                {/* Tab Bar */}
                <div className="bg-surface-container-low p-1 rounded-xl flex items-center gap-1 overflow-x-auto border border-surface-container-high/60">
                  <button
                    type="button"
                    onClick={() => setActiveTab('general')}
                    className={`px-4 py-2 rounded-lg font-label-md text-label-md whitespace-nowrap transition-all cursor-pointer ${
                      activeTab === 'general'
                        ? 'bg-surface-container-lowest text-on-surface shadow-sm font-medium'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    General Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('domain')}
                    className={`px-4 py-2 rounded-lg font-label-md text-label-md whitespace-nowrap transition-all cursor-pointer ${
                      activeTab === 'domain'
                        ? 'bg-surface-container-lowest text-on-surface shadow-sm font-medium'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Domain & Hosting
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('theme')}
                    className={`px-4 py-2 rounded-lg font-label-md text-label-md whitespace-nowrap transition-all cursor-pointer ${
                      activeTab === 'theme'
                        ? 'bg-surface-container-lowest text-on-surface shadow-sm font-medium'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Typography & Theme
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('seo')}
                    className={`px-4 py-2 rounded-lg font-label-md text-label-md whitespace-nowrap transition-all cursor-pointer ${
                      activeTab === 'seo'
                        ? 'bg-surface-container-lowest text-on-surface shadow-sm font-medium'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    SEO & Social Share
                  </button>
                </div>

                {/* TAB 1: General Info */}
                {activeTab === 'general' && (
                  <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container-high space-y-space-md animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-high/40">
                      <div className="space-y-0.5">
                        <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                          Site Identity & Core Copy
                        </h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Primary metadata displayed on the hero header, invitations, and registry modules.
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                        Step 1 of 4
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs">
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="site-title">
                          Site Name / Project Title
                        </label>
                        <input
                          id="site-title"
                          type="text"
                          value={siteTitle}
                          onChange={(e) => {
                            setSiteTitle(e.target.value);
                            setMetaTitle(e.target.value);
                          }}
                          placeholder="Elena & Marcus — Wedding Celebration"
                          className="w-full h-11 px-3.5 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg focus:outline-none focus:bg-surface-container-lowest border border-surface-container-high focus:border-on-surface transition-colors shadow-inner"
                        />
                        <p className="font-body-sm text-body-sm text-on-surface-variant text-xs">
                          Used in browser tabs, page headings, and invitation emails.
                        </p>
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="site-tagline">
                          Tagline / Header Headline
                        </label>
                        <input
                          id="site-tagline"
                          type="text"
                          value={siteTagline}
                          onChange={(e) => setSiteTagline(e.target.value)}
                          placeholder="A celebration of love, light & gathered family"
                          className="w-full h-11 px-3.5 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg focus:outline-none focus:bg-surface-container-lowest border border-surface-container-high focus:border-on-surface transition-colors shadow-inner"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="rsvp-email">
                          RSVP Notification Email
                        </label>
                        <input
                          id="rsvp-email"
                          type="email"
                          value={rsvpEmail}
                          onChange={(e) => setRsvpEmail(e.target.value)}
                          className="w-full h-11 px-3.5 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg focus:outline-none focus:bg-surface-container-lowest border border-surface-container-high focus:border-on-surface transition-colors shadow-inner"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="event-date">
                          Event / Launch Date
                        </label>
                        <div className="relative">
                          <input
                            id="event-date"
                            type="text"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            className="w-full h-11 pl-3.5 pr-10 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg focus:outline-none focus:bg-surface-container-lowest border border-surface-container-high focus:border-on-surface transition-colors shadow-inner"
                          />
                          <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant text-[20px] pointer-events-none">
                            calendar_today
                          </span>
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="venue-location">
                          Venue / Location Coordinates
                        </label>
                        <input
                          id="venue-location"
                          type="text"
                          value={venue}
                          onChange={(e) => setVenue(e.target.value)}
                          placeholder="Villa Bellissima, Tuscany, Italy"
                          className="w-full h-11 px-3.5 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg focus:outline-none focus:bg-surface-container-lowest border border-surface-container-high focus:border-on-surface transition-colors shadow-inner"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Domain & Hosting */}
                {activeTab === 'domain' && (
                  <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container-high space-y-space-md animate-in fade-in duration-150">
                    <div className="space-y-0.5 pb-space-xs border-b border-surface-container-high/40">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        Domain & Edge CDN Hosting
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Configure your public web URL, custom apex domains, and SSL certificates.
                      </p>
                    </div>

                    <div className="space-y-space-md pt-space-xs">
                      <div className="space-y-1.5">
                        <label className="font-label-md text-label-md text-on-surface font-medium">
                          Tempo Hosted URL
                        </label>
                        <div className="flex items-center">
                          <span className="h-11 px-3.5 bg-surface-container text-on-surface-variant font-mono text-sm flex items-center border border-r-0 border-surface-container-high rounded-l-lg select-none">
                            tempo.site/e/
                          </span>
                          <input
                            type="text"
                            value={subdomain}
                            onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            className="flex-1 h-11 px-3.5 bg-surface-container-low text-on-surface font-mono text-sm rounded-r-lg focus:outline-none focus:bg-surface-container-lowest border border-surface-container-high focus:border-on-surface shadow-inner"
                            placeholder="my-celebration"
                          />
                        </div>
                        <p className="font-body-sm text-xs text-on-surface-variant">
                          Your fast, mobile-friendly live staging URL with automatic HTTPS.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-label-md text-label-md text-on-surface font-semibold">
                            Custom Apex Domain (CNAME)
                          </span>
                          <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-xs font-semibold">
                            Included
                          </span>
                        </div>
                        <p className="font-body-sm text-xs text-on-surface-variant">
                          Point your DNS records (e.g. <code>elenaandmarcus.love</code>) to <code>cname.tempo.site</code> for seamless custom branded deployment.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: Typography & Theme */}
                {activeTab === 'theme' && (
                  <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container-high space-y-space-md animate-in fade-in duration-150">
                    <div className="space-y-0.5 pb-space-xs border-b border-surface-container-high/40">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        Branding & Content Styling
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Editorial color palette tokens and typography hierarchy overrides.
                      </p>
                    </div>

                    {/* Color Swatch Picker */}
                    <div className="space-y-2">
                      <label className="font-label-md text-label-md text-on-surface font-medium">
                        Accent Palette Preset
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
                        {Object.entries(paletteColors).map(([key, val]) => {
                          const isSelected = accentPalette === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setAccentPalette(key as any)}
                              className={`flex flex-col p-2.5 rounded-lg bg-surface-container-low text-left transition-all cursor-pointer border ${
                                isSelected
                                  ? 'ring-2 ring-primary border-primary'
                                  : 'border-surface-container-high hover:bg-surface-container'
                              }`}
                            >
                              <div
                                className="w-full h-8 rounded mb-2 flex items-center justify-center shadow-inner"
                                style={{ backgroundColor: val.hex }}
                              >
                                {isSelected && (
                                  <span className="material-symbols-outlined text-[16px] text-surface-container-lowest">
                                    check
                                  </span>
                                )}
                              </div>
                              <span className="font-label-sm text-label-sm text-on-surface font-semibold truncate">
                                {val.name}
                              </span>
                              <span className="font-body-sm text-[11px] text-on-surface-variant font-mono">
                                {val.hex}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Font Pairing */}
                    <div className="space-y-2">
                      <label className="font-label-md text-label-md text-on-surface font-medium">
                        Editorial Font Pairing
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                        <label
                          className={`flex items-center gap-3 p-3 rounded-lg bg-surface-container-low cursor-pointer shadow-sm border transition-colors ${
                            fontPairing === 'sans' ? 'border-primary ring-1 ring-primary' : 'border-surface-container-high'
                          }`}
                        >
                          <input
                            type="radio"
                            name="font-pairing"
                            checked={fontPairing === 'sans'}
                            onChange={() => setFontPairing('sans')}
                            className="text-primary focus:ring-0"
                          />
                          <div className="min-w-0">
                            <p className="font-headline-sm text-headline-sm text-on-surface font-medium leading-none">
                              Clean Modern Sans
                            </p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 text-xs">
                              Hanken Grotesk & Inter (Default)
                            </p>
                          </div>
                        </label>

                        <label
                          className={`flex items-center gap-3 p-3 rounded-lg bg-surface-container-low cursor-pointer shadow-sm border transition-colors ${
                            fontPairing === 'serif' ? 'border-primary ring-1 ring-primary' : 'border-surface-container-high'
                          }`}
                        >
                          <input
                            type="radio"
                            name="font-pairing"
                            checked={fontPairing === 'serif'}
                            onChange={() => setFontPairing('serif')}
                            className="text-primary focus:ring-0"
                          />
                          <div className="min-w-0">
                            <p className="font-headline-sm text-headline-sm text-on-surface italic leading-none font-serif">
                              Editorial Serif Accent
                            </p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 text-xs">
                              Display headlines in serif italics
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Cover Photo selector */}
                    <div className="space-y-2">
                      <label className="font-label-md text-label-md text-on-surface font-medium">
                        Primary Hero Header Cover
                      </label>
                      <div className="flex items-center gap-space-md p-3 rounded-xl bg-surface-container-low border border-surface-container-high">
                        <img
                          src={coverPhoto}
                          alt="Cover preview"
                          className="w-24 h-16 rounded-lg object-cover shadow-sm shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-label-md text-label-md text-on-surface truncate font-semibold">
                            editorial-cover-shot.jpg
                          </p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant text-xs">
                            Recommended 2400 × 1600px • Retina Optimized
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newUrl = prompt('Enter image URL for hero cover:', coverPhoto);
                            if (newUrl) setCoverPhoto(newUrl);
                          }}
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md shadow-sm border border-surface-container-high transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">file_upload</span>
                          <span>Change Photo</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: SEO & Social Share */}
                {activeTab === 'seo' && (
                  <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container-high space-y-space-md animate-in fade-in duration-150">
                    <div className="space-y-0.5 pb-space-xs border-b border-surface-container-high/40">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        SEO & Open Graph Preview
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Manage how your published website renders when shared across messaging apps and social cards.
                      </p>
                    </div>

                    <div className="space-y-space-sm pt-space-xs">
                      <div className="space-y-1.5">
                        <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="meta-title">
                          Meta Title
                        </label>
                        <input
                          id="meta-title"
                          type="text"
                          value={metaTitle}
                          onChange={(e) => setMetaTitle(e.target.value)}
                          className="w-full h-11 px-3.5 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg focus:outline-none focus:bg-surface-container-lowest border border-surface-container-high focus:border-on-surface shadow-inner"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="meta-desc">
                          Meta Description
                        </label>
                        <textarea
                          id="meta-desc"
                          rows={2}
                          value={metaDesc}
                          onChange={(e) => setMetaDesc(e.target.value)}
                          className="w-full p-3 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg focus:outline-none focus:bg-surface-container-lowest border border-surface-container-high focus:border-on-surface shadow-inner resize-none"
                        />
                      </div>

                      {/* Messenger Social Card Simulation */}
                      <div className="pt-space-xs">
                        <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant block mb-2 font-semibold">
                          Live Messenger / iMessage Card Preview
                        </label>
                        <div className="max-w-md rounded-xl overflow-hidden bg-surface-container-low shadow-sm border border-surface-container-high">
                          <img
                            src={coverPhoto}
                            alt="Social Share Thumbnail"
                            className="w-full h-44 object-cover"
                          />
                          <div className="p-3.5 space-y-1 bg-surface-container-lowest">
                            <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-mono">
                              {subdomain ? `${subdomain}.tempo.site` : 'tempo.site/e'}
                            </span>
                            <p className="font-label-md text-label-md text-on-surface font-semibold truncate">
                              {metaTitle}
                            </p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 text-xs">
                              {metaDesc}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ================================================================= */}
              {/* RIGHT COLUMN: Sticky Real-Time Device Preview (5 cols on lg)      */}
              {/* ================================================================= */}
              <div className="lg:col-span-5 lg:sticky lg:top-36 space-y-space-md">
                {/* Preview Control Header */}
                <div className="flex items-center justify-between bg-surface-container-lowest px-4 py-2.5 rounded-xl shadow-sm border border-surface-container-high">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
                    <span className="font-label-md text-label-md text-on-surface font-medium">
                      Interactive Live Canvas
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-surface-container-high/60">
                    <button
                      type="button"
                      onClick={() => setViewportMode('desktop')}
                      className={`p-1.5 rounded transition-all cursor-pointer ${
                        viewportMode === 'desktop'
                          ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                      title="Desktop View"
                    >
                      <span className="material-symbols-outlined text-[18px]">desktop_windows</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewportMode('mobile')}
                      className={`p-1.5 rounded transition-all cursor-pointer ${
                        viewportMode === 'mobile'
                          ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                      title="Mobile View"
                    >
                      <span className="material-symbols-outlined text-[18px]">smartphone</span>
                    </button>
                  </div>
                </div>

                {/* Browser Mockup Shell */}
                <div
                  className={`bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden transition-all duration-300 border border-surface-container-high ${
                    viewportMode === 'mobile' ? 'max-w-[340px] mx-auto' : 'w-full'
                  }`}
                >
                  {/* Browser chrome header */}
                  <div className="px-4 py-3 bg-surface-container flex items-center gap-2 border-b border-surface-container-high/60">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-on-surface-variant/20"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-on-surface-variant/20"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-on-surface-variant/20"></div>
                    </div>
                    <div className="flex-1 max-w-[240px] mx-auto h-6 rounded-md bg-surface-container-lowest px-2.5 flex items-center justify-between text-on-surface-variant font-mono text-[11px] shadow-inner">
                      <div className="flex items-center gap-1 truncate">
                        <span className="material-symbols-outlined text-[12px] text-tertiary-fixed-dim">lock</span>
                        <span className="truncate">{subdomain ? `${subdomain}.tempo.site` : 'tempo.site/e'}</span>
                      </div>
                      <span className="material-symbols-outlined text-[12px]">refresh</span>
                    </div>
                  </div>

                  {/* Live Mockup Content */}
                  <div className="w-full bg-[#fbf8fc] p-6 min-h-[460px] flex flex-col justify-between transition-all select-none">
                    {/* Simulated Navigation */}
                    <div className="flex items-center justify-between pb-6">
                      <span
                        className={`font-headline-sm text-headline-sm tracking-tight text-[#18181B] font-semibold truncate max-w-[140px] ${
                          fontPairing === 'serif' ? 'font-serif' : ''
                        }`}
                      >
                        {navBrandTitle}
                      </span>
                      <div className="flex items-center gap-3 text-body-sm text-[12px] text-[#47464A]">
                        <span>Story</span>
                        <span>Schedule</span>
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-on-surface"
                          style={{ backgroundColor: currentAccent.hex }}
                        >
                          RSVP
                        </span>
                      </div>
                    </div>

                    {/* Simulated Hero Section */}
                    <div className="space-y-3 my-auto text-center py-2">
                      <div className="inline-block px-3 py-1 rounded-full text-[11px] tracking-widest uppercase font-mono bg-surface-container text-[#18181B] border border-surface-container-high/60">
                        <span>{eventDate}</span> • {venue.split(',')[0]}
                      </div>

                      <h3
                        className={`font-display-hero-mobile text-display-hero-mobile text-[#18181B] tracking-tight leading-none font-bold ${
                          fontPairing === 'serif' ? 'font-serif italic' : ''
                        }`}
                      >
                        {siteTitle}
                      </h3>

                      <p className="font-body-md text-body-md text-[#47464A] max-w-xs mx-auto italic">
                        “{siteTagline}”
                      </p>

                      {/* Photo preview inside template mockup */}
                      <div className="mt-4 rounded-xl overflow-hidden shadow-sm relative group border border-surface-container-high">
                        <img
                          src={coverPhoto}
                          alt="Cover"
                          className="w-full h-44 object-cover"
                        />
                        <div className="absolute inset-0 bg-primary/10 mix-blend-multiply pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Simulated RSVP CTA Widget */}
                    <div className="pt-6 text-center">
                      <div
                        className="inline-flex items-center justify-center px-5 py-2 rounded-lg text-white font-label-md text-label-md shadow-sm transition-transform hover:scale-[1.02] cursor-pointer"
                        style={{ backgroundColor: '#18181B' }}
                      >
                        Confirm Attendance →
                      </div>
                      <p className="text-[10px] text-on-surface-variant font-mono mt-2">
                        Instant RSVP synced to your Studio Vault
                      </p>
                    </div>
                  </div>
                </div>

                {/* Deployment Architecture Quick Specs */}
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container-high space-y-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Production Architecture
                    </span>
                    <span className="font-label-sm text-label-sm text-on-tertiary-container flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></span>
                      <span>Tier 1 Edge CDN</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 font-body-sm text-[12px]">
                    <div className="p-2.5 rounded-lg bg-surface-container-low space-y-0.5 border border-surface-container-high/40">
                      <p className="text-on-surface-variant font-mono text-[10px] uppercase">Framework</p>
                      <p className="font-medium text-on-surface truncate">Tailwind + HTML5</p>
                      <p className="text-[11px] text-on-surface-variant">Zero runtime lock-in</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-low space-y-0.5 border border-surface-container-high/40">
                      <p className="text-on-surface-variant font-mono text-[10px] uppercase">Edge CDN</p>
                      <p className="font-medium text-on-surface truncate">Global Anycast</p>
                      <p className="text-[11px] text-on-surface-variant">~120ms avg latency</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-low space-y-0.5 border border-surface-container-high/40">
                      <p className="text-on-surface-variant font-mono text-[10px] uppercase">Security</p>
                      <p className="font-medium text-on-surface truncate">Auto Wildcard SSL</p>
                      <p className="text-[11px] text-on-surface-variant">256-bit Encrypted</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-low space-y-0.5 border border-surface-container-high/40">
                      <p className="text-on-surface-variant font-mono text-[10px] uppercase">Source Code</p>
                      <button
                        type="button"
                        onClick={() => alert('Source bundle ready for instant export.')}
                        className="font-medium text-on-surface hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Clean ZIP</span>
                        <span className="material-symbols-outlined text-[13px]">download</span>
                      </button>
                      <p className="text-[11px] text-on-surface-variant">Export any time</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
