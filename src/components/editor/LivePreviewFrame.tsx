import React, { useState } from 'react';
import { EventData } from '@/types';
import { TemplateRenderer } from '@/templates/components/TemplateRenderer';
import { eventService } from '@/services/eventService';

interface LivePreviewFrameProps {
  templateId: string;
  data: EventData;
  slug: string;
}

export const LivePreviewFrame: React.FC<LivePreviewFrameProps> = ({
  templateId,
  data,
  slug,
}) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="lg:col-span-7 flex flex-col gap-space-sm sticky top-[80px]">
      {/* Frame Browser Titlebar Controls */}
      <div className="bg-surface-container-high px-space-md py-space-xs rounded-xl shadow-sm flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-xs">
          <span className="w-3 h-3 rounded-full bg-[#E57373]" />
          <span className="w-3 h-3 rounded-full bg-[#FFB74D]" />
          <span className="w-3 h-3 rounded-full bg-[#81C784]" />
          <div className="ml-space-sm hidden sm:flex items-center gap-space-xs px-space-sm py-1 bg-surface rounded text-on-surface-variant font-caption text-caption shadow-inner">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span className="font-mono">tempo.com/e/{slug || 'preview'}</span>
          </div>
        </div>

        <div className="flex items-center gap-space-xs">
          <div className="bg-surface p-0.5 rounded-lg flex items-center shadow-inner">
            <button
              onClick={() => setDevice('desktop')}
              className={`px-space-xs py-1 rounded transition-colors cursor-pointer ${
                device === 'desktop' ? 'text-primary bg-surface-container' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Desktop view"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">desktop_windows</span>
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`px-space-xs py-1 rounded transition-colors cursor-pointer ${
                device === 'mobile' ? 'text-primary bg-surface-container' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Mobile view"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">smartphone</span>
            </button>
          </div>

          <span className="h-4 w-px bg-surface-container-highest" />
          <span className="font-label-sm text-label-sm text-on-surface-variant px-space-xs">100%</span>

          <a
            className="p-1 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            href={`/e/${slug || 'preview'}`}
            target="_blank"
            rel="noreferrer"
            title="Open external preview"
            onClick={() => {
              eventService.ensureWebsiteExists({
                slug: slug || 'preview',
                templateId,
                eventData: data,
                title: data.title || slug || 'preview',
              });
            }}
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          </a>
        </div>
      </div>

      {/* Frame Viewport */}
      <div className="w-full transition-all duration-300 flex justify-center" id="preview-wrapper">
        <div
          className={`w-full bg-[#FCF9F5] rounded-xl shadow-md overflow-hidden max-h-[calc(100vh-210px)] overflow-y-auto relative transition-all duration-300 border border-surface-container ${
            device === 'mobile' ? 'max-w-[390px] ring-8 ring-surface-container-highest' : 'max-w-full'
          }`}
          id="preview-frame"
        >
          <TemplateRenderer
            templateId={templateId}
            data={{ ...data, slug }}
            isLivePreview={true}
          />
        </div>
      </div>
    </div>
  );
};
