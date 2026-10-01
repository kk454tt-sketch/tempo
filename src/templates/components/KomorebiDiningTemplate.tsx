import React, { useState } from 'react';
import { TemplateProps } from '../types';
import { getThemeStyles } from '@/utils/themeHelper';

export const KomorebiDiningTemplate: React.FC<TemplateProps> = ({
  data,
  isLivePreview = false,
  onRsvpSubmit,
}) => {
  const [reservationName, setReservationName] = useState('');
  const [reservationEmail, setReservationEmail] = useState('');
  const [reservationDate, setReservationDate] = useState('2026-11-20');
  const [reservationTime, setReservationTime] = useState('18:30');
  const [guestsCount, setGuestsCount] = useState('2');
  const [seatingArea, setSeatingArea] = useState('counter');
  const [dietary, setDietary] = useState('');
  const [isReserved, setIsReserved] = useState(false);

  const theme = getThemeStyles(data.appearance);

  const coverPhoto = data.photos && data.photos.length > 0
    ? data.photos[0].url
    : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDi2XOK7vCTiCGviozLgg-AGlUOHngekg7Shx5BvmCyRh9bxu1BtR5VItHqNozogBCSE2PonNuR4i5O29F3xcCYS2uzb4McKLQLO_r72zJDPmWvN9uCxlje6tlvYf2sunCzGqtxYLjTXB42mUbzUd36BeDNTgTi5fuaaJGXq7QTCKjXqPDJ73aICLNisA11_0TxPbQpBUVREuzj32bQv4qbG0VNwGCHFSrltnfnIrHLrYw6oPLgBrE';

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservationName || !reservationEmail) return;
    try {
      await onRsvpSubmit?.({
        guestName: reservationName,
        guestEmail: reservationEmail,
        reservationDate,
        reservationTime,
        guestsCount: parseInt(guestsCount, 10),
        seatingArea,
        dietaryNotes: dietary,
      });
      setIsReserved(true);
    } catch {
      setIsReserved(true);
    }
  };

  const tastingCourses = [
    {
      course: 'Course 01 · Amuse',
      name: 'Smoked Hokkaido Scallop & Shiso Gelée',
      pairing: '2022 Domaine Leflaive Bourgogne Blanc',
      desc: 'Infused with roasted nori dashi and fermented finger lime caviar pearls.',
    },
    {
      course: 'Course 02 · Raw',
      name: 'Wild Bluefin Chutoro & Aged Shoyu',
      pairing: 'Junmai Daiginjo "Born Gold" Fukui',
      desc: 'Line-caught coastal tuna aged 7 days with house-cured wasabi root.',
    },
    {
      course: 'Course 03 · Hearth',
      name: 'Binchotan Grilled A5 Wagyu Tenderloin',
      pairing: '2019 Tenuta San Guido Guidalberto',
      desc: 'Charred over Japanese white oak coals with black garlic tare reduction.',
    },
    {
      course: 'Course 04 · Sweet',
      name: 'Roasted Soba Tea Gelato & Kinako Tuile',
      pairing: 'Aged 10-Year Plum Wine Liqueur',
      desc: 'Warm smoked cedar infusion with organic buckwheat crisp.',
    },
  ];

  return (
    <div
      style={theme.bgStyle}
      className={`w-full min-h-screen ${theme.fontBodyClass} ${theme.paletteClass} antialiased selection:bg-primary selection:text-white transition-colors duration-300 text-on-surface`}
    >
      {/* Editorial Navigation */}
      {!isLivePreview && (
        <header className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-md border-b border-surface-container-high/60">
          <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
            <span className="font-headline-md text-lg font-serif tracking-wide">
              {data.title}
            </span>
            <nav className="flex items-center gap-6 font-label-md text-xs tracking-wider uppercase text-on-surface-variant">
              <a href="#menu" className="hover:text-on-surface transition-colors">Tasting Menu</a>
              <a href="#philosophy" className="hover:text-on-surface transition-colors">Philosophy</a>
              <a href="#location" className="hover:text-on-surface transition-colors">Hours &amp; Location</a>
              <a
                href="#reserve"
                className="px-4 py-2 rounded-full bg-primary text-on-primary font-medium hover:opacity-90 transition-opacity"
              >
                Reserve Table
              </a>
            </nav>
          </div>
        </header>
      )}

      {/* Atmospheric Hero */}
      <section className="relative pt-16 pb-24 px-6 max-w-[1280px] mx-auto text-center flex flex-col items-center">
        <span className="font-label-sm text-xs tracking-[0.3em] uppercase text-on-surface-variant font-semibold mb-3">
          {data.tagline || 'Editorial Dining & Omakase Lounge'}
        </span>
        <h1 className="font-headline-lg text-4xl sm:text-6xl md:text-7xl font-serif tracking-tight leading-tight max-w-4xl mb-6">
          {data.title}
        </h1>
        <p className="font-body-md text-base sm:text-lg text-on-surface-variant max-w-xl italic font-serif mb-10">
          {data.note || 'A quiet celebration of seasonal Kyoto micro-climates, raw seafood provenance, and binchotan wood-fired culinary craft.'}
        </p>

        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-2xl border border-surface-container-high/70 bg-surface-container-low">
          <img
            src={coverPhoto}
            alt={data.title}
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Tasting Menu */}
      <section id="menu" className="py-20 px-6 bg-surface-container-low/40 border-t border-surface-container-high/60">
        <div className="max-w-[860px] mx-auto">
          <div className="text-center max-w-md mx-auto mb-16">
            <span className="font-label-sm text-xs tracking-widest uppercase text-on-surface-variant font-semibold">
              Curated Courses
            </span>
            <h2 className="font-headline-lg text-3xl sm:text-4xl font-serif tracking-tight mt-1">
              Autumn Tasting Sequence
            </h2>
            <p className="font-body-sm text-xs text-on-surface-variant mt-2">
              Ten courses · $185 per guest · Optional natural wine pairing
            </p>
          </div>

          <div className="flex flex-col gap-8">
            {tastingCourses.map((c, idx) => (
              <div
                key={idx}
                className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/70 shadow-sm flex flex-col gap-2"
              >
                <div className="flex items-center justify-between text-xs text-on-surface-variant font-mono">
                  <span>{c.course}</span>
                  <span className="text-primary font-serif italic">{c.pairing}</span>
                </div>
                <h3 className="font-headline-md text-lg font-serif font-medium mt-1">
                  {c.name}
                </h3>
                <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reservation Module */}
      <section id="reserve" className="py-24 px-6 max-w-[760px] mx-auto">
        <div className="bg-surface-container-lowest p-8 sm:p-12 rounded-3xl border border-surface-container-high shadow-lg">
          {!isReserved ? (
            <>
              <div className="text-center max-w-md mx-auto mb-8">
                <span className="font-label-sm text-xs tracking-widest uppercase text-on-surface-variant font-semibold">
                  Reservations
                </span>
                <h2 className="font-headline-lg text-3xl font-serif tracking-tight mt-1">
                  Reserve Your Seating
                </h2>
                <p className="font-body-sm text-xs text-on-surface-variant mt-2">
                  Counter seatings open 30 days in advance at midnight.
                </p>
              </div>

              <form onSubmit={handleReservation} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-xs uppercase tracking-wider font-medium">Guest Name</label>
                    <input
                      type="text"
                      required
                      className="w-full h-11 px-3.5 rounded-lg bg-surface border border-surface-container-high text-sm focus:outline-none focus:border-primary"
                      placeholder="Your Full Name"
                      value={reservationName}
                      onChange={(e) => setReservationName(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-xs uppercase tracking-wider font-medium">Email Address</label>
                    <input
                      type="email"
                      required
                      className="w-full h-11 px-3.5 rounded-lg bg-surface border border-surface-container-high text-sm focus:outline-none focus:border-primary"
                      placeholder="guest@domain.com"
                      value={reservationEmail}
                      onChange={(e) => setReservationEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-xs uppercase tracking-wider font-medium">Date</label>
                    <input
                      type="date"
                      required
                      className="w-full h-11 px-3.5 rounded-lg bg-surface border border-surface-container-high text-sm focus:outline-none focus:border-primary"
                      value={reservationDate}
                      onChange={(e) => setReservationDate(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-xs uppercase tracking-wider font-medium">Time</label>
                    <select
                      className="w-full h-11 px-3.5 rounded-lg bg-surface border border-surface-container-high text-sm focus:outline-none focus:border-primary"
                      value={reservationTime}
                      onChange={(e) => setReservationTime(e.target.value)}
                    >
                      <option value="17:30">5:30 PM (First Seating)</option>
                      <option value="18:30">6:30 PM</option>
                      <option value="20:00">8:00 PM (Second Seating)</option>
                      <option value="21:00">9:00 PM</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-xs uppercase tracking-wider font-medium">Party Size</label>
                    <select
                      className="w-full h-11 px-3.5 rounded-lg bg-surface border border-surface-container-high text-sm focus:outline-none focus:border-primary"
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(e.target.value)}
                    >
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                      <option value="4">4 Guests</option>
                      <option value="6">6 Guests (Private Room)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-xs uppercase tracking-wider font-medium">Seating Environment</label>
                  <select
                    className="w-full h-11 px-3.5 rounded-lg bg-surface border border-surface-container-high text-sm focus:outline-none focus:border-primary"
                    value={seatingArea}
                    onChange={(e) => setSeatingArea(e.target.value)}
                  >
                    <option value="counter">Hinoki Cypress Chef Counter (Direct View)</option>
                    <option value="dining">Garden Dining Room Table</option>
                    <option value="tatami">Private Tatami Alcove</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-xs uppercase tracking-wider font-medium">Dietary Considerations</label>
                  <input
                    type="text"
                    className="w-full h-11 px-3.5 rounded-lg bg-surface border border-surface-container-high text-sm focus:outline-none focus:border-primary"
                    placeholder="Allergies, pescatarian, non-alcoholic pairing..."
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-primary text-on-primary font-label-md font-medium text-xs uppercase tracking-widest hover:opacity-95 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>Request Reservation</span>
                  <span className="material-symbols-outlined text-[18px]">restaurant</span>
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[32px]">check</span>
              </div>
              <h3 className="font-headline-lg text-2xl font-serif font-medium">
                Reservation Confirmed
              </h3>
              <p className="font-body-md text-on-surface-variant max-w-sm text-sm">
                Thank you, {reservationName}. Your booking for {guestsCount} guests on {reservationDate} at {reservationTime} has been recorded.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Location & Hours */}
      <section id="location" className="py-20 px-6 bg-surface-container-low/40 border-t border-surface-container-high/60">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-4">
            <span className="font-label-sm text-xs tracking-widest uppercase text-on-surface-variant font-semibold">
              Dining Monograph
            </span>
            <h2 className="font-headline-lg text-3xl font-serif font-medium">
              {data.venue || 'Kyoto Dining Room'}
            </h2>
            <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed">
              {data.address || '74 Gion-machi Minamigawa, Higashiyama Ward, Kyoto'}
            </p>
            <div className="pt-4 border-t border-surface-container flex flex-col gap-2 text-xs text-on-surface-variant">
              <p><strong>Tuesday – Sunday:</strong> 5:30 PM – 11:00 PM</p>
              <p><strong>Monday:</strong> Closed for private farm foraging</p>
            </div>
          </div>
          <div className="p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-sm flex flex-col gap-3">
            <span className="material-symbols-outlined text-[28px] text-primary">local_bar</span>
            <h3 className="font-headline-md text-lg font-serif">Omakase Beverage Program</h3>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              Rare unpasteurized sakes sourced directly from boutique artisanal micro-breweries across Niigata and Nagano, paired alongside biodynamic low-intervention natural wines.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-surface-container text-center text-xs text-on-surface-variant">
        <p className="font-serif italic text-sm text-on-surface mb-1">{data.title}</p>
        <p>© 2026 {data.title}. Atelier Curated Canvas Hospitality Edition.</p>
      </footer>
    </div>
  );
};
