import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { useAuth } from '@/context/AuthContext';
import { eventService } from '@/services/eventService';
import { unlockService } from '@/services/unlockService';
import { UpiPaymentModal } from '@/components/common/UpiPaymentModal';
import { getTemplateDefinition, templatesRegistry } from '@/templates/registry';
import { TemplateRenderer } from '@/templates/components/TemplateRenderer';
import { EventData, EventPhoto, ScheduleItem, WeddingData, PortfolioData, RestaurantData, SaasData } from '@/types';
import { BirthdayMainInfoSection, DressCodeData } from '@/components/editor/BirthdayMainInfoSection';
import { BirthdayDefaultInfoSection } from '@/components/editor/BirthdayDefaultInfoSection';
import { MusicEditorSection, MusicSettingsData } from '@/components/editor/MusicEditorSection';
import { WeddingEditSection } from '@/components/editor/WeddingEditSection';
import { PortfolioEditSection } from '@/components/editor/PortfolioEditSection';
import { PortfolioStudioView } from '@/components/editor/PortfolioStudioView';
import { DEFAULT_PORTFOLIO_CARD_1, DEFAULT_PORTFOLIO_CARD_2 } from '@/templates/components/portfolioAssets';
import { RestaurantEditSection } from '@/components/editor/RestaurantEditSection';
import { SaasEditSection } from '@/components/editor/SaasEditSection';
import { LocationMapData } from '@/components/editor/LocationMapPicker';
import QRCode from 'qrcode';

export const WebsiteCreatorPage: React.FC = () => {
  const { templateId, websiteId } = useParams<{ templateId?: string; websiteId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Template configuration
  const initialTemplate = getTemplateDefinition(templateId || 'keepsake-birthday-scrapbook') || templatesRegistry[0];
  const isFreeTemplate = initialTemplate.isFree || initialTemplate.price === 0;

  const [activeTab, setActiveTab] = useState<
    'main-info' | 'default-info' | 'music' | 'share' | 'general' | 'media' | 'rsvp' | 'theme' | 'domain'
  >('main-info');
  const [viewportMode, setViewportMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [showResponsiveModal, setShowResponsiveModal] = useState<boolean>(false);
  const [modalDevice, setModalDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [mobilePane, setMobilePane] = useState<'editor' | 'preview'>('editor');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'draft' | 'published'>('draft');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeWebsiteId, setActiveWebsiteId] = useState<string | undefined>(websiteId);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(
    unlockService.isTemplateUnlocked(initialTemplate.id, isFreeTemplate)
  );
  const [showUpiModal, setShowUpiModal] = useState<boolean>(false);
  const [whatsappNumber, setWhatsappNumber] = useState<string>(
    (initialTemplate.defaultData.rsvpSettings as any)?.phone || ''
  );

  // Editable fields state
  const [siteTitle, setSiteTitle] = useState(initialTemplate.defaultData.title || "Emma's 25th Birthday Soirée");
  const [siteTagline, setSiteTagline] = useState(
    initialTemplate.defaultData.tagline || "you're invited to celebrate"
  );
  const [eventDate, setEventDate] = useState(initialTemplate.defaultData.date || 'Saturday, June 14, 2025');
  const [eventTime, setEventTime] = useState(initialTemplate.defaultData.time || '4:30 PM & onwards');
  const [venue, setVenue] = useState(initialTemplate.defaultData.venue || 'The Glasshouse Botanica');
  const [address, setAddress] = useState(
    initialTemplate.defaultData.address || '42 Rosewood Lane, Hudson Valley, NY'
  );
  const [welcomeNote, setWelcomeNote] = useState(
    initialTemplate.defaultData.note ||
      'Champagne toast at 5:30 PM • Cake cutting at sunset • Dancing under fairy lights'
  );
  const [subdomain, setSubdomain] = useState(
    (templateId || 'keepsake-birthday').toLowerCase().replace(/[^a-z0-9]/g, '-')
  );

  // Section 1: Dress Code & Location Map
  const [dressCode, setDressCode] = useState<DressCodeData>({
    title: 'Garden Elegance & Pastels',
    description: 'Soft pastels, garden elegance & dancing shoes 🌸',
    colors: ['#EBC1C6', '#B7C4A5', '#FBF1DC', '#C97B84'],
  });

  const [locationMap, setLocationMap] = useState<LocationMapData>({
    lat: 41.7475,
    lng: -73.9161,
    zoom: 15,
    query: initialTemplate.defaultData.address || initialTemplate.defaultData.venue || 'Hudson Valley, NY',
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      initialTemplate.defaultData.address || initialTemplate.defaultData.venue || 'Hudson Valley, NY'
    )}`,
    label: initialTemplate.defaultData.venue || 'Celebration Venue',
  });

  // Section 2: Milestone Age & Custom Itinerary Schedule
  const initialAgeMatch = (initialTemplate.defaultData.title || '').match(/\b(\d{1,3})(?:st|nd|rd|th)?\b/i);
  const [milestoneAge, setMilestoneAge] = useState<string>(initialAgeMatch ? initialAgeMatch[1] : '25');
  const [schedule, setSchedule] = useState<ScheduleItem[]>(
    initialTemplate.defaultData.schedule || [
      { id: 's-1', time: '4:30 PM', title: 'Arrival & Welcome Drinks', description: 'Guests arrive and receive celebration passes' },
      { id: 's-2', time: '5:30 PM', title: 'Champagne Toast', description: 'Toast to the celebrant and golden hour photos' },
      { id: 's-3', time: '6:30 PM', title: 'Sunset Cake Cutting', description: 'Singing happy birthday and making wishes' },
      { id: 's-4', time: '7:30 PM', title: 'Music & Dancing', description: 'Celebration continues under the fairy lights' },
    ]
  );

  // Category-specific structured states
  const templateCategory = initialTemplate.category || 'birthday';
  const [weddingData, setWeddingData] = useState<WeddingData | undefined>(
    initialTemplate.defaultData.weddingData || {
      partner1: (initialTemplate.defaultData.title || '').split('&')[0]?.trim() || 'Elena',
      partner2: (initialTemplate.defaultData.title || '').split('&')[1]?.split('—')[0]?.trim() || 'Marcus',
      loveStory: initialTemplate.defaultData.note,
      ceremonyVenue: initialTemplate.defaultData.venue,
      ceremonyTime: initialTemplate.defaultData.time,
    }
  );
  const [portfolioData, setPortfolioData] = useState<PortfolioData | undefined>(() => {
    const existing = initialTemplate.defaultData.portfolioData;
    if (existing && existing.card1 && existing.card2) return existing;
    return {
      creatorName: initialTemplate.defaultData.title || 'Alex Rivers',
      discipline: 'Full-stack & 3D Web Developer',
      card1: existing?.card1 || DEFAULT_PORTFOLIO_CARD_1,
      card2: existing?.card2 || DEFAULT_PORTFOLIO_CARD_2,
      activeCardIndex: existing?.activeCardIndex ?? 0,
      projects: existing?.projects,
    };
  });
  const [restaurantData, setRestaurantData] = useState<RestaurantData | undefined>(
    initialTemplate.defaultData.restaurantData
  );
  const [saasData, setSaasData] = useState<SaasData | undefined>(
    initialTemplate.defaultData.saasData
  );

  // Link & Share State
  const [showPublishSuccessModal, setShowPublishSuccessModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const liveUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/e/${subdomain || 'my-event'}`
    : `https://tempo-a85d9.web.app/e/${subdomain || 'my-event'}`;

  useEffect(() => {
    if (subdomain) {
      QRCode.toDataURL(liveUrl, { width: 180, margin: 1 })
        .then(setQrCodeUrl)
        .catch(() => {});
    }
  }, [liveUrl, subdomain]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopiedLink(true);
    showToast('📋 Link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: siteTitle,
          text: `Check out our celebration website: ${siteTitle}`,
          url: liveUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  // Photos & Media
  const [photos, setPhotos] = useState<EventPhoto[]>(
    initialTemplate.defaultData.photos || [
      {
        id: 'photo-1',
        url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
        caption: 'Party Banner',
        isCover: true,
      },
    ]
  );

  // Background Music
  const [musicUrl, setMusicUrl] = useState<string>(
    ((initialTemplate.defaultData as unknown as Record<string, unknown>).musicUrl as string) || '/music/happy-birthday.mp3'
  );
  const [musicSettings, setMusicSettings] = useState<MusicSettingsData>({
    enabled: true,
    url: ((initialTemplate.defaultData as unknown as Record<string, unknown>).musicUrl as string) || '/music/happy-birthday.mp3',
    trackName: 'Happy Birthday Celebration (Default)',
    volume: 0.7,
    autoPlay: true,
    isCustom: false,
  });
  const [rsvpEnabled, setRsvpEnabled] = useState(true);
  const [requireMobile, setRequireMobile] = useState(true);
  const [allowPlusOnes, setAllowPlusOnes] = useState(true);
  const [allowDietary, setAllowDietary] = useState(true);
  const [rsvpDeadline, setRsvpDeadline] = useState(
    initialTemplate.defaultData.rsvpSettings?.deadline || 'September 15, 2025'
  );

  // Theme & Styling
  const [accentPalette, setAccentPalette] = useState<'terracotta' | 'warm-beige' | 'monolith-zinc' | 'botanical-sage'>(
    'terracotta'
  );
  const [fontPairing, setFontPairing] = useState<'sans' | 'serif'>('sans');

  // SEO
  const [metaDesc, setMetaDesc] = useState(
    'Interactive digital birthday invitation with mini-games, clue unlocks, and mobile RSVP.'
  );

  // Reset all fields back to template defaults
  const handleResetDefaults = () => {
    setSiteTitle(initialTemplate.defaultData.title || '');
    setSiteTagline(initialTemplate.defaultData.tagline || '');
    setEventDate(initialTemplate.defaultData.date || '');
    setEventTime(initialTemplate.defaultData.time || '');
    setVenue(initialTemplate.defaultData.venue || '');
    setAddress(initialTemplate.defaultData.address || '');
    setWelcomeNote(initialTemplate.defaultData.note || '');
    if (initialTemplate.defaultData.photos && initialTemplate.defaultData.photos.length > 0) {
      setPhotos(initialTemplate.defaultData.photos);
    }
    const tmplMusic = (initialTemplate.defaultData as unknown as Record<string, unknown>).musicUrl as string || '/music/happy-birthday.mp3';
    setMusicUrl(tmplMusic);
    setMusicSettings({
      enabled: true,
      url: tmplMusic,
      trackName: 'Happy Birthday Celebration (Default)',
      volume: 0.7,
      autoPlay: true,
      isCustom: false,
    });
    setDressCode({
      title: 'Garden Elegance & Pastels',
      description: 'Soft pastels, garden elegance & dancing shoes 🌸',
      colors: ['#EBC1C6', '#B7C4A5', '#FBF1DC', '#C97B84'],
    });
    const match = (initialTemplate.defaultData.title || '').match(/\b(\d{1,3})(?:st|nd|rd|th)?\b/i);
    setMilestoneAge(match ? match[1] : '25');
    if (initialTemplate.defaultData.schedule && initialTemplate.defaultData.schedule.length > 0) {
      setSchedule(initialTemplate.defaultData.schedule);
    }
    if (initialTemplate.defaultData.rsvpSettings?.deadline) {
      setRsvpDeadline(initialTemplate.defaultData.rsvpSettings.deadline);
    }
    showToast('🔄 Restored all original template defaults!');
  };

  // Load template defaults when creating new website or switching template
  useEffect(() => {
    if (!websiteId && initialTemplate) {
      setSiteTitle(initialTemplate.defaultData.title || '');
      setSiteTagline(initialTemplate.defaultData.tagline || '');
      setEventDate(initialTemplate.defaultData.date || '');
      setEventTime(initialTemplate.defaultData.time || '');
      setVenue(initialTemplate.defaultData.venue || '');
      setAddress(initialTemplate.defaultData.address || '');
      setWelcomeNote(initialTemplate.defaultData.note || '');
      if (initialTemplate.defaultData.photos && initialTemplate.defaultData.photos.length > 0) {
        setPhotos(initialTemplate.defaultData.photos);
      }
      const tmplMusic = (initialTemplate.defaultData as unknown as Record<string, unknown>).musicUrl as string;
      if (tmplMusic) {
        setMusicUrl(tmplMusic);
        setMusicSettings({
          enabled: true,
          url: tmplMusic,
          trackName: 'Happy Birthday Celebration (Default)',
          volume: 0.7,
          autoPlay: true,
          isCustom: false,
        });
      }
      if (initialTemplate.defaultData.rsvpSettings?.deadline) {
        setRsvpDeadline(initialTemplate.defaultData.rsvpSettings.deadline);
      }
      const match = (initialTemplate.defaultData.title || '').match(/\b(\d{1,3})(?:st|nd|rd|th)?\b/i);
      if (match) {
        setMilestoneAge(match[1]);
      }
      if (initialTemplate.defaultData.schedule && initialTemplate.defaultData.schedule.length > 0) {
        setSchedule(initialTemplate.defaultData.schedule);
      }
      setSubdomain((templateId || 'invitation').toLowerCase().replace(/[^a-z0-9]/g, '-'));
    }
  }, [templateId, websiteId, initialTemplate]);

  // Restore local draft for anonymous users or when returning from sign in
  useEffect(() => {
    if (!websiteId) {
      try {
        const draftKey = `tempo_draft_${initialTemplate.id}`;
        const localData = localStorage.getItem(draftKey);
        if (localData) {
          const parsed = JSON.parse(localData);
          if (parsed.siteTitle) setSiteTitle(parsed.siteTitle);
          if (parsed.siteTagline) setSiteTagline(parsed.siteTagline);
          if (parsed.eventDate) setEventDate(parsed.eventDate);
          if (parsed.eventTime) setEventTime(parsed.eventTime);
          if (parsed.venue) setVenue(parsed.venue);
          if (parsed.address) setAddress(parsed.address);
          if (parsed.welcomeNote) setWelcomeNote(parsed.welcomeNote);
          if (parsed.subdomain) setSubdomain(parsed.subdomain);
          if (parsed.whatsappNumber) setWhatsappNumber(parsed.whatsappNumber);
        }
      } catch (err) {
        console.debug('Draft restoration error:', err);
      }
    }
  }, [initialTemplate.id, websiteId]);

  // Sync unlock state with authoritative database check
  useEffect(() => {
    let isSubscribed = true;
    const checkUnlock = async () => {
      const unlocked = await unlockService.checkDatabaseUnlock(initialTemplate.id, isFreeTemplate, user?.id);
      if (isSubscribed) {
        setIsUnlocked(unlocked);
      }
    };
    checkUnlock();

    const unsub = unlockService.subscribe(() => {
      const u = unlockService.isTemplateUnlocked(initialTemplate.id, isFreeTemplate, user?.id);
      setIsUnlocked(u);
    });

    return () => {
      isSubscribed = false;
      unsub();
    };
  }, [initialTemplate.id, isFreeTemplate, user?.id]);

  // Load existing website or draft if websiteId is provided in params
  useEffect(() => {
    const effectiveSiteId = websiteId || searchParams.get('websiteId');
    if (effectiveSiteId) {
      eventService.getWebsiteById(effectiveSiteId).then((site) => {
        if (site) {
          setActiveWebsiteId(site.id);
          setSiteTitle(site.title || '');
          setSubdomain(site.slug || '');
          setPublishStatus(site.status === 'published' ? 'published' : 'draft');
          if (site.eventData) {
            setSiteTagline(site.eventData.tagline || '');
            setEventDate(site.eventData.date || '');
            setEventTime(site.eventData.time || '');
            setVenue(site.eventData.venue || '');
            setAddress(site.eventData.address || '');
            setWelcomeNote(site.eventData.note || '');
            if (site.eventData.photos && site.eventData.photos.length > 0) {
              setPhotos(site.eventData.photos);
            }
            if ((site.eventData as unknown as Record<string, unknown>).musicUrl) {
              const mu = (site.eventData as unknown as Record<string, unknown>).musicUrl as string;
              setMusicUrl(mu);
              setMusicSettings((prev) => ({
                ...prev,
                enabled: Boolean(mu),
                url: mu,
              }));
            }
            if (site.eventData.musicSettings) {
              setMusicSettings(site.eventData.musicSettings);
              if (site.eventData.musicSettings.url) {
                setMusicUrl(site.eventData.musicSettings.url);
              }
            }
            if (site.eventData.dressCode) {
              if (typeof site.eventData.dressCode === 'string') {
                setDressCode({ description: site.eventData.dressCode });
              } else {
                setDressCode(site.eventData.dressCode);
              }
            }
            if (site.eventData.locationMap) {
              setLocationMap(site.eventData.locationMap);
            }
            if (site.eventData.milestoneAge) {
              setMilestoneAge(site.eventData.milestoneAge);
            }
            if (site.eventData.schedule && site.eventData.schedule.length > 0) {
              setSchedule(site.eventData.schedule);
            }
            if (site.eventData.rsvpSettings) {
              setRsvpEnabled(site.eventData.rsvpSettings.enabled ?? true);
              setRsvpDeadline(site.eventData.rsvpSettings.deadline || '');
            }
            if (site.eventData.weddingData) {
              setWeddingData(site.eventData.weddingData);
            }
            if (site.eventData.portfolioData) {
              setPortfolioData(site.eventData.portfolioData);
            }
            if (site.eventData.restaurantData) {
              setRestaurantData(site.eventData.restaurantData);
            }
            if (site.eventData.saasData) {
              setSaasData(site.eventData.saasData);
            }
          }
        }
      });
    }
  }, [websiteId, searchParams]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Compile full eventData payload
  const currentEventData: EventData = {
    ...initialTemplate.defaultData,
    title: siteTitle,
    tagline: siteTagline,
    date: eventDate,
    time: eventTime,
    venue: venue,
    address: address,
    note: welcomeNote,
    photos: photos,
    dressCode: dressCode,
    locationMap: locationMap,
    musicSettings: musicSettings,
    milestoneAge: milestoneAge,
    schedule: schedule,
    weddingData: weddingData,
    portfolioData: portfolioData,
    restaurantData: restaurantData,
    saasData: saasData,
    appearance: {
      atmosphere: 'playful-terracotta',
      palette: accentPalette,
      typography: fontPairing === 'serif' ? 'playfair-sans' : 'hanken-inter',
    },
    activeSections: {
      hero: true,
      countdown: true,
      story: true,
      schedule: true,
      venue: true,
      gallery: photos.length > 0,
      rsvp: rsvpEnabled,
      guestbook: false,
    },
    rsvpSettings: {
      enabled: rsvpEnabled,
      deadline: rsvpDeadline,
      allowMealSelection: true,
      allowDietaryNotes: allowDietary,
      allowSongRequests: false,
      allowPlusOnes: allowPlusOnes,
      phone: whatsappNumber,
    },
    musicUrl: musicSettings.enabled ? (musicSettings.url || musicUrl) : '',
  } as any;

  // Handle Save Draft & Publish
  const handleSave = async (publishNow = false) => {
    // 1. If trying to publish without being signed in:
    if (publishNow && !user) {
      try {
        const draftKey = `tempo_draft_${initialTemplate.id}`;
        localStorage.setItem(draftKey, JSON.stringify({
          siteTitle, siteTagline, eventDate, eventTime, venue, address, welcomeNote, subdomain, photos, musicUrl, whatsappNumber
        }));
      } catch (e) {
        console.debug('Local storage draft save:', e);
      }
      showToast('Please sign in to publish your website live to the web.');
      navigate(`/login?from=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    // 2. If saving draft without being signed in:
    if (!publishNow && !user) {
      try {
        const draftKey = `tempo_draft_${initialTemplate.id}`;
        localStorage.setItem(draftKey, JSON.stringify({
          siteTitle, siteTagline, eventDate, eventTime, venue, address, welcomeNote, subdomain, photos, musicUrl, whatsappNumber
        }));
      } catch (e) {
        console.debug('Local storage draft save:', e);
      }
      showToast('Draft saved locally in your browser! Sign in whenever you are ready to publish.');
      return;
    }

    // 3. If publishing a paid template that is not yet unlocked:
    if (publishNow && !isFreeTemplate && !isUnlocked) {
      setShowUpiModal(true);
      showToast('Please unlock this Pro template to publish your website.');
      return;
    }

    if (publishNow) {
      setIsPublishing(true);
    } else {
      setIsSaving(true);
    }

    const targetStatus = publishNow ? 'published' : publishStatus;
    const finalSlug = subdomain.trim() || `site-${Date.now()}`;

    try {
      let savedSiteId = activeWebsiteId;

      if (activeWebsiteId) {
        const updated = await eventService.updateWebsite(activeWebsiteId, {
          title: siteTitle,
          status: targetStatus,
          slug: finalSlug,
          eventData: currentEventData,
        });
        setActiveWebsiteId(updated.id);
        savedSiteId = updated.id;
        setPublishStatus(targetStatus);
        showToast(publishNow ? '🎉 Website is LIVE on production!' : '✅ Changes saved to database!');
      } else {
        const created = await eventService.createWebsite({
          userId: user ? user.id : 'anonymous',
          templateId: initialTemplate.id,
          title: siteTitle,
          eventType: initialTemplate.categoryLabel,
          slug: finalSlug,
          eventData: currentEventData,
          status: targetStatus,
        });
        setActiveWebsiteId(created.id);
        savedSiteId = created.id;
        setPublishStatus(targetStatus);
        showToast(publishNow ? '🎉 Website deployed & published!' : '✅ Saved draft to your database!');
      }

      // Persist draft in database (Phase 5)
      await eventService.saveDraft({
        siteId: savedSiteId,
        templateId: initialTemplate.id,
        title: siteTitle,
        slug: finalSlug,
        eventType: initialTemplate.categoryLabel,
        eventData: currentEventData as unknown as Record<string, unknown>,
      });

      // Update URL search param so browser refresh restores the exact draft (Phase 10 & 14)
      if (savedSiteId && (!websiteId || websiteId !== savedSiteId)) {
        navigate(`/create/${initialTemplate.id}?websiteId=${encodeURIComponent(savedSiteId)}`, { replace: true });
      }

      if (publishNow) {
        setShowPublishSuccessModal(true);
      }
    } catch (err: unknown) {
      console.error('Save error:', err);
      showToast((err as Error).message || 'Failed to save to database. Please check your connection.');
    } finally {
      setIsSaving(false);
      setIsPublishing(false);
    }
  };



  // Dedicated Immersive Studio Mode for Portfolio templates
  if (templateCategory === 'portfolio' || initialTemplate.id === 'web-developer-portfolio') {
    return (
      <PortfolioStudioView
        template={initialTemplate}
        eventData={currentEventData}
        portfolioData={portfolioData}
        onChangePortfolioData={setPortfolioData}
        onSave={handleSave}
        isSaving={isSaving}
        isPublishing={isPublishing}
        publishStatus={publishStatus}
        subdomain={subdomain}
        onChangeSubdomain={setSubdomain}
        onToast={showToast}
        onBack={() => navigate('/templates')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col antialiased">
      <Navbar />

      <main className="w-full pt-16 bg-surface flex-1">
        {/* Top Action Bar */}
        <div className="w-full bg-surface-container-lowest shadow-sm border-b border-surface-container-high/60 sticky top-16 z-30">
          <div className="max-w-[1440px] mx-auto px-2.5 sm:px-6 py-2 flex items-center justify-between gap-2">
            {/* Mobile Left: Back + Status Dot */}
            <div className="flex sm:hidden items-center gap-1.5 min-w-0">
              <Link
                to="/templates"
                className="inline-flex items-center gap-0.5 text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                title="Back to templates"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Templates</span>
              </Link>
              <span className={`px-1.5 py-0.5 rounded-full text-[9.5px] font-bold border shrink-0 ${
                publishStatus === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {publishStatus === 'published' ? 'Live' : 'Draft'}
              </span>
            </div>

            {/* Desktop Left: Breadcrumb + Template Name + Status Pill */}
            <div className="hidden sm:flex items-center gap-2 min-w-0">
              <Link to="/templates" className="text-xs text-gray-500 hover:text-gray-800 transition-colors font-medium shrink-0">
                Templates
              </Link>
              <span className="text-gray-300 text-xs">/</span>
              <span className="text-xs font-semibold text-gray-800 truncate max-w-xs">{initialTemplate.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                publishStatus === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {publishStatus === 'published' ? '● Live' : '○ Draft'}
              </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
              <Link
                to={subdomain ? `/e/${subdomain}` : `/templates/${initialTemplate.id}`}
                target="_blank"
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold transition-colors border border-surface-container-high"
                title="Open live link"
              >
                <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                <span className="hidden sm:inline">Open Live Link</span>
                <span className="sm:hidden">Live</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setModalDevice('desktop');
                  setShowResponsiveModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold transition-all border border-surface-container-high shadow-xs cursor-pointer"
                title="Open Responsive Preview Tester (Mobile, Tablet, Desktop)"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">devices</span>
                <span className="hidden sm:inline">Responsive Preview</span>
                <span className="sm:hidden">Preview</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">{isSaving ? 'sync' : 'save'}</span>
                <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Draft'}</span>
                <span className="sm:hidden">{isSaving ? '...' : 'Save'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isPublishing}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isPublishing ? 'sync' : 'rocket_launch'}
                </span>
                <span className="hidden sm:inline">{isPublishing ? 'Publishing...' : 'Publish to Web'}</span>
                <span className="sm:hidden">{isPublishing ? '...' : 'Publish'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile View Switcher Pill Bar (lg:hidden) */}
        <div className="lg:hidden w-full bg-surface-container-low/95 backdrop-blur-md px-3 py-2 border-b border-surface-container-high/60 sticky top-[108px] z-20 flex items-center justify-center shadow-xs">
          <div className="inline-flex items-center p-1 bg-white rounded-xl shadow-xs border border-surface-container-high w-full max-w-sm">
            <button
              type="button"
              onClick={() => setMobilePane('editor')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mobilePane === 'editor'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Edit Panel</span>
            </button>
            <button
              type="button"
              onClick={() => setMobilePane('preview')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mobilePane === 'preview'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>Live Preview</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#14305A] text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-white flex items-center gap-2 animate-bounce">
            <span className="material-symbols-outlined text-[20px] text-[#ffd84d]">info</span>
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}

        {/* Workspace Canvas (Split Layout) */}
        <div className="max-w-[1440px] w-full mx-auto px-2.5 sm:px-6 py-3 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
            {/* LEFT COLUMN: Editor Controls & Tabs (7 cols) */}
            <div className={`lg:col-span-7 flex flex-col gap-4 ${mobilePane === 'preview' ? 'hidden lg:flex' : 'flex'}`}>
              {/* Category-Tailored Tab Navigation */}
              {templateCategory === 'wedding' ? (
                <div className="bg-surface-container-low p-1 sm:p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto border border-surface-container-high/60 scrollbar-none touch-pan-x shadow-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('main-info')}
                    className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      activeTab !== 'share'
                        ? 'bg-white text-[#14305A] shadow-sm border border-gray-200/80 ring-1 ring-black/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px] text-[#ff5a5f]">favorite</span>
                    <span className="hidden sm:inline">1. Wedding Ceremony &amp; Narrative</span>
                    <span className="sm:hidden">1. Wedding Details</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('share')}
                    className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      activeTab === 'share'
                        ? 'bg-white text-[#14305A] shadow-sm border border-gray-200/80 ring-1 ring-black/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px] text-emerald-600">link</span>
                    <span>2. Share</span>
                  </button>
                </div>
              ) : (templateCategory as any) === 'portfolio' ? (
                <div className="bg-surface-container-low p-1 sm:p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto border border-surface-container-high/60 scrollbar-none touch-pan-x shadow-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('main-info')}
                    className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      activeTab !== 'share'
                        ? 'bg-white text-[#14305A] shadow-sm border border-gray-200/80 ring-1 ring-black/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px] text-primary">tune</span>
                    <span>1. Customization</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('share')}
                    className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      activeTab === 'share'
                        ? 'bg-white text-[#14305A] shadow-sm border border-gray-200/80 ring-1 ring-black/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px] text-emerald-600">link</span>
                    <span>2. Link &amp; Share</span>
                  </button>
                </div>
              ) : templateCategory === 'restaurant' ? (
                <div className="bg-surface-container-low p-1 sm:p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto border border-surface-container-high/60 scrollbar-none touch-pan-x shadow-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('main-info')}
                    className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      activeTab !== 'share'
                        ? 'bg-white text-[#14305A] shadow-sm border border-gray-200/80 ring-1 ring-black/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px] text-[#006876]">restaurant</span>
                    <span className="hidden sm:inline">1. Restaurant &amp; Tasting Menu Sequence</span>
                    <span className="sm:hidden">1. Dining &amp; Menu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('share')}
                    className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      activeTab === 'share'
                        ? 'bg-white text-[#14305A] shadow-sm border border-gray-200/80 ring-1 ring-black/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px] text-emerald-600">link</span>
                    <span>2. Share</span>
                  </button>
                </div>
              ) : ['saas', 'business', 'ecommerce', 'education'].includes(templateCategory) ? (
                <div className="bg-surface-container-low p-1 sm:p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto border border-surface-container-high/60 scrollbar-none touch-pan-x shadow-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('main-info')}
                    className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      activeTab !== 'share'
                        ? 'bg-white text-[#14305A] shadow-sm border border-gray-200/80 ring-1 ring-black/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px] text-primary">rocket_launch</span>
                    <span className="hidden sm:inline">1. Product &amp; Pricing Customization</span>
                    <span className="sm:hidden">1. Product &amp; Pricing</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('share')}
                    className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      activeTab === 'share'
                        ? 'bg-white text-[#14305A] shadow-sm border border-gray-200/80 ring-1 ring-black/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px] text-emerald-600">link</span>
                    <span>2. Share</span>
                  </button>
                </div>
              ) : (
                /* Default / Birthday Tab Navigation */
                <div className="bg-surface-container-low p-1 sm:p-1.5 rounded-2xl flex items-center gap-1 sm:gap-1.5 overflow-x-auto border border-surface-container-high/60 scrollbar-none touch-pan-x shadow-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('main-info')}
                    className={`px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      activeTab === 'main-info' || activeTab === 'general'
                        ? 'bg-white text-[#14305A] shadow-sm border border-gray-200/80 ring-1 ring-black/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px] text-[#ff5a5f]">event_available</span>
                    <div className="text-left">
                      <span className="block leading-tight text-xs">1. Main Info</span>
                      <span className="hidden sm:block text-[9.5px] font-normal text-gray-400 mt-0.5">Date, Venue, Dress &amp; Image</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('default-info')}
                    className={`px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      activeTab === 'default-info' || activeTab === 'rsvp' || activeTab === 'theme'
                        ? 'bg-white text-[#14305A] shadow-sm border border-gray-200/80 ring-1 ring-black/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px] text-[#006876]">article</span>
                    <div className="text-left">
                      <span className="block leading-tight text-xs">2. Site Details</span>
                      <span className="hidden sm:block text-[9.5px] font-normal text-gray-400 mt-0.5">All Template Texts &amp; RSVP</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('music')}
                    className={`px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      activeTab === 'music' || activeTab === 'media'
                        ? 'bg-white text-[#14305A] shadow-sm border border-gray-200/80 ring-1 ring-black/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px] text-[#c97b84]">music_note</span>
                    <div className="text-left">
                      <span className="block leading-tight text-xs">3. Music</span>
                      <span className="hidden sm:block text-[9.5px] font-normal text-gray-400 mt-0.5">Audio Player &amp; Custom Track</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('share')}
                    className={`px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      activeTab === 'share' || activeTab === 'domain'
                        ? 'bg-white text-[#14305A] shadow-sm border border-gray-200/80 ring-1 ring-black/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px] text-emerald-600">link</span>
                    <div className="text-left">
                      <span className="block leading-tight text-xs">4. Share</span>
                      <span className="hidden sm:block text-[9.5px] font-normal text-gray-400 mt-0.5">QR Code &amp; WhatsApp</span>
                    </div>
                  </button>
                </div>
              )}

              {/* WEDDING EDIT SECTION */}
              {templateCategory === 'wedding' && activeTab !== 'share' && (
                <WeddingEditSection
                  title={siteTitle}
                  tagline={siteTagline}
                  date={eventDate}
                  time={eventTime}
                  venue={venue}
                  address={address}
                  note={welcomeNote}
                  photos={photos}
                  schedule={schedule}
                  weddingData={weddingData}
                  locationMap={locationMap}
                  musicUrl={musicUrl}
                  rsvpDeadline={rsvpDeadline}
                  allowMealSelection={true}
                  allowDietary={allowDietary}
                  allowPlusOnes={allowPlusOnes}
                  onChangeTitle={setSiteTitle}
                  onChangeTagline={setSiteTagline}
                  onChangeDate={setEventDate}
                  onChangeTime={setEventTime}
                  onChangeVenue={setVenue}
                  onChangeAddress={setAddress}
                  onChangeNote={setWelcomeNote}
                  onChangePhotos={setPhotos}
                  onChangeSchedule={setSchedule}
                  onChangeWeddingData={setWeddingData}
                  onChangeLocationMap={setLocationMap}
                  onChangeMusicUrl={(url) => {
                    setMusicUrl(url);
                    setMusicSettings((prev) => ({ ...prev, url, enabled: Boolean(url) }));
                  }}
                  onChangeRsvpDeadline={setRsvpDeadline}
                  onChangeAllowDietary={setAllowDietary}
                  onChangeAllowPlusOnes={setAllowPlusOnes}
                  onToast={showToast}
                />
              )}

              {/* PORTFOLIO & ARCHITECTURE EDIT SECTION */}
              {(templateCategory as any) === 'portfolio' && activeTab !== 'share' && (
                <PortfolioEditSection
                  title={siteTitle}
                  tagline={siteTagline}
                  note={welcomeNote}
                  venue={venue}
                  address={address}
                  date={eventDate}
                  photos={photos}
                  portfolioData={portfolioData}
                  onChangeTitle={setSiteTitle}
                  onChangeTagline={setSiteTagline}
                  onChangeNote={setWelcomeNote}
                  onChangeVenue={setVenue}
                  onChangeAddress={setAddress}
                  onChangeDate={setEventDate}
                  onChangePhotos={setPhotos}
                  onChangePortfolioData={setPortfolioData}
                  onToast={showToast}
                />
              )}

              {/* RESTAURANT & CULINARY EDIT SECTION */}
              {templateCategory === 'restaurant' && activeTab !== 'share' && (
                <RestaurantEditSection
                  title={siteTitle}
                  tagline={siteTagline}
                  note={welcomeNote}
                  venue={venue}
                  address={address}
                  date={eventDate}
                  photos={photos}
                  restaurantData={restaurantData}
                  locationMap={locationMap}
                  onChangeTitle={setSiteTitle}
                  onChangeTagline={setSiteTagline}
                  onChangeNote={setWelcomeNote}
                  onChangeVenue={setVenue}
                  onChangeAddress={setAddress}
                  onChangeDate={setEventDate}
                  onChangePhotos={setPhotos}
                  onChangeRestaurantData={setRestaurantData}
                  onChangeLocationMap={setLocationMap}
                  onToast={showToast}
                />
              )}

              {/* SAAS, BUSINESS & EDUCATION EDIT SECTION */}
              {['saas', 'business', 'ecommerce', 'education'].includes(templateCategory) && activeTab !== 'share' && (
                <SaasEditSection
                  title={siteTitle}
                  tagline={siteTagline}
                  note={welcomeNote}
                  venue={venue}
                  address={address}
                  date={eventDate}
                  photos={photos}
                  saasData={saasData}
                  onChangeTitle={setSiteTitle}
                  onChangeTagline={setSiteTagline}
                  onChangeNote={setWelcomeNote}
                  onChangeVenue={setVenue}
                  onChangeAddress={setAddress}
                  onChangeDate={setEventDate}
                  onChangePhotos={setPhotos}
                  onChangeSaasData={setSaasData}
                  onToast={showToast}
                />
              )}

              {/* DEFAULT / BIRTHDAY EDIT SECTIONS */}
              {templateCategory === 'birthday' && (
                <>
                  {(activeTab === 'main-info' || activeTab === 'general') && (
                    <BirthdayMainInfoSection
                      date={eventDate}
                      time={eventTime}
                      venue={venue}
                      address={address}
                      dressCode={dressCode}
                      locationMap={locationMap}
                      photos={photos}
                      onChangeDate={setEventDate}
                      onChangeTime={setEventTime}
                      onChangeVenue={setVenue}
                      onChangeAddress={setAddress}
                      onChangeDressCode={setDressCode}
                      onChangeLocationMap={setLocationMap}
                      onChangePhotos={setPhotos}
                      onToast={showToast}
                    />
                  )}

                  {(activeTab === 'default-info' || activeTab === 'rsvp' || activeTab === 'theme') && (
                    <BirthdayDefaultInfoSection
                      title={siteTitle}
                      tagline={siteTagline}
                      milestoneAge={milestoneAge}
                      welcomeNote={welcomeNote}
                      schedule={schedule}
                      rsvpEnabled={rsvpEnabled}
                      rsvpDeadline={rsvpDeadline}
                      requireMobile={requireMobile}
                      allowPlusOnes={allowPlusOnes}
                      allowDietary={allowDietary}
                      accentPalette={accentPalette}
                      fontPairing={fontPairing}
                      onChangeTitle={setSiteTitle}
                      onChangeTagline={setSiteTagline}
                      onChangeMilestoneAge={setMilestoneAge}
                      onChangeWelcomeNote={setWelcomeNote}
                      onChangeSchedule={setSchedule}
                      onChangeRsvpEnabled={setRsvpEnabled}
                      onChangeRsvpDeadline={setRsvpDeadline}
                      onChangeRequireMobile={setRequireMobile}
                      onChangeAllowPlusOnes={setAllowPlusOnes}
                      onChangeAllowDietary={setAllowDietary}
                      onChangeAccentPalette={setAccentPalette}
                      onChangeFontPairing={setFontPairing}
                      onResetDefaults={handleResetDefaults}
                      onToast={showToast}
                    />
                  )}

                  {(activeTab === 'music' || activeTab === 'media') && (
                    <MusicEditorSection
                      currentMusicUrl={musicUrl}
                      musicSettings={musicSettings}
                      onChangeMusic={(newUrl, newSettings) => {
                        setMusicUrl(newUrl);
                        if (newSettings) {
                          setMusicSettings(newSettings);
                        } else {
                          setMusicSettings((prev) => ({
                            ...prev,
                            enabled: Boolean(newUrl),
                            url: newUrl,
                          }));
                        }
                      }}
                      onToast={showToast}
                    />
                  )}
                </>
              )}

              {/* SECTION 4: Link & Sharing Hub */}
              {(activeTab === 'share' || activeTab === 'domain') && (
                <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high space-y-5">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Website Link &amp; Sharing Hub</h2>
                    <p className="text-xs text-gray-500">
                      Copy your public event link, scan QR code on mobile, or share directly on WhatsApp &amp; social platforms.
                    </p>
                  </div>

                  {/* Primary Link Card */}
                  <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high space-y-3">
                    <label className="text-xs font-bold text-gray-800 block">Your Live Website Link</label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="flex-1 flex items-center px-3 py-2 bg-white rounded-xl border border-surface-container-high font-mono text-xs text-gray-800 truncate shadow-inner">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600 mr-2 shrink-0">link</span>
                        <span className="truncate">{liveUrl}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                            copiedLink
                              ? 'bg-emerald-600 text-white'
                              : 'bg-primary text-on-primary hover:bg-primary-container'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {copiedLink ? 'check' : 'content_copy'}
                          </span>
                          <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                        </button>
                        <a
                          href={liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-white text-gray-700 hover:text-gray-900 border border-surface-container-high transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                          <span>Open</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Instant Platform Sharing Buttons */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-800 block">Share Instantly on Social Apps</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `You're invited to celebrate with us! Visit our interactive website: ${siteTitle}\n${liveUrl}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:brightness-105 transition-all shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[18px]">chat</span>
                        <span>Share on WhatsApp</span>
                      </a>

                      <button
                        type="button"
                        onClick={handleNativeShare}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black transition-all shadow-sm cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">share</span>
                        <span>Share to Any App (Device)</span>
                      </button>

                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                          `Check out our website: ${siteTitle}`
                        )}&url=${encodeURIComponent(liveUrl)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1DA1F2] text-white text-xs font-bold hover:brightness-105 transition-all shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[18px]">send</span>
                        <span>Share on X (Twitter)</span>
                      </a>

                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(liveUrl)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1877F2] text-white text-xs font-bold hover:brightness-105 transition-all shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[18px]">public</span>
                        <span>Share on Facebook</span>
                      </a>
                    </div>
                  </div>

                  {/* QR Code Card for Mobile Testing */}
                  {qrCodeUrl && (
                    <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high flex flex-col sm:flex-row items-center gap-4">
                      <div className="bg-white p-2 rounded-xl shadow border border-gray-200 shrink-0">
                        <img src={qrCodeUrl} alt="Website QR Code" className="w-28 h-28 object-contain" />
                      </div>
                      <div className="space-y-1 text-center sm:text-left">
                        <span className="text-xs font-bold text-gray-900 block">Mobile QR Code Access</span>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          Scan this QR code with your smartphone camera to immediately view and test the mobile RSVP, songs, and animations on your phone.
                        </p>
                        <a
                          href={qrCodeUrl}
                          download={`${subdomain || 'event'}-qrcode.png`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline mt-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">download</span>
                          <span>Download QR Code Image</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Custom Subdomain Slug Config */}
                  <div className="space-y-3 pt-2 border-t border-surface-container-high">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Customize Event URL Slug</label>
                      <div className="flex items-center">
                        <span className="h-10 px-3 bg-gray-100 text-gray-500 text-xs font-mono flex items-center border border-r-0 border-gray-200 rounded-l-xl select-none truncate max-w-[140px] sm:max-w-none">
                          tempo.site/e/
                        </span>
                        <input
                          type="text"
                          value={subdomain}
                          onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          placeholder="leo-5th-birthday"
                          className="flex-1 h-10 px-3 bg-white text-xs font-mono rounded-r-xl border border-gray-200 focus:outline-none text-gray-900"
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">Lowercase letters, numbers, and dashes only.</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Social Card Description (WhatsApp / Google)</label>
                      <textarea
                        rows={2}
                        value={metaDesc}
                        onChange={(e) => setMetaDesc(e.target.value)}
                        placeholder="Join us for a wonderful party celebration..."
                        className="w-full p-2.5 text-xs bg-surface-container-low rounded-xl border border-gray-200 focus:bg-white text-gray-900 resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Sticky Real-time Live Interactive Template Preview (5 cols) */}
            <div className={`lg:col-span-5 lg:sticky lg:top-36 space-y-3 ${mobilePane === 'editor' ? 'hidden lg:block' : 'block'}`}>
              {/* Preview Control Header with Responsive Device Switcher */}
              <div className="flex items-center justify-between bg-surface-container-lowest px-3 sm:px-4 py-2 rounded-xl shadow-sm border border-surface-container-high gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-xs font-bold text-gray-800 truncate">Live Canvas</span>
                  {!isFreeTemplate && (
                    <button
                      type="button"
                      onClick={() => setShowUpiModal(true)}
                      className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                        isUnlocked
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[11px]">{isUnlocked ? 'check_circle' : 'lock'}</span>
                      <span>{isUnlocked ? 'Unlocked' : `Pay ${initialTemplate.priceLabel || '₹999'}`}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <div className="flex items-center gap-0.5 bg-surface-container-low p-0.5 rounded-lg border border-surface-container-high/60">
                    <button
                      type="button"
                      onClick={() => setViewportMode('mobile')}
                      className={`p-1.5 rounded transition-all cursor-pointer ${
                        viewportMode === 'mobile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                      }`}
                      title="Mobile Smartphone View (390px)"
                    >
                      <span className="material-symbols-outlined text-[16px]">smartphone</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewportMode('tablet')}
                      className={`p-1.5 rounded transition-all cursor-pointer ${
                        viewportMode === 'tablet' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                      }`}
                      title="Tablet View"
                    >
                      <span className="material-symbols-outlined text-[16px]">tablet</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewportMode('desktop')}
                      className={`p-1.5 rounded transition-all cursor-pointer ${
                        viewportMode === 'desktop' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                      }`}
                      title="Desktop View"
                    >
                      <span className="material-symbols-outlined text-[16px]">desktop_windows</span>
                    </button>
                  </div>

                  {/* Pop-out Fullscreen Responsive Tester Modal */}
                  <button
                    type="button"
                    onClick={() => {
                      setModalDevice(viewportMode);
                      setShowResponsiveModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-gray-700 hover:text-gray-900 transition-colors cursor-pointer border border-surface-container-high/80"
                    title="Open Fullscreen Responsive Tester"
                  >
                    <span className="material-symbols-outlined text-[17px]">open_in_full</span>
                  </button>
                </div>
              </div>

              {/* Interactive Live Frame */}
              <div
                className={`bg-[#1c1312] rounded-2xl shadow-2xl overflow-hidden transition-all border border-[#4A322C]/40 ${
                  viewportMode === 'mobile'
                    ? 'max-w-[390px] mx-auto min-h-[740px] max-h-[88vh]'
                    : viewportMode === 'tablet'
                    ? 'max-w-[640px] mx-auto min-h-[740px] max-h-[88vh]'
                    : 'w-full min-h-[740px] max-h-[88vh]'
                }`}
              >
                <div className="w-full h-full overflow-y-auto p-1 sm:p-2">
                  <TemplateRenderer
                    templateId={initialTemplate.id}
                    data={currentEventData}
                    isLivePreview={true}
                    onRsvpSubmit={(rsvpData) => {
                      showToast(`RSVP simulated for ${rsvpData.guestName}! Phone: ${rsvpData.mobileNumber || 'N/A'}`);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

            {/* Fullscreen Responsive Interactive Preview Modal */}
      {showResponsiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setShowResponsiveModal(false)} />

          <div className="relative w-full max-w-6xl bg-stone-950 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col h-[94vh] max-h-[94vh] border border-white/15 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3 bg-stone-900 border-b border-white/10 flex items-center justify-between shrink-0 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                    Responsive Live Preview
                  </h3>
                  <p className="text-[11px] text-white/60 hidden sm:block">
                    Test live rendering, 3D tilt, and interactive WhatsApp hire buttons across devices
                  </p>
                </div>
              </div>

              {/* Device Mode Switcher */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setModalDevice('mobile')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      modalDevice === 'mobile'
                        ? 'bg-white text-stone-950 shadow-md'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">smartphone</span>
                    <span>Mobile (390px)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalDevice('tablet')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      modalDevice === 'tablet'
                        ? 'bg-white text-stone-950 shadow-md'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">tablet</span>
                    <span>Tablet (768px)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalDevice('desktop')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      modalDevice === 'desktop'
                        ? 'bg-white text-stone-950 shadow-md'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">desktop_windows</span>
                    <span>Desktop (Fluid)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowResponsiveModal(false)}
                  className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
                  title="Close Preview"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Modal Body: Device Viewport Showcase */}
            <div className="flex-1 overflow-y-auto bg-stone-900/50 p-2 sm:p-5 flex items-center justify-center">
              <div
                className={`transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-stone-950 flex flex-col ${
                  modalDevice === 'mobile'
                    ? 'w-[390px] h-[780px] ring-8 ring-stone-800'
                    : modalDevice === 'tablet'
                    ? 'w-[768px] h-[820px] ring-8 ring-stone-800'
                    : 'w-full h-full max-h-[86vh]'
                }`}
              >
                {/* Simulated Device Browser Bar */}
                <div className="px-3.5 py-2 bg-stone-900 flex items-center gap-2 border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex-1 max-w-sm mx-auto h-5 rounded bg-stone-950 px-2.5 flex items-center justify-between text-stone-400 font-mono text-[11px] truncate">
                    <span className="truncate">tempo.com/e/${subdomain || 'preview'}</span>
                    <span className="material-symbols-outlined text-[12px] text-emerald-400">lock</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/50 uppercase hidden sm:inline">
                    {modalDevice === 'mobile' ? '390 × 844' : modalDevice === 'tablet' ? '768 × 1024' : '100% Fluid'}
                  </span>
                </div>

                {/* Live Template Content */}
                <div className="flex-1 w-full overflow-y-auto relative bg-black">
                  <TemplateRenderer
                    templateId={initialTemplate.id}
                    data={currentEventData}
                    isLivePreview={true}
                    onRsvpSubmit={(rsvpData) => {
                      showToast(`RSVP simulated for ${rsvpData.guestName}!`);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* UPI Payment Gate Modal */}
      <UpiPaymentModal
        isOpen={showUpiModal}
        onClose={() => setShowUpiModal(false)}
        onSuccess={() => {
          setIsUnlocked(true);
          setShowUpiModal(false);
          showToast(`Access granted to ${initialTemplate.name}! 🎉`);
        }}
        templateId={initialTemplate.id}
        templateName={initialTemplate.name}
        priceLabel={initialTemplate.priceLabel}
        priceAmount={initialTemplate.price || 29}
        userId={user?.id}
      />

      {/* Publish Success Popup Modal */}
      {showPublishSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setShowPublishSuccessModal(false)} />
          <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden z-10 border border-surface-container-high animate-in zoom-in-95 duration-200">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-[#14305A] via-[#1E4984] to-[#006876] text-white p-6 sm:p-7 text-center relative overflow-hidden">
              <button
                type="button"
                onClick={() => setShowPublishSuccessModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>

              <div className="w-14 h-14 mx-auto rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner border border-white/20">
                <span className="material-symbols-outlined text-3xl text-white/90">public</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Published to Web
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">Your Website is Live!</h2>
              <p className="text-xs text-white/80 mt-1 max-w-sm mx-auto">
                {siteTitle} is live on the internet and ready to receive RSVPs and guests!
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* Copy URL Box */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Shareable Public URL</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs text-gray-800 truncate shadow-inner">
                    {liveUrl}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-primary text-on-primary hover:bg-primary-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copiedLink ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">Instant Share</label>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `You're invited to celebrate with us! Visit our interactive website: ${siteTitle}\n${liveUrl}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:brightness-105 transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[17px]">chat</span>
                    <span>WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black transition-all shadow-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[17px]">share</span>
                    <span>Any App</span>
                  </button>
                </div>
              </div>

              {/* QR Code */}
              {qrCodeUrl && (
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-4">
                  <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20 bg-white p-1 rounded-xl shadow border border-gray-200 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-gray-900">Scan to Open on Mobile</p>
                    <p className="text-[11px] text-gray-500">
                      Scan with any smartphone camera to preview this site instantly on mobile.
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex-1 py-3 px-4 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary-container shadow text-center flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Open Live Website</span>
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowPublishSuccessModal(false)}
                  className="w-full sm:w-auto py-3 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

