import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Toast } from '@/components/common/Toast';
import { WebsiteCard } from '@/components/dashboard/WebsiteCard';
import { useAuth } from '@/context/AuthContext';
import { eventService } from '@/services/eventService';
import { EventWebsite } from '@/types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [websites, setWebsites] = useState<EventWebsite[]>([]);
  const [loadingWebsites, setLoadingWebsites] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const loadWebsites = async () => {
    const effectiveUserId = user?.id || 'usr_tempo_demo_01';
    setLoadingWebsites(true);
    try {
      const list = await eventService.getUserWebsites(effectiveUserId);
      setWebsites(list);
    } catch (e) {
      console.error('Failed to load user websites:', e);
    } finally {
      setLoadingWebsites(false);
    }
  };

  useEffect(() => {
    loadWebsites();
  }, [user?.id]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  const handleShare = (site: EventWebsite) => {
    const shareUrl = `${window.location.origin}/e/${site.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
    }
    triggerToast(`Sharing link copied: ${shareUrl}`);
  };

  const handleQrCode = (site: EventWebsite) => {
    triggerToast(`Print-ready QR Code generated for ${site.title}`);
  };

  const handleDuplicate = async (site: EventWebsite) => {
    const effectiveUserId = user?.id || 'usr_tempo_demo_01';
    const duplicate = await eventService.duplicateWebsite(site.id, effectiveUserId);
    if (duplicate) {
      await loadWebsites();
      triggerToast(`Duplicate created: ${duplicate.title}`);
    }
  };

  const handleDelete = async (site: EventWebsite) => {
    const effectiveUserId = user?.id || 'usr_tempo_demo_01';
    const success = await eventService.deleteWebsite(site.id, effectiveUserId);
    if (success) {
      await loadWebsites();
      triggerToast(`Site deleted`);
    }
  };

  const filteredWebsites = websites.filter((w) => {
    const matchesSearch =
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.eventType.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === 'all') return true;
    if (filterType === 'student')
      return (
        w.eventType.toLowerCase().includes('student') ||
        w.eventType.toLowerCase().includes('campus') ||
        w.templateId.includes('enrolldesk')
      );
    if (filterType === 'wedding') return w.eventType.toLowerCase() === 'wedding';
    if (filterType === 'birthday') return w.eventType.toLowerCase() === 'birthday';
    if (filterType === 'gatherings')
      return (
        w.eventType.toLowerCase().includes('party') ||
        w.eventType.toLowerCase().includes('dinner') ||
        w.eventType.toLowerCase().includes('opening')
      );
    return true;
  });

  const studentCount = websites.filter(
    (w) =>
      w.eventType.toLowerCase().includes('student') ||
      w.eventType.toLowerCase().includes('campus') ||
      w.templateId.includes('enrolldesk')
  ).length;
  const weddingCount = websites.filter((w) => w.eventType.toLowerCase() === 'wedding').length;
  const birthdayCount = websites.filter((w) => w.eventType.toLowerCase() === 'birthday').length;
  const gatheringCount = websites.filter(
    (w) =>
      w.eventType.toLowerCase().includes('party') ||
      w.eventType.toLowerCase().includes('dinner') ||
      w.eventType.toLowerCase().includes('opening')
  ).length;

  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Navbar />

      <Toast message={toastMessage} isVisible={toastVisible} />

      <main className="w-full pt-[72px] min-h-screen bg-surface flex-1">
        <div className="flex flex-col w-full">
          {/* Dashboard Container */}
          <div className="max-w-[1280px] w-full mx-auto px-margin md:px-margin-desktop py-space-lg md:py-space-xl flex flex-col gap-space-xl">
            {/* Workspace Header & Action Belt */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg pb-space-lg">
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center gap-space-sm text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest">
                  <span>Creator Studio</span>
                  <span>/</span>
                  <span className="text-primary font-semibold">{user?.name || 'Creator'}</span>
                </div>
                <div className="flex items-baseline gap-space-md flex-wrap mt-space-xs">
                  <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
                    Your websites &amp; portals
                  </h1>
                  <span className="inline-flex items-center px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-label-md">
                    {websites.length} active {websites.length === 1 ? 'project' : 'projects'}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                  Keepsake celebration sites, student portals, and community hubs crafted with deliberate modular design.
                </p>
              </div>

              {/* Action Belt: Search & Primary Action */}
              <div className="flex items-center gap-space-md flex-wrap md:flex-nowrap">
                <div className="relative flex-1 md:w-72">
                  <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-outline text-[20px]">
                    search
                  </span>
                  <input
                    className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-sm text-body-sm pl-10 pr-space-md py-space-sm rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-outline-variant/30"
                    id="site-search"
                    placeholder="Search your websites..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Link
                  to="/create"
                  className="inline-flex items-center justify-center gap-space-xs font-label-md text-label-md bg-primary text-on-primary hover:bg-primary-container transition-all px-space-lg py-space-sm rounded-xl shadow-sm tracking-wide whitespace-nowrap active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Create a site</span>
                </Link>
              </div>
            </section>

            {/* Filter Pills Row */}
            <div className="flex items-center justify-between gap-space-md pb-space-xs overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-space-xs">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-space-md py-1.5 rounded-full font-label-sm text-label-sm tracking-wider uppercase transition-colors cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-primary-container text-on-primary shadow-sm font-semibold'
                      : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  All ({websites.length})
                </button>
                <button
                  onClick={() => setFilterType('student')}
                  className={`px-space-md py-1.5 rounded-full font-label-sm text-label-sm tracking-wider uppercase transition-colors cursor-pointer ${
                    filterType === 'student'
                      ? 'bg-primary-container text-on-primary shadow-sm font-semibold'
                      : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  Student Hubs ({studentCount})
                </button>
                <button
                  onClick={() => setFilterType('wedding')}
                  className={`px-space-md py-1.5 rounded-full font-label-sm text-label-sm tracking-wider uppercase transition-colors cursor-pointer ${
                    filterType === 'wedding'
                      ? 'bg-primary-container text-on-primary shadow-sm font-semibold'
                      : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  Weddings ({weddingCount})
                </button>
                <button
                  onClick={() => setFilterType('birthday')}
                  className={`px-space-md py-1.5 rounded-full font-label-sm text-label-sm tracking-wider uppercase transition-colors cursor-pointer ${
                    filterType === 'birthday'
                      ? 'bg-primary-container text-on-primary shadow-sm font-semibold'
                      : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  Birthdays ({birthdayCount})
                </button>
                <button
                  onClick={() => setFilterType('gatherings')}
                  className={`px-space-md py-1.5 rounded-full font-label-sm text-label-sm tracking-wider uppercase transition-colors cursor-pointer ${
                    filterType === 'gatherings'
                      ? 'bg-primary-container text-on-primary shadow-sm font-semibold'
                      : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  Gatherings ({gatheringCount})
                </button>
              </div>
              <div className="hidden sm:flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[18px] text-outline">tune</span>
                <span>Sorted by recent activity</span>
              </div>
            </div>

            {/* Websites Loading State */}
            {loadingWebsites ? (
              <div className="w-full py-space-xl flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-space-sm" />
                <p className="font-label-sm uppercase tracking-widest text-on-surface-variant">
                  Loading your websites...
                </p>
              </div>
            ) : filteredWebsites.length === 0 ? (
              /* Clean Empty State */
              <div className="w-full py-space-xl px-space-lg bg-surface-container-lowest rounded-2xl border border-surface-container text-center flex flex-col items-center justify-center gap-space-md">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px]">bookmark_add</span>
                </div>
                <div className="max-w-md">
                  <h3 className="font-headline-md text-headline-md text-on-surface font-normal">
                    {searchQuery ? 'No matching websites found' : 'No websites created yet'}
                  </h3>
                  <p className="font-body-md text-on-surface-variant mt-1">
                    {searchQuery
                      ? `We couldn't find any websites matching "${searchQuery}".`
                      : 'Choose a starting template to create your keepsake website or community space.'}
                  </p>
                </div>
                <Link
                  to="/templates"
                  className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-md px-space-xl py-3 rounded-xl shadow-sm hover:bg-primary-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">explore</span>
                  <span>Explore Templates</span>
                </Link>
              </div>
            ) : (
              /* Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter-desktop">
                {filteredWebsites.map((website) => (
                  <WebsiteCard
                    key={website.id}
                    website={website}
                    onShare={handleShare}
                    onQrCode={handleQrCode}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                  />
                ))}

                {/* Card: New Website Action Container */}
                <div className="group bg-surface-container-low/70 hover:bg-surface-container-low rounded-2xl shadow-sm transition-all duration-300 flex flex-col justify-between p-space-xl relative overflow-hidden border border-surface-container">
                  <div className="flex flex-col gap-space-md">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-lowest text-primary shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="material-symbols-outlined text-[28px]">add_circle</span>
                    </div>
                    <div className="flex flex-col gap-space-xs">
                      <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                        Create another site or portal
                      </h2>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        Every event or community cohort deserves a beautifully crafted destination. Pick a curated canvas below.
                      </p>
                    </div>
                  </div>

                  {/* Canvas Type Shortcuts */}
                  <div className="flex flex-col gap-space-md mt-space-lg">
                    <span className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-semibold">
                      Quick starting canvases
                    </span>
                    <div className="grid grid-cols-2 gap-space-sm">
                      <button
                        onClick={() => navigate('/create/enrolldesk-01')}
                        className="flex items-center gap-space-xs p-space-sm bg-surface-container-lowest hover:bg-surface-container rounded-xl shadow-sm text-on-surface font-body-sm text-body-sm transition-colors cursor-pointer text-left border border-[#C9982F]/40"
                      >
                        <span className="material-symbols-outlined text-[18px] text-[#C9982F]">school</span>
                        <span className="font-semibold text-[#182449]">EnrollDesk Hub</span>
                      </button>
                      <button
                        onClick={() => navigate('/create/wedding-01')}
                        className="flex items-center gap-space-xs p-space-sm bg-surface-container-lowest hover:bg-surface-container rounded-xl shadow-sm text-on-surface font-body-sm text-body-sm transition-colors cursor-pointer text-left"
                      >
                        <span className="material-symbols-outlined text-[18px] text-primary">favorite</span>
                        <span>Wedding</span>
                      </button>
                      <button
                        onClick={() => navigate('/create/birthday-01')}
                        className="flex items-center gap-space-xs p-space-sm bg-surface-container-lowest hover:bg-surface-container rounded-xl shadow-sm text-on-surface font-body-sm text-body-sm transition-colors cursor-pointer text-left"
                      >
                        <span className="material-symbols-outlined text-[18px] text-tertiary">cake</span>
                        <span>Birthday</span>
                      </button>
                      <button
                        onClick={() => navigate('/create/opening-01')}
                        className="flex items-center gap-space-xs p-space-sm bg-surface-container-lowest hover:bg-surface-container rounded-xl shadow-sm text-on-surface font-body-sm text-body-sm transition-colors cursor-pointer text-left"
                      >
                        <span className="material-symbols-outlined text-[18px] text-secondary">storefront</span>
                        <span>Opening</span>
                      </button>
                    </div>

                    <Link
                      to="/create"
                      className="mt-space-xs w-full inline-flex items-center justify-center gap-2 py-3 px-space-md rounded-xl bg-primary text-on-primary hover:bg-primary-container transition-all font-label-md text-label-md shadow-sm active:scale-[0.98]"
                    >
                      <span>Start from a blank canvas</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
