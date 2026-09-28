import React, { useState, useEffect } from 'react';
import { TemplateProps } from '../types';
import { calculateCountdown } from '@/utils/countdown';
import { getThemeStyles } from '@/utils/themeHelper';

export const WeddingTimeless: React.FC<TemplateProps> = ({
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

  // Countdown state
  const targetDate = data.targetDateIso || '2027-02-14T16:30:00.000Z';
  const [countdown, setCountdown] = useState(() => calculateCountdown(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(calculateCountdown(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const handleRsvp = (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpSubmitted(true);
    if (onRsvpSubmit) {
      onRsvpSubmit({
        guestName,
        guestEmail,
        attendance,
        mealPreference,
        dietaryNotes,
        songRequest,
      });
    }
  };

  const coverPhoto = data.photos && data.photos.length > 0 ? data.photos[0].url : '';
  const storyPhoto = data.photos && data.photos.length > 1 ? data.photos[1].url : coverPhoto;
  const theme = getThemeStyles(data.appearance);

  return (
    <div
      style={theme.bgStyle}
      className={`w-full min-h-screen ${theme.fontBodyClass} ${theme.paletteClass} antialiased selection:bg-primary-fixed selection:text-on-primary-fixed transition-colors duration-300`}
    >
      {/* Sub-header Sticky Minimal In-Page Navigation Bar */}
      {!isLivePreview && (
        <div className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-md shadow-sm border-b border-surface-container">
          <div className="max-w-[1280px] mx-auto px-margin md:px-margin-desktop py-space-sm flex items-center justify-between">
            <a className="flex items-center gap-space-xs group" href="#hero">
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-normal group-hover:text-primary transition-colors">
                {data.title}
              </span>
            </a>
            <nav className="hidden md:flex items-center gap-space-lg text-body-sm font-body-sm">
              {data.activeSections.story && (
                <a className="text-on-surface-variant hover:text-primary transition-colors" href="#story">
                  Our Story
                </a>
              )}
              {data.activeSections.schedule && (
                <a className="text-on-surface-variant hover:text-primary transition-colors" href="#schedule">
                  Schedule
                </a>
              )}
              {data.activeSections.venue && (
                <a className="text-on-surface-variant hover:text-primary transition-colors" href="#venue">
                  Details &amp; Travel
                </a>
              )}
              {data.activeSections.gallery && (
                <a className="text-on-surface-variant hover:text-primary transition-colors" href="#gallery">
                  Gallery
                </a>
              )}
              {data.activeSections.rsvp && (
                <a
                  className="bg-primary text-on-primary font-label-md text-label-md px-space-md py-space-xs rounded-lg shadow-sm hover:bg-primary-container transition-colors tracking-wide"
                  href="#rsvp"
                >
                  RSVP
                </a>
              )}
            </nav>
            {data.activeSections.rsvp && (
              <a
                className="md:hidden bg-primary text-on-primary font-label-md text-label-md px-space-sm py-space-xs rounded-lg shadow-sm"
                href="#rsvp"
              >
                RSVP
              </a>
            )}
          </div>
        </div>
      )}

      {/* SECTION 1: HERO & ANNOUNCEMENT */}
      {data.activeSections.hero && (
        <section
          className="relative w-full max-w-[1280px] mx-auto px-margin md:px-margin-desktop pt-space-xl pb-space-xl flex flex-col items-center text-center"
          id="hero"
        >
          {/* Top Editorial Callout */}
          <div className="inline-flex items-center gap-space-xs bg-surface-container px-space-md py-space-xs rounded-full shadow-sm mb-space-md">
            <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              favorite
            </span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              {data.eventType ? `We're celebrating` : "We're getting married"}
            </span>
          </div>

          {/* Couple Monogram Title */}
          <h1 className="font-display-xl text-display-lg md:text-display-xl text-on-surface tracking-tight max-w-3xl mb-space-xs">
            {data.title}
          </h1>

          {/* Location & Date */}
          <p className="font-headline-md text-headline-md text-primary font-normal mb-space-sm">
            {data.tagline}
          </p>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mb-space-lg">
            {data.date} · {data.address || data.venue}
          </p>

          {/* Main Hero Image Showcase */}
          {coverPhoto && (
            <div className="w-full max-w-4xl relative mb-space-xl">
              <div className="relative mx-auto rounded-xl overflow-hidden bg-surface-container-high shadow-xl aspect-[16/10] sm:aspect-[16/9]">
                <img
                  className="w-full h-full object-cover object-center transform hover:scale-[1.01] transition-transform duration-700 ease-out"
                  src={coverPhoto}
                  alt={data.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-on-surface/40 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-surface/90 backdrop-blur-sm px-space-md py-space-xs rounded-lg shadow-sm flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">calendar_month</span>
                  <span className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                    {data.venue}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Live Interactive Countdown Card */}
          {data.activeSections.countdown && (
            <div className="w-full max-w-3xl bg-surface-container-low rounded-xl p-space-lg sm:p-space-xl shadow-md">
              <p className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant mb-space-md text-center">
                Countdown to the Celebration
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
                <div className="bg-surface-container-lowest rounded-lg p-space-md flex flex-col items-center justify-center shadow-sm">
                  <span className="font-display-lg text-display-lg text-primary leading-none mb-space-xs">
                    {countdown.days}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Days
                  </span>
                </div>
                <div className="bg-surface-container-lowest rounded-lg p-space-md flex flex-col items-center justify-center shadow-sm">
                  <span className="font-display-lg text-display-lg text-primary leading-none mb-space-xs">
                    {countdown.hours}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Hours
                  </span>
                </div>
                <div className="bg-surface-container-lowest rounded-lg p-space-md flex flex-col items-center justify-center shadow-sm">
                  <span className="font-display-lg text-display-lg text-primary leading-none mb-space-xs">
                    {countdown.minutes}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Minutes
                  </span>
                </div>
                <div className="bg-surface-container-lowest rounded-lg p-space-md flex flex-col items-center justify-center shadow-sm">
                  <span className="font-display-lg text-display-lg text-primary leading-none mb-space-xs">
                    {countdown.seconds}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Seconds
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* SECTION 2: OUR STORY & TIMELINE */}
      {data.activeSections.story && (
        <section className="w-full bg-surface-container-low py-space-xl" id="story">
          <div className="max-w-[1280px] mx-auto px-margin md:px-margin-desktop">
            <div className="max-w-xl mx-auto text-center mb-space-xl">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary mb-space-xs block">
                Chapter by Chapter
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-sm">
                Our Story
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {data.note || 'Six years of quiet adventures, cross-country train rides, and finding home in one another.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter-desktop items-center mb-space-xl">
              {storyPhoto && (
                <div className="md:col-span-5 flex flex-col gap-space-md">
                  <div className="rounded-xl overflow-hidden shadow-lg bg-surface-container-high aspect-[4/5]">
                    <img className="w-full h-full object-cover" src={storyPhoto} alt="Our Story portrait" />
                  </div>
                  <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm">
                    <p className="font-caption text-caption text-on-surface-variant italic">
                      "{data.note.slice(0, 100)}..."
                    </p>
                  </div>
                </div>
              )}

              <div className={storyPhoto ? 'md:col-span-7 flex flex-col gap-space-lg' : 'md:col-span-12 flex flex-col gap-space-lg'}>
                {(data.storyMilestones && data.storyMilestones.length > 0
                  ? data.storyMilestones
                  : [
                      {
                        id: 'm-1',
                        date: 'October 2021',
                        title: 'The First Coffee in Hayes Valley',
                        description:
                          'What was meant to be a thirty-minute introductory coffee stretched into a five-hour ramble through Golden Gate Park. By evening, we were already planning our next dinner.',
                        icon: 'local_cafe',
                      },
                      {
                        id: 'm-2',
                        date: 'May 2023',
                        title: 'A Shared Studio & Too Many Plants',
                        description:
                          'Combining record collections, learning each other’s grandmother recipes, and navigating the joyful chaos of our first sourdough baking phase together.',
                        icon: 'cottage',
                      },
                      {
                        id: 'm-3',
                        date: 'September 2025',
                        title: 'The Proposal on the Big Sur Cliffs',
                        description:
                          'Under the Pacific fog rolling over Garrapata State Park, Rahul asked on one knee. With salt spray in the air and teary laughter, Priya said yes before he could even finish the sentence.',
                        icon: 'favorite',
                      },
                    ]
                ).map((milestone) => (
                  <div
                    key={milestone.id}
                    className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow relative"
                  >
                    <div className="flex items-center justify-between mb-space-xs">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                        {milestone.date}
                      </span>
                      {milestone.icon && (
                        <span className="material-symbols-outlined text-secondary text-[20px]">
                          {milestone.icon}
                        </span>
                      )}
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">
                      {milestone.title}
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      {milestone.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: CELEBRATION SCHEDULE */}
      {data.activeSections.schedule && (
        <section className="w-full max-w-[1280px] mx-auto px-margin md:px-margin-desktop py-space-xl" id="schedule">
          <div className="text-center max-w-xl mx-auto mb-space-xl">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary mb-space-xs block">
              Order of Events
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-sm">
              Celebration Schedule
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              We invite you to celebrate with us for a relaxed, sunlit afternoon and starlit evening.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-space-lg">
            {(data.schedule && data.schedule.length > 0
              ? data.schedule
              : [
                  {
                    id: 's-1',
                    time: '4:00 PM',
                    title: 'Welcome Drinks & Strings',
                    description:
                      'Arrive to botanical spritzes, sparkling cider, and an acoustic string trio playing in the glasshouse conservatory gardens.',
                    location: 'Conservatory Lawn',
                    icon: 'local_bar',
                  },
                  {
                    id: 's-2',
                    time: '4:30 PM',
                    title: 'The Vow Ceremony',
                    description:
                      'An intimate union under floral canopies overlooking the Carmel Valley pine ridge. Please be seated by 4:20 PM.',
                    location: 'The Main Terrace',
                    icon: 'spa',
                  },
                  {
                    id: 's-3',
                    time: '6:00 PM',
                    title: 'Sunset Dinner & Speeches',
                    description:
                      'Multi-course coastal harvest dining, heartfelt family toasts, and warm artisan breads shared family-style.',
                    location: 'The Glass Atrium',
                    icon: 'restaurant',
                  },
                  {
                    id: 's-4',
                    time: '8:30 PM',
                    title: 'Dancing Under Lanterns',
                    description:
                      'Live DJ set, celebratory bhangra & soul classics, late-night chai, and sweet treats by the fire pits until midnight.',
                    location: 'Courtyard & Pavilions',
                    icon: 'celebration',
                  },
                ]
            ).map((event) => (
              <div
                key={event.id}
                className="bg-surface-container-low rounded-xl p-space-lg shadow-sm flex flex-col justify-between hover:bg-surface-container transition-colors"
              >
                <div>
                  <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-space-md">
                    <span className="material-symbols-outlined text-[20px]">
                      {event.icon || 'schedule'}
                    </span>
                  </div>
                  <span className="font-headline-sm text-headline-sm text-primary block mb-space-xs">
                    {event.time}
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">
                    {event.title}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                    {event.description}
                  </p>
                </div>
                {event.location && (
                  <div className="pt-space-sm">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                      {event.location}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 4: VENUE & TRAVEL DETAILS */}
      {data.activeSections.venue && (
        <section className="w-full bg-surface-container py-space-xl" id="venue">
          <div className="max-w-[1280px] mx-auto px-margin md:px-margin-desktop">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">
              <div className="lg:col-span-6 flex flex-col gap-space-lg">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary mb-space-xs block">
                    Location &amp; Practicalities
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-sm">
                    {data.venue}
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {data.travelInfo?.venueName || 'Tucked against the Pacific hillside, our venue merges historic stone foundations with airy iron glasshouses surrounded by coastal cypress trees.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
                    <span className="material-symbols-outlined text-primary mb-space-xs text-[24px]">map</span>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">The Address</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {data.address || '2480 Palmetto Bay Road\nCarmel-by-the-Sea, CA 93923'}
                    </p>
                  </div>
                  <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
                    <span className="material-symbols-outlined text-primary mb-space-xs text-[24px]">directions_bus</span>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Guest Shuttles</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {data.travelInfo?.shuttleInfo || 'Complimentary pick-ups at 3:15 PM and 3:35 PM from the Carmel Mission Inn lobby.'}
                    </p>
                  </div>
                </div>

                {data.travelInfo?.hotelBlock && (
                  <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
                    <h4 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">
                      Accommodations &amp; Room Block
                    </h4>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                      {data.travelInfo.hotelBlock.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-space-md">
                      <div className="bg-surface-container px-space-md py-space-xs rounded-lg text-on-surface font-label-md text-label-md">
                        Group Code: <span className="text-primary font-bold">{data.travelInfo.hotelBlock.groupCode}</span>
                      </div>
                    </div>
                  </div>
                )}

                {data.travelInfo?.dressCode && (
                  <div className="bg-secondary-container/40 p-space-md rounded-xl flex items-start gap-space-sm text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-[24px]">checkroom</span>
                    <div className="font-body-sm text-body-sm">
                      <span className="font-semibold block mb-0.5">{data.travelInfo.dressCode.title}</span>
                      {data.travelInfo.dressCode.description}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-6 flex flex-col gap-space-md">
                <div className="rounded-xl overflow-hidden shadow-lg bg-surface-container-high aspect-[16/10]">
                  <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY7hyhmLPlF6II-cCOH_fBDoIkOMD4qbXny8ErG-FHZQkgiGUxuZhTmm0pZA5V8JRH6nx5PqZFf6AjxpYV3Q93-N0WsrDbZUZFv7XdQPJvz_fISvGp89-jcb3r9i3kz5i_zv1qqFh_vv7UqJSfPQkdsTO_KDbs67gzXZPzD6HOvqHWJ7OrbAOsTIx1pNWHklQ7Dks0Py4b2t3ehnhTczudb8oBkVQEnkNdug4LW7bGuYnv7aGVdmTsuw"
                    alt="Venue exterior"
                  />
                </div>
                <div
                  className="w-full h-64 bg-cover bg-center rounded-xl shadow-md relative overflow-hidden"
                  style={{
                    backgroundImage: `url('${data.travelInfo?.mapImageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDLAUqG0aCG7K6rb-mdQzOgJcps-SB50V96cFyXmvWUuQS_q7_L1SilKaFCePqRPSii6l8mdH_jYjVjJ23hXD33ySfLIjYep-7ZPJHoJ6JfS7koCulbcE2Sl6KhvMq0K60spIRtSAxL0u6CEyBqqE-3BgoMwhBvut5q8oEqFquywzKrmF6J3tzMFZw2RnIeOAW5ZT5yUPJff9DkJ2owtbg6zIZSC9J77J7Ji3pKMBXwnkdPjNTC70V3lg"}')`,
                  }}
                >
                  <div className="absolute bottom-3 right-3 bg-surface/90 backdrop-blur-md px-space-md py-space-xs rounded-lg shadow-sm flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-[16px] text-primary">pin_drop</span>
                    <span className="font-label-sm text-label-sm text-on-surface">
                      {data.address || 'Carmel-by-the-Sea, CA'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 5: PHOTO GALLERY (MASONRY GRID) */}
      {data.activeSections.gallery && (
        <section className="w-full max-w-[1280px] mx-auto px-margin md:px-margin-desktop py-space-xl" id="gallery">
          <div className="text-center max-w-xl mx-auto mb-space-xl">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary mb-space-xs block">
              Moments
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-sm">
              Photo Gallery
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              A few quiet snapshots along the path that brought us here.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-space-md items-start">
            {(data.photos && data.photos.length > 0
              ? data.photos
              : [
                  {
                    id: '1',
                    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMEmgepi6-xzdKwX3jsuYc1kGZScUVA7SLGYdW7dIjOH5G3ng-4MJK43ppWUMbWn7iSieCi_h1FVl7Hmd_4yjMEkQSFM6ppBXshrvM3tahp6kY7ovPcFeAa3F7U3CCk-x_S24Ntn99BEKudNPZyjBA_sQQwgKpGJimhluqsymgvguKSEYKkz1nE5iLhgs58SYojmng7iW5ufjLcevDfnYFXSGPjzoXiZkgayspgUIsZ4_cifG7vfP0dw',
                  },
                  {
                    id: '2',
                    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCE4aAhQ5y87Hru1Y2UG5u_SvBlAehqwM5pu28c9e4VhaSh0xmQQdVzZgYuDuHGDQNDo9WR2Q7WhNpAWPNOPloJflgpy5cPteZ8wnTUmdJ-U2AVAkn7Cyrpr5qH7V1UpboIjbp0uRlGCae9zO5l6xVCwx_7a4sGYCrEFiPZCacSbfi7ff_vcDVmRLSEhQbX-uapSezH--LSVTeg1Sce6bdY2ABvqy2ynE0DqUkkNAGZYIAvu_CUMCmUfQ',
                  },
                  {
                    id: '3',
                    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9s71PhL0H3Ba_93njgf-17CBSZ1aOlFJO26G_mCzA4mmNDYaPbqnEkns0IQTRMVxUb0-F-oqIrarIz6RwVED8QEPEz75Sq4Ccwk9XzJr08O0K8g6P4PxeppHKfvbrjIkzPsYvuCEiFtjZRaAXtPmsY3M4kkTuD-Jxy3WkQ84yz5QXSK0z7Tn0I9TsMds9cnO5v0IjlgHbFeoI18Z84rIED5BIMDCojoHmGPpAh-QDLdwXYOopCfegbA',
                  },
                ]
            ).map((photo) => (
              <div
                key={photo.id}
                className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 bg-surface-container aspect-[3/4] group"
              >
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  src={photo.url}
                  alt={photo.caption || 'Event gallery photo'}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 6: RSVP FORM */}
      {data.activeSections.rsvp && (
        <section className="w-full bg-surface-container-low py-space-xl" id="rsvp">
          <div className="max-w-[760px] mx-auto px-margin md:px-margin-desktop">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg sm:p-space-xl shadow-xl">
              <div className="text-center mb-space-lg">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-space-sm">
                  <span className="material-symbols-outlined text-[24px]">mark_email_read</span>
                </div>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary mb-space-xs block">
                  Join Us
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-xs">
                  Kindly Respond
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Please confirm your attendance by{' '}
                  <span className="font-semibold text-on-surface">
                    {data.rsvpSettings.deadline || 'December 1, 2026'}
                  </span>{' '}
                  so we can curate your place settings.
                </p>
              </div>

              {!rsvpSubmitted ? (
                <form className="flex flex-col gap-space-md" onSubmit={handleRsvp}>
                  <div className="flex flex-col gap-space-xs">
                    <label className="font-body-sm text-body-sm text-on-surface font-semibold" htmlFor="guest-name">
                      Your Full Name(s) *
                    </label>
                    <input
                      className="w-full h-11 px-space-md rounded-lg bg-surface-container-lowest border-0 ring-1 ring-outline/30 focus:ring-2 focus:ring-primary text-on-surface text-body-md outline-none transition-all placeholder:text-on-surface-variant/40"
                      id="guest-name"
                      placeholder="e.g. Maya Chen & Jordan Lee"
                      required
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <label className="font-body-sm text-body-sm text-on-surface font-semibold" htmlFor="guest-email">
                      Email Address *
                    </label>
                    <input
                      className="w-full h-11 px-space-md rounded-lg bg-surface-container-lowest border-0 ring-1 ring-outline/30 focus:ring-2 focus:ring-primary text-on-surface text-body-md outline-none transition-all placeholder:text-on-surface-variant/40"
                      id="guest-email"
                      placeholder="maya@example.com"
                      required
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <span className="font-body-sm text-body-sm text-on-surface font-semibold">
                      Will you be joining us? *
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                      <label className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container cursor-pointer hover:bg-surface-container-high transition-colors">
                        <input
                          checked={attendance === 'accept'}
                          className="accent-primary w-4 h-4 cursor-pointer"
                          name="attendance"
                          type="radio"
                          value="accept"
                          onChange={() => setAttendance('accept')}
                        />
                        <span className="font-body-md text-body-md text-on-surface">Joyfully Accept</span>
                      </label>
                      <label className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container cursor-pointer hover:bg-surface-container-high transition-colors">
                        <input
                          checked={attendance === 'decline'}
                          className="accent-primary w-4 h-4 cursor-pointer"
                          name="attendance"
                          type="radio"
                          value="decline"
                          onChange={() => setAttendance('decline')}
                        />
                        <span className="font-body-md text-body-md text-on-surface">Regretfully Decline</span>
                      </label>
                    </div>
                  </div>

                  {data.rsvpSettings.allowMealSelection && attendance === 'accept' && (
                    <div className="flex flex-col gap-space-xs">
                      <label className="font-body-sm text-body-sm text-on-surface font-semibold" htmlFor="meal-preference">
                        Dinner Entrée Preference
                      </label>
                      <select
                        className="w-full h-11 px-space-md rounded-lg bg-surface-container-lowest border-0 ring-1 ring-outline/30 focus:ring-2 focus:ring-primary text-on-surface text-body-md outline-none transition-all cursor-pointer"
                        id="meal-preference"
                        value={mealPreference}
                        onChange={(e) => setMealPreference(e.target.value)}
                      >
                        <option value="harvest">Pan-Seared Pacific Halibut · saffron fennel broth</option>
                        <option value="vegetarian">Truffled Wild Mushroom Ravioli · brown butter sage (V)</option>
                        <option value="lamb">Slow Braised Lamb Shank · spiced pomegranate reduction</option>
                        <option value="vegan">Roasted Butternut Squash · spiced lentil crisp (Vegan/GF)</option>
                      </select>
                    </div>
                  )}

                  {data.rsvpSettings.allowDietaryNotes && attendance === 'accept' && (
                    <div className="flex flex-col gap-space-xs">
                      <label className="font-body-sm text-body-sm text-on-surface font-semibold" htmlFor="dietary-notes">
                        Dietary Restrictions or Allergies
                      </label>
                      <input
                        className="w-full h-11 px-space-md rounded-lg bg-surface-container-lowest border-0 ring-1 ring-outline/30 focus:ring-2 focus:ring-primary text-on-surface text-body-md outline-none transition-all placeholder:text-on-surface-variant/40"
                        id="dietary-notes"
                        placeholder="e.g. Gluten-free, nut allergy, strictly vegetarian"
                        type="text"
                        value={dietaryNotes}
                        onChange={(e) => setDietaryNotes(e.target.value)}
                      />
                    </div>
                  )}

                  {data.rsvpSettings.allowSongRequests && attendance === 'accept' && (
                    <div className="flex flex-col gap-space-xs">
                      <label className="font-body-sm text-body-sm text-on-surface font-semibold" htmlFor="song-request">
                        A Song to Get You on the Dance Floor
                      </label>
                      <input
                        className="w-full h-11 px-space-md rounded-lg bg-surface-container-lowest border-0 ring-1 ring-outline/30 focus:ring-2 focus:ring-primary text-on-surface text-body-md outline-none transition-all placeholder:text-on-surface-variant/40"
                        id="song-request"
                        placeholder="Song title & artist"
                        type="text"
                        value={songRequest}
                        onChange={(e) => setSongRequest(e.target.value)}
                      />
                    </div>
                  )}

                  <button
                    className="w-full h-12 mt-space-sm bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-space-xs tracking-wide cursor-pointer"
                    type="submit"
                  >
                    <span>Submit RSVP</span>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </button>
                </form>
              ) : (
                <div className="text-center py-space-xl flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto mb-space-md shadow-sm">
                    <span className="material-symbols-outlined text-[32px]">check_circle</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-space-xs">
                    Thank You so Much!
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mb-space-md">
                    Your response has been recorded in {data.title}'s guest register. We can't wait to celebrate with you!
                  </p>
                  <button
                    className="font-label-md text-label-md text-primary underline cursor-pointer"
                    onClick={() => setRsvpSubmitted(false)}
                    type="button"
                  >
                    Edit another response
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 7: EDITORIAL CLOSING REMARK */}
      {data.quote && (
        <section className="w-full max-w-[1280px] mx-auto px-margin md:px-margin-desktop py-space-xl text-center">
          <span className="font-display-lg text-primary italic block mb-space-xs">
            “{data.quote.text}”
          </span>
          <p className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
            — {data.quote.author}
          </p>
        </section>
      )}

      {/* Keepsake Attribution */}
      {!isLivePreview && (
        <div className="w-full pb-space-lg flex items-center justify-center">
          <div className="inline-flex items-center gap-space-xs bg-surface-container-high/80 backdrop-blur-md px-space-md py-space-xs rounded-full shadow-sm">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Made with <span className="font-semibold text-primary">Tempo</span> · Websites for your moments
            </span>
            <span className="text-on-surface-variant/40 text-[10px]">•</span>
            <a className="font-label-sm text-label-sm text-primary hover:underline font-semibold ml-space-xs" href="/create">
              Create yours
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
