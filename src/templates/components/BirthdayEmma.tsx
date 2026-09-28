import React, { useState, useEffect } from 'react';
import { TemplateProps } from '../types';
import { calculateCountdown } from '@/utils/countdown';
import { getThemeStyles } from '@/utils/themeHelper';

export const BirthdayEmma: React.FC<TemplateProps> = ({
  data,
  isLivePreview = false,
  onRsvpSubmit,
}) => {
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [attendance, setAttendance] = useState('accept');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [songRequest, setSongRequest] = useState('');

  // Guestbook Wall State
  const portalId = (data as { slug?: string }).slug || (data.title ? data.title.toLowerCase().replace(/\s+/g, '-') : 'birthday-celebration');
  const guestbookKey = `tempo_guestbook_${portalId}`;
  const [guestbookWishes, setGuestbookWishes] = useState<Array<{ id: string; name: string; message: string; timestamp: string }>>(() => {
    try {
      const saved = localStorage.getItem(guestbookKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      { id: 'w-1', name: 'Sophia & Liam', message: 'Happy 25th birthday Emma! So excited to celebrate with you tonight!', timestamp: '2 hours ago' },
      { id: 'w-2', name: 'Marcus T.', message: 'Quarter century milestone! Can’t wait for the playlist and toasts.', timestamp: 'Yesterday' },
    ];
  });
  const [newWishName, setNewWishName] = useState('');
  const [newWishMsg, setNewWishMsg] = useState('');

  // Countdown timer
  const targetDate = data.targetDateIso || '2026-10-25T19:00:00.000Z';
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
        dietaryNotes,
        songRequest,
      });
    }
  };

  const handlePostWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishName.trim() || !newWishMsg.trim()) return;

    const updated = [
      {
        id: `wish_${Date.now()}`,
        name: newWishName.trim(),
        message: newWishMsg.trim(),
        timestamp: 'Just now',
      },
      ...guestbookWishes,
    ];
    setGuestbookWishes(updated);
    try {
      localStorage.setItem(guestbookKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
    setNewWishName('');
    setNewWishMsg('');
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
    guestbook: true,
  };

  return (
    <div
      style={theme.bgStyle}
      className={`w-full min-h-screen ${theme.fontBodyClass} ${theme.paletteClass} antialiased transition-colors duration-300 selection:bg-amber-200`}
    >
      {/* Sticky In-Page Navigation Bar */}
      {!isLivePreview && (
        <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-black/5 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900 tracking-tight">
              {data.title}
            </span>
            <nav className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              {sections.story && <a href="#story" className="hover:text-slate-900 transition-colors">Story</a>}
              {sections.schedule && <a href="#schedule" className="hover:text-slate-900 transition-colors">Timeline</a>}
              {sections.venue && <a href="#venue" className="hover:text-slate-900 transition-colors">Venue</a>}
              {sections.gallery && <a href="#gallery" className="hover:text-slate-900 transition-colors">Gallery</a>}
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
            <span className="material-symbols-outlined text-[16px]">cake</span>
            <span>{data.eventType || 'Birthday Celebration'}</span>
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
              Counting Down to Party Time
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

      {/* SECTION 3: STORY / INVITATION NOTE */}
      {sections.story && data.note && (
        <section id="story" className="max-w-2xl mx-auto px-4 mb-12">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Invitation Note</span>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed italic">
              "{data.note}"
            </p>
            {data.quote && (
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
                — {data.quote.author}
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECTION 4: SCHEDULE / TIMELINE */}
      {sections.schedule && (
        <section id="schedule" className="max-w-2xl mx-auto px-4 mb-12">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Party Itinerary</span>
              <h2 className={`text-xl sm:text-2xl font-bold text-slate-900 mt-1 ${theme.fontHeadlineClass}`}>
                Evening Schedule
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {(data.schedule || [
                { id: '1', time: '7:00 PM', title: 'Welcome Cocktails & Grazing Table', description: 'Arrive, grab a welcome flute, and mingle.' },
                { id: '2', time: '8:15 PM', title: 'Dinner & Toasts', description: 'Celebratory shared feast and family toasts.' },
                { id: '3', time: '9:30 PM', title: 'Cake Cutting & Sparklers', description: 'Make a wish and blow out the candles!' },
                { id: '4', time: '10:00 PM', title: 'DJ Set & Dancing', description: 'Late night tunes and dessert lounge.' },
              ]).map((item) => (
                <div key={item.id} className="py-3.5 flex items-start gap-4">
                  <span className="text-xs font-black text-amber-700 w-20 flex-shrink-0">{item.time}</span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 5: VENUE & DIRECTIONS */}
      {sections.venue && (
        <section id="venue" className="max-w-2xl mx-auto px-4 mb-12">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Location &amp; Travel</span>
              <h2 className={`text-xl sm:text-2xl font-bold text-slate-900 mt-1 ${theme.fontHeadlineClass}`}>
                {data.venue}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">{data.address}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-slate-700">directions_car</span>
                <span>Valet parking available at the main entrance</span>
              </div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${data.venue} ${data.address}`)}`}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-slate-900 underline hover:text-amber-700"
              >
                Open Maps
              </a>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 6: PHOTO GALLERY */}
      {sections.gallery && data.photos && data.photos.length > 0 && (
        <section id="gallery" className="max-w-4xl mx-auto px-4 mb-12">
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Memories</span>
            <h2 className={`text-2xl font-bold text-slate-900 mt-1 ${theme.fontHeadlineClass}`}>
              Photo Gallery
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
        <section id="rsvp" className="max-w-lg mx-auto px-4 mb-12">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md text-center space-y-4">
            <div>
              <h2 className={`text-2xl font-bold text-slate-900 ${theme.fontHeadlineClass}`}>
                Let’s Celebrate!
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                RSVP by {data.rsvpSettings.deadline || 'October 15'} to reserve your glass.
              </p>
            </div>

            {rsvpSubmitted ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2">
                <span className="text-3xl block">🥂</span>
                <h3 className="font-bold text-base">You're on the Guest List!</h3>
                <p className="text-xs">We received your RSVP for {guestName}. Can't wait to see you there!</p>
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
                    placeholder="e.g. Alex Rivera"
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
                    placeholder="alex@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Will you attend?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAttendance('accept')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        attendance === 'accept' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      ✓ Joyfully Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttendance('decline')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        attendance === 'decline' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      Regretfully Decline
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Song Request for the DJ
                  </label>
                  <input
                    type="text"
                    placeholder="What song gets you dancing?"
                    value={songRequest}
                    onChange={(e) => setSongRequest(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dietary Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Vegetarian, Gluten-Free, Allergies..."
                    value={dietaryNotes}
                    onChange={(e) => setDietaryNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow cursor-pointer transition-colors"
                >
                  Confirm RSVP
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      {/* SECTION 8: GUESTBOOK & WISHES */}
      {sections.guestbook && (
        <section className="max-w-2xl mx-auto px-4 mb-16">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Leave a Memory</span>
              <h2 className={`text-xl sm:text-2xl font-bold text-slate-900 mt-1 ${theme.fontHeadlineClass}`}>
                Birthday Wishes Wall
              </h2>
            </div>

            <form onSubmit={handlePostWish} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={newWishName}
                  onChange={(e) => setNewWishName(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
                <input
                  type="text"
                  required
                  placeholder="Your Birthday Wish or Message"
                  value={newWishMsg}
                  onChange={(e) => setNewWishMsg(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Post Wish
              </button>
            </form>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              {guestbookWishes.map((w) => (
                <div key={w.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-0.5">
                  <div className="flex justify-between items-center font-bold text-slate-900">
                    <span>{w.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{w.timestamp}</span>
                  </div>
                  <p className="text-slate-600 italic">"{w.message}"</p>
                </div>
              ))}
            </div>
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
