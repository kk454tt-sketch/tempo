import React, { useState, useRef, useCallback } from 'react';
import {
  PortfolioData,
  PortfolioCardData,
  PortfolioHireConfig,
  PortfolioNavConfig,
} from '@/types';
import {
  DEFAULT_PORTFOLIO_CARD_1,
  DEFAULT_PORTFOLIO_CARD_2,
  DEFAULT_CHARACTER_1_IMG,
  DEFAULT_CHARACTER_2_IMG,
  CHARACTER_1_PROMPT,
  CHARACTER_2_PROMPT,
  DEFAULT_PORTFOLIO_DATA,
} from '@/templates/components/portfolioAssets';

interface PortfolioEditSectionProps {
  portfolioData?: PortfolioData;
  onChangePortfolioData: (data: PortfolioData) => void;
  onToast: (msg: string) => void;
  title?: string;
  tagline?: string;
  note?: string;
  venue?: string;
  address?: string;
  date?: string;
  photos?: any[];
  onChangeTitle?: (t: string) => void;
  onChangeTagline?: (t: string) => void;
  onChangeNote?: (t: string) => void;
  onChangeVenue?: (t: string) => void;
  onChangeAddress?: (t: string) => void;
  onChangeDate?: (t: string) => void;
  onChangePhotos?: (p: any[]) => void;
}

// Helpers for Hire Me target calculation
const dg = (s?: string) => String(s || '').replace(/\D/g, '');
const handleSocial = (v: string | undefined, base: string, re: RegExp) => {
  const trimmed = String(v || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (re.test(trimmed)) return 'https://' + trimmed.replace(/^\/+/, '');
  return base + trimmed.replace(/^@/, '').replace(/^\/+/, '');
};

const computeHireTarget = (H: PortfolioHireConfig) => {
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

// Canvas 2D image processing with plain-background flood-fill removal & edge trimming
function floodBg(px: Uint8ClampedArray, w: number, ht: number, tol: number): boolean {
  const cs = [
    [0, 0],
    [w - 1, 0],
    [0, ht - 1],
    [w - 1, ht - 1],
  ].map(([x, y]) => {
    const i = (y * w + x) * 4;
    return [px[i], px[i + 1], px[i + 2]];
  });
  const bg = [0, 1, 2].map((k) => Math.round(cs.reduce((s, v) => s + v[k], 0) / 4));
  if (
    cs.some(
      (v) =>
        Math.max(
          Math.abs(v[0] - bg[0]),
          Math.abs(v[1] - bg[1]),
          Math.abs(v[2] - bg[2])
        ) > 40
    )
  ) {
    return false;
  }
  const dist = (i: number) =>
    Math.max(
      Math.abs(px[i] - bg[0]),
      Math.abs(px[i + 1] - bg[1]),
      Math.abs(px[i + 2] - bg[2])
    );
  const gone = new Uint8Array(w * ht);
  const st: number[] = [];
  const push = (x: number, y: number) => {
    const p = y * w + x;
    if (gone[p] || dist(p * 4) > tol) return;
    gone[p] = 1;
    st.push(p);
  };
  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, ht - 1);
  }
  for (let y = 0; y < ht; y++) {
    push(0, y);
    push(w - 1, y);
  }
  while (st.length) {
    const p = st.pop()!;
    const x = p % w;
    const y = (p / w) | 0;
    px[p * 4 + 3] = 0;
    if (x > 0) push(x - 1, y);
    if (x < w - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < ht - 1) push(x, y + 1);
  }
  for (let y = 1; y < ht - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x;
      if (gone[p] || !(gone[p - 1] || gone[p + 1] || gone[p - w] || gone[p + w])) continue;
      const d = dist(p * 4);
      if (d < tol * 2.2) {
        px[p * 4 + 3] = Math.round(
          255 * Math.max(0, Math.min(1, (d - tol) / (tol * 1.2)))
        );
      }
    }
  }
  return true;
}

const loadImg = (src: string): Promise<HTMLImageElement> =>
  new Promise((ok, no) => {
    const im = new Image();
    im.onload = () => ok(im);
    im.onerror = no;
    im.src = src;
  });

async function processImage(
  src: string,
  opt: { remove: boolean; tol: number }
): Promise<{ url: string; ar: number; opaque: boolean; removed: boolean; failed: boolean }> {
  const im = await loadImg(src);
  const k = Math.min(1, 1400 / Math.max(im.naturalWidth, im.naturalHeight));
  const w = Math.max(1, Math.round(im.naturalWidth * k));
  const ht = Math.max(1, Math.round(im.naturalHeight * k));

  let cv = document.createElement('canvas');
  cv.width = w;
  cv.height = ht;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  if (!cx) throw new Error('canvas context failed');
  cx.drawImage(im, 0, 0, w, ht);

  const d = cx.getImageData(0, 0, w, ht);
  const px = d.data;
  const corners = [
    [0, 0],
    [w - 1, 0],
    [0, ht - 1],
    [w - 1, ht - 1],
  ];
  const solid = () => corners.every(([x, y]) => px[(y * w + x) * 4 + 3] > 245);

  let removed = false;
  let failed = false;
  if (opt.remove && solid()) {
    removed = floodBg(px, w, ht, Math.max(4, opt.tol));
    failed = !removed;
    if (removed) cx.putImageData(d, 0, 0);
  }
  const opaque = solid();

  let x0 = w;
  let y0 = ht;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < ht; y++) {
    for (let x = 0; x < w; x++) {
      if (px[(y * w + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) throw new Error('empty image');

  const cw = x1 - x0 + 1;
  const ch = y1 - y0 + 1;
  if (cw < w || ch < ht) {
    const c2 = document.createElement('canvas');
    c2.width = cw;
    c2.height = ch;
    c2.getContext('2d')?.drawImage(cv, x0, y0, cw, ch, 0, 0, cw, ch);
    cv = c2;
  }

  let out = '';
  let q = 0.92;
  let sc = 1;
  for (let n = 0; n < 4; n++) {
    let tc = cv;
    if (sc < 1) {
      tc = document.createElement('canvas');
      tc.width = Math.round(cv.width * sc);
      tc.height = Math.round(cv.height * sc);
      tc.getContext('2d')?.drawImage(cv, 0, 0, tc.width, tc.height);
    }
    out = tc.toDataURL('image/webp', q);
    if (out.indexOf('data:image/webp') !== 0) out = tc.toDataURL('image/png');
    if (out.length < 1.6e6) break;
    sc *= 0.8;
    q = 0.85;
  }
  return { url: out, ar: cv.width / cv.height, opaque, removed, failed };
}

export const PortfolioEditSection: React.FC<PortfolioEditSectionProps> = ({
  portfolioData,
  onChangePortfolioData,
  onToast,
}) => {
  // Tabs: 0: Slide 1, 1: Slide 2, 2: Contact & Menu
  const [activeTab, setActiveTab] = useState<number>(0);

  // File upload input refs
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  // Prompt copy feedback states
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null);

  // Raw uploaded source images stored for live tolerance re-processing
  const [rawUp1, setRawUp1] = useState<{ src: string; remove: boolean; tol: number } | null>(null);
  const [rawUp2, setRawUp2] = useState<{ src: string; remove: boolean; tol: number } | null>(null);

  // Status messages for image upload
  const [uploadMsg1, setUploadMsg1] = useState<{ text: string; ok: boolean } | null>(null);
  const [uploadMsg2, setUploadMsg2] = useState<{ text: string; ok: boolean } | null>(null);

  // Data hydration
  const safeData: PortfolioData = portfolioData || DEFAULT_PORTFOLIO_DATA;
  const card1: PortfolioCardData = safeData.card1 || DEFAULT_PORTFOLIO_CARD_1;
  const card2: PortfolioCardData = safeData.card2 || DEFAULT_PORTFOLIO_CARD_2;
  const hireConfig: PortfolioHireConfig = safeData.hire || DEFAULT_PORTFOLIO_DATA.hire!;
  const navConfig: PortfolioNavConfig = safeData.nav || DEFAULT_PORTFOLIO_DATA.nav!;

  // Switch tab and sync activeCardIndex for live preview
  const handleSelectTab = (idx: number) => {
    setActiveTab(idx);
    if (idx === 0 || idx === 1) {
      onChangePortfolioData({
        ...safeData,
        activeCardIndex: idx,
      });
    }
  };

  // Card update helper
  const updateCard = (cardIndex: 0 | 1, fields: Partial<PortfolioCardData>) => {
    if (cardIndex === 0) {
      const updated = { ...card1, ...fields };
      onChangePortfolioData({
        ...safeData,
        card1: updated,
        activeCardIndex: 0,
      });
    } else {
      const updated = { ...card2, ...fields };
      onChangePortfolioData({
        ...safeData,
        card2: updated,
        activeCardIndex: 1,
      });
    }
  };

  // Site-wide updates (hire, nav, brand, title)
  const updateSite = (fields: Partial<PortfolioData>) => {
    onChangePortfolioData({
      ...safeData,
      ...fields,
    });
  };

  // Handle image upload and run processImage
  const handleImageFile = async (
    file: File | undefined,
    cardIdx: 0 | 1
  ) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const src = e.target?.result as string;
      if (!src) return;
      const initialSetting = { src, remove: true, tol: 32 };
      if (cardIdx === 0) setRawUp1(initialSetting);
      else setRawUp2(initialSetting);

      const msgSetter = cardIdx === 0 ? setUploadMsg1 : setUploadMsg2;
      msgSetter({ text: 'Processing image...', ok: true });

      try {
        const res = await processImage(src, { remove: true, tol: 32 });
        updateCard(cardIdx, {
          characterImage: res.url,
          characterAr: res.ar,
        });

        if (res.removed) {
          msgSetter({
            text: 'Image updated. Plain background removed automatically - check edges and adjust strength if needed.',
            ok: true,
          });
        } else if (res.failed) {
          msgSetter({
            text: 'Image updated, but could not detect a plain background. Ask ChatGPT for a transparent PNG.',
            ok: false,
          });
        } else if (res.opaque) {
          msgSetter({
            text: 'Image updated, but has a solid background. Tick "Remove plain background" below.',
            ok: false,
          });
        } else {
          msgSetter({
            text: 'Image updated. Transparent background detected.',
            ok: true,
          });
        }
        onToast(`Card ${cardIdx + 1} character image updated`);
      } catch (err) {
        msgSetter({
          text: 'Could not process that image. Try a PNG or WEBP file.',
          ok: false,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Re-run background removal when tolerance or toggle changes
  const rerunProcess = useCallback(
    async (cardIdx: 0 | 1, updatedRaw: { src: string; remove: boolean; tol: number }) => {
      const msgSetter = cardIdx === 0 ? setUploadMsg1 : setUploadMsg2;
      try {
        const res = await processImage(updatedRaw.src, {
          remove: updatedRaw.remove,
          tol: updatedRaw.tol,
        });
        updateCard(cardIdx, {
          characterImage: res.url,
          characterAr: res.ar,
        });
        if (res.removed) {
          msgSetter({
            text: 'Updated with new background removal strength.',
            ok: true,
          });
        } else {
          msgSetter({
            text: res.opaque
              ? 'Solid background present.'
              : 'Transparent background detected.',
            ok: true,
          });
        }
      } catch {
        msgSetter({ text: 'Error reprocessing image.', ok: false });
      }
    },
    [card1, card2, safeData]
  );

  // Restore default original base64 avatar
  const handleRestoreOriginal = (cardIdx: 0 | 1) => {
    if (cardIdx === 0) {
      setRawUp1(null);
      setUploadMsg1({ text: 'Original image restored.', ok: true });
      updateCard(0, {
        characterImage: DEFAULT_CHARACTER_1_IMG,
        characterAr: 1.083,
      });
    } else {
      setRawUp2(null);
      setUploadMsg2({ text: 'Original image restored.', ok: true });
      updateCard(1, {
        characterImage: DEFAULT_CHARACTER_2_IMG,
        characterAr: 0.675,
      });
    }
    onToast(`Original Card ${cardIdx + 1} character restored.`);
  };

  // Download reference image file
  const handleDownloadReference = (cardIdx: 0 | 1) => {
    const url = cardIdx === 0 ? DEFAULT_CHARACTER_1_IMG : DEFAULT_CHARACTER_2_IMG;
    const link = document.createElement('a');
    link.href = url;
    link.download = `character-${cardIdx + 1}-reference.webp`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    onToast(`Downloading character-${cardIdx + 1}-reference.webp`);
  };

  // Copy prompt to clipboard
  const handleCopyPrompt = async (promptText: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedPromptIndex(idx);
      onToast(`Copied Character ${idx + 1} prompt to clipboard!`);
      setTimeout(() => setCopiedPromptIndex(null), 1500);
    } catch {
      onToast('Could not copy automatically. Please select and copy manually.');
    }
  };

  // Reset prompt to default
  const handleResetPrompt = (cardIdx: 0 | 1) => {
    const defaultPrompt = cardIdx === 0 ? CHARACTER_1_PROMPT : CHARACTER_2_PROMPT;
    updateCard(cardIdx, { prompt: defaultPrompt });
    onToast(`Character ${cardIdx + 1} prompt reset to default.`);
  };

  // Hire target calculation for Contact & Menu
  const liveHireTarget = computeHireTarget(hireConfig);

  // WhatsApp Country Code Warning Hint
  const waDigits = dg(hireConfig.whatsapp).length;
  const isWaWarning = waDigits > 0 && waDigits <= 10;

  return (
    <div className="w-full text-[#f2f2f4] space-y-3 font-sans text-sm">
      {/* Tab Navigation matching reference HTML edit panel */}
      <div className="flex gap-1.5 p-1 bg-[#141417] border border-[#2b2b31] rounded-2xl overflow-x-auto">
        <button
          type="button"
          onClick={() => handleSelectTab(0)}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
            activeTab === 0
              ? 'bg-[#f2f2f4] text-[#141417] shadow-sm'
              : 'text-[#8f8f99] hover:text-[#f2f2f4] hover:bg-[#1e1e23]'
          }`}
        >
          Slide 1
        </button>

        <button
          type="button"
          onClick={() => handleSelectTab(1)}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
            activeTab === 1
              ? 'bg-[#f2f2f4] text-[#141417] shadow-sm'
              : 'text-[#8f8f99] hover:text-[#f2f2f4] hover:bg-[#1e1e23]'
          }`}
        >
          Slide 2
        </button>

        <button
          type="button"
          onClick={() => handleSelectTab(2)}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
            activeTab === 2
              ? 'bg-[#f2f2f4] text-[#141417] shadow-sm'
              : 'text-[#8f8f99] hover:text-[#f2f2f4] hover:bg-[#1e1e23]'
          }`}
        >
          Contact & Menu
        </button>
      </div>

      {/* ======================= SLIDE 1 & SLIDE 2 TABS ======================= */}
      {(activeTab === 0 || activeTab === 1) && (() => {
        const i = activeTab as 0 | 1;
        const currentCard = i === 0 ? card1 : card2;
        const currentPrompt = currentCard.prompt || (i === 0 ? CHARACTER_1_PROMPT : CHARACTER_2_PROMPT);
        const rawUp = i === 0 ? rawUp1 : rawUp2;
        const uploadMsg = i === 0 ? uploadMsg1 : uploadMsg2;
        const fileInputRef = i === 0 ? fileInputRef1 : fileInputRef2;

        const rawWord = currentCard.word || (currentCard.name ? currentCard.name.trim().split(/\s+/)[0] : '') || (i === 0 ? 'LAUNCH' : 'CODING');
        const displayWord = rawWord.toUpperCase().replace(/\s+/g, '');

        const titleLine1 = currentCard.titleLines?.[0] || (currentCard.role ? currentCard.role.split('\n')[0] : '') || (i === 0 ? 'Full-stack' : 'Creative');
        const titleLine2 = currentCard.titleLines?.[1] || (currentCard.role && currentCard.role.includes('\n') ? currentCard.role.split('\n')[1] : '') || (i === 0 ? 'web developer' : 'frontend developer');

        const metaLine1 = currentCard.metaLines?.[0] || (i === 0 ? 'Available: Nov 2026' : 'Focus: Motion, 3D, UI systems');
        const metaLine2 = currentCard.metaLines?.[1] || (currentCard.stack && currentCard.stack.length > 0 ? `Stack: ${currentCard.stack.slice(0, 3).join(', ')}` : (i === 0 ? 'Stack: React, Node, Postgres' : 'Stack: TypeScript, Three.js, GSAP'));

        const link1Text = currentCard.links?.[0]?.text ?? (i === 0 ? 'GitHub' : 'Projects');
        const link1Url = currentCard.links?.[0]?.url ?? (currentCard.githubProfileLink || currentCard.githubProjectLink || 'https://github.com/');

        const link2Text = currentCard.links?.[1]?.text ?? (i === 0 ? 'Resume' : 'Contact');
        const link2Url = currentCard.links?.[1]?.url ?? (currentCard.resumeLink || (currentCard.phone ? `tel:${currentCard.phone}` : '#hero'));

        return (
          <div className="space-y-3">
            {/* 1. Character Image Section */}
            <details className="bg-[#18181c] border border-[#2b2b31] rounded-xl overflow-hidden group" open>
              <summary className="p-3 font-semibold text-sm cursor-pointer select-none flex items-center justify-between text-[#f2f2f4] bg-[#1a1a1f] border-b border-[#2b2b31]/60">
                <span>Character image</span>
                <span className="material-symbols-outlined text-[18px] text-[#8f8f99] transition-transform group-open:rotate-180">
                  expand_more
                </span>
              </summary>

              <div className="p-3 space-y-3">
                {/* Checkerboard thumbnail preview */}
                <div
                  className="h-40 rounded-xl border border-[#34343b] flex items-center justify-center overflow-hidden"
                  style={{
                    background:
                      'conic-gradient(#2c2c32 25%, #222227 0 50%, #2c2c32 0 75%, #222227 0) 0 0/16px 16px',
                  }}
                >
                  <img
                    src={currentCard.characterImage || (i === 0 ? DEFAULT_CHARACTER_1_IMG : DEFAULT_CHARACTER_2_IMG)}
                    alt={currentCard.characterAlt || ''}
                    className="max-h-40 max-w-full object-contain filter drop-shadow(0 10px 15px rgba(0,0,0,0.5))"
                  />
                </div>

                {/* Upload Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageFile(file, i);
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2 px-3 rounded-xl bg-[#f2f2f4] hover:bg-white text-[#141417] font-bold text-xs transition-colors cursor-pointer text-center"
                  >
                    Upload image
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRestoreOriginal(i)}
                    className="py-2 px-3 rounded-xl bg-[#1e1e23] hover:bg-[#26262d] text-[#f2f2f4] border border-[#34343b] text-xs font-medium transition-colors cursor-pointer text-center"
                  >
                    Use original
                  </button>
                </div>

                {/* Status message */}
                {uploadMsg && (
                  <div
                    className={`p-2.5 rounded-xl text-xs leading-relaxed border ${
                      uploadMsg.ok
                        ? 'bg-[#14261a] border-[#1f4a2d] text-[#9be0b0]'
                        : 'bg-[#2a2412] border-[#5a4a16] text-[#f0d98a]'
                    }`}
                  >
                    {uploadMsg.text}
                  </div>
                )}

                {/* Background removal controls (available if uploaded or toggled) */}
                {rawUp && (
                  <div className="p-3 bg-[#1e1e23] rounded-xl border border-[#34343b] space-y-2.5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#f2f2f4]">
                      <input
                        type="checkbox"
                        checked={rawUp.remove}
                        onChange={(e) => {
                          const updated = { ...rawUp, remove: e.target.checked };
                          if (i === 0) setRawUp1(updated);
                          else setRawUp2(updated);
                          rerunProcess(i, updated);
                        }}
                        className="rounded border-[#34343b] bg-[#141417] text-white focus:ring-0"
                      />
                      <span>Remove plain background</span>
                    </label>

                    {rawUp.remove && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-[#8f8f99]">
                          <span>Background removal strength</span>
                          <span className="font-mono">{rawUp.tol}</span>
                        </div>
                        <input
                          type="range"
                          min={6}
                          max={90}
                          value={rawUp.tol}
                          onChange={(e) => {
                            const newTol = Number(e.target.value);
                            const updated = { ...rawUp, tol: newTol };
                            if (i === 0) setRawUp1(updated);
                            else setRawUp2(updated);
                            rerunProcess(i, updated);
                          }}
                          className="w-full accent-white h-1.5 bg-[#141417] rounded-lg cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Alt Text */}
                <div className="space-y-1">
                  <label className="block text-xs text-[#a2a2ad]">
                    Image description (alt text)
                  </label>
                  <input
                    type="text"
                    value={currentCard.characterAlt || ''}
                    onChange={(e) => updateCard(i, { characterAlt: e.target.value })}
                    placeholder="3D figurine description..."
                    className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs focus:border-[#8d8d99] outline-none"
                  />
                </div>
              </div>
            </details>

            {/* 2. AI Image Prompt (ChatGPT) Section */}
            <details className="bg-[#18181c] border border-[#2b2b31] rounded-xl overflow-hidden group" open>
              <summary className="p-3 font-semibold text-sm cursor-pointer select-none flex items-center justify-between text-[#f2f2f4] bg-[#1a1a1f] border-b border-[#2b2b31]/60">
                <span>AI image prompt (ChatGPT) - Character {i + 1}</span>
                <span className="material-symbols-outlined text-[18px] text-[#8f8f99] transition-transform group-open:rotate-180">
                  expand_more
                </span>
              </summary>

              <div className="p-3 space-y-3">
                {/* 4-Step instructions list */}
                <ol className="list-decimal list-inside space-y-1 text-xs text-[#c9c9d1] bg-[#0f0f12] p-2.5 rounded-xl border border-[#2b2b31]">
                  <li>Download the reference image.</li>
                  <li>Copy the prompt.</li>
                  <li>In ChatGPT attach the reference image and your own photo, then paste the prompt.</li>
                  <li>Download the PNG it creates and upload it above.</li>
                </ol>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadReference(i)}
                    className="py-2 px-3 rounded-xl bg-[#1e1e23] hover:bg-[#26262d] text-[#f2f2f4] border border-[#34343b] text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[15px]">download</span>
                    <span>Download reference</span>
                  </button>

                  <a
                    href="https://chatgpt.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-[#1e1e23] hover:bg-[#26262d] text-[#f2f2f4] border border-[#34343b] text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Open ChatGPT</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                </div>

                {/* Prompt Textarea */}
                <div className="space-y-1">
                  <label className="block text-xs text-[#a2a2ad]">Prompt (you can edit it)</label>
                  <textarea
                    rows={7}
                    value={currentPrompt}
                    onChange={(e) => updateCard(i, { prompt: e.target.value })}
                    spellCheck={false}
                    className="w-full p-2.5 rounded-xl bg-[#1e1e23] border border-[#34343b] text-xs text-white/90 font-mono leading-relaxed focus:border-[#8d8d99] outline-none resize-y"
                  />
                </div>

                {/* Copy & Reset Prompt */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(currentPrompt, i)}
                    className="py-2 px-3 rounded-xl bg-[#f2f2f4] hover:bg-white text-[#141417] text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {copiedPromptIndex === i ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedPromptIndex === i ? 'Copied' : 'Copy prompt'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleResetPrompt(i)}
                    className="py-2 px-3 rounded-xl bg-[#1e1e23] hover:bg-[#26262d] text-[#f2f2f4] border border-[#34343b] text-xs font-medium transition-colors cursor-pointer text-center"
                  >
                    Reset prompt
                  </button>
                </div>
              </div>
            </details>

            {/* 3. Headline and Colour Section */}
            <details className="bg-[#18181c] border border-[#2b2b31] rounded-xl overflow-hidden group" open>
              <summary className="p-3 font-semibold text-sm cursor-pointer select-none flex items-center justify-between text-[#f2f2f4] bg-[#1a1a1f] border-b border-[#2b2b31]/60">
                <span>Headline and colour</span>
                <span className="material-symbols-outlined text-[18px] text-[#8f8f99] transition-transform group-open:rotate-180">
                  expand_more
                </span>
              </summary>

              <div className="p-3 space-y-3">
                {/* Big Headline Word */}
                <div className="space-y-1">
                  <label className="block text-xs text-[#a2a2ad]">Big headline word</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={displayWord}
                    onChange={(e) => {
                      const clean = e.target.value.toUpperCase().replace(/\s+/g, '');
                      updateCard(i, { word: clean });
                    }}
                    placeholder={i === 0 ? 'LAUNCH' : 'CODING'}
                    className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs font-mono uppercase tracking-wider focus:border-[#8d8d99] outline-none"
                  />
                  <small className="block text-[11px] text-[#8f8f99]">
                    No spaces, up to 10 letters. 4 to 6 letters look best. Font auto-scales!
                  </small>
                </div>

                {/* Background Colour Swatch + Hex Input */}
                <div className="space-y-1">
                  <label className="block text-xs text-[#a2a2ad]">Background colour</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      aria-label="Pick background colour"
                      value={currentCard.bgColor || (i === 0 ? '#c4701e' : '#2e7d32')}
                      onChange={(e) => updateCard(i, { bgColor: e.target.value.toLowerCase() })}
                      className="w-12 h-10 p-1 rounded-xl bg-[#1e1e23] border border-[#34343b] cursor-pointer flex-shrink-0"
                    />
                    <input
                      type="text"
                      maxLength={7}
                      aria-label="Background colour hex"
                      value={currentCard.bgColor || (i === 0 ? '#c4701e' : '#2e7d32')}
                      onChange={(e) => {
                        let v = e.target.value.trim();
                        if (v && v[0] !== '#') v = '#' + v;
                        if (/^#[0-9a-f]{6}$/i.test(v)) {
                          updateCard(i, { bgColor: v.toLowerCase() });
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white font-mono text-xs focus:border-[#8d8d99] outline-none"
                    />
                  </div>
                </div>
              </div>
            </details>

            {/* 4. Text Content Section */}
            <details className="bg-[#18181c] border border-[#2b2b31] rounded-xl overflow-hidden group" open>
              <summary className="p-3 font-semibold text-sm cursor-pointer select-none flex items-center justify-between text-[#f2f2f4] bg-[#1a1a1f] border-b border-[#2b2b31]/60">
                <span>Text</span>
                <span className="material-symbols-outlined text-[18px] text-[#8f8f99] transition-transform group-open:rotate-180">
                  expand_more
                </span>
              </summary>

              <div className="p-3 space-y-3">
                {/* Title Line 1 and 2 */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-xs text-[#a2a2ad]">Title line 1</label>
                    <input
                      type="text"
                      value={titleLine1}
                      onChange={(e) => {
                        const newTitle: [string, string] = [e.target.value, titleLine2];
                        updateCard(i, {
                          titleLines: newTitle,
                          role: newTitle.filter(Boolean).join('\n'),
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs focus:border-[#8d8d99] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs text-[#a2a2ad]">Title line 2</label>
                    <input
                      type="text"
                      value={titleLine2}
                      onChange={(e) => {
                        const newTitle: [string, string] = [titleLine1, e.target.value];
                        updateCard(i, {
                          titleLines: newTitle,
                          role: newTitle.filter(Boolean).join('\n'),
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs focus:border-[#8d8d99] outline-none"
                    />
                  </div>
                </div>

                {/* Info Line 1 and 2 */}
                <div className="space-y-1">
                  <label className="block text-xs text-[#a2a2ad]">Info line 1</label>
                  <input
                    type="text"
                    value={metaLine1}
                    onChange={(e) => {
                      const newMeta: [string, string] = [e.target.value, metaLine2];
                      updateCard(i, { metaLines: newMeta });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs focus:border-[#8d8d99] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs text-[#a2a2ad]">Info line 2</label>
                  <input
                    type="text"
                    value={metaLine2}
                    onChange={(e) => {
                      const newMeta: [string, string] = [metaLine1, e.target.value];
                      updateCard(i, { metaLines: newMeta });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs focus:border-[#8d8d99] outline-none"
                  />
                </div>

                {/* Description (Right side) */}
                <div className="space-y-1">
                  <label className="block text-xs text-[#a2a2ad]">Description (right side)</label>
                  <textarea
                    rows={4}
                    value={currentCard.sideText || ''}
                    onChange={(e) => updateCard(i, { sideText: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs leading-relaxed focus:border-[#8d8d99] outline-none resize-y"
                  />
                </div>

                {/* Link 1 text & URL */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-xs text-[#a2a2ad]">Link 1 text</label>
                    <input
                      type="text"
                      value={link1Text}
                      onChange={(e) => {
                        const newLinks = [
                          { text: e.target.value, url: link1Url },
                          { text: link2Text, url: link2Url },
                        ];
                        updateCard(i, {
                          links: newLinks,
                          githubProfileLink: i === 0 ? link1Url : currentCard.githubProfileLink,
                          githubProjectLink: i === 1 ? link1Url : currentCard.githubProjectLink,
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs focus:border-[#8d8d99] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs text-[#a2a2ad]">Link 1 URL</label>
                    <input
                      type="text"
                      value={link1Url}
                      onChange={(e) => {
                        const newLinks = [
                          { text: link1Text, url: e.target.value },
                          { text: link2Text, url: link2Url },
                        ];
                        updateCard(i, {
                          links: newLinks,
                          githubProfileLink: i === 0 ? e.target.value : currentCard.githubProfileLink,
                          githubProjectLink: i === 1 ? e.target.value : currentCard.githubProjectLink,
                        });
                      }}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs focus:border-[#8d8d99] outline-none"
                    />
                  </div>
                </div>

                {/* Link 2 text & URL */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-xs text-[#a2a2ad]">Link 2 text</label>
                    <input
                      type="text"
                      value={link2Text}
                      onChange={(e) => {
                        const newLinks = [
                          { text: link1Text, url: link1Url },
                          { text: e.target.value, url: link2Url },
                        ];
                        updateCard(i, {
                          links: newLinks,
                          resumeLink: i === 0 ? link2Url : currentCard.resumeLink,
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs focus:border-[#8d8d99] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs text-[#a2a2ad]">Link 2 URL</label>
                    <input
                      type="text"
                      value={link2Url}
                      onChange={(e) => {
                        const newLinks = [
                          { text: link1Text, url: link1Url },
                          { text: link2Text, url: e.target.value },
                        ];
                        updateCard(i, {
                          links: newLinks,
                          resumeLink: i === 0 ? e.target.value : currentCard.resumeLink,
                        });
                      }}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs focus:border-[#8d8d99] outline-none"
                    />
                  </div>
                </div>
              </div>
            </details>
          </div>
        );
      })()}

      {/* ======================= CONTACT & MENU TAB ======================= */}
      {activeTab === 2 && (
        <div className="space-y-3">
          {/* Hire Me Button Section */}
          <details className="bg-[#18181c] border border-[#2b2b31] rounded-xl overflow-hidden group" open>
            <summary className="p-3 font-semibold text-sm cursor-pointer select-none flex items-center justify-between text-[#f2f2f4] bg-[#1a1a1f] border-b border-[#2b2b31]/60">
              <span>Hire me button</span>
              <span className="material-symbols-outlined text-[18px] text-[#8f8f99] transition-transform group-open:rotate-180">
                expand_more
              </span>
            </summary>

            <div className="p-3 space-y-3">
              {/* Button Text */}
              <div className="space-y-1">
                <label className="block text-xs text-[#a2a2ad]">Button text</label>
                <input
                  type="text"
                  value={hireConfig.label || 'Hire me'}
                  onChange={(e) =>
                    updateSite({
                      hire: { ...hireConfig, label: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs focus:border-[#8d8d99] outline-none"
                />
              </div>

              {/* Action Mode Selector */}
              <div className="space-y-1">
                <label className="block text-xs text-[#a2a2ad]">When someone clicks it, open</label>
                <select
                  value={hireConfig.mode || 'whatsapp'}
                  onChange={(e) =>
                    updateSite({
                      hire: {
                        ...hireConfig,
                        mode: e.target.value as any,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs focus:border-[#8d8d99] outline-none cursor-pointer"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="phone">Phone call</option>
                  <option value="email">Email</option>
                  <option value="telegram">Telegram</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="custom">Custom link</option>
                </select>
              </div>

              {/* Mode: WhatsApp */}
              {hireConfig.mode === 'whatsapp' && (
                <div className="space-y-3 p-3 bg-[#141417] rounded-xl border border-[#2b2b31]">
                  <div className="space-y-1">
                    <label className="block text-xs text-[#a2a2ad]">WhatsApp number</label>
                    <input
                      type="tel"
                      value={hireConfig.whatsapp || ''}
                      onChange={(e) =>
                        updateSite({
                          hire: { ...hireConfig, whatsapp: e.target.value },
                        })
                      }
                      placeholder="919876543210"
                      className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs font-mono focus:border-[#8d8d99] outline-none"
                    />
                    <small
                      className={`block text-[11px] ${
                        isWaWarning ? 'text-amber-400 font-medium' : 'text-[#8f8f99]'
                      }`}
                    >
                      {isWaWarning
                        ? 'Looks like the country code is missing. Add it before the number.'
                        : 'Country code first, no + or 0. Example: 919876543210'}
                    </small>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs text-[#a2a2ad]">Message that is pre-filled</label>
                    <textarea
                      rows={3}
                      value={hireConfig.waText || ''}
                      onChange={(e) =>
                        updateSite({
                          hire: { ...hireConfig, waText: e.target.value },
                        })
                      }
                      placeholder="Hi! I saw your portfolio and would like to talk about a project."
                      className="w-full p-2.5 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs focus:border-[#8d8d99] outline-none resize-y"
                    />
                  </div>
                </div>
              )}

              {/* Mode: Phone */}
              {hireConfig.mode === 'phone' && (
                <div className="space-y-1 p-3 bg-[#141417] rounded-xl border border-[#2b2b31]">
                  <label className="block text-xs text-[#a2a2ad]">Phone number</label>
                  <input
                    type="tel"
                    value={hireConfig.phone || ''}
                    onChange={(e) =>
                      updateSite({
                        hire: { ...hireConfig, phone: e.target.value },
                      })
                    }
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs font-mono focus:border-[#8d8d99] outline-none"
                  />
                  <small className="block text-[11px] text-[#8f8f99]">
                    Opens the phone dialer.
                  </small>
                </div>
              )}

              {/* Mode: Email */}
              {hireConfig.mode === 'email' && (
                <div className="space-y-3 p-3 bg-[#141417] rounded-xl border border-[#2b2b31]">
                  <div className="space-y-1">
                    <label className="block text-xs text-[#a2a2ad]">Email address</label>
                    <input
                      type="email"
                      value={hireConfig.email || ''}
                      onChange={(e) =>
                        updateSite({
                          hire: { ...hireConfig, email: e.target.value },
                        })
                      }
                      placeholder="you@example.com"
                      className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs focus:border-[#8d8d99] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs text-[#a2a2ad]">Subject</label>
                    <input
                      type="text"
                      value={hireConfig.subject || ''}
                      onChange={(e) =>
                        updateSite({
                          hire: { ...hireConfig, subject: e.target.value },
                        })
                      }
                      placeholder="Let's work together"
                      className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs focus:border-[#8d8d99] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Mode: Telegram */}
              {hireConfig.mode === 'telegram' && (
                <div className="space-y-1 p-3 bg-[#141417] rounded-xl border border-[#2b2b31]">
                  <label className="block text-xs text-[#a2a2ad]">Telegram username</label>
                  <input
                    type="text"
                    value={hireConfig.telegram || ''}
                    onChange={(e) =>
                      updateSite({
                        hire: { ...hireConfig, telegram: e.target.value },
                      })
                    }
                    placeholder="@username"
                    className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs focus:border-[#8d8d99] outline-none"
                  />
                </div>
              )}

              {/* Mode: Instagram */}
              {hireConfig.mode === 'instagram' && (
                <div className="space-y-1 p-3 bg-[#141417] rounded-xl border border-[#2b2b31]">
                  <label className="block text-xs text-[#a2a2ad]">Instagram username</label>
                  <input
                    type="text"
                    value={hireConfig.instagram || ''}
                    onChange={(e) =>
                      updateSite({
                        hire: { ...hireConfig, instagram: e.target.value },
                      })
                    }
                    placeholder="@username"
                    className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs focus:border-[#8d8d99] outline-none"
                  />
                </div>
              )}

              {/* Mode: LinkedIn */}
              {hireConfig.mode === 'linkedin' && (
                <div className="space-y-1 p-3 bg-[#141417] rounded-xl border border-[#2b2b31]">
                  <label className="block text-xs text-[#a2a2ad]">
                    LinkedIn profile (username or full link)
                  </label>
                  <input
                    type="text"
                    value={hireConfig.linkedin || ''}
                    onChange={(e) =>
                      updateSite({
                        hire: { ...hireConfig, linkedin: e.target.value },
                      })
                    }
                    placeholder="your-name"
                    className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs focus:border-[#8d8d99] outline-none"
                  />
                </div>
              )}

              {/* Mode: Custom */}
              {hireConfig.mode === 'custom' && (
                <div className="space-y-1 p-3 bg-[#141417] rounded-xl border border-[#2b2b31]">
                  <label className="block text-xs text-[#a2a2ad]">Any link</label>
                  <input
                    type="text"
                    value={hireConfig.custom || ''}
                    onChange={(e) =>
                      updateSite({
                        hire: { ...hireConfig, custom: e.target.value },
                      })
                    }
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs focus:border-[#8d8d99] outline-none"
                  />
                </div>
              )}

              {/* Calculated link preview badge */}
              <div className="space-y-2">
                <code className="block p-2.5 rounded-xl bg-[#0f0f12] border border-[#2b2b31] font-mono text-[11px] text-[#c9c9d1] break-all">
                  {liveHireTarget.fallback
                    ? 'Nothing entered yet, so it still opens: '
                    : 'Opens: '}
                  {liveHireTarget.href}
                </code>

                <a
                  href={liveHireTarget.href}
                  target={liveHireTarget.ext ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="block w-full py-2.5 px-3 rounded-xl bg-[#1e1e23] hover:bg-[#2a2a31] text-[#f2f2f4] border border-[#34343b] text-xs font-bold text-center transition-colors cursor-pointer"
                >
                  Test the button
                </a>
              </div>
            </div>
          </details>

          {/* Top Menu Section */}
          <details className="bg-[#18181c] border border-[#2b2b31] rounded-xl overflow-hidden group" open>
            <summary className="p-3 font-semibold text-sm cursor-pointer select-none flex items-center justify-between text-[#f2f2f4] bg-[#1a1a1f] border-b border-[#2b2b31]/60">
              <span>Top menu</span>
              <span className="material-symbols-outlined text-[18px] text-[#8f8f99] transition-transform group-open:rotate-180">
                expand_more
              </span>
            </summary>

            <div className="p-3 space-y-3">
              {/* Brand Name */}
              <div className="space-y-1">
                <label className="block text-xs text-[#a2a2ad]">Name next to the logo dot</label>
                <input
                  type="text"
                  value={safeData.brand || safeData.creatorName || 'Your Name'}
                  onChange={(e) =>
                    updateSite({
                      brand: e.target.value,
                      creatorName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs focus:border-[#8d8d99] outline-none"
                />
              </div>

              {/* Menu link 1 text & URL */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs text-[#a2a2ad]">Menu link 1 text</label>
                  <input
                    type="text"
                    value={navConfig.l1}
                    onChange={(e) =>
                      updateSite({
                        nav: { ...navConfig, l1: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs focus:border-[#8d8d99] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-[#a2a2ad]">Menu link 1 URL</label>
                  <input
                    type="text"
                    value={navConfig.u1}
                    onChange={(e) =>
                      updateSite({
                        nav: { ...navConfig, u1: e.target.value },
                      })
                    }
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs focus:border-[#8d8d99] outline-none"
                  />
                </div>
              </div>

              {/* Menu link 2 text & URL */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs text-[#a2a2ad]">Menu link 2 text</label>
                  <input
                    type="text"
                    value={navConfig.l2}
                    onChange={(e) =>
                      updateSite({
                        nav: { ...navConfig, l2: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs focus:border-[#8d8d99] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-[#a2a2ad]">Menu link 2 URL</label>
                  <input
                    type="text"
                    value={navConfig.u2}
                    onChange={(e) =>
                      updateSite({
                        nav: { ...navConfig, u2: e.target.value },
                      })
                    }
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs focus:border-[#8d8d99] outline-none"
                  />
                </div>
              </div>
            </div>
          </details>

          {/* Browser Tab Section */}
          <details className="bg-[#18181c] border border-[#2b2b31] rounded-xl overflow-hidden group" open>
            <summary className="p-3 font-semibold text-sm cursor-pointer select-none flex items-center justify-between text-[#f2f2f4] bg-[#1a1a1f] border-b border-[#2b2b31]/60">
              <span>Browser tab</span>
              <span className="material-symbols-outlined text-[18px] text-[#8f8f99] transition-transform group-open:rotate-180">
                expand_more
              </span>
            </summary>

            <div className="p-3 space-y-2">
              <label className="block text-xs text-[#a2a2ad]">Page title</label>
              <input
                type="text"
                value={safeData.title || 'Web developer portfolio'}
                onChange={(e) => updateSite({ title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#1e1e23] border border-[#34343b] text-white text-xs focus:border-[#8d8d99] outline-none"
              />
            </div>
          </details>
        </div>
      )}
    </div>
  );
};
