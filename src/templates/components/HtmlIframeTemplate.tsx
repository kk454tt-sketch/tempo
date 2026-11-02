import { openWhatsAppWithMessage } from '@/utils/whatsappRsvp';
import React, { useRef, useState, useEffect } from 'react';
import { TemplateProps } from '@/types/template';

interface HtmlIframeTemplateProps extends TemplateProps {
  htmlSrc: string;
  templateTitle?: string;
}

export const HtmlIframeTemplate: React.FC<HtmlIframeTemplateProps> = ({
  htmlSrc,
  templateTitle = 'Interactive Template',
  data,
  isLivePreview: _isLivePreview = false,
  onRsvpSubmit,
}) => {
  void _isLivePreview;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize editor updates with the iframe DOM where possible without mutating core animations
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const syncDom = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;

        // Synchronize dynamic script configurations (e.g. window.__TEMPO_EVENT_CONFIG)
        const win = iframe.contentWindow as any;
        if (win && win.__TEMPO_EVENT_CONFIG) {
          if (data?.title) win.__TEMPO_EVENT_CONFIG.title = data.title;
          if (data?.tagline) win.__TEMPO_EVENT_CONFIG.script = data.tagline;
          if (data?.venue) win.__TEMPO_EVENT_CONFIG.venue = data.venue;
          if (data?.address) win.__TEMPO_EVENT_CONFIG.addr = data.address;
          if (data?.date) win.__TEMPO_EVENT_CONFIG.date = data.date;
          if ((data?.rsvpSettings as any)?.phone) win.__TEMPO_EVENT_CONFIG.phone = (data.rsvpSettings as any).phone;
          if (typeof win.applyConfigToDom === 'function') {
            win.applyConfigToDom(win.__TEMPO_EVENT_CONFIG);
          }
        }

        // 1. Title / Celebrant Name
        if (data?.title) {
          const titleEls = doc.querySelectorAll('h1, .event-title, #event-title, .celebrant-name, [data-field="title"], [data-k="title"]');
          titleEls.forEach((el) => {
            if (data.title !== 'Untitled Event') {
              el.textContent = data.title;
            }
          });
          if (doc.title) {
            doc.title = data.title;
          }
        }

        // 2. Tagline / Subtitle
        if (data?.tagline) {
          const taglineEls = doc.querySelectorAll('.event-tagline, #event-tagline, .subheadline, [data-field="tagline"], [data-k="script"]');
          taglineEls.forEach((el) => {
            el.textContent = data.tagline;
          });
        }

        // 3. Date
        if (data?.date) {
          const dateEls = doc.querySelectorAll('.event-date, #event-date, .date, [data-field="date"], [data-k="hdate"], [data-k="ddate"]');
          dateEls.forEach((el) => {
            el.textContent = data.date;
          });
        }

        // 4. Time
        if (data?.time) {
          const timeEls = doc.querySelectorAll('.event-time, #event-time, .time, [data-field="time"], [data-k="dtime"]');
          timeEls.forEach((el) => {
            el.textContent = data.time;
          });
        }

        // 5. Venue & Address
        if (data?.venue) {
          const venueEls = doc.querySelectorAll('.event-venue, #event-venue, .venue, [data-field="venue"], [data-k="venue"]');
          venueEls.forEach((el) => {
            el.textContent = data.venue;
          });
        }
        if (data?.address) {
          const addrEls = doc.querySelectorAll('.event-address, #event-address, .address, [data-field="address"], [data-k="addr"]');
          addrEls.forEach((el) => {
            el.textContent = data.address;
          });
        }

        // 6. Note / Description / Host
        if (data?.note) {
          const noteEls = doc.querySelectorAll('.event-note, #event-note, .note, [data-field="note"], [data-k="host"]');
          noteEls.forEach((el) => {
            el.textContent = data.note;
          });
        }

        // 7. Cover / Polaroid Photo
        if (data?.photos && data.photos.length > 0 && data.photos[0].url) {
          const photoEls = doc.querySelectorAll('img.hero-photo, img.polaroid-img, img.cover-photo, img.main-photo, img#ph, [data-field="photo"]');
          photoEls.forEach((el) => {
            (el as HTMLImageElement).src = data.photos[0].url;
          });
        }

        // Listen for form submissions (like RSVP forms in HTML templates) and direct to WhatsApp with overfill
        const forms = doc.querySelectorAll('form');
        forms.forEach((form) => {
          if (!form.getAttribute('data-rsvp-bound')) {
            form.setAttribute('data-rsvp-bound', 'true');
            form.addEventListener('submit', (e) => {
              e.preventDefault();
              e.stopPropagation();

              const formData = new FormData(form as HTMLFormElement);
              const rsvpObj: Record<string, unknown> = {};
              formData.forEach((val, key) => {
                rsvpObj[key] = val;
              });
              if (onRsvpSubmit) {
                onRsvpSubmit(rsvpObj);
              }

              const formEl = form as HTMLFormElement;
              const nameInput = formEl.querySelector<HTMLInputElement>('input[name*="name" i], input[id*="name" i], input[type="text"]');
              const mobileInput = formEl.querySelector<HTMLInputElement>('input[type="tel"], input[name*="phone" i], input[name*="mobile" i]');
              const guestSelect = formEl.querySelector<HTMLSelectElement | HTMLInputElement>('select[name*="guest" i], input[name*="guest" i]');
              const attendSelect = formEl.querySelector<HTMLSelectElement | HTMLInputElement>('select[name*="attend" i], input[name*="attend" i]:checked, select[id*="attend" i]');
              const wishesText = formEl.querySelector<HTMLTextAreaElement>('textarea');

              const guestName = (rsvpObj.name || rsvpObj.guestName || nameInput?.value || 'Friend / Guest').toString();
              const guestMobile = (rsvpObj.mobile || rsvpObj.phone || mobileInput?.value || '').toString();
              const attendance = (rsvpObj.attendance || attendSelect?.value || 'yes').toString();
              const guestCount = (rsvpObj.guestCount || rsvpObj.guests || guestSelect?.value || '1').toString();
              const wishes = (rsvpObj.wishes || rsvpObj.message || wishesText?.value || '').toString();

              openWhatsAppWithMessage({
                eventTitle: data?.title || templateTitle,
                eventType: data?.eventType || 'Celebration',
                date: data?.date,
                time: data?.time,
                venue: data?.venue,
                address: data?.address,
                guestName,
                guestMobile,
                attendance,
                guestCount,
                wishes,
                recipientPhone: (data?.rsvpSettings as any)?.phone,
              });

              const submitBtn = formEl.querySelector('button[type="submit"], input[type="submit"]');
              if (submitBtn) {
                const prev = submitBtn.textContent;
                submitBtn.textContent = '✓ Opening WhatsApp...';
                setTimeout(() => { if (prev) submitBtn.textContent = prev; }, 3000);
              }
            });
          }
        });

        // Intercept any WhatsApp links inside iframe to ensure they are overfilled
        const waLinks = doc.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"], [data-whatsapp]');
        waLinks.forEach((anchor) => {
          if (!anchor.getAttribute('data-wa-bound')) {
            anchor.setAttribute('data-wa-bound', 'true');
            anchor.addEventListener('click', (e) => {
              e.preventDefault();
              openWhatsAppWithMessage({
                eventTitle: data?.title || templateTitle,
                eventType: data?.eventType || 'Celebration',
                date: data?.date,
                time: data?.time,
                venue: data?.venue,
                address: data?.address,
                guestName: 'Friend / Guest',
                attendance: 'yes',
                guestCount: '1',
                recipientPhone: (data?.rsvpSettings as any)?.phone,
              });
            });
          }
        });
      } catch (err) {
        console.debug('Iframe DOM synchronization note:', err);
      }
    };

    const handleLoad = () => {
      setIsLoading(false);
      syncDom();
    };

    // If iframe already loaded, run sync directly
    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
      syncDom();
    }

    iframe.addEventListener('load', handleLoad);
    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, [data, onRsvpSubmit]);


  const isPortfolio =
    data?.eventType?.toLowerCase() === 'portfolio' ||
    (data as any)?.category === 'portfolio';
  const isMusicConfigured = data?.musicSettings
    ? data.musicSettings.enabled
    : isPortfolio
    ? Boolean(data?.musicUrl)
    : Boolean(data?.musicUrl);
  const musicUrl = isMusicConfigured
    ? (data?.musicSettings?.url || (data as unknown as Record<string, unknown>)?.musicUrl as string || (isPortfolio ? '' : '/music/happy-birthday.mp3'))
    : '';
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpAttending, setRsvpAttending] = useState<'yes' | 'no'>('yes');
  const [rsvpGuests, setRsvpGuests] = useState('1');
  const [rsvpWishes, setRsvpWishes] = useState('');
  const [rsvpSent, setRsvpSent] = useState(false);

  const handleFloatingRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) return;

    openWhatsAppWithMessage({
      eventTitle: data?.title || templateTitle,
      eventType: data?.eventType || 'Celebration',
      date: data?.date,
      time: data?.time,
      venue: data?.venue,
      address: data?.address,
      guestName: rsvpName.trim(),
      guestMobile: rsvpPhone.trim(),
      attendance: rsvpAttending,
      guestCount: rsvpGuests,
      wishes: rsvpWishes.trim(),
      recipientPhone: (data?.rsvpSettings as any)?.phone,
    });

    onRsvpSubmit?.({
      name: rsvpName.trim(),
      phone: rsvpPhone.trim(),
      attendance: rsvpAttending,
      guestCount: rsvpGuests,
      wishes: rsvpWishes.trim(),
    });

    setRsvpSent(true);
    setTimeout(() => {
      setRsvpSent(false);
      setIsRsvpModalOpen(false);
    }, 2500);
  };

  const toggleMusic = () => {
    if (!audioRef.current || !musicUrl) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingMusic(true);
      }).catch((err) => console.debug('Audio play note:', err));
    }
  };
  void toggleMusic;

  return (
    <div className="relative w-full h-full min-h-[520px] md:min-h-[760px] flex flex-col bg-stone-950 rounded-xl overflow-hidden shadow-2xl border border-stone-800/60">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-stone-950/90 backdrop-blur-sm text-stone-400">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-mono tracking-wide">Loading interactive HTML experience...</p>
        </div>
      )}

      {/* Background Birthday Song Audio Element */}
      {musicUrl && (
        <audio
          ref={audioRef}
          src={musicUrl}
          loop
          preload="auto"
          onPlay={() => setIsPlayingMusic(true)}
          onPause={() => setIsPlayingMusic(false)}
        />
      )}

      {/* Audio Element for Music */}

      {/* Floating WhatsApp RSVP Modal */}
      {isRsvpModalOpen && (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl p-5 text-white animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[20px]">chat</span>
                <h4 className="font-bold text-sm">Send RSVP via WhatsApp</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsRsvpModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {rsvpSent ? (
              <div className="py-8 text-center">
                <span className="material-symbols-outlined text-emerald-400 text-[42px] mb-2">check_circle</span>
                <p className="font-bold text-base text-emerald-300">WhatsApp Launched!</p>
                <p className="text-xs text-stone-300 mt-1">Your pre-filled RSVP note is ready to send in WhatsApp.</p>
              </div>
            ) : (
              <form onSubmit={handleFloatingRsvpSubmit} className="mt-3 space-y-3">
                <p className="text-[11px] text-stone-400 leading-tight">
                  Fill in your details below and WhatsApp will open directly with your complete pre-filled RSVP message.
                </p>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-300 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    placeholder="e.g. Maya & Alex"
                    className="w-full h-9 px-3 bg-stone-800 border border-stone-700 rounded-lg text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-300 mb-1">Attendance</label>
                    <select
                      value={rsvpAttending}
                      onChange={(e) => setRsvpAttending(e.target.value as 'yes' | 'no')}
                      className="w-full h-9 px-2 bg-stone-800 border border-stone-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="yes">Attending 🎉</option>
                      <option value="no">Declining ❌</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-300 mb-1">Total Guests</label>
                    <select
                      value={rsvpGuests}
                      onChange={(e) => setRsvpGuests(e.target.value)}
                      className="w-full h-9 px-2 bg-stone-800 border border-stone-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="1">1 Person</option>
                      <option value="2">2 Persons</option>
                      <option value="3">3 Persons</option>
                      <option value="4+">4+ Persons</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-300 mb-1">Your WhatsApp / Mobile</label>
                  <input
                    type="tel"
                    value={rsvpPhone}
                    onChange={(e) => setRsvpPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="w-full h-9 px-3 bg-stone-800 border border-stone-700 rounded-lg text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-300 mb-1">Wishes / Note (Optional)</label>
                  <textarea
                    rows={2}
                    value={rsvpWishes}
                    onChange={(e) => setRsvpWishes(e.target.value)}
                    placeholder="Congratulations! Can't wait to celebrate!"
                    className="w-full p-2 bg-stone-800 border border-stone-700 rounded-lg text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer mt-2"
                >
                  <span className="material-symbols-outlined text-[17px]">send</span>
                  <span>Send via WhatsApp (Pre-filled)</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* The Native HTML Template Iframe */}
      <iframe
        ref={iframeRef}
        src={htmlSrc}
        title={data?.title || templateTitle}
        className="w-full flex-1 min-h-[500px] md:min-h-[720px] border-0 bg-transparent"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
      />
    </div>
  );
};

/**
 * Higher-Order Component factory to produce a TemplateProps-compatible
 * React component for each HTML template.
 */
export const createHtmlTemplateComponent = (
  htmlSrc: string,
  templateTitle: string
): React.FC<TemplateProps> => {
  const Component: React.FC<TemplateProps> = (props) => (
    <HtmlIframeTemplate
      {...props}
      htmlSrc={htmlSrc}
      templateTitle={templateTitle}
    />
  );
  Component.displayName = `HtmlTemplate(${templateTitle})`;
  return Component;
};

// Specialized React components for curated templates
export const EditorialEvelynTemplate = createHtmlTemplateComponent(
  '/html-templates/editorial-evelyn-30th.html',
  "Evelyn's Editorial 30th Soirée"
);

export const MidnightPartySarahTemplate = createHtmlTemplateComponent(
  '/html-templates/midnight-party-sarah-25th.html',
  "Sarah's Midnight Neon Party"
);

export const CinematicElenaJulianWeddingTemplate = createHtmlTemplateComponent(
  '/html-templates/cinematic-elena-julian-wedding.html',
  'Elena & Julian Cinematic Wedding'
);

export const MidsummerEveningInvitationTemplate = createHtmlTemplateComponent(
  '/html-templates/midsummer-evening-invitation.html',
  'A Midsummer Evening Soirée'
);

export const ValentinSpeculativeNoirTemplate = createHtmlTemplateComponent(
  '/html-templates/valentin-speculative-noir.html',
  "Valentin's Speculative Noir Protocol"
);

export const GoldenStarsCelebrationTemplate = createHtmlTemplateComponent(
  '/html-templates/golden-stars-celebration.html',
  "Golden Stars Celebration Invitation"
);

export const InteractiveModernInviteTemplate = createHtmlTemplateComponent(
  '/html-templates/interactive-modern-invite.html',
  "Interactive Modern Birthday & WhatsApp RSVP"
);

export const EnchantedWhisperingPinesTemplate = createHtmlTemplateComponent(
  '/html-templates/enchanted-whispering-pines.html',
  "Enchanted Whispering Pines Birthday"
);

export const RoyalLuxuryEnvelopeTemplate = createHtmlTemplateComponent(
  '/html-templates/royal-luxury-envelope.html',
  "Royal Heritage Wax Envelope Soirée"
);

export const RoyalRoseMomentsTemplate = createHtmlTemplateComponent(
  '/html-templates/royal-rose-moments.html',
  "Royal Rose Moments Celebration"
);

export const JanamdinMubarakHindiTemplate = createHtmlTemplateComponent(
  '/html-templates/janamdin-mubarak-hindi.html',
  "जन्मदिन मुबारक - Janamdin Mubarak"
);

// Portfolio Templates (Tempo.tt Collection)
export const DesignGalleryPortfolioTemplate = createHtmlTemplateComponent(
  '/html-templates/design-gallery-portfolio.html',
  '2022 Design Gallery — Editorial Portfolio'
);

export const ThreeDInMotionPortfolioTemplate = createHtmlTemplateComponent(
  '/html-templates/3d-in-motion-portfolio.html',
  '3D in Motion — 3D Character Artist & Animator'
);

export const EmiwayMinecraftPortfolioTemplate = createHtmlTemplateComponent(
  '/html-templates/emiway-minecraft-portfolio.html',
  'EMIWAY | Minecraft Player & Creator Portfolio'
);

export const AlexThreeDDesignerPortfolioTemplate = createHtmlTemplateComponent(
  '/html-templates/alex-3d-designer-portfolio.html',
  "Hi, I'm Alex — 3D Designer Portfolio"
);

export const MotionDesignerPortfolioTemplate = createHtmlTemplateComponent(
  '/html-templates/motion-designer-portfolio.html',
  'Motion Graphics Designer Portfolio'
);

export const WebDeveloperThreeDPortfolioTemplate = createHtmlTemplateComponent(
  '/html-templates/web-developer-portfolio.html',
  '3D Web Developer Interactive Portfolio'
);
