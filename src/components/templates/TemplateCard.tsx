import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TemplateMetadata } from '@/types/template';

interface TemplateCardProps {
  template: TemplateMetadata;
  onPreviewClick?: (template: TemplateMetadata) => void;
  onPreview?: (template: TemplateMetadata) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onPreviewClick, onPreview }) => {
  const handlePreview = onPreviewClick || onPreview;
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('tempo_bookmarks') || '[]');
      setIsBookmarked(saved.includes(template.id));
    } catch {
      setIsBookmarked(false);
    }
  }, [template.id]);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('tempo_bookmarks') || '[]');
      let updated: string[];
      if (saved.includes(template.id)) {
        updated = saved.filter((id) => id !== template.id);
        setIsBookmarked(false);
      } else {
        updated = [...saved, template.id];
        setIsBookmarked(true);
      }
      localStorage.setItem('tempo_bookmarks', JSON.stringify(updated));
      window.dispatchEvent(new Event('bookmark_updated'));
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const isFree = template.isFree || template.price === 0;

  return (
    <article className="group flex flex-col rounded-xl bg-surface-container-lowest shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 overflow-hidden border border-surface-container-high/70">
      {/* 16:10 Aspect Ratio Viewport Frame */}
      <div className="relative aspect-[16/10] bg-surface-container-low overflow-hidden">
        {/* Minimalist Browser Chrome Mockup Bar (visible on sm+) */}
        <div className="hidden sm:flex absolute top-0 left-0 right-0 h-6 bg-surface-container-high/80 backdrop-blur-sm z-10 items-center px-3 gap-1.5 border-b border-surface-container-high/40">
          <span className="w-2 h-2 rounded-full bg-outline-variant/60"></span>
          <span className="w-2 h-2 rounded-full bg-outline-variant/60"></span>
          <span className="w-2 h-2 rounded-full bg-outline-variant/60"></span>
          <span className="ml-2 font-label-sm text-[10px] text-on-surface-variant/70 tracking-wider truncate">
            {template.id}.preview.canvas
          </span>
        </div>

        {/* Template Preview Image */}
        <Link to={`/templates/${template.id}`} className="block w-full h-full">
          <img
            src={template.previewImage}
            alt={template.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
        </Link>

        {/* Price / Free Badge Overlay */}
        <div className="absolute top-2 left-2 sm:top-8 sm:left-3 z-10">
          {isFree ? (
            <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[10px] sm:text-[11px] font-semibold tracking-wide shadow-sm">
              FREE
            </span>
          ) : (
            <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-[10px] sm:text-[11px] font-semibold shadow-sm">
              {template.priceLabel || `$${template.price}`}
            </span>
          )}
        </div>

        {/* Quick Action Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 sm:bg-primary/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5 sm:gap-2 sm:pt-6 pointer-events-none group-hover:pointer-events-auto z-20">
          <button
            onClick={() => {
              if (handlePreview) {
                handlePreview(template);
              } else {
                navigate(`/templates/${template.id}`);
              }
            }}
            className="w-8 h-8 sm:w-auto sm:h-auto sm:px-3.5 sm:py-1.5 rounded-full sm:rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-md hover:bg-surface transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            title="Live Preview"
            aria-label="Live Preview"
          >
            <span className="material-symbols-outlined text-[18px] sm:text-[16px]">visibility</span>
            <span className="hidden sm:inline">Live Preview</span>
          </button>
          <button
            onClick={toggleBookmark}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full sm:rounded-lg bg-surface-container-lowest text-on-surface flex items-center justify-center shadow-md hover:bg-surface transition-colors cursor-pointer shrink-0 ${
              isBookmarked ? 'text-on-tertiary-container' : ''
            }`}
            title={isBookmarked ? 'Remove from saved' : 'Save to bookmarks'}
            aria-label="Save to bookmarks"
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
            >
              bookmark
            </span>
          </button>
        </div>
      </div>

      {/* Card Details & Metadata */}
      <div className="p-2.5 sm:p-space-md flex flex-col justify-between flex-1 gap-1.5 sm:gap-space-sm bg-surface-container-lowest">
        <div className="space-y-0.5 sm:space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[9px] sm:text-label-sm uppercase tracking-wider text-on-surface-variant truncate max-w-[65%]">
              {template.categoryLabel}
            </span>
            <span className="font-label-sm sm:font-label-md text-[10px] sm:text-label-md text-on-surface font-semibold">
              {isFree ? 'FREE' : template.priceLabel || `$${template.price}`}
            </span>
          </div>

          <Link to={`/templates/${template.id}`}>
            <h3 className="font-semibold text-xs sm:text-headline-sm text-on-surface group-hover:text-primary transition-colors truncate">
              {template.name}
            </h3>
          </Link>
          <p className="hidden sm:block font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
            {template.description}
          </p>
        </div>

        {/* Author info */}
        <div className="flex items-center justify-between text-on-surface-variant text-xs pt-1">
          <div className="flex items-center gap-1.5 min-w-0">
            {template.authorAvatar ? (
              <img
                src={template.authorAvatar}
                alt={template.author || 'Studio'}
                className="w-4 h-4 rounded-full object-cover shrink-0"
              />
            ) : (
              <span className="w-4 h-4 rounded-full bg-surface-container flex items-center justify-center text-[8px] font-semibold text-on-surface-variant shrink-0">
                {(template.author || 'TP').slice(0, 2).toUpperCase()}
              </span>
            )}
            <span className="truncate text-on-surface-variant text-[11px] sm:text-xs">
              {template.author || 'Studio Atelier'}
            </span>
          </div>
          {template.techStack && (
            <span className="text-[10px] text-on-surface-variant/70 truncate hidden sm:inline">
              {template.techStack.split('·')[0].trim()}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full pt-1">
          <button
            type="button"
            onClick={() => {
              if (handlePreview) {
                handlePreview(template);
              } else {
                navigate(`/templates/${template.id}`);
              }
            }}
            className="flex-1 h-8 sm:h-9 px-1.5 sm:px-3 rounded-lg border border-surface-container-high bg-surface-container-low text-on-surface text-[11px] sm:text-xs font-semibold hover:bg-surface-container hover:text-on-surface transition-all flex items-center justify-center gap-1 cursor-pointer truncate"
          >
            <span className="material-symbols-outlined text-[14px] sm:text-[16px] shrink-0">visibility</span>
            <span className="truncate">Preview</span>
          </button>
          <Link
            to={`/create/${template.id}`}
            className="flex-1 h-8 sm:h-9 px-1.5 sm:px-3 rounded-lg bg-primary text-on-primary text-[11px] sm:text-xs font-bold hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-1 shadow-sm truncate"
          >
            <span className="truncate">Use</span>
            <span className="hidden sm:inline"> Template</span>
            <span className="material-symbols-outlined text-[13px] sm:text-[14px] shrink-0">arrow_forward</span>
          </Link>
        </div>
      </div>
    </article>
  );
};
