import React, { useState, useEffect } from 'react';
import { TemplateProps } from '../types';
import { calculateCountdown } from '@/utils/countdown';
import { getThemeStyles } from '@/utils/themeHelper';

export const PartyEvening: React.FC<TemplateProps> = ({
  data,
  isLivePreview = false,
  onRsvpSubmit,
}) => {
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [attendance, setAttendance] = useState('accept');
  const [plusOnes, setPlusOnes] = useState('0');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [cocktailChoice, setCocktailChoice] = useState('signature');

  // Countdown timer
  const targetDate = data.targetDateIso || '2026-11-14T20:00:00.000Z';
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
        plusOnes,
        dietaryNotes,
        cocktailChoice,
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
      className={`w-full min-h-screen ${theme.fontBodyClass} ${theme.paletteClass} antialiased transition-colors duration-300 selection:bg-amber-300`}
    >
      {/* Sticky Header */}
      {!isLivePreview && (
        <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-black/5 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900 tracking-tight">
              {data.title}
            </span>
            <nav className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              {sections.story && <a href="#story" className="hover:text-slate-900 transition-colors">Evening Details</a>}
              {sections.schedule && <a href="#schedule" className="hover:text-slate-900 transition-colors">Itinerary</a>}
              {sections.venue && <a href="#venue" className="hover:text-slate-900 transition-colors">Venue</a>}
              {sections.rsvp && (
                <a href="#rsvp" className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors">
                  RSVP
                </a>
              )}
            </nav>
          </div>
        </header>
      )}

      {/* SECTION 1: HERO */}
      {sections.hero && (
        <section className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-8 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-amber-100 text-amber-900 mb-4 shadow-sm">
            <span className="material-symbols-outlined text-[16px]">wine_bar</span>
            <span>{data.eventType || 'Evening Dinner & Celebration'}</span>
          </div>

          <h1 className={`text-4xl sm:text-6xl font-black text-slate-900 tracking-tight mb-2 ${theme.fontHeadlineClass}`}>
            {data.title}
          </h1>

          {data.tagline && (
            <p className="text-lg sm:text-xl font-medium text-amber-800 italic mb-2">
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
              Party Commences In
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
                <span className="text-2xl sm:text-3xl font-black text-amber-600 block">{countdown.seconds}</span>
                <span className="text-[10px] uppercase font-bold text-slate-500">Secs</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: STORY / HOST NOTE */}
      {sections.story && data.note && (
        <section id="story" className="max-w-2xl mx-auto px-4 mb-12">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Host Welcome</span>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed italic">
              "{data.note}"
            </p>
          </div>
        </section>
      )}

      {/* SECTION 4: SCHEDULE */}
      {sections.schedule && (
        <section id="schedule" className="max-w-2xl mx-auto px-4 mb-12">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Itinerary</span>
              <h2 className={`text-xl sm:text-2xl font-bold text-slate-900 mt-1 ${theme.fontHeadlineClass}`}>
                The Evening's Progression
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {[
                { time: '6:30 PM', title: 'Garden Aperitivo & Hors d’Oeuvres', desc: 'Craft spritzes and seasonal small bites on the terrace.' },
                { time: '7:45 PM', title: 'Candlelit Banquet Dinner', desc: 'Multi-course seasonal dining with curated wine pairings.' },
                { time: '9:15 PM', title: 'Dessert Bar & Celebration Toasts', desc: 'Artisanal sweet bites and celebratory champagne.' },
                { time: '10:00 PM', title: 'Moonlit Lounge & Vinyl Sets', desc: 'Cocktails and dancing under the stars until midnight.' },
              ].map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-start gap-4">
                  <span className="text-xs font-black text-amber-700 w-20 flex-shrink-0">{item.time}</span>
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

      {/* SECTION 5: VENUE & DRESS CODE */}
      {sections.venue && (
        <section id="venue" className="max-w-2xl mx-auto px-4 mb-12">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Venue &amp; Attire</span>
              <h2 className={`text-xl sm:text-2xl font-bold text-slate-900 mt-1 ${theme.fontHeadlineClass}`}>
                {data.venue}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">{data.address}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-900 block">Dress Code</span>
                <span className="text-slate-600 block mt-0.5">Cocktail Elegant / Smart Evening Attire</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-900 block">Arrival &amp; Valet</span>
                <span className="text-slate-600 block mt-0.5">Complimentary valet at main courtyard gate</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 6: PHOTO GALLERY */}
      {sections.gallery && data.photos && data.photos.length > 0 && (
        <section id="gallery" className="max-w-4xl mx-auto px-4 mb-12">
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Visual Mood</span>
            <h2 className={`text-2xl font-bold text-slate-900 mt-1 ${theme.fontHeadlineClass}`}>
              Moments &amp; Atmosphere
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {data.photos.map((photo, i) => (
              <div key={photo.id || i} className="aspect-square rounded-xl overflow-hidden bg-slate-100 shadow-sm hover:scale-[1.02] transition-transform">
                <img src={photo.url} alt={photo.caption || 'Celebration'} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 7: RSVP FORM */}
      {sections.rsvp && (
        <section id="rsvp" className="max-w-lg mx-auto px-4 mb-16">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md text-center space-y-4">
            <div>
              <h2 className={`text-2xl font-bold text-slate-900 ${theme.fontHeadlineClass}`}>
                Reserve Your Seat
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Space around the banquet table is limited. Please RSVP by {data.rsvpSettings.deadline || 'November 1'}.
              </p>
            </div>

            {rsvpSubmitted ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2">
                <span className="text-3xl block">🥂</span>
                <h3 className="font-bold text-base">Seat Reserved!</h3>
                <p className="text-xs">We look forward to raising a toast with {guestName}!</p>
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
                    placeholder="e.g. Robin Taylor"
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
                    placeholder="robin@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Attendance
                    </label>
                    <select
                      value={attendance}
                      onChange={(e) => setAttendance(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      <option value="accept">Attending</option>
                      <option value="decline">Cannot Attend</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Plus Ones
                    </label>
                    <select
                      value={plusOnes}
                      onChange={(e) => setPlusOnes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      <option value="0">Just Myself</option>
                      <option value="1">+1 Guest</option>
                      <option value="2">+2 Guests</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Welcome Cocktail Preference
                  </label>
                  <select
                    value={cocktailChoice}
                    onChange={(e) => setCocktailChoice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="signature">Old Fashioned / Bourbon</option>
                    <option value="spritz">French 75 / Champagne Spritz</option>
                    <option value="botanical">Smoked Mezcal Paloma</option>
                    <option value="mocktail">Artisanal Non-Alcoholic Botanicals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dietary Requirements
                  </label>
                  <input
                    type="text"
                    placeholder="Vegetarian, Pescatarian, Nut allergies..."
                    value={dietaryNotes}
                    onChange={(e) => setDietaryNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow cursor-pointer transition-colors"
                >
                  Confirm Reservation
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
