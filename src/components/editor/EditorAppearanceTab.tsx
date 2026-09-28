import React from 'react';
import { EventData, AppearanceSettings } from '@/types';

interface EditorAppearanceTabProps {
  data: EventData;
  onChange: (updates: Partial<EventData>) => void;
}

export const EditorAppearanceTab: React.FC<EditorAppearanceTabProps> = ({
  data,
  onChange,
}) => {
  const appearance = data.appearance || {
    atmosphere: 'classic-elegance',
    palette: 'terracotta-ivory-olive',
    typography: 'playfair-sans',
  };

  const updateAppearance = (updates: Partial<AppearanceSettings>) => {
    onChange({
      appearance: {
        ...appearance,
        ...updates,
      },
    });
  };

  return (
    <div className="tab-panel flex flex-col gap-space-md">
      <div>
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary">
          Tone &amp; Texture
        </span>
        <h2 className="font-headline-md text-headline-md text-on-surface mt-space-xs">
          Appearance
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Tailor the visual mood with refined architectural presets.
        </p>
      </div>

      <div className="flex flex-col gap-space-xs">
        <label className="font-body-sm text-body-sm text-on-surface font-semibold">
          Visual Atmosphere
        </label>
        <div className="grid grid-cols-2 gap-space-xs">
          {[
            { id: 'classic-elegance', label: 'Classic Elegance' },
            { id: 'modernist-warmth', label: 'Modernist Warmth' },
            { id: 'sunlit-botanical', label: 'Sunlit Botanical' },
            { id: 'monochrome-pure', label: 'Monochrome Pure' },
          ].map((item) => {
            const isSelected = appearance.atmosphere === item.id;
            return (
              <button
                key={item.id}
                onClick={() => updateAppearance({ atmosphere: item.id as AppearanceSettings['atmosphere'] })}
                className={`py-space-sm px-space-md text-left rounded-lg transition-colors font-label-md text-label-md flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-surface text-primary shadow-sm border border-primary/20'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface'
                }`}
                type="button"
              >
                <span>{item.label}</span>
                {isSelected && (
                  <span className="material-symbols-outlined text-[18px]">check</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-space-xs">
        <label className="font-body-sm text-body-sm text-on-surface font-semibold">
          Palette Swatches
        </label>
        <div className="flex flex-col gap-space-xs">
          {[
            {
              id: 'terracotta-ivory-olive',
              label: 'Terracotta, Ivory & Olive',
              colors: ['#8F3C2C', '#FCF9F5', '#556254'],
            },
            {
              id: 'sage-cream',
              label: 'Sage & Cream Linen',
              colors: ['#4A5D4E', '#F4F1EA', '#C2B490'],
            },
            {
              id: 'midnight-gilding',
              label: 'Midnight & Gilding',
              colors: ['#1A2634', '#E5D7B7', '#F8F6F0'],
            },
          ].map((palette) => {
            const isSelected = appearance.palette === palette.id;
            return (
              <div
                key={palette.id}
                onClick={() => updateAppearance({ palette: palette.id as AppearanceSettings['palette'] })}
                className={`p-space-sm rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-surface shadow-sm border border-primary/20'
                    : 'bg-surface-container-low hover:bg-surface'
                }`}
              >
                <div className="flex items-center gap-space-sm">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {palette.colors.map((c, i) => (
                      <span
                        key={i}
                        className="w-6 h-6 rounded-full shadow-inner border border-black/10"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <span className="font-label-md text-label-md text-on-surface">
                    {palette.label}
                  </span>
                </div>
                {isSelected && (
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    check_circle
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-space-xs">
        <label className="font-body-sm text-body-sm text-on-surface font-semibold">
          Typography Pairing
        </label>
        <div className="grid grid-cols-1 gap-space-xs">
          <div
            onClick={() => updateAppearance({ typography: 'playfair-sans' })}
            className={`p-space-sm rounded-lg flex items-center justify-between cursor-pointer ${
              appearance.typography === 'playfair-sans'
                ? 'bg-surface shadow-sm border border-primary/20'
                : 'bg-surface-container-low hover:bg-surface'
            }`}
          >
            <div>
              <span className="font-headline-md text-[18px] text-on-surface">Playfair &amp; Sans</span>
              <p className="font-caption text-caption text-on-surface-variant">
                Stationery standard with contemporary legibility
              </p>
            </div>
            <span className="material-symbols-outlined text-primary text-[18px]">
              {appearance.typography === 'playfair-sans'
                ? 'radio_button_checked'
                : 'radio_button_unchecked'}
            </span>
          </div>
          <div
            onClick={() => updateAppearance({ typography: 'modern-grotesque' })}
            className={`p-space-sm rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
              appearance.typography === 'modern-grotesque'
                ? 'bg-surface shadow-sm border border-primary/20'
                : 'bg-surface-container-low hover:bg-surface'
            }`}
          >
            <div>
              <span className="font-body-lg text-[16px] font-semibold text-on-surface">Modern Grotesque</span>
              <p className="font-caption text-caption text-on-surface-variant">
                Editorial gallerist with tight tracking
              </p>
            </div>
            <span className="material-symbols-outlined text-outline text-[18px]">
              {appearance.typography === 'modern-grotesque'
                ? 'radio_button_checked'
                : 'radio_button_unchecked'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
