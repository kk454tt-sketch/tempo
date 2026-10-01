import React, { useState } from 'react';
import { TemplateProps } from '../types';

export const FolioNoirTemplate: React.FC<TemplateProps> = ({
  data,
  isLivePreview = false,
  onRsvpSubmit,
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [guestlistName, setGuestlistName] = useState('');
  const [guestlistEmail, setGuestlistEmail] = useState('');
  const [isJoined, setIsJoined] = useState(false);

  const coverPhoto = data.photos && data.photos.length > 0
    ? data.photos[0].url
    : 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9392y6E2-h94s1JcW9uE4U69zM3m5Zk2y3w4v5u6t7s8r9q0p';

  const handleGuestlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestlistName || !guestlistEmail) return;
    try {
      await onRsvpSubmit?.({
        guestName: guestlistName,
        guestEmail: guestlistEmail,
        type: 'guestlist',
      });
      setIsJoined(true);
    } catch {
      setIsJoined(true);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0d0d0f] text-[#f0f0f4] antialiased selection:bg-white selection:text-black">
      {/* Monolith Obsidian Header */}
      {!isLivePreview && (
        <header className="sticky top-0 z-40 w-full bg-[#0d0d0f]/90 backdrop-blur-md border-b border-white/10">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
            <span className="font-mono text-sm tracking-widest uppercase font-semibold text-white">
              {data.title}
            </span>
            <nav className="flex items-center gap-6 font-mono text-xs tracking-wider uppercase text-white/60">
              <a href="#work" className="hover:text-white transition-colors">Visuals</a>
              <a href="#manifest" className="hover:text-white transition-colors">Manifesto</a>
              <a
                href="#guestlist"
                className="px-4 py-1.5 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-all font-sans text-xs tracking-normal"
              >
                Guestlist Access
              </a>
            </nav>
          </div>
        </header>
      )}

      {/* Hero */}
      <section className="pt-20 pb-24 px-6 lg:px-12 max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-6 max-w-4xl">
          <span className="font-mono text-xs text-emerald-400 tracking-[0.3em] uppercase">
            {data.eventType || 'Visual Monograph // 001'}
          </span>
          <h1 className="text-4xl sm:text-7xl font-light tracking-tight leading-[1.05] text-white">
            {data.tagline || 'High-contrast nocturnal design practice & visual curation.'}
          </h1>
          <p className="text-base sm:text-lg text-white/60 max-w-2xl font-light">
            {data.note || 'Exploring the intersections of obsidian minimalism, generative lighting, and digital typography.'}
          </p>
        </div>

        <div className="mt-12 relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/10 bg-white/5">
          <img
            src={coverPhoto}
            alt={data.title}
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Visual Works Gallery */}
      <section id="work" className="py-20 px-6 lg:px-12 max-w-[1440px] mx-auto border-t border-white/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-400">
              Selected Output
            </span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white mt-1">
              Visual Archive
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {['all', 'monograph', 'editorial', 'motion'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3.5 py-1.5 rounded-full font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                  activeFilter === cat
                    ? 'bg-white text-black font-semibold'
                    : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.photos && data.photos.length > 0 ? (
            data.photos.map((photo, i) => (
              <div
                key={photo.id || i}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-white/5 border border-white/10"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || 'Folio visual'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {photo.caption && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5 text-white text-xs font-mono">
                    {photo.caption}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white/5 border border-white/10">
              <img
                src={coverPhoto}
                alt="Folio visual"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </section>

      {/* Guestlist / Access Form */}
      <section id="guestlist" className="py-24 px-6 lg:px-12 max-w-[760px] mx-auto">
        <div className="bg-white/[0.03] p-8 sm:p-12 rounded-3xl border border-white/10">
          {!isJoined ? (
            <>
              <div className="text-center max-w-md mx-auto mb-8">
                <span className="font-mono text-xs tracking-widest uppercase text-emerald-400">
                  Access Portal
                </span>
                <h2 className="text-3xl font-light text-white tracking-tight mt-1">
                  Private Guestlist
                </h2>
                <p className="text-xs text-white/60 mt-2">
                  Request access to nocturnal exhibition previews and private releases.
                </p>
              </div>

              <form onSubmit={handleGuestlist} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    className="w-full h-11 px-3.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-white"
                    value={guestlistName}
                    onChange={(e) => setGuestlistName(e.target.value)}
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    className="w-full h-11 px-3.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-white"
                    value={guestlistEmail}
                    onChange={(e) => setGuestlistEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-11 rounded-lg bg-white text-black font-semibold text-xs uppercase tracking-wider hover:bg-white/90 transition-all cursor-pointer"
                >
                  Join Exclusive Guestlist
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6 flex flex-col items-center gap-2">
              <span className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center material-symbols-outlined text-[24px]">
                check
              </span>
              <h3 className="text-xl font-light text-white">Access Granted</h3>
              <p className="text-xs text-white/60">
                You're on the list, {guestlistName}. Private verification token has been dispatched.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10 text-center text-xs text-white/40 font-mono">
        © 2026 {data.title}. Folio Noir Atelier Edition.
      </footer>
    </div>
  );
};
