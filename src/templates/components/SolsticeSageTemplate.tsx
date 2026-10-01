import React, { useState, useEffect } from 'react';
import { TemplateProps } from '../types';
import { calculateCountdown } from '@/utils/countdown';
import { getThemeStyles } from '@/utils/themeHelper';

export const SolsticeSageTemplate: React.FC<TemplateProps> = ({
  data,
  isLivePreview = false,
  onRsvpSubmit,
}) => {
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [attendance, setAttendance] = useState('accept');
  const [mealPreference, setMealPreference] = useState('harvest');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [songRequest, setSongRequest] = useState('');
  const [plusOnes, setPlusOnes] = useState('0');
  const [rsvpError, setRsvpError] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Guestbook wish state
  const [wishes, setWishes] = useState<Array<{ name: string; message: string; date: string }>>([
    {
      name: 'Elena & Marcus',
      message: 'So incredibly thrilled to celebrate this magical chapter with you both!',
      date: 'Yesterday',
    },
    {
      name: 'Oliver Vance',
      message: 'Wishing you endless joy, laughter, and timeless adventures ahead.',
      date: '2 days ago',
    },
  ]);
  const [newWishName, setNewWishName] = useState('');
  const [newWishMsg, setNewWishMsg] = useState('');
  const [wishSubmitted, setWishSubmitted] = useState(false);

  // Countdown state
  const targetDate = data.targetDateIso || '2026-11-20T16:00:00.000Z';
  const [countdown, setCountdown] = useState(() => calculateCountdown(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(calculateCountdown(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const handleRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpError('');
    try {
      await onRsvpSubmit?.({
        guestName,
        guestEmail,
        attendance,
        mealPreference,
        dietaryNotes,
        songRequest,
        plusOnes: parseInt(plusOnes, 10) || 0,
      });
      setRsvpSubmitted(true);
    } catch (error) {
      setRsvpError(error instanceof Error ? error.message : 'Your RSVP could not be recorded. Please try again.');
    }
  };

  const handleAddWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishName.trim() || !newWishMsg.trim()) return;
    setWishes([
      {
        name: newWishName.trim(),
        message: newWishMsg.trim(),
        date: 'Just now',
      },
      ...wishes,
    ]);
    setNewWishName('');
    setNewWishMsg('');
    setWishSubmitted(true);
    setTimeout(() => setWishSubmitted(false), 4000);
  };

  const coverPhoto = data.photos && data.photos.length > 0
    ? data.photos[0].url
    : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAbM9xqfg8IeSoPnnzoohoLtwjBjL0LzSxcHq3zA2HqkdoNmCw31LJPODRNaKfcXk4aEE_BfLwVRaawwpxLqGNH48ABqNULnMp6CSaQYntE3kILXJXmZxlqFKWuSW6nF-GB9ZhqzC1cvhVUTd47SyA733MSJ9NgbSnWMrSc--VEbhKbLHEbyn_2rUxvv_pfZS3BdFWhJMFD8CvHTQw0en7Xc-L42x9GniriMJgr4aLKZyJvO1fzx0Ocw';

  const storyPhoto = data.photos && data.photos.length > 1
    ? data.photos[1].url
    : coverPhoto;

  const theme = getThemeStyles(data.appearance);

  return (
    <div
      style={theme.bgStyle}
      className={`w-full min-h-screen ${theme.fontBodyClass} ${theme.paletteClass} antialiased selection:bg-primary selection:text-white transition-colors duration-300`}
    >
      {/* Editorial Sticky Navigation Bar */}
      {!isLivePreview && (
        <header className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-md border-b border-surface-container-high/60 transition-colors">
          <div className="max-w-[1280px] mx-auto px-6 h-14 flex items-center justify-between">
            <a href="#hero" className="font-headline-md text-base text-on-surface tracking-tight font-medium">
              {data.title}
            </a>

            <nav className="hidden md:flex items-center gap-6 font-label-md text-xs tracking-wider uppercase text-on-surface-variant">
              {data.activeSections?.story && (
                <a href="#story" className="hover:text-on-surface transition-colors">Story</a>
              )}
              {data.activeSections?.schedule && (
                <a href="#schedule" className="hover:text-on-surface transition-colors">Schedule</a>
              )}
              {data.activeSections?.venue && (
                <a href="#venue" className="hover:text-on-surface transition-colors">Location</a>
              )}
              {data.activeSections?.gallery && (
                <a href="#gallery" className="hover:text-on-surface transition-colors">Gallery</a>
              )}
              {data.activeSections?.guestbook && (
                <a href="#guestbook" className="hover:text-on-surface transition-colors">Wishes</a>
              )}
              {data.activeSections?.rsvp && (
                <a
                  href="#rsvp"
                  className="px-4 py-1.5 rounded-full bg-primary text-on-primary font-medium hover:opacity-90 transition-opacity uppercase tracking-wider"
                >
                  RSVP
                </a>
              )}
            </nav>
          </div>
        </header>
      )}

      {/* ========================================================================= */}
      {/* 1. HERO MONOGRAPH SECTION                                                */}
      {/* ========================================================================= */}
      {data.activeSections?.hero !== false && (
        <section id="hero" className="relative pt-12 md:pt-20 pb-16 px-6 max-w-[1280px] mx-auto">
          <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-4 mb-10">
            <span className="font-label-sm text-xs tracking-[0.25em] uppercase text-on-surface-variant font-semibold">
              {data.eventType || 'Curated Keepsake'}
            </span>
            <h1 className="font-headline-lg text-4xl sm:text-6xl md:text-7xl font-light text-on-surface tracking-tight leading-[1.08]">
              {data.title}
            </h1>
            {data.tagline && (
              <p className="font-body-md text-base sm:text-lg text-on-surface-variant max-w-xl italic font-serif">
                "{data.tagline}"
              </p>
            )}
            <div className="h-px w-16 bg-on-surface/20 my-2"></div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-on-surface-variant font-medium">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                {data.date}
              </span>
              {data.time && (
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                  {data.time}
                </span>
              )}
              {data.venue && (
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  {data.venue}
                </span>
              )}
            </div>
          </div>

          {/* Hero Main Editorial Image Frame */}
          <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full rounded-2xl overflow-hidden shadow-xl border border-surface-container-high/80 bg-surface-container-low">
            <img
              src={coverPhoto}
              alt={data.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />
            <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 text-white flex flex-col gap-1">
              <span className="font-label-sm text-xs tracking-widest uppercase opacity-80">
                Official Invitation
              </span>
              <span className="font-headline-md text-xl sm:text-2xl font-light">
                {data.address || data.venue}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. COUNTDOWN TICKER                                                       */}
      {/* ========================================================================= */}
      {data.activeSections?.countdown !== false && (
        <section className="py-12 px-6 bg-surface-container-low/60 border-y border-surface-container-high/60">
          <div className="max-w-[900px] mx-auto text-center flex flex-col items-center gap-6">
            <span className="font-label-sm text-xs tracking-[0.2em] uppercase text-on-surface-variant font-medium">
              Counting Down To The Moment
            </span>
            <div className="grid grid-cols-4 gap-3 sm:gap-6 w-full max-w-lg">
              <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl border border-surface-container-high/60 shadow-sm flex flex-col items-center">
                <span className="font-display-lg text-2xl sm:text-4xl font-light text-on-surface">
                  {countdown.days}
                </span>
                <span className="font-label-sm text-[11px] tracking-wider uppercase text-on-surface-variant mt-1">
                  Days
                </span>
              </div>
              <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl border border-surface-container-high/60 shadow-sm flex flex-col items-center">
                <span className="font-display-lg text-2xl sm:text-4xl font-light text-on-surface">
                  {countdown.hours}
                </span>
                <span className="font-label-sm text-[11px] tracking-wider uppercase text-on-surface-variant mt-1">
                  Hours
                </span>
              </div>
              <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl border border-surface-container-high/60 shadow-sm flex flex-col items-center">
                <span className="font-display-lg text-2xl sm:text-4xl font-light text-on-surface">
                  {countdown.minutes}
                </span>
                <span className="font-label-sm text-[11px] tracking-wider uppercase text-on-surface-variant mt-1">
                  Mins
                </span>
              </div>
              <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl border border-surface-container-high/60 shadow-sm flex flex-col items-center">
                <span className="font-display-lg text-2xl sm:text-4xl font-light text-on-surface">
                  {countdown.seconds}
                </span>
                <span className="font-label-sm text-[11px] tracking-wider uppercase text-on-surface-variant mt-1">
                  Secs
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. STORY & MONOGRAPH DETAILS                                              */}
      {/* ========================================================================= */}
      {data.activeSections?.story !== false && (
        <section id="story" className="py-20 px-6 max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 flex flex-col gap-6">
              <span className="font-label-sm text-xs tracking-widest uppercase text-on-surface-variant font-semibold">
                The Narrative
              </span>
              <h2 className="font-headline-lg text-3xl sm:text-4xl font-light text-on-surface tracking-tight leading-snug">
                Every detail curated with deliberate intention.
              </h2>
              <p className="font-body-md text-base text-on-surface-variant leading-relaxed">
                {data.note || 'We invite you to gather under the open sky to celebrate love, friendship, and the beginning of a remarkable journey together.'}
              </p>
              {data.travelInfo?.dressCode && (
                <div className="p-5 rounded-xl bg-surface-container-low border border-surface-container-high/70 flex flex-col gap-1.5">
                  <span className="font-label-sm text-xs uppercase tracking-wider font-semibold text-on-surface">
                    Dress Code: {data.travelInfo.dressCode.title}
                  </span>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    {data.travelInfo.dressCode.description}
                  </p>
                </div>
              )}
            </div>

            <div className="lg:col-span-7">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-surface-container-high/80 bg-surface-container-low">
                <img
                  src={storyPhoto}
                  alt="Story moment"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. SCHEDULE / ITINERARY                                                  */}
      {/* ========================================================================= */}
      {data.activeSections?.schedule !== false && data.schedule && data.schedule.length > 0 && (
        <section id="schedule" className="py-20 px-6 bg-surface-container-low/40 border-t border-surface-container-high/60">
          <div className="max-w-[900px] mx-auto flex flex-col items-center">
            <span className="font-label-sm text-xs tracking-widest uppercase text-on-surface-variant font-semibold mb-3">
              Program of Events
            </span>
            <h2 className="font-headline-lg text-3xl sm:text-4xl font-light text-on-surface tracking-tight text-center mb-12">
              Order of the Day
            </h2>

            <div className="w-full flex flex-col gap-4">
              {data.schedule.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container-high/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <span className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-mono text-sm text-on-surface font-medium shrink-0">
                      0{idx + 1}
                    </span>
                    <div className="flex flex-col">
                      <h3 className="font-headline-md text-lg text-on-surface font-medium">
                        {item.title}
                      </h3>
                      <p className="font-body-sm text-sm text-on-surface-variant mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <span className="font-mono text-sm font-semibold text-primary px-3 py-1 rounded bg-surface-container-low">
                      {item.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 5. VENUE & TRAVEL ACCOMMODATION                                           */}
      {/* ========================================================================= */}
      {data.activeSections?.venue !== false && (
        <section id="venue" className="py-20 px-6 max-w-[1280px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-label-sm text-xs tracking-widest uppercase text-on-surface-variant font-semibold">
              Location & Details
            </span>
            <h2 className="font-headline-lg text-3xl sm:text-4xl font-light text-on-surface tracking-tight mt-2">
              {data.venue || 'The Venue'}
            </h2>
            {data.address && (
              <p className="font-body-md text-on-surface-variant mt-2">
                {data.address}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/80 shadow-sm flex flex-col gap-3">
              <span className="material-symbols-outlined text-[28px] text-primary">directions_car</span>
              <h3 className="font-headline-md text-lg text-on-surface font-medium">Arrival & Parking</h3>
              <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed">
                {data.travelInfo?.shuttleInfo || 'Valet parking is arranged at the venue entrance. Complimentary shuttle service departs hourly from downtown partner hotels.'}
              </p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/80 shadow-sm flex flex-col gap-3">
              <span className="material-symbols-outlined text-[28px] text-primary">hotel</span>
              <h3 className="font-headline-md text-lg text-on-surface font-medium">Accommodations</h3>
              <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed">
                {data.travelInfo?.hotelBlock?.description || 'A courtesy block of guest rooms has been reserved with special rates under our celebration code.'}
              </p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/80 shadow-sm flex flex-col gap-3">
              <span className="material-symbols-outlined text-[28px] text-primary">schedule</span>
              <h3 className="font-headline-md text-lg text-on-surface font-medium">Timing & Access</h3>
              <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed">
                Doors open 45 minutes prior to commencement. Guests are warmly invited to enjoy welcome refreshments in the courtyard.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 6. PHOTO GALLERY                                                          */}
      {/* ========================================================================= */}
      {data.activeSections?.gallery !== false && data.photos && data.photos.length > 0 && (
        <section id="gallery" className="py-20 px-6 bg-surface-container-low/40 border-t border-surface-container-high/60">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="font-label-sm text-xs tracking-widest uppercase text-on-surface-variant font-semibold">
                Atmosphere & Memories
              </span>
              <h2 className="font-headline-lg text-3xl sm:text-4xl font-light text-on-surface tracking-tight mt-2">
                Visual Monograph
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.photos.map((photo, i) => (
                <div
                  key={photo.id || i}
                  className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-container-low shadow-sm border border-surface-container-high/70"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Gallery snapshot'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  {photo.caption && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 text-white font-label-sm text-xs">
                      {photo.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 7. INTERACTIVE RSVP FORM                                                  */}
      {/* ========================================================================= */}
      {data.activeSections?.rsvp !== false && data.rsvpSettings?.enabled !== false && (
        <section id="rsvp" className="py-24 px-6 max-w-[800px] mx-auto">
          <div className="bg-surface-container-lowest p-8 sm:p-12 rounded-3xl border border-surface-container-high shadow-lg">
            {!rsvpSubmitted ? (
              <>
                <div className="text-center max-w-md mx-auto mb-8">
                  <span className="font-label-sm text-xs tracking-[0.2em] uppercase text-on-surface-variant font-semibold">
                    Kindly Respond
                  </span>
                  <h2 className="font-headline-lg text-3xl sm:text-4xl font-light text-on-surface tracking-tight mt-2">
                    RSVP Confirmation
                  </h2>
                  <p className="font-body-sm text-sm text-on-surface-variant mt-2">
                    {data.rsvpSettings?.deadline ? `Please reply by ${data.rsvpSettings.deadline}` : 'Please confirm your attendance below.'}
                  </p>
                </div>

                {rsvpError && (
                  <div className="p-4 mb-6 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
                    {rsvpError}
                  </div>
                )}

                <form onSubmit={handleRsvp} className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-sm text-xs text-on-surface font-medium uppercase tracking-wider">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full h-11 px-3.5 rounded-lg bg-surface border border-surface-container-high text-on-surface focus:outline-none focus:border-primary text-sm"
                        placeholder="Guest Name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-sm text-xs text-on-surface font-medium uppercase tracking-wider">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full h-11 px-3.5 rounded-lg bg-surface border border-surface-container-high text-on-surface focus:outline-none focus:border-primary text-sm"
                        placeholder="guest@example.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-label-sm text-xs text-on-surface font-medium uppercase tracking-wider">
                      Will you be attending? *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setAttendance('accept')}
                        className={`h-11 rounded-lg font-label-md text-sm font-medium border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          attendance === 'accept'
                            ? 'bg-primary text-on-primary border-primary shadow-sm'
                            : 'bg-surface border-surface-container-high text-on-surface hover:bg-surface-container'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        <span>Joyfully Accept</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAttendance('decline')}
                        className={`h-11 rounded-lg font-label-md text-sm font-medium border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          attendance === 'decline'
                            ? 'bg-primary text-on-primary border-primary shadow-sm'
                            : 'bg-surface border-surface-container-high text-on-surface hover:bg-surface-container'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                        <span>Regretfully Decline</span>
                      </button>
                    </div>
                  </div>

                  {attendance === 'accept' && (
                    <>
                      {data.rsvpSettings?.allowMealSelection !== false && (
                        <div className="flex flex-col gap-1.5">
                          <label className="font-label-sm text-xs text-on-surface font-medium uppercase tracking-wider">
                            Entrée / Culinary Preference
                          </label>
                          <select
                            className="w-full h-11 px-3.5 rounded-lg bg-surface border border-surface-container-high text-on-surface focus:outline-none focus:border-primary text-sm"
                            value={mealPreference}
                            onChange={(e) => setMealPreference(e.target.value)}
                          >
                            <option value="harvest">Seasonal Farm-to-Table Harvest</option>
                            <option value="coastal">Wild Coastal Salmon &amp; Herbs</option>
                            <option value="prime">Prime Braised Beef Tenderloin</option>
                            <option value="vegan">Organic Botanical Vegan Tasting</option>
                          </select>
                        </div>
                      )}

                      {data.rsvpSettings?.allowDietaryNotes !== false && (
                        <div className="flex flex-col gap-1.5">
                          <label className="font-label-sm text-xs text-on-surface font-medium uppercase tracking-wider">
                            Dietary Restrictions or Allergies
                          </label>
                          <input
                            type="text"
                            className="w-full h-11 px-3.5 rounded-lg bg-surface border border-surface-container-high text-on-surface focus:outline-none focus:border-primary text-sm"
                            placeholder="e.g. Gluten-free, nut allergy, dairy-free"
                            value={dietaryNotes}
                            onChange={(e) => setDietaryNotes(e.target.value)}
                          />
                        </div>
                      )}

                      {data.rsvpSettings?.allowPlusOnes && (
                        <div className="flex flex-col gap-1.5">
                          <label className="font-label-sm text-xs text-on-surface font-medium uppercase tracking-wider">
                            Additional Guests (Plus Ones)
                          </label>
                          <select
                            className="w-full h-11 px-3.5 rounded-lg bg-surface border border-surface-container-high text-on-surface focus:outline-none focus:border-primary text-sm"
                            value={plusOnes}
                            onChange={(e) => setPlusOnes(e.target.value)}
                          >
                            <option value="0">Just Myself (0)</option>
                            <option value="1">+1 Guest</option>
                            <option value="2">+2 Guests</option>
                          </select>
                        </div>
                      )}

                      {data.rsvpSettings?.allowSongRequests && (
                        <div className="flex flex-col gap-1.5">
                          <label className="font-label-sm text-xs text-on-surface font-medium uppercase tracking-wider">
                            Song Request / Celebration Anthem
                          </label>
                          <input
                            type="text"
                            className="w-full h-11 px-3.5 rounded-lg bg-surface border border-surface-container-high text-on-surface focus:outline-none focus:border-primary text-sm"
                            placeholder="Artist - Song Title"
                            value={songRequest}
                            onChange={(e) => setSongRequest(e.target.value)}
                          />
                        </div>
                      )}
                    </>
                  )}

                  <button
                    type="submit"
                    className="w-full h-12 mt-2 rounded-xl bg-primary text-on-primary font-label-md font-medium text-sm uppercase tracking-wider hover:opacity-95 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Confirm RSVP</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-8 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-[32px]">done_all</span>
                </div>
                <h3 className="font-headline-lg text-2xl text-on-surface font-medium">
                  Thank You, {guestName}!
                </h3>
                <p className="font-body-md text-on-surface-variant max-w-sm">
                  {attendance === 'accept'
                    ? 'Your response has been recorded. We eagerly look forward to celebrating together.'
                    : 'Your response has been noted. We will miss you!'}
                </p>
                <button
                  type="button"
                  onClick={() => setRsvpSubmitted(false)}
                  className="mt-4 text-xs font-medium text-on-surface-variant hover:text-on-surface underline cursor-pointer"
                >
                  Edit your submission
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 8. WISHES / MEMORY WALL (GUESTBOOK)                                       */}
      {/* ========================================================================= */}
      {data.activeSections?.guestbook !== false && (
        <section id="guestbook" className="py-20 px-6 bg-surface-container-low/40 border-t border-surface-container-high/60">
          <div className="max-w-[800px] mx-auto">
            <div className="text-center max-w-md mx-auto mb-10">
              <span className="font-label-sm text-xs tracking-widest uppercase text-on-surface-variant font-semibold">
                Memory Wall
              </span>
              <h2 className="font-headline-lg text-3xl font-light text-on-surface tracking-tight mt-1">
                Wishes &amp; Well-Notes
              </h2>
            </div>

            {/* Post Note Form */}
            <form onSubmit={handleAddWish} className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/80 mb-8 shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    className="w-full h-10 px-3.5 rounded-lg bg-surface border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
                    value={newWishName}
                    onChange={(e) => setNewWishName(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="h-10 rounded-lg bg-primary text-on-primary font-label-md text-xs uppercase tracking-wider font-medium hover:opacity-90 transition-all cursor-pointer"
                  >
                    Leave a Note
                  </button>
                </div>
                <textarea
                  required
                  rows={2}
                  placeholder="Share a thoughtful memory or congratulatory wish..."
                  className="w-full p-3.5 rounded-lg bg-surface border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary resize-none"
                  value={newWishMsg}
                  onChange={(e) => setNewWishMsg(e.target.value)}
                />
              </div>
              {wishSubmitted && (
                <p className="text-xs text-emerald-600 font-medium mt-2">
                  ✓ Your message has been posted to the memory wall!
                </p>
              )}
            </form>

            {/* Note Cards */}
            <div className="flex flex-col gap-4">
              {wishes.map((w, idx) => (
                <div
                  key={idx}
                  className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container-high/60 shadow-sm flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <span className="font-semibold text-on-surface">{w.name}</span>
                    <span>{w.date}</span>
                  </div>
                  <p className="font-body-sm text-sm text-on-surface-variant italic font-serif">
                    "{w.message}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Floating Audio Vibe Player Pill */}
      {data.activeSections?.spotifyVibe && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-md border border-surface-container-high shadow-lg text-on-surface font-label-sm text-xs cursor-pointer hover:bg-surface-container transition-all"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">
              {isPlayingAudio ? 'volume_up' : 'music_note'}
            </span>
            <span>{isPlayingAudio ? 'Playing Atmosphere' : 'Play Celebration Soundscape'}</span>
          </button>
        </div>
      )}

      {/* Minimal Monograph Footer */}
      <footer className="py-12 px-6 border-t border-surface-container text-center text-xs text-on-surface-variant/70">
        <p className="font-serif italic text-sm text-on-surface mb-2">
          {data.title}
        </p>
        <p>© 2026 Crafted with Tempo Atelier Curated Canvas.</p>
      </footer>
    </div>
  );
};
