import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TemplateProps } from '../types';

/* =========================================================
   CONFIG & ASSETS
   ========================================================= */
const TOTAL_BUBBLES = 8;
const TOTAL_FRIENDS = 4;
const TOTAL_PAIRS = 6;

const BUBBLE_EMOJIS = ['🐠', '🐡', '🐙', '🦀', '⭐', '🐬', '🎂', '🎈'];
const CARD_ICONS = ['⭐', '🐳', '🐚', '🦀', '🐠', '🐬'];

const SEA_FRIENDS = [
  { name: 'Sammy Seahorse', emoji: '🍓', type: 'seahorse' },
  { name: 'Pippa Pufferfish', emoji: '🍦', type: 'puffer' },
  { name: 'Toby Turtle', emoji: '🍉', type: 'turtle' },
  { name: 'Clara Crab', emoji: '🎂', type: 'crab' },
  { name: 'Jojo Jellyfish', emoji: '🥞', type: 'jelly' },
];

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

/* =========================================================
   WEB AUDIO SFX HOOK
   ========================================================= */
function useSfx() {
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const enabledRef = useRef(true);
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = () => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AC) ctxRef.current = new AC();
    }
    if (ctxRef.current && ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  };

  const tone = (
    ctx: AudioContext,
    {
      type = 'sine',
      at,
      freq,
      steps = [],
      gain,
      dur,
    }: {
      type?: OscillatorType;
      at: number;
      freq: number;
      steps?: Array<{ t: number; f: number; ramp?: 'exp' | 'lin' }>;
      gain: number;
      dur: number;
    }
  ) => {
    try {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, at);
      steps.forEach((s) => {
        if (s.ramp === 'exp') osc.frequency.exponentialRampToValueAtTime(Math.max(1, s.f), at + s.t);
        else osc.frequency.linearRampToValueAtTime(s.f, at + s.t);
      });
      g.gain.setValueAtTime(gain, at);
      g.gain.exponentialRampToValueAtTime(0.001, at + dur);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(at);
      osc.stop(at + dur);
    } catch {
      // audio error safely suppressed
    }
  };

  const playSfx = useCallback((kind: 'pop' | 'flip' | 'star' | 'feed' | 'click') => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (kind === 'pop') {
      tone(ctx, { at: now, freq: 600, steps: [{ t: 0.08, f: 1400, ramp: 'exp' }], gain: 0.4, dur: 0.09 });
    } else if (kind === 'flip') {
      tone(ctx, { type: 'triangle', at: now, freq: 320, steps: [{ t: 0.06, f: 180, ramp: 'exp' }], gain: 0.3, dur: 0.06 });
    } else if (kind === 'star') {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
        tone(ctx, { at: now + i * 0.07, freq: f, gain: 0.3, dur: 0.25 })
      );
    } else if (kind === 'feed') {
      tone(ctx, {
        type: 'triangle',
        at: now,
        freq: 400,
        steps: [{ t: 0.07, f: 700 }, { t: 0.14, f: 900 }],
        gain: 0.35,
        dur: 0.16,
      });
    } else if (kind === 'click') {
      tone(ctx, { at: now, freq: 440, gain: 0.2, dur: 0.04 });
    }
  }, []);

  const toggleSfx = useCallback(() => {
    const next = !enabledRef.current;
    enabledRef.current = next;
    setSfxEnabled(next);
    playSfx('click');
  }, [playSfx]);

  return { sfxEnabled, toggleSfx, playSfx };
}

/* =========================================================
   BACKGROUND GRAPHICS
   ========================================================= */
const AMBIENT_BUBBLES = [
  'bottom-4 left-6 w-5 h-5 animate-pulse',
  'bottom-8 left-28 w-3 h-3',
  'bottom-2 right-12 w-6 h-6 animate-pulse',
  'bottom-12 right-32 w-4 h-4',
];

function UnderwaterBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-b from-[#3ec9e0] via-[#006876] to-[#0a2744]">
      {/* Sunlight rays */}
      <svg className="absolute -top-10 left-0 w-full h-72 opacity-30" fill="none" viewBox="0 0 390 280" preserveAspectRatio="xMidYMin slice">
        <polygon fill="#ffffff" points="0,0 80,280 140,280 40,0" />
        <polygon fill="#ffffff" points="90,0 200,280 270,280 170,0" />
        <polygon fill="#ffffff" points="260,0 350,280 390,260 320,0" />
      </svg>

      {/* Floating bubbles */}
      <div className="absolute inset-0 overflow-hidden">
        {AMBIENT_BUBBLES.map((cls, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-white/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)] ${cls}`}
          />
        ))}
      </div>

      {/* Sea floor */}
      <svg className="absolute -bottom-2 left-0 w-[440px] h-28 -ml-6 text-[#004f58]/40" fill="currentColor" viewBox="0 0 440 120">
        <path d="M0,70 Q60,30 140,75 T280,60 T440,80 L440,120 L0,120 Z" />
      </svg>
      <svg className="absolute -bottom-1 left-0 w-full h-20 text-[#ffd84d]/20" fill="currentColor" viewBox="0 0 390 90" preserveAspectRatio="none">
        <path d="M0,45 Q70,80 160,35 T320,50 T400,30 L400,90 L0,90 Z" />
      </svg>
    </div>
  );
}

function MascotOllie() {
  return (
    <svg className="w-full h-full" fill="none" viewBox="0 0 200 200">
      <path d="M100 45 C65 45 50 75 50 115 C50 145 60 165 72 165 C80 165 85 150 92 150 C98 150 102 165 110 165 C118 165 122 150 128 150 C135 150 140 165 148 165 C160 165 170 145 170 115 C170 75 145 45 100 45 Z" fill="#ffffff" stroke="#ffffff" strokeLinejoin="round" strokeWidth="8" />
      <path d="M100 48 C70 48 55 76 55 115 C55 140 64 158 74 158 C81 158 87 146 93 146 C99 146 103 158 110 158 C117 158 122 146 128 146 C134 146 139 158 146 158 C156 158 165 140 165 115 C165 76 140 48 100 48 Z" fill="#7a68ff" />
      <ellipse cx="85" cy="72" fill="#ffffff" opacity="0.35" rx="20" ry="12" transform="rotate(-15 85 72)" />
      <ellipse cx="82" cy="105" fill="#14305A" rx="14" ry="16" />
      <ellipse cx="128" cy="105" fill="#14305A" rx="14" ry="16" />
      <circle cx="78" cy="100" fill="#ffffff" r="5" />
      <circle cx="85" cy="110" fill="#ffffff" r="2" />
      <circle cx="124" cy="100" fill="#ffffff" r="5" />
      <circle cx="131" cy="110" fill="#ffffff" r="2" />
      <ellipse cx="68" cy="120" fill="#FF7B7B" opacity="0.7" rx="7" ry="5" />
      <ellipse cx="142" cy="120" fill="#FF7B7B" opacity="0.7" rx="7" ry="5" />
      <path d="M96 122 Q105 134 114 122" fill="#fb7878" stroke="#14305A" strokeLinecap="round" strokeWidth="4" />
      {/* Birthday Party Hat */}
      <polygon fill="#ff5a5f" points="105,8 82,54 128,54" stroke="#ffffff" strokeLinejoin="round" strokeWidth="4" />
      <polygon fill="#ffe07e" points="98,18 90,54 110,54" />
      <circle cx="105" cy="8" fill="#ffe07e" r="8" stroke="#ffffff" strokeWidth="3" />
      {/* Tentacle wave */}
      <path d="M54 125 C30 115 25 80 40 75 C48 72 52 90 62 105" fill="#7a68ff" stroke="#ffffff" strokeLinecap="round" strokeWidth="5" />
      <circle cx="34" cy="82" fill="#ffd84d" r="3" />
      <circle cx="42" cy="98" fill="#ffd84d" r="3" />
    </svg>
  );
}

/* =========================================================
   TOP STATUS BAR & MUSIC PLAYER
   ========================================================= */
interface TopBarProps {
  unlockedStars: number;
  sfxEnabled: boolean;
  onToggleSfx: () => void;
  musicPlaying: boolean;
  onToggleMusic: () => void;
  onRsvp: () => void;
}

function TopBar({ unlockedStars, sfxEnabled, onToggleSfx, musicPlaying, onToggleMusic, onRsvp }: TopBarProps) {
  return (
    <header className="relative z-30 pt-3 px-4 pb-2 flex items-center justify-between">
      <div className="flex items-center gap-1.5 bg-white/95 px-3 py-1.5 rounded-full border-2 border-white shadow-[0_3px_0_#14305A]">
        <span className="text-[11px] font-bold text-[#14305A] uppercase tracking-wider mr-0.5">Stars</span>
        {[1, 2, 3].map((n) => (
          <div key={n} className="w-5 h-5 flex items-center justify-center">
            {n <= unlockedStars ? (
              <span className="material-symbols-outlined text-[19px] text-[#ffb800] animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
            ) : (
              <span className="material-symbols-outlined text-[19px] text-gray-300">
                star
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          title={musicPlaying ? 'Mute Birthday Music' : 'Play Birthday Music'}
          onClick={onToggleMusic}
          className={`w-9 h-9 rounded-full bg-white flex items-center justify-center border-2 border-white shadow-[0_3px_0_#14305A] active:translate-y-0.5 text-primary transition-all ${
            musicPlaying ? 'text-[#ff5a5f] ring-2 ring-[#ffd84d]' : 'text-gray-600'
          }`}
        >
          <span className="material-symbols-outlined text-[19px]">
            {musicPlaying ? 'music_note' : 'music_off'}
          </span>
        </button>

        <button
          type="button"
          title="Toggle Sound Effects"
          onClick={onToggleSfx}
          className="w-9 h-9 rounded-full bg-white flex items-center justify-center border-2 border-white shadow-[0_3px_0_#14305A] active:translate-y-0.5 text-[#006876]"
        >
          <span className="material-symbols-outlined text-[19px]">
            {sfxEnabled ? 'volume_up' : 'volume_off'}
          </span>
        </button>

        <button
          type="button"
          onClick={onRsvp}
          className="px-3 py-1.5 rounded-full bg-[#ffd84d] text-[#14305A] font-bold text-xs flex items-center gap-1 border-2 border-white shadow-[0_3px_0_#14305A] active:translate-y-0.5"
        >
          <span className="material-symbols-outlined text-[16px]">mail</span>
          <span>RSVP</span>
        </button>
      </div>
    </header>
  );
}

/* =========================================================
   SCENE 1: START HERO
   ========================================================= */
function StartScene({
  title,
  tagline,
  onPlay,
  coverPhoto,
}: {
  title: string;
  tagline: string;
  onPlay: () => void;
  coverPhoto?: string;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between px-5 pt-2 pb-6 overflow-y-auto">
      <div className="flex flex-col items-center text-center">
        <div className="bg-[#ffd84d] text-[#14305A] px-4 py-1 rounded-full font-bold text-xs border-2 border-white shadow-[0_3px_0_#14305A] mb-1.5 flex items-center gap-1.5 animate-pulse">
          <span className="material-symbols-outlined text-[16px]">celebration</span>
          <span>YOU ARE INVITED!</span>
        </div>

        <div className="relative bg-white px-5 py-3 rounded-2xl border-4 border-white shadow-[0_6px_0_#14305A] max-w-[320px]">
          <h1 className="text-2xl sm:text-3xl font-black text-[#006876] uppercase tracking-tight leading-tight">
            {title || "Leo's 5th Birthday Quest!"}
          </h1>
          <p className="text-xs text-gray-600 font-semibold mt-1">
            {tagline || 'Undersea 3D Adventure & Party Invitation'}
          </p>
          <span className="material-symbols-outlined absolute -top-3 -right-3 text-[#ffb800] text-[26px] animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_awesome
          </span>
        </div>
      </div>

      <div className="relative my-auto py-2 flex flex-col items-center">
        {coverPhoto && (
          <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden mb-2">
            <img src={coverPhoto} alt="Celebrant" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative bg-white/95 px-4 py-1.5 rounded-2xl border-2 border-white shadow-[0_4px_0_#14305A] mb-2 text-center max-w-[260px]">
          <span className="text-xs font-bold text-[#14305A] block">
            Hi adventurer! Help me unlock the secret party chest! 🐙
          </span>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r-2 border-b-2 border-white" />
        </div>
        <div className="w-40 h-40 relative drop-shadow-[0_8px_0_rgba(20,48,90,0.35)] animate-bounce">
          <MascotOllie />
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onPlay}
          className="w-full max-w-[280px] h-14 rounded-full bg-[#ffd84d] hover:bg-[#ffe07e] text-[#14305A] font-black text-lg uppercase tracking-wide border-4 border-white shadow-[0_6px_0_#14305A] active:translate-y-1 active:shadow-[0_1px_0_#14305A] transition-transform flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[28px]">play_arrow</span>
          <span>PLAY QUEST &amp; UNLOCK!</span>
        </button>
        <p className="text-[11px] text-white/90 text-center font-bold drop-shadow-sm">
          Play 3 mini-games to reveal secret party clues &amp; RSVP!
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   SCENE 2: REEF PATH MAP
   ========================================================= */
function MapScene({
  unlockedStars,
  onStartLevel,
  onChest,
}: {
  unlockedStars: number;
  onStartLevel: (lvl: number) => void;
  onChest: () => void;
}) {
  const lvl2Open = unlockedStars >= 1;
  const lvl3Open = unlockedStars >= 2;
  const chestOpen = unlockedStars >= 3;

  return (
    <div className="absolute inset-0 flex flex-col px-4 pt-1 pb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="bg-white px-3 py-1 rounded-full border-2 border-white shadow-[0_3px_0_#14305A] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[17px] text-[#006876]">map</span>
          <span className="text-xs font-bold text-[#14305A]">Secret Reef Path</span>
        </div>
        <span className="text-xs bg-white/90 text-[#14305A] px-2.5 py-1 rounded-full font-black border border-white">
          {unlockedStars} of 3 Stars Unlocked
        </span>
      </div>

      <div className="relative flex-1 min-h-0 bg-white/20 backdrop-blur-sm rounded-3xl border-4 border-white shadow-[0_6px_0_#14305A] overflow-hidden p-4 flex flex-col justify-between">
        {/* Winding path SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" fill="none" viewBox="0 0 350 480" preserveAspectRatio="none">
          <path d="M70,390 C120,380 280,380 270,280 C260,190 80,240 85,150 C90,80 220,100 260,40" stroke="#ffffff" strokeDasharray="10 10" strokeLinecap="round" strokeWidth="6" vectorEffect="non-scaling-stroke" />
          <path d="M70,390 C120,380 280,380 270,280 C260,190 80,240 85,150 C90,80 220,100 260,40" stroke="#006876" strokeDasharray="10 10" strokeLinecap="round" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* Level 3 */}
        <div className="relative flex items-center justify-end pr-2 pt-1">
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => onStartLevel(3)}
              className={`relative w-18 h-18 rounded-full bg-[#ff7b7b] text-white border-4 border-white shadow-[0_5px_0_#14305A] flex flex-col items-center justify-center active:translate-y-1 transition-all ${
                lvl3Open ? 'cursor-pointer hover:scale-105' : 'opacity-60'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">psychology</span>
              <span className="text-[11px] font-black">LVL 3</span>
              <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow ${lvl3Open ? 'bg-[#ffd84d] text-[#14305A]' : 'bg-gray-400 text-white'}`}>
                <span className="material-symbols-outlined text-[13px]">{lvl3Open ? 'play_arrow' : 'lock'}</span>
              </div>
            </button>
            <span className="bg-white/95 px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold border border-white text-[#14305A] shadow-sm">
              Memory Match
            </span>
          </div>
        </div>

        {/* Level 2 */}
        <div className="relative flex items-center justify-start pl-2">
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => onStartLevel(2)}
              className={`relative w-18 h-18 rounded-full bg-[#ffd84d] text-[#14305A] border-4 border-white shadow-[0_5px_0_#14305A] flex flex-col items-center justify-center active:translate-y-1 transition-all ${
                lvl2Open ? 'cursor-pointer hover:scale-105' : 'opacity-60'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">set_meal</span>
              <span className="text-[11px] font-black">LVL 2</span>
              <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow ${lvl2Open ? 'bg-[#3ec9e0] text-[#14305A]' : 'bg-gray-400 text-white'}`}>
                <span className="material-symbols-outlined text-[13px]">{lvl2Open ? 'play_arrow' : 'lock'}</span>
              </div>
            </button>
            <span className="bg-white/95 px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold border border-white text-[#14305A] shadow-sm">
              Feed Friends
            </span>
          </div>
        </div>

        {/* Level 1 & Chest */}
        <div className="relative flex items-center justify-between px-2 pb-1">
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => onStartLevel(1)}
              className="relative w-18 h-18 rounded-full bg-[#3ec9e0] text-[#14305A] border-4 border-white shadow-[0_5px_0_#14305A] flex flex-col items-center justify-center active:translate-y-1 transition-all animate-bounce cursor-pointer hover:scale-105"
            >
              <span className="material-symbols-outlined text-[24px]">bubble_chart</span>
              <span className="text-[11px] font-black">LVL 1</span>
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#ffd84d] border-2 border-white flex items-center justify-center shadow">
                <span className="material-symbols-outlined text-[13px] text-[#14305A]">play_arrow</span>
              </div>
            </button>
            <span className="bg-white/95 px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold border border-white text-[#14305A] shadow-sm">
              Bubble Pop
            </span>
          </div>

          <div className="flex flex-col items-center cursor-pointer" onClick={onChest} role="button" tabIndex={0}>
            <div className={`relative w-20 h-20 rounded-2xl bg-[#ff5a5f] text-white border-4 border-white shadow-[0_5px_0_#14305A] flex flex-col items-center justify-center ${chestOpen ? 'animate-bounce' : ''}`}>
              {chestOpen ? (
                <>
                  <span className="text-3xl">🎁</span>
                  <span className="text-[10px] font-black text-white">OPEN!</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[32px] text-white">lock</span>
                  <span className="text-[10px] font-black text-white">CHEST</span>
                </>
              )}
              <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-[#ffd84d] text-[#14305A] flex items-center justify-center font-black text-xs border-2 border-white shadow">
                🎁
              </div>
            </div>
            <span className="bg-white/95 px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold border border-white text-[#14305A] shadow-sm">
              Party Invitation
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   GAME 1: BUBBLE POP
   ========================================================= */
interface BubbleData {
  id: number;
  emoji: string;
  size: number;
  left: number;
  fieldHeight: number;
}

function BubbleGame({ playSfx, onWin }: { playSfx: (s: 'pop' | 'star') => void; onWin: (lvl: number) => void }) {
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const [count, setCount] = useState(0);
  const doneRef = useRef(false);
  const seqRef = useRef(0);

  const spawnBubble = useCallback((): BubbleData => {
    return {
      id: ++seqRef.current,
      emoji: BUBBLE_EMOJIS[Math.floor(Math.random() * BUBBLE_EMOJIS.length)],
      size: 60 + Math.floor(Math.random() * 20),
      left: 10 + Math.floor(Math.random() * 240),
      fieldHeight: 340,
    };
  }, []);

  useEffect(() => {
    setBubbles(Array.from({ length: 4 }, () => spawnBubble()));
    const timer = setInterval(() => {
      if (doneRef.current) return;
      setBubbles((prev) => (prev.length < 6 ? [...prev, spawnBubble()] : prev));
    }, 900);
    return () => clearInterval(timer);
  }, [spawnBubble]);

  const popBubble = (id: number) => {
    playSfx('pop');
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    setCount((c) => {
      const next = c + 1;
      if (next >= TOTAL_BUBBLES && !doneRef.current) {
        doneRef.current = true;
        setTimeout(() => onWin(1), 350);
      }
      return next;
    });
  };

  return (
    <div className="absolute inset-0 flex flex-col px-4 pt-1 pb-4">
      <div className="flex items-center justify-between bg-white/95 px-4 py-2 rounded-2xl border-2 border-white shadow-[0_4px_0_#14305A] mb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[24px] text-[#006876]">bubble_chart</span>
          <div>
            <span className="text-sm font-black text-[#006876] block leading-none">POP {TOTAL_BUBBLES} BUBBLES!</span>
            <span className="text-[11px] text-gray-500 font-semibold block leading-none mt-1">Tap floating sea creatures</span>
          </div>
        </div>
        <div className="px-3 py-1 rounded-xl bg-[#3ec9e0] text-[#14305A] font-black text-sm border-2 border-white shadow">
          {Math.min(count, TOTAL_BUBBLES)} / {TOTAL_BUBBLES}
        </div>
      </div>

      <div className="relative flex-1 min-h-0 w-full rounded-3xl bg-white/15 border-4 border-white shadow-[0_6px_0_#14305A] overflow-hidden">
        {bubbles.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => popBubble(b.id)}
            className="absolute rounded-full flex items-center justify-center cursor-pointer border-2 border-white/90 shadow-[0_4px_12px_rgba(62,201,224,0.5)] active:scale-125 transition-transform"
            style={{
              width: b.size,
              height: b.size,
              left: b.left,
              top: 30 + (b.id % 5) * 55,
              background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9), rgba(62,201,224,0.7) 60%, rgba(0,104,118,0.8) 100%)',
            }}
          >
            <span className="text-2xl select-none pointer-events-none">{b.emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   GAME 2: FEED FRIENDS
   ========================================================= */
function FeedGame({ playSfx, onWin }: { playSfx: (s: 'feed' | 'click') => void; onWin: (lvl: number) => void }) {
  const [fed, setFed] = useState(0);
  const [friendIdx, setFriendIdx] = useState(0);
  const [tray, setTray] = useState(() => shuffle(SEA_FRIENDS));
  const [celebrating, setCelebrating] = useState(false);

  const friend = SEA_FRIENDS[friendIdx];

  const feed = (emoji: string) => {
    if (celebrating) return;
    if (emoji === friend.emoji) {
      playSfx('feed');
      const nextFed = fed + 1;
      setFed(nextFed);
      setCelebrating(true);
      setTimeout(() => {
        setCelebrating(false);
        if (nextFed >= TOTAL_FRIENDS) {
          onWin(2);
        } else {
          setFriendIdx((i) => (i + 1) % SEA_FRIENDS.length);
          setTray(shuffle(SEA_FRIENDS));
        }
      }, 600);
    } else {
      playSfx('click');
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col px-4 pt-1 pb-4">
      <div className="flex items-center justify-between bg-white/95 px-4 py-2 rounded-2xl border-2 border-white shadow-[0_4px_0_#14305A] mb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[24px] text-[#ffd84d]">restaurant</span>
          <div>
            <span className="text-sm font-black text-[#14305A] block leading-none">FEED {TOTAL_FRIENDS} FRIENDS!</span>
            <span className="text-[11px] text-gray-500 font-semibold block leading-none mt-1">Match their favorite treats</span>
          </div>
        </div>
        <div className="px-3 py-1 rounded-xl bg-[#ffd84d] text-[#14305A] font-black text-sm border-2 border-white shadow">
          {fed} / {TOTAL_FRIENDS}
        </div>
      </div>

      <div className="relative flex-1 min-h-0 flex flex-col items-center justify-between bg-white/20 rounded-3xl border-4 border-white shadow-[0_6px_0_#14305A] p-4 overflow-hidden">
        <div className="flex flex-col items-center">
          <div className="bg-white px-4 py-2 rounded-2xl border-2 border-white shadow-[0_4px_0_#14305A] flex items-center gap-2 animate-bounce">
            <span className="text-xs font-bold text-[#14305A]">I'm craving: </span>
            <span className="text-3xl">{friend.emoji}</span>
          </div>
          <span className="mt-2 text-base font-black text-white drop-shadow">{friend.name}</span>
        </div>

        <div className={`text-7xl transition-transform duration-500 ${celebrating ? 'scale-125 rotate-12' : ''}`}>
          {friend.type === 'seahorse' ? '🦄' : friend.type === 'puffer' ? '🐡' : friend.type === 'turtle' ? '🐢' : '🦀'}
        </div>

        <div className="w-full bg-white/95 p-3 rounded-2xl border-2 border-white shadow-[0_4px_0_#14305A]">
          <span className="text-[11px] font-bold text-gray-500 block text-center mb-1.5 uppercase tracking-wider">
            Tap the matching snack:
          </span>
          <div className="grid grid-cols-5 gap-1.5">
            {tray.map((item) => (
              <button
                key={item.emoji}
                type="button"
                onClick={() => feed(item.emoji)}
                className="h-12 rounded-xl bg-sky-50 border-2 border-white shadow flex items-center justify-center text-2xl active:scale-95 transition-all hover:bg-sky-100 cursor-pointer"
              >
                {item.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   GAME 3: MEMORY MATCH
   ========================================================= */
function MemoryGame({ playSfx, onWin }: { playSfx: (s: 'flip' | 'feed') => void; onWin: (lvl: number) => void }) {
  const [deck] = useState(() =>
    shuffle([...CARD_ICONS, ...CARD_ICONS]).map((icon, id) => ({ id, icon }))
  );
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const blocked = useRef(false);

  const handleCard = (id: number) => {
    if (blocked.current || matched.includes(id) || flipped.includes(id)) return;
    playSfx('flip');
    const next = [...flipped, id];
    setFlipped(next);

    if (next.length === 2) {
      blocked.current = true;
      const [a, b] = next.map((i) => deck[i]);
      if (a.icon === b.icon) {
        setTimeout(() => {
          playSfx('feed');
          setMatched((m) => {
            const updated = [...m, a.id, b.id];
            if (updated.length / 2 >= TOTAL_PAIRS) {
              setTimeout(() => onWin(3), 400);
            }
            return updated;
          });
          setFlipped([]);
          blocked.current = false;
        }, 300);
      } else {
        setTimeout(() => {
          setFlipped([]);
          blocked.current = false;
        }, 600);
      }
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col px-4 pt-1 pb-4">
      <div className="flex items-center justify-between bg-white/95 px-4 py-2 rounded-2xl border-2 border-white shadow-[0_4px_0_#14305A] mb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[24px] text-[#ff7b7b]">extension</span>
          <div>
            <span className="text-sm font-black text-[#ff7b7b] block leading-none">FIND 6 PAIRS!</span>
            <span className="text-[11px] text-gray-500 font-semibold block leading-none mt-1">Tap shells to find matches</span>
          </div>
        </div>
        <div className="px-3 py-1 rounded-xl bg-[#ff7b7b] text-white font-black text-sm border-2 border-white shadow">
          {matched.length / 2} / {TOTAL_PAIRS}
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-3 grid-rows-4 gap-2 p-3 bg-white/20 rounded-3xl border-4 border-white shadow-[0_6px_0_#14305A]">
        {deck.map((card) => {
          const isMatched = matched.includes(card.id);
          const faceUp = isMatched || flipped.includes(card.id);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleCard(card.id)}
              className="relative rounded-2xl cursor-pointer min-h-0 w-full h-full p-0 border-none outline-none"
            >
              {faceUp ? (
                <div
                  className={`w-full h-full rounded-2xl border-2 shadow flex items-center justify-center text-3xl ${
                    isMatched ? 'bg-[#ffd84d]/90 border-white' : 'bg-white border-white'
                  }`}
                >
                  {card.icon}
                </div>
              ) : (
                <div className="w-full h-full rounded-2xl bg-[#006876] border-2 border-white shadow flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[28px] text-[#3ec9e0]">water_drop</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   SCENE 6: STAR REWARD CLUE
   ========================================================= */
function RewardScene({
  level,
  eventDate,
  eventTime,
  venue,
  onContinue,
}: {
  level: number;
  eventDate: string;
  eventTime: string;
  venue: string;
  onContinue: () => void;
}) {
  const clues = [
    { tag: 'PARTY CLUE #1', icon: '📅', title: eventDate || 'Saturday Celebration', details: 'Mark your calendars for an unforgettable birthday dive!' },
    { tag: 'PARTY CLUE #2', icon: '⏰', title: eventTime || '3:00 PM – 6:00 PM', details: 'Games start right at kickoff, followed by cake cutting and treasure hunt!' },
    { tag: 'PARTY CLUE #3', icon: '📍', title: venue || 'Coral Cove Pavilion', details: 'Venue is ready with party snacks, balloon drops, and music vibes!' },
  ];

  const clue = clues[Math.min(Math.max(1, level) - 1, clues.length - 1)];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between gap-2 px-5 pt-3 pb-6 overflow-y-auto">
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-[#ffd84d] text-[#14305A] border-4 border-white shadow-[0_5px_0_#14305A] flex items-center justify-center animate-bounce mb-1.5">
          <span className="material-symbols-outlined text-[34px] text-[#14305A]" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight drop-shadow">
          STAR REWARD UNLOCKED!
        </h2>
        <p className="text-xs text-white/90 font-semibold">You completed Level {level}!</p>
      </div>

      <div className="relative w-full max-w-[300px] bg-white p-5 rounded-3xl border-4 border-white shadow-[0_8px_0_#14305A] text-center my-auto">
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#ff5a5f] text-white px-3.5 py-0.5 rounded-full text-xs font-bold border-2 border-white shadow whitespace-nowrap">
          {clue.tag}
        </div>
        <div className="my-2">
          <div className="text-4xl mb-1">{clue.icon}</div>
          <h3 className="text-lg font-black text-[#006876]">{clue.title}</h3>
          <p className="text-xs text-gray-600 font-medium mt-1 leading-snug">{clue.details}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="w-full max-w-[260px] h-13 rounded-full bg-[#ffd84d] text-[#14305A] font-black text-base uppercase border-4 border-white shadow-[0_5px_0_#14305A] active:translate-y-1 flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>CONTINUE QUEST</span>
        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
      </button>
    </div>
  );
}

/* =========================================================
   SCENE 7: TREASURE CHEST / INVITATION UNLOCKED
   ========================================================= */
function TreasureScene({
  title,
  date,
  time,
  venue,
  address,
  note,
  coverPhoto,
  dressCode,
  mapUrl,
  onRsvp,
  onReset,
}: {
  title: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  note: string;
  coverPhoto?: string;
  dressCode?: string | { title?: string; description: string; colors?: string[] };
  mapUrl?: string;
  onRsvp: () => void;
  onReset: () => void;
}) {
  const dressCodeText = typeof dressCode === 'string' ? dressCode : dressCode?.description;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between px-4 pt-2 pb-6 overflow-y-auto">
      <div className="text-center">
        <div className="inline-flex items-center gap-1 bg-[#ffd84d] text-[#14305A] px-3.5 py-1 rounded-full text-xs font-black border-2 border-white shadow-[0_3px_0_#14305A] mb-1 animate-pulse">
          <span className="material-symbols-outlined text-[16px]">celebration</span>
          <span>QUEST COMPLETE! INVITATION UNLOCKED!</span>
        </div>
      </div>

      <div className="relative w-full max-w-md bg-white p-5 rounded-3xl border-4 border-white shadow-[0_10px_0_#14305A] my-auto">
        <div className="flex items-center justify-between border-b-2 border-gray-100 pb-3">
          <div>
            <span className="text-[11px] font-bold text-[#ff5a5f] uppercase tracking-wider block">Official VIP Pass</span>
            <h2 className="text-xl font-black text-[#006876] leading-tight">{title || "Leo's 5th Birthday!"}</h2>
          </div>
          {coverPhoto ? (
            <img src={coverPhoto} alt="Celebrant" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#ffd84d] flex items-center justify-center text-2xl border-2 border-white shadow">
              🎂
            </div>
          )}
        </div>

        <div className="space-y-2.5 pt-3">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#006876] text-[20px] mt-0.5">event</span>
            <div>
              <span className="text-xs font-bold text-gray-800 block leading-tight">{date || 'Saturday, Sept 20, 2025'}</span>
              <span className="text-[11px] text-gray-500 block">Undersea Birthday Bash</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#ff5a5f] text-[20px] mt-0.5">schedule</span>
            <div>
              <span className="text-xs font-bold text-gray-800 block leading-tight">{time || '3:00 PM – 6:00 PM'}</span>
              <span className="text-[11px] text-gray-500 block">Games, music &amp; cake cutting</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#ffd84d] text-[20px] mt-0.5">location_on</span>
            <div className="flex-1">
              <span className="text-xs font-bold text-gray-800 block leading-tight">{venue || 'Coral Cove Lagoon'}</span>
              <span className="text-[11px] text-gray-500 block">{address || 'Sunny Bay Park'}</span>
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006876] hover:underline mt-0.5"
                >
                  <span>Open in Google Maps ↗</span>
                </a>
              )}
            </div>
          </div>
          {dressCodeText && (
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#c97b84] text-[20px] mt-0.5">checkroom</span>
              <div>
                <span className="text-xs font-bold text-gray-800 block leading-tight">Dress Code</span>
                <span className="text-[11px] text-gray-600 block">{dressCodeText}</span>
              </div>
            </div>
          )}
          {note && (
            <div className="bg-sky-50 p-2.5 rounded-2xl border border-sky-100 flex items-start gap-2">
              <span className="text-base">💌</span>
              <p className="text-[11px] text-gray-700 font-medium leading-tight">{note}</p>
            </div>
          )}
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-2 pt-2">
        <button
          type="button"
          onClick={onRsvp}
          className="w-full max-w-md h-13 rounded-full bg-[#ff5a5f] text-white font-black text-base uppercase border-4 border-white shadow-[0_5px_0_#14305A] active:translate-y-1 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
          <span>RSVP TO CELEBRATE!</span>
        </button>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-bold text-white/90 underline decoration-2 underline-offset-4 cursor-pointer"
        >
          ↺ Play Mini-Games Again
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   SCENE 8: PARENT RSVP SHEET WITH MOBILE NUMBER
   ========================================================= */
interface RsvpModalProps {
  playSfx: (s: 'star' | 'click') => void;
  onClose: () => void;
  onDone: () => void;
  onSubmitRsvp?: (data: Record<string, unknown>) => void;
}

function RsvpModal({ playSfx, onClose, onDone, onSubmitRsvp }: RsvpModalProps) {
  const [parentName, setParentName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [kidsCount, setKidsCount] = useState(1);
  const [attending, setAttending] = useState('yes');
  const [dietary, setDietary] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSfx('star');

    const payload = {
      guestName: parentName,
      mobileNumber: mobileNumber,
      phone: mobileNumber,
      plusOnes: kidsCount,
      attendance: attending === 'yes' ? 'accept' : 'decline',
      dietaryNotes: dietary,
      submittedAt: new Date().toISOString(),
    };

    if (onSubmitRsvp) {
      onSubmitRsvp(payload);
    }
    setSuccess(true);
  };

  return (
    <div className="absolute inset-0 flex flex-col justify-end bg-black/60 backdrop-blur-sm p-3 z-50">
      <div className="relative w-full max-w-md mx-auto bg-white rounded-3xl p-5 border-4 border-white shadow-[0_12px_0_#14305A] flex flex-col max-h-[95%] overflow-y-auto">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-gray-200"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-3 pr-8">
          <span className="w-10 h-10 shrink-0 rounded-full bg-[#3ec9e0] flex items-center justify-center text-[#14305A] font-bold">
            <span className="material-symbols-outlined text-[22px]">family_restroom</span>
          </span>
          <div>
            <h3 className="text-lg font-black text-[#006876] leading-tight">Guest RSVP</h3>
            <span className="text-[11px] text-gray-500 font-medium">Quick RSVP with your phone number</span>
          </div>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="text-[11px] font-bold text-gray-700 block mb-1">
              Parent / Guest Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Maya & Jackson"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-gray-50 border-2 border-gray-200 text-xs font-semibold text-gray-800 focus:border-[#006876] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-700 block mb-1">
              Mobile Number (WhatsApp / SMS) <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. +1 555-0192 or 9876543210"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-gray-50 border-2 border-gray-200 text-xs font-semibold text-gray-800 focus:border-[#006876] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-700 block mb-1">Number of Adventurers (Kids / Guests):</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  playSfx('click');
                  setKidsCount((k) => Math.max(1, k - 1));
                }}
                className="w-9 h-9 rounded-full bg-gray-100 text-gray-800 font-black text-base border-2 border-white shadow flex items-center justify-center cursor-pointer"
              >
                –
              </button>
              <span className="text-base font-black text-[#006876] w-6 text-center">{kidsCount}</span>
              <button
                type="button"
                onClick={() => {
                  playSfx('click');
                  setKidsCount((k) => Math.min(8, k + 1));
                }}
                className="w-9 h-9 rounded-full bg-gray-100 text-gray-800 font-black text-base border-2 border-white shadow flex items-center justify-center cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-700 block mb-1">Will you attend the celebration?</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="attending"
                  value="yes"
                  checked={attending === 'yes'}
                  onChange={() => setAttending('yes')}
                  className="peer sr-only"
                />
                <div className="p-2 rounded-xl bg-gray-50 border-2 border-gray-200 peer-checked:border-[#006876] peer-checked:bg-[#3ec9e0]/20 text-center text-xs font-bold text-gray-800">
                  🎉 Yes! Diving in!
                </div>
              </label>
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="attending"
                  value="no"
                  checked={attending === 'no'}
                  onChange={() => setAttending('no')}
                  className="peer sr-only"
                />
                <div className="p-2 rounded-xl bg-gray-50 border-2 border-gray-200 peer-checked:border-[#ff5a5f] peer-checked:bg-[#ff5a5f]/20 text-center text-xs font-bold text-gray-800">
                  😢 Cheering from shore
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-700 block mb-1">Dietary notes or special wishes:</label>
            <input
              type="text"
              placeholder="e.g. Peanut allergy, vegan cake"
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-gray-50 border-2 border-gray-200 text-xs text-gray-800 focus:border-[#006876] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-full bg-[#006876] text-white font-black text-sm uppercase border-2 border-white shadow-[0_4px_0_#14305A] active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>CONFIRM RSVP</span>
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
          </button>
        </form>

        {success && (
          <div className="absolute inset-0 bg-white p-6 rounded-3xl flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#ffd84d] flex items-center justify-center text-3xl mb-2 border-4 border-white shadow-[0_4px_0_#14305A] animate-bounce">
              🐚
            </div>
            <h3 className="text-xl font-black text-[#006876]">RSVP Confirmed!</h3>
            <p className="text-xs text-gray-600 font-medium mt-1 mb-4 leading-relaxed">
              Thank you! Your phone number <strong>{mobileNumber}</strong> is recorded. We can't wait to celebrate!
            </p>
            <button
              type="button"
              onClick={onDone}
              className="h-11 px-6 rounded-full bg-[#ffd84d] text-[#14305A] font-black text-xs uppercase border-2 border-white shadow cursor-pointer"
            >
              Done &amp; Back to Map
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MAIN NOVA BIRTHDAY WORLD TEMPLATE COMPONENT
   ========================================================= */
export const NovaBirthdayWorldTemplate: React.FC<TemplateProps> = ({
  data,
  isLivePreview: _isLivePreview = false,
  onRsvpSubmit,
}) => {
  const [screen, setScreen] = useState<'start' | 'map' | 'lvl1' | 'lvl2' | 'lvl3' | 'reward' | 'chest' | 'rsvp'>('start');
  const [unlockedStars, setUnlockedStars] = useState(0);
  const [rewardLevel, setRewardLevel] = useState(1);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sfx = useSfx();

  const isMusicConfigured = data.musicSettings ? data.musicSettings.enabled : Boolean(data.musicUrl ?? true);
  const musicTrackUrl = isMusicConfigured
    ? (data.musicSettings?.url ?? ((data as unknown as Record<string, unknown>).musicUrl as string) ?? '/music/happy-birthday.mp3')
    : '';

  // Initialize and handle background music
  useEffect(() => {
    if (!musicTrackUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setMusicPlaying(false);
      return;
    }

    const audio = new Audio(musicTrackUrl);
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [musicTrackUrl]);

  const toggleMusic = () => {
    if (!audioRef.current || !musicTrackUrl) return;
    if (musicPlaying) {
      audioRef.current.pause();
      setMusicPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setMusicPlaying(true);
      }).catch(() => {
        // autoplay restriction
      });
    }
  };

  const awardStar = (level: number) => {
    setUnlockedStars((s) => Math.max(s, level));
    setRewardLevel(level);
    sfx.playSfx('star');
    setScreen('reward');
  };

  const handleStartLevel = (lvl: number) => {
    sfx.playSfx('click');
    if (lvl === 1) setScreen('lvl1');
    else if (lvl === 2) setScreen('lvl2');
    else if (lvl === 3) setScreen('lvl3');
  };

  const handleChest = () => {
    sfx.playSfx('click');
    if (unlockedStars >= 3) {
      setScreen('chest');
    } else {
      alert(`Collect all 3 stars to open the secret party chest! (${unlockedStars}/3 stars collected)`);
    }
  };

  const coverPhoto = data.photos?.[0]?.url;

  return (
    <div className="w-full h-full min-h-[100dvh] flex flex-col items-center justify-center bg-[#07192f] p-0 sm:p-4 select-none">
      {/* Smartphone-scaled frame */}
      <div className="relative w-full h-[100dvh] sm:w-[390px] sm:h-[844px] bg-[#006876] sm:rounded-[44px] overflow-hidden shadow-2xl border-0 sm:border-4 border-white flex flex-col">
        <UnderwaterBackground />

        <TopBar
          unlockedStars={unlockedStars}
          sfxEnabled={sfx.sfxEnabled}
          onToggleSfx={sfx.toggleSfx}
          musicPlaying={musicPlaying}
          onToggleMusic={toggleMusic}
          onRsvp={() => setScreen('rsvp')}
        />

        <div className="relative z-20 flex-1 min-h-0 w-full overflow-hidden">
          {screen === 'start' && (
            <StartScene
              title={data.title}
              tagline={data.tagline}
              coverPhoto={coverPhoto}
              onPlay={() => {
                sfx.playSfx('click');
                // start music if allowed
                if (!musicPlaying && audioRef.current) {
                  audioRef.current.play().then(() => setMusicPlaying(true)).catch(() => {});
                }
                setScreen('map');
              }}
            />
          )}

          {screen === 'map' && (
            <MapScene
              unlockedStars={unlockedStars}
              onStartLevel={handleStartLevel}
              onChest={handleChest}
            />
          )}

          {screen === 'lvl1' && (
            <BubbleGame
              playSfx={sfx.playSfx}
              onWin={awardStar}
            />
          )}

          {screen === 'lvl2' && (
            <FeedGame
              playSfx={sfx.playSfx}
              onWin={awardStar}
            />
          )}

          {screen === 'lvl3' && (
            <MemoryGame
              playSfx={sfx.playSfx}
              onWin={awardStar}
            />
          )}

          {screen === 'reward' && (
            <RewardScene
              level={rewardLevel}
              eventDate={data.date}
              eventTime={data.time}
              venue={data.venue}
              onContinue={() => {
                sfx.playSfx('click');
                setScreen(unlockedStars >= 3 ? 'chest' : 'map');
              }}
            />
          )}

          {screen === 'chest' && (
            <TreasureScene
              title={data.title}
              date={data.date}
              time={data.time}
              venue={data.venue}
              address={data.address}
              note={data.note}
              coverPhoto={coverPhoto}
              dressCode={data.dressCode}
              mapUrl={data.locationMap?.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address || data.venue)}`}
              onRsvp={() => {
                sfx.playSfx('click');
                setScreen('rsvp');
              }}
              onReset={() => {
                setUnlockedStars(0);
                setScreen('start');
              }}
            />
          )}

          {screen === 'rsvp' && (
            <RsvpModal
              playSfx={sfx.playSfx}
              onClose={() => setScreen(unlockedStars >= 3 ? 'chest' : 'map')}
              onDone={() => {
                sfx.playSfx('click');
                setScreen('map');
              }}
              onSubmitRsvp={onRsvpSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
};
