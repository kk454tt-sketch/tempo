import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TemplateProps } from '../types';
import {
  DEFAULT_PORTFOLIO_CARD_1,
  DEFAULT_PORTFOLIO_CARD_2,
  DEFAULT_CHARACTER_1_IMG,
  DEFAULT_CHARACTER_2_IMG,
  DEFAULT_PORTFOLIO_DATA,
} from './portfolioAssets';
import { PortfolioCardData, PortfolioHireConfig } from '@/types/event';

export interface DeveloperPortfolioTemplateProps extends TemplateProps {
  viewportMode?: 'desktop' | 'tablet' | 'mobile';
}

// Word font scaling: wf = n > 6 ? +(6/n).toFixed(3) : 1
const getWordScale = (w: string): number => {
  const n = [...String(w)].length;
  return n > 6 ? +(6 / n).toFixed(3) : 1;
};

const dg = (s?: string) => String(s || '').replace(/\D/g, '');
const handleSocial = (v: string | undefined, base: string, re: RegExp) => {
  const trimmed = String(v || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (re.test(trimmed)) return 'https://' + trimmed.replace(/^\/+/, '');
  return base + trimmed.replace(/^@/, '').replace(/^\/+/, '');
};

const getHireTarget = (H?: PortfolioHireConfig) => {
  if (!H) {
    return { href: 'https://wa.me/919876543210?text=Hi!%20I%20saw%20your%20portfolio', ext: true };
  }
  let r: { href: string; ext?: boolean; fallback?: boolean } | null = null;
  let u: string;
  switch (H.mode) {
    case 'whatsapp':
      if (dg(H.whatsapp)) {
        r = {
          href:
            'https://wa.me/' +
            dg(H.whatsapp) +
            (H.waText ? '?text=' + encodeURIComponent(H.waText) : ''),
          ext: true,
        };
      }
      break;
    case 'phone':
      if (dg(H.phone)) {
        r = {
          href: 'tel:' + (/^\s*\+/.test(H.phone || '') ? '+' : '') + dg(H.phone),
          ext: false,
        };
      }
      break;
    case 'email':
      if (H.email && H.email.trim()) {
        r = {
          href:
            'mailto:' +
            H.email.trim() +
            (H.subject ? '?subject=' + encodeURIComponent(H.subject) : ''),
          ext: false,
        };
      }
      break;
    case 'telegram':
      u = handleSocial(H.telegram, 'https://t.me/', /^(t|telegram)\.me\//i);
      if (u) r = { href: u, ext: true };
      break;
    case 'instagram':
      u = handleSocial(H.instagram, 'https://instagram.com/', /^(www\.)?instagram\.com\//i);
      if (u) r = { href: u, ext: true };
      break;
    case 'linkedin':
      u = handleSocial(H.linkedin, 'https://www.linkedin.com/in/', /^(www\.)?linkedin\.com\//i);
      if (u) r = { href: u, ext: true };
      break;
    case 'custom':
      u = String(H.custom || '').trim();
      if (u && u !== '#') {
        r = { href: u, ext: /^https?:/i.test(u) };
      }
      break;
  }
  return r || { href: H.fallback || 'mailto:hello@yourname.dev', ext: false, fallback: true };
};

export const DeveloperPortfolioTemplate: React.FC<DeveloperPortfolioTemplateProps> = ({
  data,
  isLivePreview = false,
  viewportMode: externalViewportMode,
}) => {
  const portfolioData = data.portfolioData || DEFAULT_PORTFOLIO_DATA;
  const card1: PortfolioCardData = portfolioData.card1 || DEFAULT_PORTFOLIO_CARD_1;
  const card2: PortfolioCardData = portfolioData.card2 || DEFAULT_PORTFOLIO_CARD_2;
  const cards = [card1, card2];

  // --- Active section index ---
  const initialIndex = portfolioData.activeCardIndex === 1 ? 1 : 0;
  const [cur, setCur] = useState<number>(initialIndex);

  // Scroll container ref (the scroll-snap container)
  const scrollRef = useRef<HTMLDivElement>(null);

  // For blocking rapid re-navigation
  const busyRef = useRef(false);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userInteractedRef = useRef(false);
  const userInteractTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Responsive container observer
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [internalMode, setInternalMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const updateSize = () => {
      const width = el.offsetWidth;
      if (width <= 540) setInternalMode('mobile');
      else if (width <= 820) setInternalMode('tablet');
      else setInternalMode('desktop');
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const activeMode = externalViewportMode || internalMode;
  const isMobile = activeMode === 'mobile';
  const isTablet = activeMode === 'tablet';
  const isCompact = isMobile || isTablet;

  // Load Google Fonts
  useEffect(() => {
    const linkId = 'web-developer-portfolio-fonts';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Anton&family=Rajdhani:wght@500;600;700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // Scroll to a section index smoothly
  const scrollToIndex = useCallback((idx: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const sections = container.querySelectorAll<HTMLElement>('.pf-section');
    if (!sections[idx]) return;
    sections[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Navigate to a target index
  const go = useCallback(
    (targetIndex: number) => {
      if (busyRef.current) return;
      const count = cards.length;
      const nextIndex = ((targetIndex % count) + count) % count;
      if (nextIndex === cur) return;

      busyRef.current = true;
      setCur(nextIndex);
      scrollToIndex(nextIndex);

      setTimeout(() => {
        busyRef.current = false;
      }, 900);
    },
    [cur, cards.length, scrollToIndex]
  );

  // Mark user interaction (pauses auto-scroll for 8s)
  const markUserInteraction = useCallback(() => {
    userInteractedRef.current = true;
    if (userInteractTimeoutRef.current) clearTimeout(userInteractTimeoutRef.current);
    userInteractTimeoutRef.current = setTimeout(() => {
      userInteractedRef.current = false;
    }, 8000);
  }, []);

  // Sync scroll position → update cur state
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const onScroll = () => {
      const sections = container.querySelectorAll<HTMLElement>('.pf-section');
      const containerTop = container.scrollTop;
      const containerH = container.clientHeight;
      let best = 0;
      let bestDiff = Infinity;
      sections.forEach((sec, i) => {
        const diff = Math.abs(sec.offsetTop - containerTop - containerH / 2 + containerH / 2);
        if (diff < bestDiff) {
          bestDiff = diff;
          best = i;
        }
      });
      setCur(best);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    container.addEventListener('touchstart', markUserInteraction, { passive: true });
    container.addEventListener('wheel', markUserInteraction, { passive: true });

    return () => {
      container.removeEventListener('scroll', onScroll);
      container.removeEventListener('touchstart', markUserInteraction);
      container.removeEventListener('wheel', markUserInteraction);
    };
  }, [markUserInteraction]);

  // Sync external activeCardIndex changes from studio panel
  useEffect(() => {
    if (typeof portfolioData.activeCardIndex === 'number') {
      const targetIdx = portfolioData.activeCardIndex % cards.length;
      if (targetIdx !== cur) {
        setCur(targetIdx);
        scrollToIndex(targetIdx);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolioData.activeCardIndex]);

  // Auto-scroll (5.5s), paused during user interaction
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const startAuto = () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      autoTimerRef.current = setInterval(() => {
        if (!userInteractedRef.current) {
          setCur(prev => {
            const next = (prev + 1) % cards.length;
            scrollToIndex(next);
            return next;
          });
        }
      }, 5500);
    };

    startAuto();
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [cards.length, scrollToIndex]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea, select')) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        markUserInteraction();
        go(cur + 1);
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        markUserInteraction();
        go(cur - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cur, go, markUserInteraction]);

  // 3D perspective tilt on desktop
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>, idx: number) => {
    if (isCompact || idx !== cur) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--tx', (x * 12).toFixed(2));
    el.style.setProperty('--ty', (-y * 12).toFixed(2));
  };
  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty('--tx', '0');
    e.currentTarget.style.setProperty('--ty', '0');
  };

  // Trailing ring cursor (Desktop only)
  useEffect(() => {
    if (isLivePreview || isCompact) return;
    const ring = document.getElementById('portfolio-cursor-ring');
    if (!ring) return;
    let mx = -100, my = -100, rx = -100, ry = -100, active = false, animId: number;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (!active) { rx = mx; ry = my; active = true; ring.style.opacity = '0.7'; }
    };
    const onLeave = () => { active = false; ring.style.opacity = '0'; };
    const tick = () => {
      if (active) {
        rx += (mx - rx) * 0.16;
        ry += (my - ry) * 0.16;
        ring.style.transform = `translate3d(${rx.toFixed(1)}px,${ry.toFixed(1)}px,0)`;
      }
      animId = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerleave', onLeave);
    animId = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(animId);
    };
  }, [isLivePreview, isCompact]);

  const hireTarget = getHireTarget(portfolioData.hire);
  const navConfig = portfolioData.nav || {
    l1: 'Projects', u1: 'https://github.com/',
    l2: 'Resume', u2: '#section-0',
  };
  const brandName = portfolioData.brand || portfolioData.creatorName || card1.name || 'Your Name';

  const arrowSvg = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );

  return (
    <div
      ref={wrapperRef}
      className={`pf-root ${isLivePreview ? 'is-preview' : ''} ${isMobile ? 'is-mobile' : isTablet ? 'is-tablet' : ''}`}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' } as React.CSSProperties}
    >
      <style>{`
        /* ====== BASE RESET ====== */
        .pf-root * { box-sizing: border-box; }
        .pf-root .sr { position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0); }

        /* ====== SCROLL CONTAINER ====== */
        .pf-root {
          container-type: inline-size;
          font-family: Rajdhani, 'Arial Narrow', sans-serif;
          color: #fff;
          -webkit-font-smoothing: antialiased;
        }
        .pf-scroll {
          width: 100%;
          height: 100%;
          overflow-y: scroll;
          overflow-x: hidden;
          scroll-snap-type: y mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .pf-scroll::-webkit-scrollbar { display: none; }

        /* ====== EACH FULL-HEIGHT SECTION ====== */
        .pf-section {
          position: relative;
          width: 100%;
          height: 100svh;
          min-height: 520px;
          scroll-snap-align: start;
          scroll-snap-stop: always;
          overflow: hidden;
          cursor: default;
        }
        .pf-root.is-preview .pf-section {
          height: 100%;
          min-height: 540px;
          scroll-snap-align: none;
        }

        /* ====== BACKGROUND GLOW ====== */
        .pf-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(60% 55% at 50% 48%, rgba(255,255,255,.2), transparent 72%);
          pointer-events: none;
          z-index: 0;
        }

        /* ====== STAGE (3D tilt container) ====== */
        .pf-stage {
          position: absolute;
          inset: 0;
          transform: perspective(1400px) rotateX(calc(var(--ty,0)*1deg)) rotateY(calc(var(--tx,0)*1deg));
          transition: transform .6s ease-out;
          z-index: 1;
        }

        /* ====== BACKGROUND WORD ====== */
        .pf-word {
          position: absolute;
          left: 0; right: 0; bottom: 0;
          z-index: 1;
          display: flex;
          justify-content: center;
          font: 400 min(33vw, 56svh) / .82 Anton, Impact, 'Arial Narrow', sans-serif;
          font-size: calc(min(33vw, 56svh) * var(--wf, 1));
          color: #f7f6f2;
          user-select: none;
          letter-spacing: -0.01em;
          pointer-events: none;
        }
        .pf-word b { display: block; font-weight: 400; }

        /* ====== CHARACTER IMAGE ====== */
        /*
          BOTH characters use identical sizing rules.
          Character 1: 640×591 → ar=1.083 (wider than tall)
          Character 2: 640×948 → ar=0.675 (taller than wide)
          The formula width=min(96vw, ar*85svh) with max-height:85svh
          ensures both take up the same VISUAL HEIGHT on screen.
        */
        .pf-char {
          position: absolute;
          left: 50%;
          bottom: 0;
          z-index: 2;
          /* Use height-based sizing so both chars match visually */
          height: 85svh;
          width: auto;
          max-width: 96vw;
          object-fit: contain;
          object-position: bottom center;
          transform: translate(-50%, 0);
          pointer-events: none;
          user-select: none;
          filter: drop-shadow(0 30px 40px rgba(0,0,0,.22));
        }

        /* ====== META (left column) ====== */
        .pf-meta {
          position: absolute;
          z-index: 4;
          top: clamp(90px, 20svh, 220px);
          left: clamp(20px, 4vw, 56px);
          font-weight: 600;
          font-size: clamp(13px, 1.05vw, 16px);
          line-height: 1.55;
          letter-spacing: .04em;
          text-transform: uppercase;
        }
        .pf-meta h2 {
          margin: 0 0 12px;
          font: 600 clamp(20px, 2.1vw, 32px)/1.05 Rajdhani, sans-serif;
          letter-spacing: .02em;
        }
        .pf-meta p { margin: 0; opacity: .88; }
        .pf-meta a { color: #fff; font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }

        /* ====== SIDE (right column) ====== */
        .pf-side {
          position: absolute;
          z-index: 4;
          top: clamp(90px, 20svh, 220px);
          right: clamp(20px, 4vw, 56px);
          width: min(300px, 26vw);
          font-weight: 500;
          font-size: clamp(14px, 1.1vw, 17px);
          line-height: 1.45;
        }
        .pf-side p { margin: 0; }

        /* ====== ARROW BUTTONS ====== */
        .pf-arrows { display: flex; gap: 10px; margin-top: 22px; }
        .pf-arrows button {
          width: 44px; height: 44px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,.75);
          background: transparent;
          color: #fff;
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: background .25s, color .25s;
        }
        .pf-arrows button:hover { background: #fff; color: var(--pf-bg); }
        .pf-arrows button[data-dir="-1"] svg { transform: rotate(180deg); }

        /* ====== NAV BAR ====== */
        .pf-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 22px clamp(20px, 4vw, 56px);
          font-weight: 600;
          font-size: 15px;
          letter-spacing: .05em;
          text-transform: uppercase;
          pointer-events: none;
        }
        .pf-root.is-preview .pf-nav { position: absolute; }
        .pf-nav > * { pointer-events: auto; }
        .pf-nav a { color: #fff; text-decoration: none; }
        .pf-brand {
          display: flex; gap: 10px; align-items: center;
          font-weight: 700; color: #fff; text-decoration: none;
        }
        .pf-brand i {
          width: 24px; height: 24px;
          border-radius: 50%; background: #fff;
          display: block; flex-shrink: 0;
        }
        .pf-links {
          display: flex; align-items: center;
          gap: clamp(14px, 3vw, 40px);
        }
        .pf-hire {
          border: 1.5px solid #fff;
          border-radius: 99px;
          padding: 7px 18px;
          transition: background .25s, color .25s;
          color: #fff;
          text-decoration: none;
          cursor: pointer;
          background: transparent;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: .05em;
          font-family: inherit;
          display: inline-block;
          white-space: nowrap;
        }
        .pf-hire:hover { background: #fff; color: var(--pf-bg); }
        .pf-root a:focus-visible, .pf-root button:focus-visible { outline: 2px solid #fff; outline-offset: 4px; }

        /* ====== SECTION DOT INDICATORS ====== */
        .pf-dots {
          position: fixed;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 100;
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: none;
        }
        .pf-root.is-preview .pf-dots { position: absolute; }
        .pf-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.4);
          border: 1.5px solid rgba(255,255,255,0.6);
          transition: background .3s, transform .3s;
        }
        .pf-dot.active {
          background: #fff;
          transform: scale(1.3);
        }

        /* ====== CURSOR RING ====== */
        .pf-ring {
          position: fixed;
          left: 0; top: 0;
          width: 54px; height: 54px;
          margin: -27px 0 0 -27px;
          border: 1.5px solid #fff;
          border-radius: 50%;
          pointer-events: none;
          z-index: 99;
          opacity: 0;
          transition: opacity .3s;
        }
        @media (hover: none) { .pf-ring { display: none; } }

        /* ====== MOBILE RESPONSIVE ====== */
        @container (max-width: 760px) {
          .pf-nav { padding: 16px 16px; }
          .pf-brand { font-size: 13px; }
          .pf-brand i { width: 20px; height: 20px; }
          .pf-hire { padding: 6px 13px; font-size: 12px; }
          .pf-links a:not(.pf-hire) { display: none; }
          .pf-meta {
            top: 66px;
            left: 16px;
            max-width: 64%;
            font-size: 12px;
          }
          .pf-meta h2 { font-size: clamp(19px, 5.5cqw, 24px); line-height: 1.1; margin-bottom: 5px; }
          .pf-meta p { font-size: 11px; line-height: 1.4; }
          .pf-side { top: 66px; right: 14px; width: auto; }
          .pf-side p { display: none; }
          .pf-arrows { margin-top: 0; gap: 8px; }
          .pf-arrows button { width: 40px; height: 40px; }
          .pf-word {
            font-size: calc(clamp(80px, 25cqw, 122px) * var(--wf, 1));
            line-height: 0.82;
            letter-spacing: -0.02em;
          }
          .pf-char {
            height: 78svh;
            max-width: 100cqw;
          }
          .pf-dots { right: 10px; }
        }

        /* Fallback media queries for non-container-query support */
        @media (max-width: 760px) {
          .pf-nav { padding: 16px 16px; }
          .pf-links a:not(.pf-hire) { display: none; }
          .pf-meta { top: 66px; left: 16px; max-width: 64%; font-size: 12px; }
          .pf-meta h2 { font-size: 22px; line-height: 1.1; margin-bottom: 5px; }
          .pf-meta p { font-size: 11px; line-height: 1.4; }
          .pf-side { top: 66px; right: 14px; width: auto; }
          .pf-side p { display: none; }
          .pf-arrows { margin-top: 0; gap: 8px; }
          .pf-arrows button { width: 40px; height: 40px; }
          .pf-word { font-size: calc(min(28vw, 118px) * var(--wf, 1)); line-height: 0.82; }
          .pf-char { height: 78svh; max-width: 100vw; }
        }

        /* Class-based overrides for studio viewport switcher */
        .pf-root.is-mobile .pf-nav { padding: 16px 16px; }
        .pf-root.is-mobile .pf-brand { font-size: 13px; }
        .pf-root.is-mobile .pf-brand i { width: 20px; height: 20px; }
        .pf-root.is-mobile .pf-hire { padding: 6px 13px; font-size: 12px; }
        .pf-root.is-mobile .pf-links a:not(.pf-hire) { display: none; }
        .pf-root.is-mobile .pf-meta { top: 66px; left: 16px; max-width: 64%; font-size: 12px; }
        .pf-root.is-mobile .pf-meta h2 { font-size: 22px; line-height: 1.1; margin-bottom: 5px; }
        .pf-root.is-mobile .pf-meta p { font-size: 11px; }
        .pf-root.is-mobile .pf-side { top: 66px; right: 14px; width: auto; }
        .pf-root.is-mobile .pf-side p { display: none; }
        .pf-root.is-mobile .pf-arrows { margin-top: 0; gap: 8px; }
        .pf-root.is-mobile .pf-arrows button { width: 40px; height: 40px; }
        .pf-root.is-mobile .pf-word { font-size: calc(clamp(80px, 25cqw, 122px) * var(--wf, 1)); line-height: 0.82; letter-spacing: -0.02em; }
        .pf-root.is-mobile .pf-char { height: 78svh; max-width: 100cqw; }

        .pf-root.is-tablet .pf-meta { font-size: clamp(12px, 1.5cqw, 15px); }
        .pf-root.is-tablet .pf-meta h2 { font-size: clamp(18px, 3cqw, 28px); }
        .pf-root.is-tablet .pf-links a:not(.pf-hire) { display: none; }
        .pf-root.is-tablet .pf-word { font-size: calc(clamp(100px, 22cqw, 170px) * var(--wf, 1)); }
        .pf-root.is-tablet .pf-char { height: 82svh; }

        @media (prefers-reduced-motion: reduce) {
          .pf-root * { transition-duration: .01ms !important; transition-delay: 0s !important; }
          .pf-scroll { scroll-snap-type: none; }
        }
      `}</style>

      <h1 className="sr">{portfolioData.title || 'Web developer portfolio'}</h1>

      {/* Fixed Navigation Bar — floats above all sections */}
      <header
        className="pf-nav"
        style={{ '--pf-bg': cards[cur]?.bgColor || (cur === 0 ? '#c4701e' : '#2e7d32') } as React.CSSProperties}
      >
        <a className="pf-brand" href="#section-0">
          <i />
          <span>{brandName}</span>
        </a>
        <nav className="pf-links">
          {navConfig.l1 && (
            <a href={navConfig.u1 || '#'} target={navConfig.u1?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
              {navConfig.l1}
            </a>
          )}
          {navConfig.l2 && (
            <a href={navConfig.u2 || '#'} target={navConfig.u2?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
              {navConfig.l2}
            </a>
          )}
          <a
            className="pf-hire"
            href={hireTarget.href}
            target={hireTarget.ext ? '_blank' : undefined}
            rel="noopener noreferrer"
          >
            {portfolioData.hire?.label || 'Hire me'}
          </a>
        </nav>
      </header>

      {/* Section dot indicators */}
      <div className="pf-dots" aria-hidden="true">
        {cards.map((_, i) => (
          <div key={i} className={`pf-dot ${i === cur ? 'active' : ''}`} />
        ))}
      </div>

      {/* Scroll-snap Container */}
      <div className="pf-scroll" ref={scrollRef}>
        {cards.map((card, idx) => {
          const rawWord = card.word || (card.name ? card.name.trim().split(/\s+/)[0] : '') || (idx === 0 ? 'LAUNCH' : 'CODING');
          const cleanWord = rawWord.toUpperCase().replace(/\s+/g, '') || (idx === 0 ? 'LAUNCH' : 'CODING');
          const wordScale = getWordScale(cleanWord);
          const bgColor = card.bgColor || (idx === 0 ? '#c4701e' : '#2e7d32');

          const titleLine1 = card.titleLines?.[0] || (card.role ? card.role.split('\n')[0] : '') || (idx === 0 ? 'Full-stack' : 'Creative');
          const titleLine2 = card.titleLines?.[1] || (card.role && card.role.includes('\n') ? card.role.split('\n')[1] : '') || (idx === 0 ? 'web developer' : 'frontend developer');

          const metaLine1 = card.metaLines?.[0] || (idx === 0 ? 'Available: Nov 2026' : 'Focus: Motion, 3D, UI systems');
          const metaLine2 = card.metaLines?.[1] || (card.stack && card.stack.length > 0
            ? `Stack: ${card.stack.slice(0, 3).join(', ')}`
            : (idx === 0 ? 'Stack: React, Node, Postgres' : 'Stack: TypeScript, Three.js, GSAP'));

          const slideLinks = card.links && card.links.length > 0
            ? card.links
            : idx === 0
              ? [
                { text: 'GitHub', url: card.githubProfileLink || 'https://github.com/' },
                { text: 'Resume', url: card.resumeLink || '#section-0' },
              ]
              : [
                { text: 'Projects', url: card.githubProjectLink || 'https://github.com/' },
                { text: 'Contact', url: card.phone ? `tel:${card.phone}` : '#section-0' },
              ];

          const charSrc = card.characterImage || (idx === 0 ? DEFAULT_CHARACTER_1_IMG : DEFAULT_CHARACTER_2_IMG);

          return (
            <section
              key={card.id || `section-${idx}`}
              id={`section-${idx}`}
              className="pf-section"
              style={{
                backgroundColor: bgColor,
                backgroundImage: card.bgImage ? `url(${card.bgImage})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                '--pf-bg': bgColor,
                '--wf': wordScale,
              } as React.CSSProperties}
              aria-label={cleanWord}
            >
              <div className="pf-glow" />

              {/* 3D tilt stage */}
              <div
                className="pf-stage"
                onPointerMove={(e) => handlePointerMove(e as any, idx)}
                onPointerLeave={handlePointerLeave}
              >
                {/* Background word */}
                <div className="pf-word" aria-hidden="true">
                  {[...cleanWord].map((char, charIdx) => (
                    <b key={charIdx} style={{ '--i': charIdx } as React.CSSProperties}>{char}</b>
                  ))}
                </div>

                {/* Character image — fixed height so both chars match visually */}
                <img
                  className="pf-char"
                  src={charSrc}
                  alt={card.characterAlt || card.name}
                  loading="eager"
                  draggable={false}
                />
              </div>

              {/* Left: Meta, titles, links */}
              <div className="pf-meta">
                <h2>
                  {titleLine1}
                  {titleLine2 && <br />}
                  {titleLine2}
                </h2>
                {metaLine1 && <p>{metaLine1}</p>}
                {metaLine2 && <p>{metaLine2}</p>}
                {slideLinks.length > 0 && (
                  <p>
                    {slideLinks.map((link, lIdx) => (
                      <React.Fragment key={lIdx}>
                        {lIdx > 0 && ', '}
                        <a
                          href={link.url || '#'}
                          target={link.url?.startsWith('http') ? '_blank' : undefined}
                          rel="noopener noreferrer"
                        >
                          {link.text}
                        </a>
                      </React.Fragment>
                    ))}
                  </p>
                )}
              </div>

              {/* Right: Description + arrows */}
              <div className="pf-side">
                <p>{card.sideText}</p>
                <div className="pf-arrows">
                  <button
                    type="button"
                    data-dir="-1"
                    onClick={() => { markUserInteraction(); go(cur - 1); }}
                    aria-label="Previous section"
                  >
                    {arrowSvg}
                  </button>
                  <button
                    type="button"
                    data-dir="1"
                    onClick={() => { markUserInteraction(); go(cur + 1); }}
                    aria-label="Next section"
                  >
                    {arrowSvg}
                  </button>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Trailing ring cursor (Desktop only) */}
      {!isLivePreview && !isCompact && <div className="pf-ring" id="portfolio-cursor-ring" />}
    </div>
  );
};
