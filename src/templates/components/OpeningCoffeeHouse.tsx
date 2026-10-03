import React, { useState, useEffect } from 'react';
import { TemplateProps } from '../types';
import { calculateCountdown } from '@/utils/countdown';
import { getThemeStyles } from '@/utils/themeHelper';

export const OpeningCoffeeHouse: React.FC<TemplateProps> = ({
  data,
  isLivePreview = false,
  onRsvpSubmit,
}) => {
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [sessionTime, setSessionTime] = useState('morning');
  const [partySize, setPartySize] = useState('2');

  // Countdown timer
  const targetDate = data.targetDateIso || '2026-10-20T09:00:00.000Z';
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
        sessionTime,
        partySize,
      });
    }
  };

  const theme = getThemeStyles(data.appearance);
  const coverPhoto = data.photos && data.photos.length > 0 ? data.photos[0].url : '';
  const sections = data.activeSections || {
    hero: true,
    countdown: true,
    story: true,
    schedule: true,
    venue: true,
    gallery: true,
    rsvp: true,
    guestbook: false,
  };

  return (
    <div
      style={theme.bgStyle}
      className={`w-full min-h-screen ${theme.fontBodyClass} ${theme.paletteClass} antialiased transition-colors duration-300 selection:bg-emerald-200`}
    >
      {/* Sticky Header */}
      {!isLivePreview && (
        <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-black/5 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900 tracking-tight">
              {data.title}
            </span>
            <nav className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              {sections.story && <a href="#story" className="hover:text-slate-900 transition-colors">Our Story</a>}
              {sections.schedule && <a href="#schedule" className="hover:text-slate-900 transition-colors">Itinerary</a>}
              {sections.venue && <a href="#venue" className="hover:text-slate-900 transition-colors">Location</a>}
              {sections.rsvp && (
                <a href="#rsvp" className="px-3 py-1.5 rounded-lg bg-emerald-900 text-white font-bold hover:bg-emerald-800 transition-colors">
                  VIP Pass
                </a>
              )}
            </nav>
          </div>
        </header>
      )}

      {/* SECTION 1: HERO */}
      {sections.hero && (
        <section className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-8 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-emerald-100 text-emerald-900 mb-4 shadow-sm">
            <span className="material-symbols-outlined text-[16px]">storefront</span>
            <span>{data.eventType || 'Grand Opening Showcase'}</span>
          </div>

          <h1 className={`text-4xl sm:text-6xl font-black text-slate-900 tracking-tight mb-2 ${theme.fontHeadlineClass}`}>
            {data.title}
          </h1>

          {data.tagline && (
            <p className="text-lg sm:text-xl font-medium text-emerald-800 italic mb-2">
              {data.tagline}
            </p>
          )}

          <p className="text-sm sm:text-base font-semibold text-slate-600 mb-6">
            {data.date} · {data.time}
          </p>

          {coverPhoto && (
            <div className="w-full max-w-3xl aspect-[16/10] rounded-2xl overflow-hidden shadow-xl bg-slate-100 relative mb-6">
              <img className="w-full h-full object-cover" src={coverPhoto} alt={data.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white text-left">
                <p className="font-bold text-base sm:text-lg">{data.venue}</p>
                <p className="text-xs sm:text-sm text-slate-200">{data.address}</p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* SECTION 2: COUNTDOWN */}
      {sections.countdown && (
        <section className="max-w-xl mx-auto px-4 mb-10">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-3">
              Doors Open In
            </span>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 block">{countdown.days}</span>
                <span className="text-[10px] uppercase font-bold text-slate-500">Days</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 block">{countdown.hours}</span>
                <span className="text-[10px] uppercase font-bold text-slate-500">Hours</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 block">{countdown.minutes}</span>
                <span className="text-[10px] uppercase font-bold text-slate-500">Mins</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 block">{countdown.seconds}</span>
                <span className="text-[10px] uppercase font-bold text-slate-500">Secs</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: STORY */}
      {sections.story && data.note && (
        <section id="story" className="max-w-2xl mx-auto px-4 mb-12">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Our Craft &amp; Vision</span>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {data.note}
            </p>
          </div>
        </section>
      )}

      {/* SECTION 4: SCHEDULE */}
      {sections.schedule && (
        <section id="schedule" className="max-w-2xl mx-auto px-4 mb-12">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Opening Day Schedule</span>
              <h2 className={`text-xl sm:text-2xl font-bold text-slate-900 mt-1 ${theme.fontHeadlineClass}`}>
                Launch Events
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {[
                { time: '9:00 AM', title: 'Ribbon Cutting & First 50 Free Pour-Overs', desc: 'Complimentary origin pour-overs and handmade morning pastries.' },
                { time: '11:30 AM', title: 'Roaster Masterclass & Origin Tasting', desc: 'Guided sensory coffee tasting led by our master head roaster.' },
                { time: '2:00 PM', title: 'Barista Latte Art Throwdown', desc: 'Friendly community barista throwdown with live prizes.' },
                { time: '5:00 PM', title: 'Sunset Cold Brew & Live Acoustic Set', desc: 'Nitro cold brew on tap with local acoustic musical guests.' },
              ].map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-start gap-4">
                  <span className="text-xs font-black text-emerald-800 w-20 flex-shrink-0">{item.time}</span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 5: VENUE & HOURS */}
      {sections.venue && (
        <section id="venue" className="max-w-2xl mx-auto px-4 mb-12">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Flagship Roastery</span>
              <h2 className={`text-xl sm:text-2xl font-bold text-slate-900 mt-1 ${theme.fontHeadlineClass}`}>
                {data.venue}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">{data.address}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-900 block">Opening Week Hours</span>
                <span className="text-slate-600 block mt-0.5">{data.time || '7:00 AM – 7:00 PM Daily'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-900 block">Transit &amp; Parking</span>
                <span className="text-slate-600 block mt-0.5">Complimentary parking in lot behind building</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 6: PHOTO GALLERY */}
      {sections.gallery && data.photos && data.photos.length > 0 && (
        <section id="gallery" className="max-w-4xl mx-auto px-4 mb-12">
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Roastery Views</span>
            <h2 className={`text-2xl font-bold text-slate-900 mt-1 ${theme.fontHeadlineClass}`}>
              Visual Showcase
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {data.photos.map((photo, i) => (
              <div key={photo.id || i} className="aspect-square rounded-xl overflow-hidden bg-slate-100 shadow-sm hover:scale-[1.02] transition-transform">
                <img src={photo.url} alt={photo.caption || 'Storefront'} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 7: VIP PASS / RSVP */}
      {sections.rsvp && (
        <section id="rsvp" className="max-w-lg mx-auto px-4 mb-16">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md text-center space-y-4">
            <div>
              <h2 className={`text-2xl font-bold text-slate-900 ${theme.fontHeadlineClass}`}>
                Claim Your VIP Opening Pass
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Receive a complimentary roast tasting flight on opening day.
              </p>
            </div>

            {rsvpSubmitted ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2">
                <span className="text-3xl block">☕</span>
                <h3 className="font-bold text-base">VIP Pass Reserved!</h3>
                <p className="text-xs">We saved a spot for {guestName}. Show your name at the bar on opening day!</p>
              </div>
            ) : (
              <form onSubmit={handleRsvp} className="space-y-3.5 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Hayes"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="jordan@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Preferred Session
                    </label>
                    <select
                      value={sessionTime}
                      onChange={(e) => setSessionTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      <option value="morning">Morning (9am - 12pm)</option>
                      <option value="afternoon">Afternoon (12pm - 4pm)</option>
                      <option value="evening">Evening (4pm - 8pm)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Party Size
                    </label>
                    <select
                      value={partySize}
                      onChange={(e) => setPartySize(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      <option value="1">Just Me</option>
                      <option value="2">2 People</option>
                      <option value="3-4">3 to 4 People</option>
                      <option value="5+">5+ Group</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-sm shadow cursor-pointer transition-colors"
                >
                  Claim Opening Pass
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      {!isLivePreview && (
        <footer className="w-full py-6 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
          Made with <strong className="text-slate-900 font-semibold">Tempo</strong> · Websites for your moments
        </footer>
      )}
    </div>
  );
};
