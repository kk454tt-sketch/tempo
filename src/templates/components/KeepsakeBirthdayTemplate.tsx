import { openWhatsAppWithMessage } from '@/utils/whatsappRsvp';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { TemplateProps } from '../types';

/* =========================================================
   CUSTOM STYLES & FONTS INJECTION
   ========================================================= */
const KEEPSAKE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Homemade+Apple&display=swap');

  .font-fraunces { font-family: 'Fraunces', Georgia, serif; }
  .font-hand { font-family: 'Caveat', cursive; }
  .font-script { font-family: 'Homemade Apple', cursive; }
  .font-typewriter { font-family: 'Courier Prime', monospace; }

  .paper-texture-bg {
    background-color: #F8E7E4;
    background-image: 
      radial-gradient(ellipse at top left, rgba(255, 255, 255, 0.55) 0%, transparent 60%),
      radial-gradient(circle at 100% 100%, #EBC9C4 0%, transparent 45%),
      linear-gradient(to right, rgba(74, 50, 44, 0.035) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(74, 50, 44, 0.035) 1px, transparent 1px);
    background-size: 100% 100%, 100% 100%, 20px 20px, 20px 20px;
  }

  .flat-shadow-sm {
    filter: drop-shadow(3px 4px 6px rgba(74, 50, 44, 0.14));
  }
  .flat-shadow-md {
    filter: drop-shadow(6px 10px 15px rgba(74, 50, 44, 0.16)) drop-shadow(2px 3px 4px rgba(74, 50, 44, 0.08));
  }
  .flat-shadow-lg {
    filter: drop-shadow(10px 18px 24px rgba(74, 50, 44, 0.2)) drop-shadow(3px 5px 8px rgba(74, 50, 44, 0.1));
  }

  .deckled-card {
    background-color: #FBF1DC;
    box-shadow: 
      0 1px 3px rgba(74, 50, 44, 0.06),
      8px 14px 28px rgba(74, 50, 44, 0.16),
      -2px -2px 6px rgba(255, 255, 255, 0.7);
    border: 1px dashed rgba(201, 162, 93, 0.45);
    position: relative;
  }
  .deckled-card::before {
    content: '';
    position: absolute;
    inset: 6px;
    border: 1px solid rgba(201, 162, 93, 0.4);
    border-radius: 6px;
    pointer-events: none;
  }

  .coffee-stain {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    border: 3.5px solid rgba(138, 93, 76, 0.12);
    box-shadow: inset 0 0 10px rgba(138, 93, 76, 0.08);
    position: absolute;
    transform: rotate(18deg) scaleX(1.08);
    pointer-events: none;
  }
  .coffee-stain::after {
    content: '';
    position: absolute;
    inset: 2px;
    border-radius: 50%;
    border: 1.5px solid rgba(138, 93, 76, 0.08);
  }

  .washi-tape {
    background: rgba(235, 193, 198, 0.85);
    backdrop-filter: blur(1px);
    box-shadow: 1px 2px 4px rgba(74, 50, 44, 0.09);
    border-left: 2px dashed rgba(255,255,255,0.7);
    border-right: 2px dashed rgba(255,255,255,0.7);
  }
  .washi-tape-sage {
    background: rgba(183, 196, 165, 0.85);
    backdrop-filter: blur(1px);
    box-shadow: 1px 2px 4px rgba(74, 50, 44, 0.09);
    border-left: 2px dashed rgba(255,255,255,0.7);
    border-right: 2px dashed rgba(255,255,255,0.7);
  }

  @keyframes washiWiggle {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(1.5deg) skewX(1deg); }
  }
  .washi-flutter {
    animation: washiWiggle 3.5s ease-in-out infinite;
  }

  .ditsy-floral {
    background-color: #EBC1C6;
    background-image: radial-gradient(#C97B84 16%, transparent 17%), radial-gradient(#F8E7E4 16%, transparent 17%);
    background-size: 14px 14px;
    background-position: 0 0, 7px 7px;
  }

  @keyframes gentleFloat {
    0%, 100% { transform: translateY(0px) rotate(-2deg); }
    50% { transform: translateY(-8px) rotate(-1deg); }
  }
  .animate-float {
    animation: gentleFloat 4.2s ease-in-out infinite;
  }

  @keyframes floatPetal {
    0% { transform: translateY(0) rotate(0deg); opacity: 0.85; }
    50% { transform: translateY(-12px) rotate(14deg) translateX(4px); opacity: 1; }
    100% { transform: translateY(0) rotate(0deg); opacity: 0.85; }
  }
  .petal-float-1 { animation: floatPetal 5s ease-in-out infinite; }
  .petal-float-2 { animation: floatPetal 4.2s ease-in-out infinite 0.6s; }
  .petal-float-3 { animation: floatPetal 6s ease-in-out infinite 1.2s; }

  @keyframes arrowBounce {
    0%, 100% { transform: translateY(0) rotate(-4deg); }
    50% { transform: translateY(-6px) rotate(-2deg); }
  }
  .arrow-bounce {
    animation: arrowBounce 1.8s ease-in-out infinite;
  }

  @keyframes starPulse {
    0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
    50% { transform: scale(1.15) rotate(6deg); opacity: 1; filter: drop-shadow(0 0 4px #C9A25D); }
  }
  .star-twinkle {
    animation: starPulse 2.8s ease-in-out infinite;
  }

  @keyframes waxGlow {
    0%, 100% { box-shadow: 0 4px 10px rgba(74,50,44,0.35), inset 0 2px 3px rgba(255,255,255,0.6), inset 0 -3px 4px rgba(0,0,0,0.3); }
    50% { box-shadow: 0 6px 16px rgba(201,162,93,0.5), inset 0 2px 5px rgba(255,255,255,0.85), inset 0 -3px 4px rgba(0,0,0,0.3); }
  }
  .wax-pulse {
    animation: waxGlow 3s ease-in-out infinite;
  }

  @keyframes peekBounce {
    0%, 100% { transform: translateY(0) rotate(2.8deg); }
    50% { transform: translateY(-8px) rotate(3.2deg); }
  }
  .peek-hover-bounce {
    animation: peekBounce 3s ease-in-out infinite;
  }

  @keyframes tagPendulum {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(2.5deg); }
    75% { transform: rotate(-2.5deg); }
  }
  .tag-sway {
    transform-origin: left center;
    animation: tagPendulum 4s ease-in-out infinite;
  }

  .ticket-stub {
    background-color: #FBF1DC;
    border: 1px dashed rgba(74, 50, 44, 0.35);
    position: relative;
  }
  .ticket-stub::before, .ticket-stub::after {
    content: '';
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 14px;
    height: 14px;
    background-color: #F8E7E4;
    border-radius: 50%;
    border: 1px solid rgba(74, 50, 44, 0.25);
  }
  .ticket-stub::before { left: -8px; }
  .ticket-stub::after { right: -8px; }

  .notebook-line {
    border: none;
    border-bottom: 1.5px dashed rgba(74, 50, 44, 0.35);
    background: transparent;
    outline: none;
    font-family: 'Caveat', cursive;
    font-size: 1.25rem;
    color: #4A322C;
    width: 100%;
    padding: 4px 2px;
    transition: border-color 0.25s ease;
  }
  .notebook-line:focus {
    border-bottom: 1.5px solid #C97B84;
  }

  .state-screen {
    transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .state-hidden {
    opacity: 0;
    pointer-events: none;
    position: absolute;
    inset: 0;
    transform: scale(0.95) translateY(12px);
  }
  .state-active {
    opacity: 1;
    pointer-events: auto;
    transform: scale(1) translateY(0);
  }

  @keyframes cardEntrance {
    0% { opacity: 0; transform: translateY(40px) scale(0.92); }
    70% { transform: translateY(-4px) scale(1.01); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  .card-enter-anim {
    animation: cardEntrance 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .flap-container {
    perspective: 800px;
  }
  .envelope-top-flap {
    transform-origin: top center;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .flap-opened {
    transform: rotateX(175deg);
  }

  @keyframes sealCrackAnim {
    0% { transform: scale(1); }
    40% { transform: scale(1.15) rotate(4deg); }
    100% { transform: scale(0.92); opacity: 0; }
  }
  .seal-breaking {
    animation: sealCrackAnim 0.45s ease-out forwards;
  }

  .confetti-particle {
    position: absolute;
    pointer-events: none;
    z-index: 100;
    animation: confettiFall 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }
  @keyframes confettiFall {
    0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
    100% { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)) scale(0.6); opacity: 0; }
  }

  .card-scroll::-webkit-scrollbar {
    width: 3.5px;
  }
  .card-scroll::-webkit-scrollbar-thumb {
    background-color: rgba(201, 123, 132, 0.35);
    border-radius: 4px;
  }
`;

export const KeepsakeBirthdayTemplate: React.FC<TemplateProps> = ({
  data,
  isLivePreview: _isLivePreview = false,
  onRsvpSubmit,
}) => {
  const [currentState, setCurrentState] = useState<1 | 2 | 3>(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFlapOpened, setIsFlapOpened] = useState(false);
  const [isSealBreaking, setIsSealBreaking] = useState(false);
  const [isRibbonHidden, setIsRibbonHidden] = useState(false);

  // Audio Music state
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // RSVP Form State
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [guestCount, setGuestCount] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [guestMobile, setGuestMobile] = useState('');
  const [attendance, setAttendance] = useState<'yes' | 'no'>('yes');
  const [dietaryNotes, setDietaryNotes] = useState('');

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Celebrant details parsing
  const title = data.title || "Emma's 25th Birthday Soirée";
  const tagline = data.tagline || "you're invited to celebrate";
  const eventDate = data.date || 'Saturday, June 14, 2025';
  const eventTime = data.time || '4:30 PM & onwards';
  const venue = data.venue || 'The Glasshouse Botanica';
  const address = data.address || '42 Rosewood Lane, Hudson Valley, NY';
  const note = data.note || 'Champagne toast at 5:30 PM • Cake cutting at sunset • Dancing under fairy lights';

  // Dynamic Music Settings
  const isMusicConfigured = data.musicSettings ? data.musicSettings.enabled : Boolean(data.musicUrl ?? true);
  const musicTrackUrl = data.musicSettings?.url ?? (data as unknown as Record<string, unknown>).musicUrl as string ?? '/music/happy-birthday.mp3';

  // Dynamic Dress Code Parsing
  const dressCodeText = useMemo(() => {
    if (typeof data.dressCode === 'string') return data.dressCode;
    if (data.dressCode?.description) return data.dressCode.description;
    if (data.travelInfo?.dressCode?.description) return data.travelInfo.dressCode.description;
    return '"Soft pastels, garden elegance & dancing shoes 🌸"';
  }, [data.dressCode, data.travelInfo]);

  const dressCodeTitle = useMemo(() => {
    if (typeof data.dressCode === 'object' && data.dressCode?.title) return data.dressCode.title;
    return 'dress code';
  }, [data.dressCode]);

  const dressCodeColors = useMemo(() => {
    if (typeof data.dressCode === 'object' && data.dressCode?.colors && data.dressCode.colors.length > 0) {
      return data.dressCode.colors;
    }
    return ['#EBC1C6', '#B7C4A5', '#FBF1DC', '#C97B84'];
  }, [data.dressCode]);

  // Dynamic Map Directions Link
  const mapDirectionsUrl = useMemo(() => {
    if (data.locationMap?.mapUrl) return data.locationMap.mapUrl;
    const q = address || venue;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  }, [data.locationMap, address, venue]);

  // Extract initial for wax seal
  const celebrantInitial = useMemo(() => {
    const cleanTitle = title.replace(/[^a-zA-Z]/g, '');
    return cleanTitle ? cleanTitle.charAt(0).toUpperCase() : 'E';
  }, [title]);

  // Extract milestone number (e.g. 25, 5, 30)
  const milestoneNumber = useMemo(() => {
    if (data.milestoneAge) return data.milestoneAge;
    const match = title.match(/\b(\d{1,3})(?:st|nd|rd|th)?\b/i);
    return match ? match[1] : '25';
  }, [data.milestoneAge, title]);

  // Polaroid photo URL
  const polaroidPhoto = useMemo(() => {
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].url;
    }
    return null;
  }, [data.photos]);

  // Handle Music Toggle
  const toggleMusic = useCallback(() => {
    if (!audioRef.current || !isMusicConfigured || !musicTrackUrl) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch(() => {
          // autoplay policy catch
        });
    }
  }, [isPlayingMusic]);

  // Confetti burst helper
  const spawnConfetti = useCallback((originX: number, originY: number, count = 16) => {
    const container = containerRef.current;
    if (!container) return;
    const canvasRect = container.getBoundingClientRect();
    const colors = ['#C97B84', '#B7C4A5', '#FBF1DC', '#EBC1C6', '#C9A25D', '#E3C27E'];

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'confetti-particle';

      const size = Math.random() * 6 + 5;
      const color = colors[Math.floor(Math.random() * colors.length)];

      particle.style.width = `${size}px`;
      particle.style.height = `${size * (Math.random() > 0.5 ? 1.4 : 1)}px`;
      particle.style.backgroundColor = color;
      particle.style.borderRadius = Math.random() > 0.4 ? '50%' : '2px';

      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 85 + 40;
      const dx = Math.cos(angle) * velocity;
      const dy = Math.sin(angle) * velocity - 20;
      const rot = (Math.random() - 0.5) * 500;

      particle.style.setProperty('--dx', `${dx}px`);
      particle.style.setProperty('--dy', `${dy}px`);
      particle.style.setProperty('--rot', `${rot}deg`);

      const localX = originX - canvasRect.left;
      const localY = originY - canvasRect.top;

      particle.style.left = `${localX}px`;
      particle.style.top = `${localY}px`;

      container.appendChild(particle);

      setTimeout(() => {
        if (particle.parentNode) particle.parentNode.removeChild(particle);
      }, 1800);
    }
  }, []);

  // State 1 Envelope Tap
  const handleEnvelopeTap = (e: React.MouseEvent) => {
    if (currentState !== 1 || isTransitioning) return;
    setIsTransitioning(true);

    // Auto-start music if not playing yet
    if (audioRef.current && !isPlayingMusic) {
      audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
    }

    const rect = e.currentTarget.getBoundingClientRect();
    spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);

    setIsSealBreaking(true);

    setTimeout(() => {
      setIsRibbonHidden(true);
    }, 180);

    setTimeout(() => {
      setIsFlapOpened(true);
    }, 280);

    setTimeout(() => {
      setIsTransitioning(false);
      setCurrentState(2);
    }, 700);
  };

  // State 2 Pull Card
  const handleCardPull = () => {
    if (currentState !== 2 || isTransitioning) return;
    setIsTransitioning(true);

    setTimeout(() => {
      setIsTransitioning(false);
      setCurrentState(3);
    }, 380);
  };

  // Replay
  const handleReplay = () => {
    setIsRsvpOpen(false);
    setRsvpSuccess(false);
    setIsFlapOpened(false);
    setIsSealBreaking(false);
    setIsRibbonHidden(false);
    setCurrentState(1);
  };

  // Polaroid Photo Click Reaction
  const handlePhotoClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 16);
  };

  // Handle RSVP Submit
  const handleSubmitRsvp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestMobile.trim()) return;

    const payload = {
      name: guestName.trim(),
      mobile: guestMobile.trim(),
      attendance,
      guests: guestCount,
      dietary: dietaryNotes.trim(),
      timestamp: new Date().toISOString(),
    };

    onRsvpSubmit?.(payload);
    setRsvpSuccess(true);

    // Launch WhatsApp directly with pre-filled details
    openWhatsAppWithMessage({
      eventTitle: data?.title || "Emma's 25th Birthday Soirée",
      eventType: data?.eventType || 'Birthday',
      date: data?.date,
      time: data?.time,
      venue: data?.venue,
      address: data?.address,
      guestName: guestName.trim(),
      guestMobile: guestMobile.trim(),
      attendance,
      guestCount,
      notes: dietaryNotes.trim(),
      recipientPhone: (data?.rsvpSettings as any)?.phone,
    });

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height * 0.45, 28);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-1 sm:p-4 md:p-6 bg-[#2b1f1d] min-h-full select-none">
      {/* Inject custom style block for exact font & animation fidelity */}
      <style>{KEEPSAKE_STYLES}</style>

      {/* Hidden Audio Player for Birthday Music */}
      <audio ref={audioRef} src={musicTrackUrl} loop preload="auto" />

      {/* Main Responsive Frame Canvas */}
      <div
        ref={containerRef}
        id="mobile-canvas"
        className="paper-texture-bg relative w-full max-w-[420px] h-[844px] max-h-[92vh] rounded-[32px] sm:rounded-[40px] shadow-[0_25px_60px_-15px_rgba(43,31,29,0.7),0_0_0_6px_#382926,0_0_0_8px_#4a3834] overflow-hidden text-[#4A322C] font-fraunces flex flex-col mx-auto"
      >
        {/* =========================================================
            HEADER BAR: State Switcher & Controls
            ========================================================= */}
        <div className="absolute top-3 inset-x-3 z-50 flex items-center justify-between pointer-events-auto">
          {/* State pill switcher */}
          <div className="relative flex items-center bg-[#4A322C]/90 backdrop-blur-md px-1.5 py-1 rounded-full shadow-lg border border-[#F8E7E4]/20">
            {/* Sliding Pill Indicator */}
            <div
              className="absolute top-1 bottom-1 rounded-full bg-[#C97B84] transition-all duration-300 ease-out shadow-sm"
              style={{
                left: currentState === 1 ? '46px' : currentState === 2 ? '118px' : '196px',
                width: currentState === 1 ? '70px' : currentState === 2 ? '76px' : '62px',
              }}
            />
            <span className="text-[9.5px] tracking-wider uppercase text-[#F8E7E4]/75 font-mono pl-2 pr-1 select-none">
              State:
            </span>
            <button
              onClick={() => {
                if (currentState !== 1) {
                  setIsFlapOpened(false);
                  setIsSealBreaking(false);
                  setIsRibbonHidden(false);
                  setCurrentState(1);
                }
              }}
              className={`relative z-10 text-xs px-2.5 py-1 rounded-full font-medium transition-colors font-hand text-[15px] cursor-pointer ${
                currentState === 1 ? 'text-white' : 'text-[#F8E7E4]/80 hover:text-white'
              }`}
            >
              1. Sealed
            </button>
            <button
              onClick={() => setCurrentState(2)}
              className={`relative z-10 text-xs px-2.5 py-1 rounded-full font-medium transition-colors font-hand text-[15px] cursor-pointer ${
                currentState === 2 ? 'text-white' : 'text-[#F8E7E4]/80 hover:text-white'
              }`}
            >
              2. Opening
            </button>
            <button
              onClick={() => setCurrentState(3)}
              className={`relative z-10 text-xs px-2.5 py-1 rounded-full font-medium transition-colors font-hand text-[15px] cursor-pointer ${
                currentState === 3 ? 'text-white' : 'text-[#F8E7E4]/80 hover:text-white'
              }`}
            >
              3. Card
            </button>
          </div>

          {/* Right Action Icons: Music + Replay + Quick RSVP */}
          <div className="flex items-center gap-1.5">
            {/* Music Player Button */}
            <button
              onClick={toggleMusic}
              className={`w-7 h-7 rounded-full flex items-center justify-center border border-white/20 shadow-sm transition-all active:scale-90 cursor-pointer ${
                isPlayingMusic ? 'bg-[#C97B84] text-white animate-pulse' : 'bg-[#4A322C]/75 text-[#F8E7E4]'
              }`}
              title={isPlayingMusic ? 'Mute Music' : 'Play Birthday Song'}
            >
              <span className="text-xs">{isPlayingMusic ? '🎵' : '🔇'}</span>
            </button>

            {/* Replay Button */}
            <button
              onClick={handleReplay}
              className="text-xs bg-[#4A322C]/75 hover:bg-[#4A322C] text-[#F8E7E4] px-2 py-1 rounded-full border border-white/10 shadow-sm transition-transform active:scale-90 flex items-center gap-1 font-typewriter text-[9px] cursor-pointer"
              title="Replay unsealing animation"
            >
              <span>↻</span>
            </button>

            {/* RSVP Top Button in State 3 */}
            {currentState === 3 && (
              <button
                onClick={() => {
                  setRsvpSuccess(false);
                  setIsRsvpOpen(true);
                }}
                className="text-xs bg-[#C97B84] hover:bg-[#b56b74] text-white px-2.5 py-1 rounded-full shadow-md font-hand tracking-wide text-sm font-bold flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
              >
                <span>RSVP</span>
                <span className="text-xs">💌</span>
              </button>
            )}
          </div>
        </div>

        {/* Floating background petals across the screen canvas */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          <div className="absolute top-24 right-10 petal-float-1 opacity-70">
            <svg height="18" viewBox="0 0 20 20" width="18">
              <path d="M10 2 C15 5 17 13 10 18 C3 13 5 5 10 2 Z" fill="#EBC1C6"></path>
            </svg>
          </div>
          <div className="absolute top-1/3 left-5 petal-float-2 opacity-60">
            <svg height="22" viewBox="0 0 24 24" width="22">
              <path d="M12 2 C18 6 20 15 12 22 C4 15 6 6 12 2 Z" fill="#C97B84"></path>
            </svg>
          </div>
          <div className="absolute bottom-48 right-6 petal-float-3 opacity-60">
            <svg height="16" viewBox="0 0 18 18" width="16">
              <path d="M9 2 C14 5 15 12 9 16 C3 12 4 5 9 2 Z" fill="#EBC1C6"></path>
            </svg>
          </div>
        </div>

        {/* =========================================================
            STATE 1: SEALED ENVELOPE (LANDING SCREEN)
            ========================================================= */}
        <div
          className={`state-screen w-full h-full relative cursor-pointer ${
            currentState === 1 ? 'state-active' : 'state-hidden'
          }`}
          onClick={handleEnvelopeTap}
        >
          {/* Corner Coffee Ring Stain */}
          <div className="coffee-stain top-12 -left-6" />

          {/* Dried flower sprig */}
          <div className="absolute top-16 right-7 flat-shadow-sm rotate-[18deg] pointer-events-none z-10">
            <svg fill="none" height="58" viewBox="0 0 50 60" width="48">
              <path d="M25 58 C25 45 28 32 30 18" stroke="#879576" strokeLinecap="round" strokeWidth="1.8" />
              <path d="M28 36 C34 33 39 36 38 41 C33 43 30 40 28 36 Z" fill="#B7C4A5" opacity="0.85" />
              <path d="M27 28 C21 26 18 30 19 34 C23 35 26 31 27 28 Z" fill="#B7C4A5" opacity="0.85" />
              <circle cx="30" cy="16" fill="#EBC1C6" opacity="0.9" r="6" />
              <circle cx="24" cy="13" fill="#F8E7E4" opacity="0.95" r="5" />
              <circle cx="35" cy="12" fill="#EBC1C6" opacity="0.85" r="5" />
              <circle cx="33" cy="20" fill="#F8E7E4" opacity="0.9" r="5.5" />
              <circle cx="24" cy="19" fill="#EBC1C6" opacity="0.9" r="5" />
              <circle cx="30" cy="16" fill="#C9A25D" r="2.5" />
            </svg>
          </div>

          {/* Pearl-string chain drape across the top corner */}
          <div className="absolute top-10 left-12 pointer-events-none flat-shadow-sm opacity-90">
            <svg height="40" viewBox="0 0 120 40" width="120">
              <circle cx="6" cy="6" fill="#FFFDF8" r="3.2" stroke="#D1C1B0" strokeWidth="0.5" />
              <circle cx="16" cy="11" fill="#FFFDF8" r="3" stroke="#D1C1B0" strokeWidth="0.5" />
              <circle cx="28" cy="18" fill="#FFFDF8" r="3.2" stroke="#D1C1B0" strokeWidth="0.5" />
              <circle cx="42" cy="24" fill="#FFFDF8" r="3.3" stroke="#D1C1B0" strokeWidth="0.5" />
              <circle cx="58" cy="27" fill="#FFFDF8" r="3.5" stroke="#D1C1B0" strokeWidth="0.5" />
              <circle cx="74" cy="26" fill="#FFFDF8" r="3.3" stroke="#D1C1B0" strokeWidth="0.5" />
              <circle cx="90" cy="22" fill="#FFFDF8" r="3.2" stroke="#D1C1B0" strokeWidth="0.5" />
              <circle cx="104" cy="17" fill="#FFFDF8" r="3" stroke="#D1C1B0" strokeWidth="0.5" />
              <circle cx="116" cy="13" fill="#FFFDF8" r="2.8" stroke="#D1C1B0" strokeWidth="0.5" />
            </svg>
          </div>

          {/* Handwritten note above envelope */}
          <div className="absolute top-28 left-8 rotate-[-3deg] flat-shadow-sm z-20 pointer-events-none">
            <p className="font-hand text-2xl text-[#4A322C] tracking-wide leading-none">
              for you, darling guest <span className="inline-block text-[#C97B84] text-xl animate-pulse">♡</span>
            </p>
          </div>

          {/* Tiny hand-drawn star cluster */}
          <div className="absolute top-36 right-16 rotate-12 text-[#C9A25D] opacity-80 pointer-events-none star-twinkle">
            <svg fill="none" height="34" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 34 34" width="34">
              <path d="M10 2 L12 8 L18 10 L12 12 L10 18 L8 12 L2 10 L8 8 Z" />
              <circle cx="26" cy="8" fill="#C9A25D" r="1.5" />
              <path d="M24 20 L25 24 L29 25 L25 26 L24 30 L23 26 L19 25 L23 24 Z" strokeWidth="1" />
              <circle cx="14" cy="28" fill="#C9A25D" r="1" />
            </svg>
          </div>

          {/* Two washi tape strips holding "open me" tag */}
          <div className="absolute top-[48%] left-4 -translate-y-24 rotate-[-12deg] z-30 flat-shadow-md washi-flutter pointer-events-none">
            <div className="washi-tape-sage h-4 w-14 mx-auto -mb-2 relative z-10 rotate-[4deg]" />
            <div className="bg-[#FBF1DC] px-3 py-1.5 border border-[#4A322C]/20 shadow-sm text-center">
              <span className="font-typewriter text-[11px] text-[#4A322C] tracking-wider uppercase">open me</span>
            </div>
            <div className="washi-tape h-4 w-12 mx-auto -mt-2 relative z-10 rotate-[-5deg]" />
          </div>

          {/* Cherry Sticker */}
          <div className="absolute bottom-40 left-6 rotate-[14deg] flat-shadow-sm z-20 pointer-events-none">
            <svg fill="none" height="42" viewBox="0 0 50 50" width="42">
              <path d="M17 28 C18 16 28 8 36 6" stroke="#879576" strokeLinecap="round" strokeWidth="2.2" />
              <path d="M33 28 C30 18 30 11 36 6" stroke="#879576" strokeLinecap="round" strokeWidth="2" />
              <path d="M36 6 C42 4 46 8 44 11 C40 12 37 9 36 6 Z" fill="#B7C4A5" />
              <circle cx="17" cy="33" fill="#C97B84" r="11" />
              <circle cx="13" cy="29" fill="#F8E7E4" opacity="0.6" r="3" />
              <circle cx="34" cy="32" fill="#C97B84" r="10.5" />
              <circle cx="31" cy="28" fill="#F8E7E4" opacity="0.6" r="2.8" />
            </svg>
          </div>

          {/* MAIN SEALED ENVELOPE */}
          <div className="absolute top-[49%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[74%] flat-shadow-lg z-20 animate-float group">
            <div className="relative bg-[#FBF1DC] rounded-md aspect-[1.42/1] border border-[#C97B84]/40 overflow-hidden p-1 shadow-inner flap-container transition-transform duration-300 group-hover:scale-[1.02]">
              <div className="w-full h-full border border-dashed border-[#C97B84]/50 rounded relative flex flex-col justify-between overflow-hidden bg-[#FAF3E3]">
                {/* Envelope Flap with 3D folding ability */}
                <div
                  className={`absolute top-0 inset-x-0 h-[58%] overflow-hidden z-10 envelope-top-flap ${
                    isFlapOpened ? 'flap-opened' : ''
                  }`}
                >
                  <div className="absolute top-0 inset-x-0 h-full ditsy-floral opacity-90" />
                  <svg className="w-full h-full drop-shadow-sm" preserveAspectRatio="none" viewBox="0 0 280 120">
                    <polygon fill="#FBF1DC" points="0,0 280,0 140,118" stroke="#C97B84" strokeDasharray="3,3" strokeWidth="1.2" />
                  </svg>
                </div>

                {/* Lower fold crease visual */}
                <div className="absolute bottom-0 inset-x-0 h-full pointer-events-none">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 280 160">
                    <line stroke="#4A322C" strokeOpacity="0.1" strokeWidth="1" x1="0" x2="140" y1="160" y2="78" />
                    <line stroke="#4A322C" strokeOpacity="0.1" strokeWidth="1" x1="280" x2="140" y1="160" y2="78" />
                  </svg>
                </div>

                {/* Silk ribbons */}
                <div
                  className={`absolute inset-y-0 left-[35%] w-8 bg-[#C97B84] shadow-md z-20 flex items-center justify-center transition-all duration-300 ${
                    isRibbonHidden ? 'opacity-40' : 'opacity-100'
                  }`}
                >
                  <div className="w-[2px] h-full bg-[#EBC1C6]/50" />
                </div>
                <div
                  className={`absolute inset-x-0 top-[52%] h-7 bg-[#C97B84] shadow-md z-20 flex flex-col justify-center transition-all duration-300 ${
                    isRibbonHidden ? 'opacity-40' : 'opacity-100'
                  }`}
                >
                  <div className="h-[2px] w-full bg-[#EBC1C6]/50" />
                </div>

                {/* Silk Ribbon Bow */}
                <div
                  className={`absolute top-[48%] left-[35%] -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flat-shadow-sm transition-opacity duration-300 ${
                    isRibbonHidden ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  <svg fill="none" height="70" viewBox="0 0 90 70" width="86">
                    <path d="M42 35 C28 20 5 18 12 32 C18 42 38 38 42 35 Z" fill="#C97B84" stroke="#A85862" strokeWidth="0.8" />
                    <path d="M40 34 C30 24 15 23 20 31 C25 38 38 36 40 34 Z" fill="#D88D96" opacity="0.6" />
                    <path d="M48 35 C62 20 85 18 78 32 C72 42 52 38 48 35 Z" fill="#C97B84" stroke="#A85862" strokeWidth="0.8" />
                    <path d="M50 34 C60 24 75 23 70 31 C65 38 52 36 50 34 Z" fill="#D88D96" opacity="0.6" />
                    <path d="M42 38 C35 52 26 62 18 68 C22 66 32 58 40 42 Z" fill="#C97B84" />
                    <path d="M48 38 C54 52 64 62 72 68 C68 66 58 58 50 42 Z" fill="#C97B84" />
                    <ellipse cx="45" cy="35" fill="#A85862" rx="7" ry="6" />
                    <ellipse cx="44" cy="34" fill="#C97B84" rx="5" ry="4" />
                  </svg>
                </div>

                {/* GLOSSY GOLD WAX SEAL */}
                <div
                  className={`absolute top-[52%] left-[54%] -translate-x-1/2 -translate-y-1/2 z-40 flat-shadow-md cursor-pointer ${
                    isSealBreaking ? 'seal-breaking' : ''
                  }`}
                >
                  <div
                    className="relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 wax-pulse group-hover:scale-110 active:scale-95"
                    style={{
                      background: 'radial-gradient(circle at 35% 30%, #E3C27E 0%, #C9A25D 60%, #9B7736 100%)',
                    }}
                  >
                    <div className="absolute inset-1 rounded-full border-2 border-[#E3C27E]/80 opacity-90" />
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shadow-inner"
                      style={{
                        background: 'radial-gradient(circle at 40% 35%, #B8924E 0%, #936F2E 100%)',
                      }}
                    >
                      <span
                        className="font-fraunces italic font-bold text-2xl text-[#FBF1DC]"
                        style={{ textShadow: '0 -1px 1px rgba(0,0,0,0.5), 0 1px 1px rgba(255,255,255,0.4)' }}
                      >
                        {celebrantInitial}
                      </span>
                    </div>
                    <div className="absolute top-2 left-3 w-4 h-2 bg-white/40 rounded-full blur-[0.6px] rotate-[-25deg]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Handwritten arrow & tap hint */}
          <div className="absolute bottom-20 inset-x-0 flex flex-col items-center justify-center gap-1 z-30 pointer-events-none arrow-bounce">
            <p className="font-hand text-2xl text-[#4A322C] tracking-wide rotate-[-2deg]">tap to open</p>
            <svg className="text-[#4A322C] rotate-[-5deg]" fill="none" height="34" viewBox="0 0 26 34" width="26">
              <path d="M14 32 C17 24 16 12 13 6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
              <path d="M6 12 L13 5 L19 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            </svg>
          </div>

          <div className="absolute bottom-6 inset-x-0 text-center pointer-events-none">
            <span className="text-[11px] font-typewriter text-[#4A322C]/60 tracking-wider">TAP ANYWHERE TO UNSEAL</span>
          </div>
        </div>

        {/* =========================================================
            STATE 2: OPENING (CRACKED SEAL & SLIDING PEEK)
            ========================================================= */}
        <div
          className={`state-screen w-full h-full relative cursor-pointer ${
            currentState === 2 ? 'state-active' : 'state-hidden'
          }`}
          onClick={handleCardPull}
        >
          {/* Corner Coffee Ring Stain */}
          <div className="coffee-stain top-12 -left-6" />

          {/* Floating petals & sparkles */}
          <div className="absolute top-20 left-10 petal-float-1 z-40 pointer-events-none">
            <svg height="24" viewBox="0 0 22 22" width="24">
              <path d="M11 2 C16 6 18 14 11 20 C4 14 6 6 11 2 Z" fill="#EBC1C6" opacity="0.9" />
            </svg>
          </div>
          <div className="absolute top-28 right-8 petal-float-2 z-40 pointer-events-none">
            <svg height="26" viewBox="0 0 28 28" width="26">
              <path d="M14 2 C20 7 22 18 14 26 C6 18 8 7 14 2 Z" fill="#C97B84" opacity="0.8" transform="rotate(25 14 14)" />
            </svg>
          </div>
          <div className="absolute bottom-40 right-10 petal-float-3 z-40 pointer-events-none">
            <svg height="22" viewBox="0 0 22 22" width="22">
              <path d="M11 2 C16 6 18 14 11 20 C4 14 6 6 11 2 Z" fill="#EBC1C6" opacity="0.85" />
            </svg>
          </div>

          {/* Untied ribbon drape */}
          <div className="absolute top-[68%] left-6 z-10 pointer-events-none flat-shadow-sm rotate-[-12deg]">
            <svg fill="none" height="45" viewBox="0 0 140 45" width="140">
              <path d="M5 35 C35 10 90 40 135 15" stroke="#C97B84" strokeLinecap="round" strokeWidth="12" />
              <path d="M5 35 C35 10 90 40 135 15" opacity="0.6" stroke="#EBC1C6" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>

          {/* CRACKED GOLD WAX SEAL HALVES */}
          <div className="absolute top-[65%] left-[26%] -translate-x-1/2 rotate-[-22deg] z-30 flat-shadow-md pointer-events-none">
            <div className="relative w-12 h-14 overflow-hidden">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, #E3C27E 0%, #C9A25D 60%, #9B7736 100%)',
                  boxShadow: 'inset 0 2px 2px rgba(255,255,255,0.6)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'radial-gradient(circle at 40% 35%, #B8924E 0%, #936F2E 100%)' }}
                >
                  <span className="font-fraunces italic font-bold text-xl text-[#FBF1DC] -mr-3">{celebrantInitial}</span>
                </div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-[#4A322C]/40" />
            </div>
          </div>

          <div className="absolute top-[67%] left-[44%] -translate-x-1/2 rotate-[28deg] z-30 flat-shadow-md pointer-events-none">
            <div className="relative w-11 h-14 overflow-hidden">
              <div
                className="w-14 h-14 rounded-full -ml-3 flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, #E3C27E 0%, #C9A25D 60%, #9B7736 100%)',
                  boxShadow: 'inset 0 2px 2px rgba(255,255,255,0.6)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'radial-gradient(circle at 40% 35%, #B8924E 0%, #936F2E 100%)' }}
                />
              </div>
            </div>
          </div>

          {/* ENVELOPE OPEN WITH FLAP UP AND CARD HALFWAY EMERGING */}
          <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[76%] flat-shadow-lg z-20">
            <div className="relative bg-[#FBF1DC] rounded-md aspect-[1.32/1] border border-[#C97B84]/40 overflow-visible p-1">
              {/* Open Flap Folded Upwards with ditsy floral print */}
              <div className="absolute -top-[52%] inset-x-1 h-[54%] overflow-hidden rounded-t-md z-0 flat-shadow-sm">
                <div className="w-full h-full ditsy-floral relative border-t border-[#C97B84]/40">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 280 120">
                    <polygon fill="#EBC1C6" fillOpacity="0.9" points="0,120 280,120 140,0" stroke="#C97B84" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>

              {/* Peeking card emerging from envelope */}
              <div className="absolute -top-[46%] left-[3%] w-[94%] h-[126%] deckled-card rounded-md p-3.5 z-10 rotate-[2.8deg] flat-shadow-md flex flex-col justify-between peek-hover-bounce cursor-grab active:cursor-grabbing">
                <div className="border-b border-dashed border-[#C97B84]/30 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-hand text-sm text-[#4A322C]/75">{tagline}</span>
                    <span className="font-typewriter text-[9px] uppercase px-1.5 py-0.5 bg-[#EBC1C6]/40 rounded text-[#4A322C] font-bold">
                      INVITATION
                    </span>
                  </div>
                  <h3 className="font-fraunces italic font-bold text-[22px] text-[#C97B84] leading-tight mt-0.5 truncate">
                    {title}
                  </h3>
                  <p className="font-typewriter text-[10px] text-[#4A322C] tracking-wide font-bold">{eventDate}</p>
                </div>

                {/* Peeking polaroid corner */}
                <div className="relative bg-white p-2 pb-3 rounded shadow-sm border border-[#4A322C]/10 max-w-[145px] mx-auto rotate-[-3deg] my-1">
                  <div className="washi-tape-sage absolute -top-2 left-2 h-3.5 w-10 rotate-[-8deg] z-20" />
                  <div className="w-full h-16 bg-[#F8E7E4] rounded flex items-center justify-center overflow-hidden">
                    {polaroidPhoto ? (
                      <img src={polaroidPhoto} alt="Sneak peek" className="w-full h-full object-cover" />
                    ) : (
                      <svg fill="none" height="42" viewBox="0 0 40 40" width="42">
                        <circle cx="20" cy="18" fill="#EBC1C6" r="10" />
                        <path d="M12 34 C12 26 28 26 28 34" fill="#C97B84" />
                        <circle cx="16" cy="15" fill="#4A322C" r="1.5" />
                        <circle cx="24" cy="15" fill="#4A322C" r="1.5" />
                        <path d="M18 20 Q 20 22 22 20" fill="none" stroke="#4A322C" strokeWidth="1" />
                      </svg>
                    )}
                  </div>
                  <p className="font-hand text-xs text-[#4A322C] text-center mt-1 font-semibold">sneak peek... ✨</p>
                </div>

                <div className="text-center truncate">
                  <span className="font-hand text-xs text-[#C97B84] tracking-wide">{venue}</span>
                </div>
              </div>

              {/* Envelope Pocket Front */}
              <div className="absolute inset-0 bg-[#FBF1DC] rounded-b-md border-t-2 border-[#C97B84]/30 z-20 overflow-hidden flex flex-col justify-end p-3 pointer-events-none">
                <div className="w-full h-full border border-dashed border-[#C97B84]/40 rounded-sm pointer-events-none flex items-end justify-center pb-2">
                  <span className="font-hand text-sm text-[#4A322C]/60 tracking-wider">unfolding the magic...</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pull button hint */}
          <div className="absolute bottom-16 inset-x-0 flex flex-col items-center justify-center gap-1 z-30 pointer-events-none">
            <div className="flex items-center gap-1.5 bg-white/85 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-[#C97B84]/30 rotate-[-1deg]">
              <span className="font-hand text-2xl text-[#C97B84] font-bold">pull to reveal the invitation ↗</span>
            </div>
            <p className="font-typewriter text-[10px] text-[#4A322C]/60 tracking-wider mt-1 uppercase">TAP TO VIEW FULL CARD</p>
          </div>
        </div>

        {/* =========================================================
            STATE 3: THE INVITATION CARD (FULL SCREEN)
            ========================================================= */}
        <div
          className={`state-screen w-full h-full relative p-3 sm:p-4 flex flex-col justify-between overflow-hidden ${
            currentState === 3 ? 'state-active' : 'state-hidden'
          }`}
        >
          {/* Deckled Hand-Torn Card Container with custom scroll */}
          <div
            className="relative w-full h-full deckled-card rounded-xl p-3.5 sm:p-4 flex flex-col justify-between card-scroll overflow-y-auto z-10 card-enter-anim"
          >
            {/* Header Section */}
            <div className="relative pt-6">
              <div className="relative inline-block rotate-[-2deg]">
                <div className="flex items-center gap-1">
                  <span className="font-hand text-2xl text-[#4A322C] font-bold tracking-wide">
                    {tagline}
                  </span>
                  <svg className="text-[#C9A25D] star-twinkle" fill="none" height="16" viewBox="0 0 20 20" width="16">
                    <path d="M10 2L12 8L18 10L12 12L10 18L8 12L2 10L8 8Z" fill="currentColor" />
                  </svg>
                </div>
                {/* Curved ink underline */}
                <svg className="w-full h-2.5 -mt-0.5 text-[#C97B84]" fill="none" viewBox="0 0 160 12">
                  <path d="M4 8 C50 2 115 11 156 5" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
                </svg>
              </div>

              {/* Celebrant Headline */}
              <div className="relative mt-1">
                <h1 className="font-fraunces italic font-normal text-[32px] sm:text-[36px] leading-[1.05] text-[#4A322C] tracking-tight">
                  {title}
                </h1>
              </div>

              {/* Birthday cupcake doodle */}
              <div className="absolute top-6 right-1 pointer-events-none">
                <svg fill="none" height="44" viewBox="0 0 50 50" width="44">
                  <line stroke="#4A322C" strokeWidth="1.8" x1="25" x2="25" y1="12" y2="5" />
                  <ellipse cx="25" cy="4" fill="#C9A25D" rx="2" ry="3.5" />
                  <path d="M14 26 C14 18 36 18 36 26 Z" fill="#F8E7E4" stroke="#4A322C" strokeWidth="1.4" />
                  <polygon fill="#EBC1C6" points="16,26 34,26 31,42 19,42" stroke="#4A322C" strokeWidth="1.4" />
                  <circle cx="25" cy="18" fill="#C97B84" r="3" />
                </svg>
              </div>
            </div>

            {/* Middle Section: Milestone Number + Polaroid Photo */}
            <div className="relative my-2 min-h-[170px] flex items-center justify-between">
              {/* Giant milestone watermark */}
              <div className="absolute left-0 top-0 select-none pointer-events-none z-0">
                <span
                  className="font-fraunces italic font-extrabold text-[115px] leading-none tracking-tighter select-none"
                  style={{
                    WebkitTextStroke: '1.8px #C9A25D',
                    color: 'transparent',
                    textShadow: '2px 3px 0px rgba(248, 231, 228, 0.7)',
                  }}
                >
                  {milestoneNumber}
                </span>
              </div>

              {/* Ribbon banner across numeral */}
              <div className="absolute left-14 top-16 w-32 h-5 bg-[#C97B84]/90 rotate-[-16deg] z-10 flat-shadow-sm flex items-center justify-center pointer-events-none">
                <span className="text-[9px] font-typewriter text-white uppercase tracking-widest font-bold">
                  CHAPTER {milestoneNumber}
                </span>
              </div>

              {/* POLAROID PHOTO with interactive click reaction */}
              <div
                onClick={handlePhotoClick}
                className="relative ml-auto mr-1 rotate-[5deg] bg-white p-2 pb-3.5 rounded-sm flat-shadow-md z-20 border border-[#4A322C]/10 max-w-[150px] cursor-pointer transition-transform hover:scale-105 hover:rotate-[3deg]"
                title="Click to celebrate!"
              >
                <div className="washi-tape-sage absolute -top-2.5 left-4 h-4 w-12 rotate-[-6deg] z-30" />
                <div className="washi-tape absolute -bottom-2 -right-2 h-4 w-11 rotate-[18deg] z-30" />

                <div className="w-full h-24 bg-[#EBC1C6]/30 rounded-sm overflow-hidden relative flex items-center justify-center border border-[#4A322C]/5">
                  {polaroidPhoto ? (
                    <img src={polaroidPhoto} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    <svg height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 140 100" width="100%">
                      <rect fill="#F8E7E4" height="100" width="140" />
                      <circle cx="70" cy="42" fill="#FBF1DC" r="28" />
                      <path d="M42 42 C42 22 55 12 70 12 C85 12 98 22 98 42 C98 56 94 68 94 68 C84 62 82 52 82 52 C72 56 62 50 62 50 C58 60 46 66 42 42 Z" fill="#4A322C" opacity="0.85" />
                      <ellipse cx="70" cy="42" fill="#FCECE9" rx="14" ry="16" />
                      <circle cx="63" cy="46" fill="#EBC1C6" opacity="0.8" r="3.5" />
                      <circle cx="77" cy="46" fill="#EBC1C6" opacity="0.8" r="3.5" />
                      <path d="M62 40 Q 65 38 68 40" fill="none" stroke="#4A322C" strokeLinecap="round" strokeWidth="1.2" />
                      <path d="M72 40 Q 75 38 78 40" fill="none" stroke="#4A322C" strokeLinecap="round" strokeWidth="1.2" />
                      <path d="M67 48 Q 70 51 73 48" fill="none" stroke="#C97B84" strokeLinecap="round" strokeWidth="1.4" />
                      <path d="M48 95 C52 72 88 72 92 95 Z" fill="#C97B84" />
                    </svg>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#C97B84]/15 to-transparent pointer-events-none" />
                </div>
                <p className="font-hand text-xs text-[#4A322C] text-center mt-2 leading-tight font-semibold select-none">
                  making a wish at golden hour ✨
                </p>
              </div>
            </div>

            {/* Perforated Ticket Stub Pass */}
            <div className="relative my-1.5 z-20">
              <div className="ticket-stub p-3 rounded shadow-sm">
                <div className="flex items-center justify-between border-b border-dashed border-[#4A322C]/25 pb-1 mb-2">
                  <div className="flex items-center gap-1.5">
                    <svg className="text-[#879576]" fill="none" height="14" viewBox="0 0 20 20" width="14">
                      <path d="M10 2 C10 10 4 12 2 18 C8 16 12 12 12 2 Z" fill="#B7C4A5" />
                      <path d="M10 2 C10 10 16 12 18 18 C12 16 8 12 8 2 Z" fill="#879576" opacity="0.7" />
                    </svg>
                    <span className="font-typewriter text-[8px] uppercase tracking-wider text-[#4A322C]/75 font-bold">
                      CELEBRATION PASS • ADMIT ONE
                    </span>
                  </div>
                  <span className="font-typewriter text-[8px] text-[#C97B84] font-bold">
                    #{celebrantInitial}PARTY{milestoneNumber}
                  </span>
                </div>

                {/* Date, Time, Venue */}
                <div className="grid grid-cols-3 gap-2 text-left">
                  <div>
                    <span className="block font-typewriter text-[7.5px] uppercase text-[#4A322C]/60 tracking-wider">
                      Date
                    </span>
                    <span className="font-typewriter font-bold text-[10.5px] text-[#4A322C] leading-tight block">
                      {eventDate}
                    </span>
                  </div>
                  <div>
                    <span className="block font-typewriter text-[7.5px] uppercase text-[#4A322C]/60 tracking-wider">
                      Time
                    </span>
                    <span className="font-typewriter font-bold text-[10.5px] text-[#4A322C] leading-tight block">
                      {eventTime}
                    </span>
                  </div>
                  <div>
                    <span className="block font-typewriter text-[7.5px] uppercase text-[#4A322C]/60 tracking-wider">
                      Venue
                    </span>
                    <span className="font-typewriter font-bold text-[10.5px] text-[#4A322C] leading-tight block truncate">
                      {venue}
                    </span>
                  </div>
                </div>

                {/* Address */}
                <div className="mt-2 pt-1 border-t border-dotted border-[#4A322C]/25 flex items-center justify-between text-[8px] font-typewriter text-[#4A322C]/80">
                  <span className="truncate max-w-[200px]">{address}</span>
                  <span className="text-[#C9A25D] font-bold shrink-0">01 Darling Guest</span>
                </div>
              </div>
            </div>

            {/* Route Sketch & Dress Code Note */}
            <div className="grid grid-cols-2 gap-2.5 my-1 items-stretch z-20">
              {/* Route Sketch Map Link */}
              <a
                href={mapDirectionsUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#F8E7E4]/90 hover:bg-[#F8E7E4] p-2 rounded border border-[#4A322C]/15 relative flat-shadow-sm flex flex-col justify-between group transition-all"
                title="Tap to open Google Maps navigation"
              >
                <div className="flex items-center justify-between">
                  <span className="font-typewriter text-[8px] uppercase tracking-wider text-[#4A322C]/70">
                    Route sketch
                  </span>
                  <span className="text-[9px] text-[#C97B84] group-hover:scale-125 transition-transform">📍 GPS ↗</span>
                </div>
                <div className="h-16 w-full relative my-0.5">
                  <svg fill="none" height="100%" viewBox="0 0 130 65" width="100%">
                    <ellipse cx="28" cy="46" fill="#EBC1C6" opacity="0.6" rx="14" ry="8" />
                    <text fill="#C97B84" fontFamily="'Caveat', cursive" fontSize="7" x="20" y="48">
                      pond
                    </text>
                    <circle cx="15" cy="22" fill="#B7C4A5" opacity="0.7" r="5" />
                    <line stroke="#4A322C" strokeWidth="1.2" x1="15" x2="15" y1="22" y2="28" />
                    <circle cx="25" cy="18" fill="#B7C4A5" opacity="0.6" r="4.5" />
                    <line stroke="#4A322C" strokeWidth="1" x1="25" x2="25" y1="18" y2="24" />
                    <path d="M12 56 Q 48 52 64 36 T 112 18" stroke="#C97B84" strokeDasharray="3,3" strokeWidth="1.8" />
                    <path d="M112 18 C108 12 116 12 112 22 C108 12 116 12 112 18 Z" fill="#C97B84" />
                    <circle cx="112" cy="16" fill="#FBF1DC" r="1.5" />
                    <text fill="#C97B84" fontFamily="'Caveat', cursive" fontSize="10" fontWeight="bold" x="65" y="11">
                      Venue ♡
                    </text>
                  </svg>
                </div>
                <p className="font-hand text-[10px] text-[#4A322C]/80 leading-tight">tap for directions map ↗</p>
              </a>

              {/* Dress Code Note */}
              <div className="relative bg-[#FAF3E3] p-2 rounded border-l-2 border-dashed border-[#C97B84] flat-shadow-sm rotate-[1deg] flex flex-col justify-between">
                <div className="washi-tape absolute -top-2 left-4 h-3 w-8 rotate-[-4deg]" />
                <div>
                  <span className="font-hand text-xs text-[#C97B84] font-bold block uppercase tracking-wider">
                    {dressCodeTitle}
                  </span>
                  <p className="font-hand text-[12px] text-[#4A322C] leading-snug mt-0.5">
                    {dressCodeText}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-[#4A322C]/10 flex-wrap">
                  {dressCodeColors.map((color, cIdx) => (
                    <span
                      key={cIdx}
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs cursor-pointer hover:scale-125 transition-transform"
                      style={{ backgroundColor: color }}
                      title={`Color ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Itinerary Note */}
            <div className="text-center my-0.5 z-20 bg-[#F8E7E4]/50 py-1 px-2 rounded border border-[#C97B84]/20">
              <p className="font-typewriter text-[8px] text-[#4A322C] tracking-wide">
                {note}
              </p>
            </div>

            {/* Bottom Sentiment */}
            <div className="text-center my-0.5 z-20">
              <p className="font-script text-[12.5px] text-[#4A322C] tracking-wide rotate-[-1deg]">
                can't wait to make memories with you! With love ♡
              </p>
            </div>

            {/* RSVP Tag Sway Button */}
            <div className="relative pt-1 flex items-center justify-between z-20">
              <div className="flex items-center gap-1.5 text-[#C97B84] opacity-80 pointer-events-none">
                <span className="font-hand text-xs text-[#4A322C]/75">bring your polaroids 📸</span>
              </div>

              <div className="tag-sway">
                <button
                  onClick={() => {
                    setRsvpSuccess(false);
                    setIsRsvpOpen(true);
                  }}
                  className="group relative inline-flex items-center gap-1.5 bg-[#C97B84] hover:bg-[#b56b74] text-white px-3.5 py-1.5 rounded-r-md rounded-l-2xl border border-dashed border-[#FBF1DC] flat-shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#FBF1DC] border border-[#4A322C]/30 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4A322C]" />
                  </span>
                  <span className="font-hand font-bold text-base tracking-wider pl-1.5">
                    RSVP by {data.rsvpSettings?.deadline || 'May 25'} 💌
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            RSVP BOTTOM SHEET MODAL (Includes Mobile Number Request)
            ========================================================= */}
        {isRsvpOpen && (
          <div className="absolute inset-0 z-50 bg-[#2b1f1d]/60 backdrop-blur-[3px] flex items-end animate-in fade-in duration-200">
            <div className="w-full bg-[#FBF1DC] rounded-t-3xl border-t-2 border-[#C97B84] p-5 flat-shadow-lg relative animate-in slide-in-from-bottom duration-300">
              {/* Washi Tape */}
              <div className="washi-tape absolute -top-3 left-1/2 -translate-x-1/2 h-5 w-24 rotate-[1deg] washi-flutter pointer-events-none" />

              {/* Modal Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#4A322C]/15">
                <div>
                  <span className="font-typewriter text-[9px] uppercase tracking-widest text-[#4A322C]/60">
                    KEEPSAKE CONFIRMATION
                  </span>
                  <h4 className="font-fraunces italic font-bold text-xl text-[#C97B84] leading-tight">
                    Will you be joining us? ♡
                  </h4>
                </div>
                <button
                  onClick={() => setIsRsvpOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#F8E7E4] border border-[#4A322C]/20 flex items-center justify-center text-[#4A322C] hover:bg-[#EBC1C6] transition-transform active:scale-90 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {rsvpSuccess ? (
                /* RSVP Success Note */
                <div className="py-6 flex flex-col items-center justify-center text-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-md"
                    style={{
                      background: 'radial-gradient(circle at 35% 30%, #E3C27E 0%, #C9A25D 60%, #9B7736 100%)',
                    }}
                  >
                    <span className="font-fraunces italic font-bold text-xl text-[#FBF1DC]">
                      {celebrantInitial}
                    </span>
                  </div>
                  <h5 className="font-fraunces italic font-bold text-xl text-[#C97B84]">RSVP Received! ♡</h5>
                  <p className="font-hand text-base text-[#4A322C] mt-1">
                    Thank you {guestName}! A confirmation note has been saved. Can't wait to celebrate!
                  </p>
                  <button
                    onClick={() => setIsRsvpOpen(false)}
                    className="mt-4 font-typewriter text-[9px] uppercase tracking-widest bg-[#C97B84] hover:bg-[#b56b74] text-white px-4 py-2 rounded-full shadow transition-transform active:scale-95 cursor-pointer"
                  >
                    Close Note
                  </button>
                </div>
              ) : (
                /* RSVP Form */
                <form onSubmit={handleSubmitRsvp} className="mt-3 space-y-2.5">
                  {/* Full Name */}
                  <div>
                    <label className="block font-typewriter text-[8.5px] uppercase tracking-wider text-[#4A322C]/70">
                      Your Full Name(s) *
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Maya & Liam"
                      className="notebook-line placeholder:text-[#4A322C]/35 text-base"
                    />
                  </div>

                  {/* Mobile Number for WhatsApp/SMS Notification */}
                  <div>
                    <label className="block font-typewriter text-[8.5px] uppercase tracking-wider text-[#4A322C]/70">
                      Mobile Number (WhatsApp / SMS) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={guestMobile}
                      onChange={(e) => setGuestMobile(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="notebook-line placeholder:text-[#4A322C]/35 text-base"
                    />
                  </div>

                  {/* Attendance */}
                  <div className="pt-0.5">
                    <label className="block font-typewriter text-[8.5px] uppercase tracking-wider text-[#4A322C]/70 mb-0.5">
                      Attendance
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer font-hand text-base text-[#4A322C]">
                        <input
                          type="radio"
                          name="attendance"
                          value="yes"
                          checked={attendance === 'yes'}
                          onChange={() => setAttendance('yes')}
                          className="accent-[#C97B84] cursor-pointer"
                        />
                        <span>Delighted to attend ✨</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-hand text-base text-[#4A322C]">
                        <input
                          type="radio"
                          name="attendance"
                          value="no"
                          checked={attendance === 'no'}
                          onChange={() => setAttendance('no')}
                          className="accent-[#C97B84] cursor-pointer"
                        />
                        <span>Regretfully declining 💌</span>
                      </label>
                    </div>
                  </div>

                  {/* Guest Count */}
                  <div className="flex items-center justify-between pt-0.5">
                    <label className="font-typewriter text-[8.5px] uppercase tracking-wider text-[#4A322C]/70">
                      Number of Guests
                    </label>
                    <div className="flex items-center gap-3 bg-[#F8E7E4] px-2.5 py-0.5 rounded-full border border-[#C97B84]/30">
                      <button
                        type="button"
                        onClick={() => setGuestCount((c) => Math.max(1, c - 1))}
                        className="text-[#4A322C] font-bold text-sm px-1 cursor-pointer hover:text-[#C97B84]"
                      >
                        -
                      </button>
                      <span className="font-typewriter font-bold text-xs text-[#4A322C] min-w-[12px] text-center">
                        {guestCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setGuestCount((c) => Math.min(8, c + 1))}
                        className="text-[#4A322C] font-bold text-sm px-1 cursor-pointer hover:text-[#C97B84]"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Wishes / Dietary */}
                  <div>
                    <label className="block font-typewriter text-[8.5px] uppercase tracking-wider text-[#4A322C]/70">
                      Birthday Wishes or Dietary Notes
                    </label>
                    <input
                      type="text"
                      value={dietaryNotes}
                      onChange={(e) => setDietaryNotes(e.target.value)}
                      placeholder="Any sweet wishes or notes..."
                      className="notebook-line placeholder:text-[#4A322C]/35 text-sm"
                    />
                  </div>

                  {/* Send Button */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-hand text-xs text-[#4A322C]/65">sealed with love ♡</span>
                    <button
                      type="submit"
                      className="bg-[#C97B84] hover:bg-[#b56b74] text-white font-typewriter uppercase tracking-widest text-[10px] px-4 py-2 rounded shadow border border-dashed border-[#FBF1DC] flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                    >
                      <span>Send RSVP via WhatsApp</span>
                      <span>📮</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
