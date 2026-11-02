const fs = require('fs');
const filePath = 'src/components/editor/PortfolioStudioView.tsx';
let src = fs.readFileSync(filePath, 'utf8');

// Find the bounds of the handleDownloadHtml function
const startMarker = '  // Generate and download a standalone clean HTML file (matching index.html from user)\n  const handleDownloadHtml = () => {';
const endMarker = "    onToast('Downloaded index.html (Clean Standalone Website)');\n  };";

const startIdx = src.indexOf(startMarker);
const endIdx = src.indexOf(endMarker) + endMarker.length;

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find markers. startIdx:', startIdx, 'endIdx:', endIdx);
  process.exit(1);
}

const newFn = `  // Generate and download a standalone clean HTML file
  const handleDownloadHtml = () => {
    const safeData = portfolioData || DEFAULT_PORTFOLIO_DATA;
    const card1 = safeData.card1 || DEFAULT_PORTFOLIO_CARD_1;
    const card2 = safeData.card2 || DEFAULT_PORTFOLIO_CARD_2;
    const pageTitle = safeData.title || 'Web developer portfolio';
    const brandName = safeData.brand || safeData.creatorName || card1.name || 'Your Name';
    const nav1Text = safeData.nav?.l1 || 'Projects';
    const nav1Url = safeData.nav?.u1 || 'https://github.com/';
    const nav2Text = safeData.nav?.l2 || 'Resume';
    const nav2Url = safeData.nav?.u2 || '#sec-0';
    const hireLabel = safeData.hire?.label || 'Hire me';

    const hireHref =
      safeData.hire?.mode === 'whatsapp'
        ? \`https://wa.me/\${(safeData.hire.whatsapp || '').replace(/\\\\D/g, '')}\${
            safeData.hire.waText ? '?text=' + encodeURIComponent(safeData.hire.waText) : ''
          }\`
        : safeData.hire?.fallback || 'mailto:hello@yourname.dev';

    const s1 = {
      word: (card1.word || 'LAUNCH').toUpperCase().replace(/\\s+/g, ''),
      bg: card1.bgColor || '#c4701e',
      img: card1.characterImage || DEFAULT_CHARACTER_1_IMG,
      alt: card1.characterAlt || 'Character 1',
      title: card1.titleLines || [card1.role || 'Full-stack', 'web developer'],
      meta: card1.metaLines || ['Available: Nov 2026', 'Stack: React, Node, Postgres'],
      links: card1.links ? card1.links.map((l) => [l.text, l.url]) : [['GitHub', 'https://github.com/'], ['Resume', '#sec-0']],
      desc: card1.sideText || 'Crafting fast, dynamic websites and web apps.',
    };
    const s2 = {
      word: (card2.word || 'CODING').toUpperCase().replace(/\\s+/g, ''),
      bg: card2.bgColor || '#2e7d32',
      img: card2.characterImage || DEFAULT_CHARACTER_2_IMG,
      alt: card2.characterAlt || 'Character 2',
      title: card2.titleLines || [card2.role || 'Creative', 'frontend developer'],
      meta: card2.metaLines || ['Focus: Motion, 3D, UI systems', 'Stack: TypeScript, Three.js, GSAP'],
      links: card2.links ? card2.links.map((l) => [l.text, l.url]) : [['Projects', 'https://github.com/'], ['Contact', '#sec-0']],
      desc: card2.sideText || 'Bridging modern design and frontend engineering.',
    };
    const sData = JSON.stringify([s1, s2]);
    const esc = (v: unknown) =>
      String(v == null ? '' : v)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const htmlContent = \`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>\${esc(pageTitle)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}
html,body{height:100%;margin:0;overflow:hidden;font-family:Rajdhani,'Arial Narrow',sans-serif;color:#fff;-webkit-font-smoothing:antialiased}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.scroll-wrap{width:100%;height:100svh;overflow-y:scroll;overflow-x:hidden;scroll-snap-type:y mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.scroll-wrap::-webkit-scrollbar{display:none}
.pf-sec{position:relative;width:100%;height:100svh;min-height:520px;scroll-snap-align:start;scroll-snap-stop:always;overflow:hidden;cursor:default}
.glow{position:absolute;inset:0;background:radial-gradient(60% 55% at 50% 48%,rgba(255,255,255,.2),transparent 72%);pointer-events:none;z-index:0}
.stage{position:absolute;inset:0;z-index:1;transform:perspective(1400px) rotateX(0deg) rotateY(0deg);transition:transform .6s ease-out}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;justify-content:space-between;align-items:center;padding:22px clamp(20px,4vw,56px);font-weight:600;font-size:15px;letter-spacing:.05em;text-transform:uppercase;pointer-events:none}
.nav>*{pointer-events:auto}
.nav a{color:#fff;text-decoration:none}
.brand{display:flex;gap:10px;align-items:center;font-weight:700}
.brand i{width:26px;height:26px;border-radius:50%;background:#fff;display:block}
.links{display:flex;align-items:center;gap:clamp(16px,3vw,40px)}
.hire{border:1.5px solid #fff;border-radius:99px;padding:8px 18px;transition:background .25s,color .25s;color:#fff;text-decoration:none;font-weight:600;font-size:14px;text-transform:uppercase;letter-spacing:.05em}
.hire:hover{background:#fff;color:var(--pf-bg)}
a:focus-visible,button:focus-visible{outline:2px solid #fff;outline-offset:4px}
.word{position:absolute;left:0;right:0;bottom:0;z-index:1;display:flex;justify-content:center;font:400 min(33vw,56svh)/.82 Anton,Impact,'Arial Narrow',sans-serif;color:#f7f6f2;user-select:none;font-size:calc(min(33vw,56svh)*var(--wf,1));letter-spacing:-0.01em;pointer-events:none}
.word b{display:block;font-weight:400}
.char{position:absolute;left:50%;bottom:0;z-index:2;height:85svh;width:auto;max-width:96vw;object-fit:contain;object-position:bottom center;transform:translate(-50%,0);pointer-events:none;user-select:none;filter:drop-shadow(0 30px 40px rgba(0,0,0,.22))}
.meta,.side{position:absolute;z-index:4;top:clamp(90px,20svh,220px)}
.meta{left:clamp(20px,4vw,56px);font-weight:600;font-size:clamp(13px,1.05vw,16px);line-height:1.55;letter-spacing:.04em;text-transform:uppercase}
.meta h2{margin:0 0 12px;font:600 clamp(20px,2.1vw,32px)/1.05 Rajdhani,sans-serif;letter-spacing:.02em}
.meta p{margin:0;opacity:.88}
.meta a{color:#fff;font-weight:700;text-decoration:underline;text-underline-offset:3px}
.side{right:clamp(20px,4vw,56px);width:min(300px,26vw);font-weight:500;font-size:clamp(14px,1.1vw,17px);line-height:1.45}
.side p{margin:0}
.arrows{display:flex;gap:10px;margin-top:22px}
.arrows button{width:44px;height:44px;border-radius:50%;border:1.5px solid rgba(255,255,255,.75);background:transparent;color:#fff;cursor:pointer;display:grid;place-items:center;transition:background .25s,color .25s}
.arrows button:hover{background:#fff;color:var(--pf-bg)}
.arrows button[data-dir="-1"] svg{transform:rotate(180deg)}
.dots{position:fixed;right:18px;top:50%;transform:translateY(-50%);z-index:100;display:flex;flex-direction:column;gap:8px}
.dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.4);border:1.5px solid rgba(255,255,255,.6);transition:background .3s,transform .3s;cursor:pointer}
.dot.on{background:#fff;transform:scale(1.3)}
.ring{position:fixed;left:0;top:0;width:54px;height:54px;margin:-27px 0 0 -27px;border:1.5px solid #fff;border-radius:50%;pointer-events:none;z-index:99;opacity:0;transition:opacity .3s}
@media (hover:none){.ring{display:none}}
@media (max-width:760px){
.nav{padding:16px 16px}
.links a:not(.hire){display:none}
.meta{top:66px;left:16px;max-width:64%;font-size:12px}
.meta h2{font-size:22px;line-height:1.1;margin-bottom:5px}
.meta p{font-size:11px;line-height:1.4}
.side{top:66px;right:14px;width:auto}
.side p{display:none}
.arrows{margin-top:0}
.arrows button{width:40px;height:40px}
.word{font-size:calc(min(28vw,118px)*var(--wf,1));line-height:0.82}
.char{height:78svh;max-width:100vw}
.dots{right:10px}
}
@media (prefers-reduced-motion:reduce){*{transition-duration:.01ms!important}
.scroll-wrap{scroll-snap-type:none}}
</style>
</head>
<body>
<h1 class="sr">\${esc(pageTitle)}</h1>
<header class="nav" id="nav">
  <a class="brand" href="#sec-0"><i></i><span>\${esc(brandName)}</span></a>
  <nav class="links">
    <a href="\${esc(nav1Url)}">\${esc(nav1Text)}</a>
    <a href="\${esc(nav2Url)}">\${esc(nav2Text)}</a>
    <a class="hire" href="\${esc(hireHref)}">\${esc(hireLabel)}</a>
  </nav>
</header>
<div class="dots" id="dots"></div>
<div class="scroll-wrap" id="scroller"></div>
<div class="ring" id="ring"></div>
<script>
const S=\${sData};
const esc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const wf=w=>{const n=[...String(w)].length;return n>6?+(6/n).toFixed(3):1};
const arrow='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const scroller=document.getElementById('scroller');
const dotsEl=document.getElementById('dots');
const navEl=document.getElementById('nav');
S.forEach((s,i)=>{
  const sec=document.createElement('section');
  sec.className='pf-sec'; sec.id='sec-'+i;
  sec.style.cssText='background-color:'+s.bg+';--pf-bg:'+s.bg+';--wf:'+wf(s.word);
  const wordHtml=[...s.word].map((c,j)=>'<b style="--i:'+j+'">'+esc(c)+'</b>').join('');
  const L=s.links.filter(l=>l[0]);
  const metaHtml='<h2>'+s.title.filter(Boolean).map(esc).join('<br>')+'</h2>'+s.meta.filter(Boolean).map(m=>'<p>'+esc(m)+'</p>').join('')+(L.length?'<p>'+L.map(l=>'<a href="'+esc(l[1]||'#')+'">'+esc(l[0])+'</a>').join(', ')+'</p>':'');
  sec.innerHTML='<div class=\\"glow\\"></div><div class=\\"stage\\" id=\\"stage-'+i+'\\"><div class=\\"word\\" aria-hidden=\\"true\\">'+wordHtml+'</div><img class=\\"char\\" src=\\"'+esc(s.img)+'\\" alt=\\"'+esc(s.alt)+'\\" draggable=\\"false\\"></div><div class=\\"meta\\">'+metaHtml+'</div><div class=\\"side\\"><p>'+esc(s.desc)+'</p><div class=\\"arrows\\"><button data-dir=\\"-1\\" aria-label=\\"Previous\\">'+arrow+'</button><button data-dir=\\"1\\" aria-label=\\"Next\\">'+arrow+'</button></div></div>';
  scroller.appendChild(sec);
  const dot=document.createElement('div');
  dot.className='dot'+(i===0?' on':'');
  dot.onclick=()=>goTo(i);
  dotsEl.appendChild(dot);
});
const secs=[...scroller.querySelectorAll('.pf-sec')];
const dots=[...dotsEl.querySelectorAll('.dot')];
let cur=0,userTimer=null,autoTimer=null;
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
function goTo(n){n=((n%S.length)+S.length)%S.length;secs[n].scrollIntoView({behavior:'smooth',block:'start'});}
function updateNav(i){cur=i;dots.forEach((d,j)=>d.classList.toggle('on',j===i));navEl.style.setProperty('--pf-bg',S[i].bg);}
scroller.addEventListener('scroll',()=>{let best=0,bestD=Infinity;secs.forEach((s,i)=>{const d=Math.abs(s.offsetTop-scroller.scrollTop);if(d<bestD){bestD=d;best=i;}});if(best!==cur)updateNav(best);},{passive:true});
scroller.addEventListener('click',e=>{const b=e.target.closest('[data-dir]');if(!b)return;markUser();goTo(cur+ +b.dataset.dir);});
addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowRight'){markUser();goTo(cur+1);}if(e.key==='ArrowUp'||e.key==='ArrowLeft'){markUser();goTo(cur-1);}});
function markUser(){clearTimeout(userTimer);userTimer=setTimeout(()=>userTimer=null,8000);}
scroller.addEventListener('wheel',markUser,{passive:true});
scroller.addEventListener('touchstart',markUser,{passive:true});
secs.forEach((sec,i)=>{const stage=document.getElementById('stage-'+i);sec.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||i!==cur)return;const r=sec.getBoundingClientRect();const tx=((e.clientX-r.left)/r.width-.5)*7;const ty=-((e.clientY-r.top)/r.height-.5)*5;stage.style.transform='perspective(1400px) rotateX('+ty+'deg) rotateY('+tx+'deg)';});sec.addEventListener('pointerleave',()=>{stage.style.transform='perspective(1400px) rotateX(0deg) rotateY(0deg)';});});
const ring=document.getElementById('ring');let mx=0,my=0,rx=0,ry=0,seen=false;
addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;if(!seen){seen=true;rx=mx;ry=my;ring.style.opacity=0.7;}});
(function loop(){rx+=(mx-rx)*.16;ry+=(my-ry)*.16;ring.style.transform='translate('+rx+'px,'+ry+'px)';requestAnimationFrame(loop)})();
if(!reduce)autoTimer=setInterval(()=>{if(!userTimer)goTo(cur+1);},5500);
<\/script>
</body>
</html>\`;

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
  };`;

const before = src.slice(0, startIdx);
const after = src.slice(endIdx);
const result = before + newFn + after;

fs.writeFileSync(filePath, result, 'utf8');
console.log('Done. File length:', result.length);
console.log('New fn starts at:', startIdx, 'old end was:', endIdx);
