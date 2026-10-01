import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TemplateMetadata } from '@/types/template';

interface PreviewModalProps {
  template: TemplateMetadata | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ template, isOpen, onClose }) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');

  if (!isOpen || !template) return null;

  const isFree = template.isFree || template.price === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] border border-surface-container-high animate-in zoom-in-95 duration-200">
        {/* Top Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-surface flex items-center justify-between border-b border-surface-container-high/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim animate-pulse shrink-0"></span>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">
                {template.name}
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant truncate">
                {template.categoryLabel} · {template.author || 'Studio Atelier'}
              </p>
            </div>
          </div>

          {/* Viewport switcher */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  deviceMode === 'desktop'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm font-medium'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Desktop View"
              >
                <span className="material-symbols-outlined text-[18px]">desktop_windows</span>
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  deviceMode === 'mobile'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm font-medium'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Mobile View"
              >
                <span className="material-symbols-outlined text-[18px]">smartphone</span>
              </button>
            </div>

            <Link
              to={`/create/${template.id}`}
              className="px-4 py-1.5 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary-container shadow-sm transition-all"
            >
              {isFree ? 'Use Free Template' : `Customize — ${template.priceLabel || `$${template.price}`}`}
            </Link>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Modal Body / Sandbox Preview Frame */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-surface-container-low/40 flex items-center justify-center min-h-[400px]">
          <div
            className={`transition-all duration-300 rounded-xl overflow-hidden shadow-xl bg-surface-container-lowest border border-surface-container-high ${
              deviceMode === 'mobile' ? 'w-[375px] min-h-[600px]' : 'w-full'
            }`}
          >
            {/* Chrome Bar */}
            <div className="px-4 py-2.5 bg-surface-container flex items-center gap-2 border-b border-surface-container-high/60">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-outline-variant/60"></span>
                <span className="w-2 h-2 rounded-full bg-outline-variant/60"></span>
                <span className="w-2 h-2 rounded-full bg-outline-variant/60"></span>
              </div>
              <div className="flex-1 max-w-xs mx-auto h-6 rounded bg-surface-container-lowest px-3 flex items-center justify-between text-on-surface-variant font-mono text-[11px] shadow-inner truncate">
                <span className="truncate">{template.id}.canvas.design/live</span>
                <span className="material-symbols-outlined text-[12px] text-tertiary-fixed-dim">lock</span>
              </div>
            </div>

            {/* Template Preview Image Hero */}
            <div className="relative aspect-[16/10] overflow-hidden bg-surface-container">
              <img
                src={template.previewImage}
                alt={template.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent flex flex-col justify-end p-6 text-on-primary">
                <span className="font-label-sm text-label-sm uppercase tracking-wider opacity-80 mb-1">
                  {template.categoryLabel} · {template.version || 'v2.0'}
                </span>
                <h2 className="font-headline-lg text-headline-lg font-bold tracking-tight">
                  {template.name}
                </h2>
                <p className="font-body-sm text-body-sm opacity-90 max-w-md mt-1">
                  {template.description}
                </p>
              </div>
            </div>

            {/* Feature specs inside preview */}
            <div className="p-6 bg-surface-container-lowest grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-surface-container-high/40">
              <div className="p-3 rounded-lg bg-surface-container-low">
                <p className="font-label-sm text-xs text-on-surface-variant">Architecture</p>
                <p className="font-label-md text-sm text-on-surface font-semibold mt-0.5">
                  {template.techStack || 'HTML5 + Tailwind'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low">
                <p className="font-label-sm text-xs text-on-surface-variant">Access Tier</p>
                <p className="font-label-md text-sm text-on-surface font-semibold mt-0.5">
                  {isFree ? 'Free Forever' : `Commercial — ${template.priceLabel || `$${template.price}`}`}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low">
                <p className="font-label-sm text-xs text-on-surface-variant">Rating</p>
                <p className="font-label-md text-sm text-on-surface font-semibold mt-0.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  <span>{template.rating || 4.98} ({template.reviewsCount || 42} reviews)</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 bg-surface border-t border-surface-container-high/60 flex items-center justify-between text-on-surface-variant text-body-sm text-xs">
          <span>Instant staging environment online · Retina 4K canvas</span>
          <Link to={`/templates/${template.id}`} className="font-label-sm text-on-surface hover:underline">
            View complete monograph details →
          </Link>
        </div>
      </div>
    </div>
  );
};
