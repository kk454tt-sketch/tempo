import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TemplateMetadata } from '@/types/template';

interface TemplateCardProps {
  template: TemplateMetadata;
  onPreview?: (template: TemplateMetadata) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onPreview }) => {
  const navigate = useNavigate();

  const handleUseTemplate = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/create/${template.id}`);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPreview) {
      onPreview(template);
    } else {
      navigate(`/templates/${template.id}`);
    }
  };

  const isPro = template.tier === 'pro' || template.id.includes('enrolldesk');

  return (
    <div
      onClick={handlePreview}
      className="group bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col border border-surface-container hover:border-outline-variant/60 cursor-pointer"
    >
      {/* Visual Preview Frame */}
      <div className="relative aspect-[16/10] sm:aspect-[16/11] overflow-hidden bg-surface-container">
        <img
          className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-500 ease-out"
          src={template.previewImage}
          alt={template.name}
        />
        {/* Ambient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-lowest/95 backdrop-blur-md text-on-surface font-label-sm text-[11px] uppercase tracking-wider shadow-sm font-semibold">
            {template.categoryLabel}
          </span>
          {isPro ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#182449] text-[#C9982F] font-label-sm text-[11px] uppercase tracking-wider shadow-sm font-bold border border-[#C9982F]/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9982F] animate-pulse" />
              Pro Interactive
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-secondary font-label-sm text-[11px] uppercase tracking-wider shadow-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Free Keepsake
            </span>
          )}
        </div>

        {/* Floating Quick Action CTA on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-space-md bg-black/20 backdrop-blur-[2px]">
          <button
            onClick={handleUseTemplate}
            className="font-label-md text-label-md bg-primary text-on-primary px-space-lg py-2.5 rounded-xl shadow-md hover:bg-primary-container transition-all flex items-center gap-space-xs cursor-pointer"
          >
            <span>Use this template</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>

        {/* Bottom preview hint */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white/95 text-[12px] font-medium">
          <span>{template.badge || 'Full Suite'}</span>
          <span className="flex items-center gap-0.5 group-hover:underline">
            Preview live <span className="material-symbols-outlined text-[14px]">visibility</span>
          </span>
        </div>
      </div>

      {/* Card Body & Details */}
      <div className="p-space-lg flex flex-col justify-between flex-1 gap-space-md">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-md text-headline-md text-on-surface font-semibold group-hover:text-primary transition-colors">
              {template.name}
            </h3>
            {template.subtitle && (
              <span className="text-tertiary font-serif italic text-body-md">
                {template.subtitle}
              </span>
            )}
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 leading-relaxed">
            {template.description}
          </p>

          {/* Modular Functions Highlights */}
          {template.availableFunctions && (
            <div className="flex flex-wrap gap-1 pt-1">
              {template.availableFunctions.slice(0, 3).map((func, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-medium"
                >
                  ✓ {func}
                </span>
              ))}
              {template.availableFunctions.length > 3 && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-container text-primary font-bold">
                  +{template.availableFunctions.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Card Action Row */}
        <div className="pt-space-sm flex items-center justify-between border-t border-surface-container text-on-surface-variant font-label-sm text-label-sm">
          <span className="text-secondary flex items-center gap-1 font-medium text-xs">
            <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
            {isPro ? 'Modular Community Functions' : 'Instant RSVP & Mobile Ready'}
          </span>
          <button
            onClick={handleUseTemplate}
            className="font-semibold text-primary hover:text-primary-container transition-colors flex items-center gap-0.5 cursor-pointer"
          >
            Start with this →
          </button>
        </div>
      </div>
    </div>
  );
};
