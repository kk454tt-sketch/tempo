import React, { useState, useRef, useMemo } from 'react';
import { PortfolioData } from '@/types';
import {
  getPortfolioSiteConfig,
  PortfolioSiteConfig,
} from './portfolioSiteDefaults';
import {
  DEFAULT_CHARACTER_1_IMG,
  TEMPLATE_AVATAR_PROMPTS,
  TEMPLATE_REFERENCE_IMAGES,
} from '@/templates/components/portfolioAssets';

export interface StitchMinimalPortfolioEditorProps {
  templateId: string;
  title?: string;
  tagline?: string;
  note?: string;
  venue?: string;
  address?: string;
  date?: string;
  photos?: any[];
  portfolioData?: PortfolioData;
  activeSubTab?: 'main-info' | 'default-info';
  onSubTabChange?: (tab: 'main-info' | 'default-info') => void;
  onChangeTitle?: (t: string) => void;
  onChangeTagline?: (tg: string) => void;
  onChangeNote?: (n: string) => void;
  onChangeVenue?: (v: string) => void;
  onChangeAddress?: (a: string) => void;
  onChangeDate?: (d: string) => void;
  onChangePhotos?: (p: any[]) => void;
  onChangePortfolioData: (data: PortfolioData) => void;
  onToast: (msg: string) => void;
}

export const StitchMinimalPortfolioEditor: React.FC<StitchMinimalPortfolioEditorProps> = ({
  templateId,
  portfolioData,
  onChangePhotos,
  onChangePortfolioData,
  onToast,
}) => {
  const siteConfig: PortfolioSiteConfig = useMemo(() => getPortfolioSiteConfig(templateId), [templateId]);

  // Safe portfolio data object: strictly respects empty strings and does not revert to fallbacks
  const safeData = useMemo<PortfolioData>(() => {
    const p = portfolioData || {};
    const dt = p.defaultTexts || {};
    const mergedDefaultTexts: Record<string, string> = {
      ...siteConfig.defaultTexts,
      ...dt,
    };

    return {
      templateId,
      creatorName: p.creatorName !== undefined ? p.creatorName : siteConfig.creatorName,
      brand: p.brand !== undefined ? p.brand : siteConfig.creatorName,
      discipline: p.discipline !== undefined ? p.discipline : siteConfig.discipline,
      title: p.title !== undefined ? p.title : (siteConfig.defaultTexts.heroTitle || siteConfig.name),
      statusNote: p.statusNote !== undefined ? p.statusNote : (siteConfig.defaultTexts.heroYearTag || ''),
      creatorRole: p.creatorRole !== undefined ? p.creatorRole : siteConfig.discipline,
      customAvatarUrl: p.customAvatarUrl,
      ...p,
      defaultTexts: mergedDefaultTexts,
      hire: {
        mode: 'whatsapp',
        whatsapp: p.hire?.whatsapp !== undefined ? p.hire.whatsapp : (siteConfig.defaultTexts.whatsappNumber || ''),
        waText: p.hire?.waText !== undefined ? p.hire.waText : 'Hi! I saw your portfolio and would like to discuss an opportunity.',
        email: p.hire?.email !== undefined ? p.hire.email : (siteConfig.defaultTexts.contactEmail || siteConfig.defaultTexts.emailAddress || 'hello@yourname.com'),
        subject: p.hire?.subject !== undefined ? p.hire.subject : 'Project Inquiry',
        phone: p.hire?.phone !== undefined ? p.hire.phone : (siteConfig.defaultTexts.contactPhone || siteConfig.defaultTexts.whatsappNumber || ''),
        label: p.hire?.label !== undefined ? p.hire.label : (siteConfig.defaultTexts.btnViewWork || siteConfig.defaultTexts.btnExploreWorld || 'Work With Me'),
        fallback: p.hire?.fallback !== undefined ? p.hire.fallback : (siteConfig.defaultTexts.contactEmail ? `mailto:${siteConfig.defaultTexts.contactEmail}` : 'mailto:hello@yourname.com'),
      },
      nav: {
        l1: p.nav?.l1 !== undefined ? p.nav.l1 : 'Projects',
        u1: p.nav?.u1 !== undefined ? p.nav.u1 : '#work',
        l2: p.nav?.l2 !== undefined ? p.nav.l2 : (siteConfig.defaultTexts.btnContact || siteConfig.defaultTexts.btnWatchGameplay || 'Contact'),
        u2: p.nav?.u2 !== undefined ? p.nav.u2 : '#contact',
      },
      socialLinks: {
        github: p.socialLinks?.github ?? 'https://github.com/',
        linkedin: p.socialLinks?.linkedin ?? 'https://linkedin.com/',
        twitter: p.socialLinks?.twitter ?? 'https://twitter.com/',
        behance: p.socialLinks?.behance ?? 'https://behance.net/',
        artstation: p.socialLinks?.artstation ?? 'https://artstation.com/',
        youtube: p.socialLinks?.youtube ?? 'https://youtube.com/',
        discord: p.socialLinks?.discord ?? 'https://discord.gg/',
        instagram: p.socialLinks?.instagram ?? 'https://instagram.com/',
      },
    };
  }, [siteConfig, portfolioData]);

  // Track accordion open state per category
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Header & Badges': true,
    'Hero & Typography': true,
    'About & Bio': true,
    'Event & Celebrant': true,
    'Date, Time & Schedule': true,
    'Venue & Location': true,
    'Story & Invitation Note': true,
    'RSVP & WhatsApp Confirmation': true,
    'Services & Skills': false,
    'Showcases & Projects': false,
    'Contact & Footer': true,
  });

  const toggleSection = (cat: string) => {
    setOpenSections((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const [isProcessingImg, setIsProcessingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFieldChange = (key: string, val: string) => {
    const updatedTexts = {
      ...(safeData.defaultTexts || {}),
      [key]: val,
    };

    const patch: Partial<PortfolioData> = {
      defaultTexts: updatedTexts,
    };

    // Propagate key bindings to top-level portfolioData fields for direct sync
    if (key === 'heroTitle' || key === 'heroHeading' || key === 'heroName') {
      patch.title = val;
    }
    if (key === 'heroSubtitle' || key === 'discipline') {
      patch.discipline = val;
    }
    if (key === 'brandName' || key === 'creatorName') {
      patch.creatorName = val;
      patch.brand = val;
    }
    if (key === 'heroYearTag' || key === 'headerDate' || key === 'statusNote') {
      patch.statusNote = val;
    }
    if (key === 'contactEmail' || key === 'emailAddress') {
      patch.hire = {
        mode: safeData.hire?.mode || 'whatsapp',
        whatsapp: safeData.hire?.whatsapp || '',
        waText: safeData.hire?.waText || '',
        subject: safeData.hire?.subject || 'Project Inquiry',
        phone: safeData.hire?.phone || '',
        label: safeData.hire?.label || 'Contact',
        ...(safeData.hire || {}),
        email: val,
        fallback: `mailto:${val}`,
      };
    }
    if (key === 'contactPhone' || key === 'whatsappNumber') {
      patch.hire = {
        mode: safeData.hire?.mode || 'whatsapp',
        whatsapp: val,
        waText: safeData.hire?.waText || '',
        email: safeData.hire?.email || '',
        subject: safeData.hire?.subject || 'Project Inquiry',
        label: safeData.hire?.label || 'Contact',
        fallback: safeData.hire?.fallback || '',
        ...(safeData.hire || {}),
        phone: val,
      };
    }

    onChangePortfolioData({
      ...safeData,
      ...patch,
    });
  };

  const handleSocialChange = (network: string, val: string) => {
    const updatedSocials = {
      ...(safeData.socialLinks || {}),
      [network]: val,
    };
    onChangePortfolioData({
      ...safeData,
      socialLinks: updatedSocials,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onToast('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      onToast('Image size exceeds 8MB. Please select a smaller image.');
      return;
    }

    setIsProcessingImg(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (result) {
        if (onChangePhotos) {
          onChangePhotos([
            {
              id: `p-${Date.now()}`,
              url: result,
              caption: 'Portfolio Hero Avatar',
              isCover: true,
            },
          ]);
        }
        onChangePortfolioData({
          ...safeData,
          customAvatarUrl: result,
        });
        onToast('Portfolio asset updated & live synced!');
      }
      setIsProcessingImg(false);
    };
    reader.onerror = () => {
      setIsProcessingImg(false);
      onToast('Failed to load image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleRestoreDefaultImage = () => {
    if (onChangePhotos) {
      onChangePhotos([]);
    }
    onChangePortfolioData({
      ...safeData,
      customAvatarUrl: undefined,
    });
    onToast('Restored default original template artwork!');
  };

  // Group siteConfig.fields by category
  const categories = useMemo(() => {
    const map: Record<string, typeof siteConfig.fields> = {};
    siteConfig.fields.forEach((f) => {
      if (!map[f.category]) map[f.category] = [];
      map[f.category].push(f);
    });
    return map;
  }, [siteConfig]);

  const categoryOrder = [
    'Header & Badges',
    'Hero & Typography',
    'About & Bio',
    'Services & Skills',
    'Showcases & Projects',
    'Contact & Footer',
    'Event & Celebrant',
    'Date, Time & Schedule',
    'Venue & Location',
    'Story & Invitation Note',
    'RSVP & WhatsApp Confirmation',
  ];

  const categoryIcons: Record<string, string> = {
    'Header & Badges': '🏷️',
    'Hero & Typography': '✨',
    'About & Bio': '👤',
    'Services & Skills': '🛠️',
    'Showcases & Projects': '🎨',
    'Contact & Footer': '📬',
    'Event & Celebrant': '🎂',
    'Date, Time & Schedule': '📅',
    'Venue & Location': '📍',
    'Story & Invitation Note': '💌',
    'RSVP & WhatsApp Confirmation': '📲',
  };

  return (
    <div className="w-full text-zinc-900 font-sans space-y-3.5">
      {/* Site Identity Summary Pill */}
      <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-zinc-900">{siteConfig.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white border border-zinc-200 text-zinc-600">
            {siteConfig.hasImages ? '✓ Has Images' : 'No Images'}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Live Synced
          </span>
        </div>
      </div>

      {/* Render only the categories that actually exist for this template with sequential numbering (1, 2, 3...) */}
      {categoryOrder
        .filter((catName) => categories[catName] && categories[catName].length > 0)
        .map((catName, activeIdx) => {
          const fields = categories[catName];
          const isOpen = openSections[catName] ?? true;
          const icon = categoryIcons[catName] || '📄';

          return (
            <div
              key={catName}
              className="border border-zinc-200 rounded-lg bg-white overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            >
              {/* Category Accordion Header */}
              <button
                type="button"
                onClick={() => toggleSection(catName)}
                className="w-full px-4 py-3 flex items-center justify-between text-left bg-zinc-50/70 hover:bg-zinc-50 transition border-b border-zinc-100 cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded bg-zinc-900 text-white text-[10px] font-semibold flex items-center justify-center">
                    {activeIdx + 1}
                  </span>
                <div>
                  <h2 className="text-xs font-semibold text-zinc-900 uppercase tracking-wide flex items-center gap-1.5">
                    <span>{icon}</span> {catName}
                  </h2>
                  <p className="text-[10px] text-zinc-500">
                    {fields.length} {fields.length === 1 ? 'control' : 'controls'} for {siteConfig.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className={`w-4 h-4 text-zinc-500 transform transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
            </button>

            {/* Category Accordion Body */}
            {isOpen && (
              <div className="p-3.5 space-y-3 block bg-white">
                {fields.map((f) => {
                  const currentVal = safeData.defaultTexts?.[f.key] ?? '';

                  return (
                    <div key={f.key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-medium text-zinc-800">
                          {f.label}
                        </label>
                      </div>

                      {f.isMultiline ? (
                        <textarea
                          rows={2}
                          value={currentVal}
                          onChange={(e) => handleFieldChange(f.key, e.target.value)}
                          className="w-full text-xs px-3 py-1.5 bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900 shadow-2xs resize-none"
                          placeholder={siteConfig.defaultTexts[f.key] || ''}
                        />
                      ) : (
                        <input
                          type="text"
                          value={currentVal}
                          onChange={(e) => handleFieldChange(f.key, e.target.value)}
                          className="w-full text-xs px-3 py-1.5 bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900 shadow-2xs"
                          placeholder={siteConfig.defaultTexts[f.key] || ''}
                        />
                      )}
                      {f.description && (
                        <span className="text-[10px] text-zinc-400 block">{f.description}</span>
                      )}
                    </div>
                  );
                })}

                {/* Additional site-specific features within Contact & Footer */}
                {catName === 'Contact & Footer' && (
                  <>
                    {/* Social links for 3D in Motion and Alex 3D */}
                    {(templateId === '3d-in-motion-portfolio' || templateId === 'alex-3d-designer-portfolio' || templateId === 'motion-designer-portfolio') && (
                      <div className="border-t border-zinc-100 pt-2.5 space-y-2">
                        <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase block">
                          Social Handles &amp; Links
                        </span>
                        <div className="grid grid-cols-1 gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-16 text-[10px] text-zinc-500 font-mono">Instagram</span>
                            <input
                              type="text"
                              value={safeData.socialLinks?.instagram ?? ''}
                              onChange={(e) => handleSocialChange('instagram', e.target.value)}
                              className="flex-1 text-xs px-2 py-1 bg-white border border-zinc-200 rounded font-mono text-zinc-800 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                              placeholder="https://instagram.com/yourprofile"
                            />
                          </div>
                          {templateId === '3d-in-motion-portfolio' && (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="w-16 text-[10px] text-zinc-500 font-mono">Behance</span>
                                <input
                                  type="text"
                                  value={safeData.socialLinks?.behance ?? ''}
                                  onChange={(e) => handleSocialChange('behance', e.target.value)}
                                  className="flex-1 text-xs px-2 py-1 bg-white border border-zinc-200 rounded font-mono text-zinc-800 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                                  placeholder="https://behance.net/yourprofile"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-16 text-[10px] text-zinc-500 font-mono">ArtStation</span>
                                <input
                                  type="text"
                                  value={safeData.socialLinks?.artstation ?? ''}
                                  onChange={(e) => handleSocialChange('artstation', e.target.value)}
                                  className="flex-1 text-xs px-2 py-1 bg-white border border-zinc-200 rounded font-mono text-zinc-800 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                                  placeholder="https://artstation.com/yourprofile"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-16 text-[10px] text-zinc-500 font-mono">LinkedIn</span>
                                <input
                                  type="text"
                                  value={safeData.socialLinks?.linkedin ?? ''}
                                  onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                                  className="flex-1 text-xs px-2 py-1 bg-white border border-zinc-200 rounded font-mono text-zinc-800 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                                  placeholder="https://linkedin.com/in/yourprofile"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Community Links for EMIWAY Minecraft */}
                    {templateId === 'emiway-minecraft-portfolio' && (
                      <div className="border-t border-zinc-100 pt-2.5 space-y-2">
                        <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase block">
                          Gamer Social &amp; Community Channels
                        </span>
                        <div className="grid grid-cols-1 gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-16 text-[10px] text-zinc-500 font-mono">YouTube</span>
                            <input
                              type="text"
                              value={safeData.socialLinks?.youtube ?? ''}
                              onChange={(e) => handleSocialChange('youtube', e.target.value)}
                              className="flex-1 text-xs px-2 py-1 bg-white border border-zinc-200 rounded font-mono text-zinc-800 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                              placeholder="https://youtube.com/@channel"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-16 text-[10px] text-zinc-500 font-mono">Discord</span>
                            <input
                              type="text"
                              value={safeData.socialLinks?.discord ?? ''}
                              onChange={(e) => handleSocialChange('discord', e.target.value)}
                              className="flex-1 text-xs px-2 py-1 bg-white border border-zinc-200 rounded font-mono text-zinc-800 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                              placeholder="https://discord.gg/server"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-16 text-[10px] text-zinc-500 font-mono">Instagram</span>
                            <input
                              type="text"
                              value={safeData.socialLinks?.instagram ?? ''}
                              onChange={(e) => handleSocialChange('instagram', e.target.value)}
                              className="flex-1 text-xs px-2 py-1 bg-white border border-zinc-200 rounded font-mono text-zinc-800 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                              placeholder="https://instagram.com/profile"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Template Artwork / Avatar Section (Only when template has customizable avatar assets) */}
      {siteConfig.hasImages && (
        <div className="border border-zinc-200 rounded-lg bg-white overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
              Template Artwork Asset
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">Original Verified</span>
          </div>
          <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <img
                src={safeData.customAvatarUrl || siteConfig.previewPoster || (templateId === 'web-developer-portfolio' ? DEFAULT_CHARACTER_1_IMG : '')}
                alt="Artwork Preview"
                className="w-10 h-10 rounded-md object-contain bg-white border border-zinc-200 p-0.5"
              />
              <div>
                <span className="text-xs font-medium text-zinc-800 block">
                  {safeData.customAvatarUrl ? 'Custom Uploaded' : 'Original Template Artwork'}
                </span>
                <span className="text-[10px] text-zinc-400 block">
                  {siteConfig.imageSummary.split(',')[0]}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingImg}
                className="px-2.5 py-1 rounded text-xs font-medium bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-800 transition cursor-pointer"
              >
                {isProcessingImg ? 'Uploading...' : 'Replace'}
              </button>
              {safeData.customAvatarUrl && (
                <button
                  type="button"
                  onClick={handleRestoreDefaultImage}
                  className="px-2 py-1 rounded text-xs font-medium text-zinc-500 hover:text-zinc-800 transition cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          🖼️ AI AVATAR FACE-SWAP & IMAGE UPLOAD SECTION
          ========================================== */}
      {siteConfig.hasImages && TEMPLATE_AVATAR_PROMPTS[templateId] && (() => {
        const avatarInfo = TEMPLATE_AVATAR_PROMPTS[templateId];
        const refImg = TEMPLATE_REFERENCE_IMAGES[templateId] || siteConfig.previewPoster || '';
        const isWebDev = templateId === 'web-developer-portfolio';
        const card2Info = isWebDev ? TEMPLATE_AVATAR_PROMPTS['web-developer-portfolio-card2'] : null;
        const card2Ref = isWebDev ? (TEMPLATE_REFERENCE_IMAGES['web-developer-portfolio-card2'] || '') : '';

        return (
          <div className="border border-indigo-200 rounded-lg bg-gradient-to-b from-indigo-50/60 to-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {/* Section Header */}
            <div className="px-4 py-3 border-b border-indigo-100 bg-indigo-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">AI</span>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">🖼️ AI Avatar & Face Swap</h3>
                    <p className="text-[10px] text-zinc-500">Create your personalized 3D avatar with AI</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                  ChatGPT / Gemini
                </span>
              </div>
            </div>

            <div className="p-3.5 space-y-3">
              {/* How It Works Steps */}
              <div className="bg-white rounded-lg border border-zinc-200 p-3">
                <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase block mb-2">How It Works</span>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span className="text-[11px] text-zinc-700">Click <strong>"Copy Prompt"</strong> below to copy the AI prompt</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span className="text-[11px] text-zinc-700">Go to <strong>ChatGPT</strong> or <strong>Gemini</strong> → paste prompt + upload <strong>your face photo</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span className="text-[11px] text-zinc-700">Download the <strong>generated PNG</strong> image from AI</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                    <span className="text-[11px] text-zinc-700">Come back here → <strong>upload your PNG</strong> below → <strong>Publish!</strong></span>
                  </div>
                </div>
              </div>

              {/* Prompt Card 1 */}
              <div className="bg-white rounded-lg border border-zinc-200 p-3 space-y-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={refImg}
                    alt="Reference"
                    className="w-12 h-12 rounded-lg object-cover bg-zinc-100 border border-zinc-200"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-zinc-900 block truncate">{avatarInfo.label}</span>
                    <span className="text-[10px] text-zinc-500 block">{avatarInfo.description}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(avatarInfo.prompt);
                    onToast('✅ AI prompt copied! Paste it in ChatGPT or Gemini with your face photo.');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  Copy Prompt for ChatGPT / Gemini
                </button>
              </div>

              {/* Card 2 Prompt (only for Web Developer Portfolio) */}
              {isWebDev && card2Info && (
                <div className="bg-white rounded-lg border border-zinc-200 p-3 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={card2Ref}
                      alt="Reference Card 2"
                      className="w-12 h-12 rounded-lg object-cover bg-zinc-100 border border-zinc-200"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-zinc-900 block truncate">{card2Info.label}</span>
                      <span className="text-[10px] text-zinc-500 block">{card2Info.description}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(card2Info.prompt);
                      onToast('✅ Card 2 prompt copied! Paste in ChatGPT or Gemini with your face photo.');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    Copy Card 2 Prompt
                  </button>
                </div>
              )}

              {/* Quick Open Links */}
              <div className="flex items-center gap-2">
                <a
                  href="https://chatgpt.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-semibold transition cursor-pointer"
                >
                  <span>🤖</span> Open ChatGPT
                </a>
                <a
                  href="https://gemini.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition cursor-pointer"
                >
                  <span>✨</span> Open Gemini
                </a>
              </div>

              {/* Upload Generated Image */}
              <div className="bg-gradient-to-b from-emerald-50/80 to-white rounded-lg border border-emerald-200 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase">
                    Step 4: Upload Your AI-Generated Image
                  </span>
                  {safeData.customAvatarUrl && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                      ✓ Uploaded
                    </span>
                  )}
                </div>

                {safeData.customAvatarUrl && (
                  <div className="flex items-center gap-2.5 p-2 bg-white rounded-md border border-emerald-200">
                    <img
                      src={safeData.customAvatarUrl}
                      alt="Your custom avatar"
                      className="w-14 h-14 rounded-md object-contain bg-zinc-50 border border-zinc-100"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-medium text-zinc-800 block">Your Custom Avatar</span>
                      <span className="text-[10px] text-emerald-600 block">Live on your site! Publish to go live.</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingImg}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    {isProcessingImg ? 'Processing...' : 'Upload PNG Image'}
                  </button>
                  {safeData.customAvatarUrl && (
                    <button
                      type="button"
                      onClick={handleRestoreDefaultImage}
                      className="px-3 py-2.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-800 bg-white border border-zinc-200 hover:bg-zinc-50 transition cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-zinc-400 text-center">
                  Supports PNG, JPG, WebP · Max 8MB · Transparent PNG recommended
                </p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
