import React, { useState } from 'react';
import { EventData, PortfolioData, TemplateDefinition } from '@/types';
import { DeveloperPortfolioTemplate } from '@/templates/components/DeveloperPortfolioTemplate';
import { PortfolioEditSection } from './PortfolioEditSection';
import {
  DEFAULT_PORTFOLIO_CARD_1,
  DEFAULT_PORTFOLIO_CARD_2,
  DEFAULT_CHARACTER_1_IMG,
  DEFAULT_CHARACTER_2_IMG,
  DEFAULT_PORTFOLIO_DATA,
} from '@/templates/components/portfolioAssets';

interface PortfolioStudioViewProps {
  template: TemplateDefinition;
  eventData: EventData;
  portfolioData?: PortfolioData;
  onChangePortfolioData: (data: PortfolioData) => void;
  onSave: (publishNow: boolean) => Promise<void>;
  isSaving: boolean;
  isPublishing: boolean;
  publishStatus: 'draft' | 'published';
  subdomain: string;
  onChangeSubdomain?: (slug: string) => void;
  onToast: (msg: string) => void;
  onBack: () => void;
}

export const PortfolioStudioView: React.FC<PortfolioStudioViewProps> = ({
  template,
  eventData,
  portfolioData,
  onChangePortfolioData,
  onSave,
  isSaving,
  isPublishing,
  publishStatus,
  subdomain,
  onToast,
  onBack,
}) => {
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Generate and download a standalone clean HTML file
  const handleDownloadHtml = () => {
    const htmlFileMap: Record<string, string> = {
      'design-gallery-portfolio': '/html-templates/design-gallery-portfolio.html',
      '3d-in-motion-portfolio': '/html-templates/3d-in-motion-portfolio.html',
      'emiway-minecraft-portfolio': '/html-templates/emiway-minecraft-portfolio.html',
      'alex-3d-designer-portfolio': '/html-templates/alex-3d-designer-portfolio.html',
      'motion-designer-portfolio': '/html-templates/motion-designer-portfolio.html',
      'web-developer-portfolio': '/html-templates/web-developer-portfolio.html',
    };

    const targetUrl = htmlFileMap[template.id];
    if (targetUrl) {
      fetch(targetUrl)
        .then((res) => res.text())
        .then((rawHtml) => {
          const blob = new Blob([rawHtml], { type: 'text/html;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${template.id}.html`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          onToast('Portfolio HTML exported successfully!');
        })
        .catch(() => {
          downloadGenerated();
        });
      return;
    }
    downloadGenerated();
  };

  const downloadGenerated = () => {
    const safeData = portfolioData || DEFAULT_PORTFOLIO_DATA;
    const card1 = safeData.card1 || DEFAULT_PORTFOLIO_CARD_1;
    const card2 = safeData.card2 || DEFAULT_PORTFOLIO_CARD_2;
    const pageTitle = safeData.title || 'Web developer portfolio';
    const brandName = safeData.brand || safeData.creatorName || card1.name || 'Your Name';
    const nav1Text = safeData.nav?.l1 || 'Projects';
    const nav1Url = safeData.nav?.u1 || 'https://github.com/';
    const nav2Text = safeData.nav?.l2 || 'Resume';
    const nav2Url = safeData.nav?.u2 || '#hero';
    const hireLabel = safeData.hire?.label || 'Hire me';

    const hireHref =
      safeData.hire?.mode === 'whatsapp'
        ? `https://wa.me/${(safeData.hire.whatsapp || '').replace(/\\D/g, '')}${
            safeData.hire.waText ? '?text=' + encodeURIComponent(safeData.hire.waText) : ''
          }`
        : safeData.hire?.fallback || 'mailto:hello@yourname.dev';

    const htmlContent = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${pageTitle.replace(/</g, '&lt;')}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet">
<style>
:root{--bg:${card1.bgColor || '#c4701e'};box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
html{scroll-padding-top:env(safe-area-inset-top,0px)}
*{box-sizing:border-box}
html,body{height:100%;margin:0;background-color:var(--bg);transition:background-color .9s ease;font-family:Rajdhani,'Arial Narrow',sans-serif;color:#fff;-webkit-font-smoothing:antialiased}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.hero{position:relative;height:100%;min-height:520px;overflow:hidden;cursor:default}
.glow{position:absolute;inset:0;background:radial-gradient(60% 55% at 50% 48%,rgba(255,255,255,.2),transparent 72%);pointer-events:none}
.nav{position:absolute;inset:0 0 auto 0;z-index:6;display:flex;justify-content:space-between;align-items:center;padding:22px clamp(20px,4vw,56px);font-weight:600;font-size:15px;letter-spacing:.05em;text-transform:uppercase}
.nav a{color:#fff;text-decoration:none}
.brand{display:flex;gap:10px;align-items:center;font-weight:700}
.brand i{width:26px;height:26px;border-radius:50%;background:#fff;display:block}
.links{display:flex;align-items:center;gap:clamp(16px,3vw,40px)}
.hire{border:1.5px solid #fff;border-radius:99px;padding:8px 18px;transition:background .25s,color .25s}
.hire:hover{background:#fff;color:var(--bg)}
a:focus-visible,button:focus-visible{outline:2px solid #fff;outline-offset:4px}
.slide{position:absolute;inset:0;visibility:hidden;pointer-events:none}
.slide.on,.slide.out{visibility:visible}
.slide.on{pointer-events:auto}
.stage{position:absolute;inset:0;transform:perspective(1400px) rotateX(calc(var(--ty,0)*1deg)) rotateY(calc(var(--tx,0)*1deg));transition:transform .6s ease-out}
.word{position:absolute;left:0;right:0;bottom:0;z-index:1;display:flex;justify-content:center;font:400 min(33vw,56svh)/.82 Anton,Impact,'Arial Narrow',sans-serif;color:#f7f6f2;user-select:none;font-size:calc(min(33vw,56svh)*var(--wf,1))}
.word b{display:block;font-weight:400;transform:translateY(120%)}
.slide.on .word b{transform:none;transition:transform .9s cubic-bezier(.2,.8,.2,1) calc(.3s + var(--i)*60ms)}
.slide.out .word b{transition:transform .6s cubic-bezier(.6,0,.8,.2) calc(var(--i)*30ms)}
.char{position:absolute;left:50%;bottom:0;z-index:2;width:min(96vw,calc(var(--ar)*80svh));height:auto;transform:translate(-50%,105svh);pointer-events:none;user-select:none;filter:drop-shadow(0 30px 40px rgba(0,0,0,.22))}
.slide.on .char{transform:translate(-50%,0);transition:transform 1.1s cubic-bezier(.2,.8,.2,1) .3s}
.slide.out .char{transform:translate(-50%,-105svh);transition:transform .8s cubic-bezier(.6,0,.8,.2)}
.meta,.side{position:absolute;z-index:4;top:clamp(96px,22svh,220px);opacity:0;transform:translateY(14px)}
.slide.on .meta,.slide.on .side{opacity:1;transform:none;transition:opacity .7s .7s,transform .7s .7s}
.slide.out .meta,.slide.out .side{transition:opacity .3s}
.meta{left:clamp(20px,4vw,56px);font-weight:600;font-size:clamp(13px,1.05vw,16px);line-height:1.55;letter-spacing:.04em;text-transform:uppercase}
.meta h2{margin:0 0 14px;font:600 clamp(20px,2.1vw,32px)/1.05 Rajdhani,sans-serif;letter-spacing:.02em}
.meta p{margin:0;opacity:.88}
.meta a{color:#fff;font-weight:700;text-decoration:underline;text-underline-offset:3px}
.side{right:clamp(20px,4vw,56px);width:min(300px,26vw);font-weight:500;font-size:clamp(14px,1.1vw,17px);line-height:1.45}
.side p{margin:0}
.arrows{display:flex;gap:10px;margin-top:22px}
.arrows button{width:44px;height:44px;border-radius:50%;border:1.5px solid rgba(255,255,255,.75);background:transparent;color:#fff;cursor:pointer;display:grid;place-items:center;transition:background .25s,color .25s}
.arrows button:hover{background:#fff;color:var(--bg)}
.arrows button[data-dir="-1"] svg{transform:rotate(180deg)}
.ring{position:fixed;left:0;top:0;width:54px;height:54px;margin:-27px 0 0 -27px;border:1.5px solid #fff;border-radius:50%;pointer-events:none;z-index:9;opacity:0;transition:opacity .3s}
@media (hover:none){.ring{display:none}}
@media (max-width:760px){
.links a:not(.hire){display:none}
.meta{top:84px}
.side{top:84px;width:auto}
.side p{display:none}
.arrows{margin-top:0}
.word{font-size:calc(min(34vw,40svh)*var(--wf,1))}
}
@media (prefers-reduced-motion:reduce){*{transition-duration:.01ms!important;transition-delay:0s!important}}
</style>
</head>
<body>
<h1 class="sr">${pageTitle.replace(/</g, '&lt;')}</h1>
<main class="hero" id="hero">
<div class="glow"></div>
<header class="nav">
<a class="brand" href="#hero"><i></i>${brandName.replace(/</g, '&lt;')}</a>
<nav class="links">
<a href="${nav1Url}">${nav1Text.replace(/</g, '&lt;')}</a>
<a href="${nav2Url}">${nav2Text.replace(/</g, '&lt;')}</a>
<a class="hire" href="${hireHref}">${hireLabel.replace(/</g, '&lt;')}</a>
</nav>
</header>
</main>
<div class="ring" id="ring"></div>
<script>
const S=${JSON.stringify([
  {
    word: (card1.word || 'LAUNCH').toUpperCase().replace(/\s+/g, ''),
    bg: card1.bgColor || '#c4701e',
    img: card1.characterImage || DEFAULT_CHARACTER_1_IMG,
    ar: card1.characterAr || 1.083,
    alt: card1.characterAlt || 'Character 1',
    title: card1.titleLines || [card1.role || 'Full-stack', 'web developer'],
    meta: card1.metaLines || ['Available: Nov 2026', 'Stack: React, Node, Postgres'],
    links: card1.links ? card1.links.map((l) => [l.text, l.url]) : [['GitHub', 'https://github.com/'], ['Resume', '#hero']],
    desc: card1.sideText || 'Crafting fast, dynamic websites and web apps.',
  },
  {
    word: (card2.word || 'CODING').toUpperCase().replace(/\s+/g, ''),
    bg: card2.bgColor || '#2e7d32',
    img: card2.characterImage || DEFAULT_CHARACTER_2_IMG,
    ar: card2.characterAr || 0.675,
    alt: card2.characterAlt || 'Character 2',
    title: card2.titleLines || [card2.role || 'Creative', 'frontend developer'],
    meta: card2.metaLines || ['Focus: Motion, 3D, UI systems', 'Stack: TypeScript, Three.js, GSAP'],
    links: card2.links ? card2.links.map((l) => [l.text, l.url]) : [['Projects', 'https://github.com/'], ['Contact', '#hero']],
    desc: card2.sideText || 'Bridging modern design and frontend engineering.',
  },
])};
const esc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const wf=w=>{const n=[...String(w)].length;return n>6?+(6/n).toFixed(3):1};
const wordHTML=w=>[...w].map((c,j)=>\`<b style="--i:\${j}">\${esc(c)}</b>\`).join('');
const metaHTML=s=>{const L=s.links.filter(l=>l[0]);return \`<h2>\${s.title.filter(Boolean).map(esc).join('<br>')}</h2>\`+s.meta.filter(Boolean).map(m=>\`<p>\${esc(m)}</p>\`).join('')+(L.length?\`<p>\${L.map(l=>\`<a href="\${esc(l[1]||'#')}">\${esc(l[0])}</a>\`).join(', ')}</p>\`:'')};
const hero=document.getElementById('hero');
const arrow='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
hero.insertAdjacentHTML('beforeend',S.map(s=>\`<section class="slide" style="--ar:\${s.ar};--wf:\${wf(s.word)}" aria-label="\${esc(s.word)}">
<div class="stage"><div class="word" aria-hidden="true">\${wordHTML(s.word)}</div><img class="char" src="\${esc(s.img)}" alt="\${esc(s.alt)}"></div>
<div class="meta">\${metaHTML(s)}</div>
<div class="side"><p>\${esc(s.desc)}</p><div class="arrows"><button data-dir="-1" aria-label="Previous">\${arrow}</button><button data-dir="1" aria-label="Next">\${arrow}</button></div></div>
</section>\`).join(''));
const el=[...hero.querySelectorAll('.slide')];
let cur=0,busy=false,timer;
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
function go(n){
 n=(n+S.length)%S.length;
 if(n===cur||busy)return;
 busy=true;
 const out=el[cur];
 out.classList.remove('on');out.classList.add('out');
 cur=n;el[cur].classList.add('on');
 document.documentElement.style.setProperty('--bg',S[cur].bg);
 setTimeout(()=>{out.classList.remove('out');busy=false},1150);
}
function auto(){clearInterval(timer);if(!reduce)timer=setInterval(()=>go(cur+1),5500)}
hero.addEventListener('click',e=>{const b=e.target.closest('[data-dir]');if(b){go(cur+ +b.dataset.dir);auto()}});
addEventListener('keydown',e=>{if(e.key==='ArrowRight'){go(cur+1);auto()}if(e.key==='ArrowLeft'){go(cur-1);auto()}});
hero.addEventListener('pointermove',e=>{
 if(e.pointerType!=='mouse')return;
 const r=hero.getBoundingClientRect();
 hero.style.setProperty('--tx',((e.clientX-r.left)/r.width-.5)*7);
 hero.style.setProperty('--ty',-((e.clientY-r.top)/r.height-.5)*5);
});
hero.addEventListener('pointerleave',()=>{hero.style.setProperty('--tx',0);hero.style.setProperty('--ty',0)});
const ring=document.getElementById('ring');
let mx=0,my=0,rx=0,ry=0,seen=false;
addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;if(!seen){seen=true;rx=mx;ry=my;ring.style.opacity=1}});
(function loop(){rx+=(mx-rx)*.16;ry+=(my-ry)*.16;ring.style.transform=\`translate(\${rx}px,\${ry}px)\`;requestAnimationFrame(loop)})();
setTimeout(()=>{el[0].classList.add('on');auto()},80);
</script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    onToast('Downloaded index.html (Clean Standalone Website)');
  };

  // If raw fullscreen mode is requested, render 100% edge-to-edge pure site matching reference HTML
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black overflow-hidden select-none">
        <DeveloperPortfolioTemplate data={eventData} isLivePreview={false} />

        {/* Floating controls in top-right corner to exit or open editor panel */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsFullscreen(false);
              setIsPanelOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-full bg-black/75 hover:bg-black/95 backdrop-blur-md text-white border border-white/25 text-xs font-bold flex items-center gap-1.5 shadow-2xl transition-all cursor-pointer"
            title="Open Customization Panel"
          >
            <span className="material-symbols-outlined text-[16px] text-amber-400">tune</span>
            <span>Customization</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="px-3.5 py-1.5 rounded-full bg-black/75 hover:bg-black/95 backdrop-blur-md text-white border border-white/25 text-xs font-bold flex items-center gap-1.5 shadow-2xl transition-all cursor-pointer"
            title="Exit Fullscreen View"
          >
            <span className="material-symbols-outlined text-[16px]">fullscreen_exit</span>
            <span>Exit Fullscreen</span>
          </button>
        </div>
      </div>
    );
  }

  const activeCardIdx = portfolioData?.activeCardIndex === 1 ? 1 : 0;

  return (
    <div className="w-screen h-screen flex flex-col bg-stone-950 text-white overflow-hidden select-none antialiased">
      {/* Studio Top Control Header */}
      <header className="h-[50px] bg-stone-950 border-b border-white/10 px-3 sm:px-4 flex items-center justify-between gap-2 shrink-0 z-30">
        {/* Left: Back & Project info */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Back to Templates"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="hidden sm:inline">Templates</span>
          </button>

          <span className="text-white/20 text-xs hidden sm:inline">/</span>

          <span className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-xs">
            {template.name}
          </span>

          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 hidden sm:inline-flex items-center gap-1 ${
              publishStatus === 'published'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                publishStatus === 'published' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span>{publishStatus === 'published' ? 'Live' : 'Draft'}</span>
          </span>
        </div>

        {/* Center: Card Quick Switcher + Responsive Viewport + Panel Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Card Switcher Pills */}
          <div className="flex items-center bg-stone-900 border border-white/10 p-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => {
                if (portfolioData) {
                  onChangePortfolioData({ ...portfolioData, activeCardIndex: 0 });
                }
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCardIdx === 0
                  ? 'bg-[#c4701e] text-white shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Switch to Card 1 (LAUNCH / Streetwear)"
            >
              <span className="w-2 h-2 rounded-full bg-white/90" />
              <span>Card 1</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (portfolioData) {
                  onChangePortfolioData({ ...portfolioData, activeCardIndex: 1 });
                }
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCardIdx === 1
                  ? 'bg-[#2e7d32] text-white shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Switch to Card 2 (CODING / Lime Puffer)"
            >
              <span className="w-2 h-2 rounded-full bg-white/90" />
              <span>Card 2</span>
            </button>
          </div>

          {/* Viewport Switcher */}
          <div className="hidden md:flex items-center bg-stone-900 border border-white/10 p-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => setViewportMode('mobile')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewportMode === 'mobile'
                  ? 'bg-white text-stone-950 shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Mobile Viewport (390px)"
            >
              <span className="material-symbols-outlined text-[16px]">smartphone</span>
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('tablet')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewportMode === 'tablet'
                  ? 'bg-white text-stone-950 shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Tablet Viewport (768px)"
            >
              <span className="material-symbols-outlined text-[16px]">tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('desktop')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewportMode === 'desktop'
                  ? 'bg-white text-stone-950 shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Desktop Viewport (Fluid 100%)"
            >
              <span className="material-symbols-outlined text-[16px]">desktop_windows</span>
            </button>
          </div>

          {/* Panel Toggle Button */}
          <button
            type="button"
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPanelOpen
                ? 'bg-white text-stone-950 shadow-sm'
                : 'bg-stone-900 text-white/80 hover:text-white border border-white/10'
            }`}
            title={isPanelOpen ? 'Collapse Customization Panel' : 'Open Customization Panel'}
          >
            <span className="material-symbols-outlined text-[16px] text-amber-500">tune</span>
            <span className="hidden sm:inline">Customization</span>
          </button>
        </div>

        {/* Right: Export HTML + Live Link + Fullscreen + Save + Publish */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Download index.html button matching reference export */}
          <button
            type="button"
            onClick={handleDownloadHtml}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-colors cursor-pointer"
            title="Download Standalone index.html Site"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export HTML</span>
          </button>

          {/* Live Link Button */}
          <a
            href={subdomain ? `/e/${subdomain}` : `/templates/${template.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-white/80 hover:text-white hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            title="Open Live Website in New Tab"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            <span>Live</span>
          </a>

          {/* Fullscreen Site Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-white/80 hover:text-white hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            title="Preview Site Edge-to-Edge"
          >
            <span className="material-symbols-outlined text-[16px]">fullscreen</span>
            <span>Raw Site</span>
          </button>

          {/* Save Draft Button */}
          <button
            type="button"
            onClick={() => onSave(false)}
            disabled={isSaving}
            className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white border border-white/15 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Save Draft to Database"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isSaving ? 'sync' : 'save'}
            </span>
            <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          {/* Publish to Web Button */}
          <button
            type="button"
            onClick={() => onSave(true)}
            disabled={isPublishing}
            className="flex items-center gap-1 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Publish Live Website to Production"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isPublishing ? 'sync' : 'rocket_launch'}
            </span>
            <span className="hidden sm:inline">{isPublishing ? 'Publishing...' : 'Publish'}</span>
          </button>
        </div>
      </header>

      {/* Main Studio Area (Panel on Left + Exact Live Site on Right) */}
      <div className="flex-1 w-full h-[calc(100vh-50px)] flex overflow-hidden relative">
        {/* Left Column: The "Customization" Panel Drawer */}
        {isPanelOpen && (
          <aside className="w-full sm:w-[460px] max-w-full sm:max-w-[460px] h-full flex-shrink-0 bg-stone-900/98 backdrop-blur-md border-r border-white/10 flex flex-col overflow-hidden z-20 shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="px-4 py-3 bg-stone-950 border-b border-white/10 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-amber-400">tune</span>
                  <span>Customization</span>
                </h2>
                <p className="text-[11px] text-white/50">
                  Edit Slide 1, Slide 2, Contact & Menu settings
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPanelOpen(false)}
                className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Collapse Panel"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
            </div>

            {/* Scrollable Customization Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 scrollbar-thin scrollbar-thumb-stone-700">
              <PortfolioEditSection
                portfolioData={portfolioData}
                onChangePortfolioData={onChangePortfolioData}
                onToast={onToast}
              />
            </div>
          </aside>
        )}

        {/* Right Area: Interactive Live Site */}
        <main className="flex-1 h-full bg-[#09090b] flex items-center justify-center p-0 overflow-hidden relative">
          {/* Floating Reopen Button if Panel is Collapsed */}
          {!isPanelOpen && (
            <button
              type="button"
              onClick={() => setIsPanelOpen(true)}
              className="fixed left-5 bottom-6 z-40 bg-white hover:bg-stone-100 text-stone-950 px-4 py-2.5 rounded-full shadow-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border border-black/10 animate-bounce"
            >
              <span className="material-symbols-outlined text-[18px] text-amber-500">tune</span>
              <span>Open Customization Panel</span>
            </button>
          )}

          {/* Viewport Responsive Frame */}
          <div
            className={`transition-all duration-300 relative flex flex-col overflow-hidden ${
              viewportMode === 'desktop'
                ? 'w-full h-full'
                : viewportMode === 'tablet'
                ? 'w-[768px] h-[92vh] max-h-[960px] rounded-[28px] border-8 border-stone-800 shadow-2xl ring-1 ring-white/10 my-auto'
                : 'w-[390px] h-[844px] max-h-[92vh] rounded-[38px] border-8 border-stone-800 shadow-2xl ring-1 ring-white/10 my-auto'
            }`}
          >
            {/* Realtime Live Template */}
            <div className="w-full h-full relative overflow-hidden bg-black">
              {template.component ? (
                <template.component data={eventData} isLivePreview={true} {...({ viewportMode } as any)} />
              ) : (
                <DeveloperPortfolioTemplate data={eventData} isLivePreview={true} viewportMode={viewportMode} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

