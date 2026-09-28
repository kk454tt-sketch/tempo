import React, { useRef, useState } from 'react';
import { EventData, EventPhoto } from '@/types';
import { storageService } from '@/services/storageService';

interface EditorPhotosTabProps {
  data: EventData;
  onChange: (updates: Partial<EventData>) => void;
  onToast?: (msg: string) => void;
}

export const EditorPhotosTab: React.FC<EditorPhotosTabProps> = ({
  data,
  onChange,
  onToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');
  const [captionInput, setCaptionInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Quick Curated Presets
  const curatedPresets = [
    {
      label: 'Campus Quad',
      url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    },
    {
      label: 'Coastal Pavilion',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
    },
    {
      label: 'Celebration Confetti',
      url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
    },
    {
      label: 'Evening Lounge',
      url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80',
    },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newPhotos: EventPhoto[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await storageService.uploadImage(file);
        if (res.success && res.photo) {
          newPhotos.push(res.photo);
        } else if (res.error && onToast) {
          onToast(res.error);
        }
      }

      if (newPhotos.length > 0) {
        const updated = [...(data.photos || []), ...newPhotos];
        onChange({ photos: updated });
        if (onToast) onToast(`Added ${newPhotos.length} photo(s)`);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const newPhoto = storageService.createPhotoFromUrl(urlInput.trim(), captionInput.trim() || 'Event Photo');
    const updated = [...(data.photos || []), newPhoto];
    onChange({ photos: updated });
    setUrlInput('');
    setCaptionInput('');
    if (onToast) onToast('Photo added from URL');
  };

  const handleAddPreset = (url: string, label: string) => {
    const newPhoto = storageService.createPhotoFromUrl(url, label);
    const updated = [...(data.photos || []), newPhoto];
    onChange({ photos: updated });
    if (onToast) onToast(`Added preset: ${label}`);
  };

  const handleRemovePhoto = (photoId: string) => {
    const updated = (data.photos || []).filter((p) => p.id !== photoId);
    onChange({ photos: updated });
    if (onToast) onToast('Photo removed');
  };

  const handleSetCover = (photoId: string) => {
    const updated = (data.photos || []).map((p) => ({
      ...p,
      isCover: p.id === photoId,
    }));
    // move cover to the front
    const coverIdx = updated.findIndex((p) => p.id === photoId);
    if (coverIdx > 0) {
      const [coverPhoto] = updated.splice(coverIdx, 1);
      updated.unshift(coverPhoto);
    }
    onChange({ photos: updated });
    if (onToast) onToast('Set as cover photo');
  };

  return (
    <div className="tab-panel flex flex-col gap-space-md">
      <div>
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary">
          Living Gallery &amp; Covers
        </span>
        <h2 className="font-headline-md text-headline-md text-on-surface mt-space-xs">
          Event Photos
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Upload images from your device or paste web links. The first photo serves as the monumental hero banner.
        </p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="hidden"
      />

      {/* Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="p-space-lg bg-surface-container-low rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container transition-colors group border-2 border-dashed border-outline-variant/50"
      >
        <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-primary-container shadow-sm mb-space-sm group-hover:scale-105 transition-transform">
          <span className="material-symbols-outlined text-[24px]">
            {isUploading ? 'sync' : 'cloud_upload'}
          </span>
        </div>
        <p className="font-label-md text-label-md text-on-surface font-semibold">
          {isUploading ? 'Optimizing & Uploading...' : 'Upload from Device'}
        </p>
        <span className="font-caption text-caption text-on-surface-variant mt-0.5">
          PNG, JPG, WEBP — automatically optimized for fast loading
        </span>
      </div>

      {/* Add via URL Form */}
      <form onSubmit={handleAddUrl} className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container space-y-2">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant block font-semibold">
          Or Add Photo via Direct URL
        </span>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-outline-variant/40 bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
          />
          <input
            type="text"
            placeholder="Caption (optional)"
            value={captionInput}
            onChange={(e) => setCaptionInput(e.target.value)}
            className="w-full sm:w-36 px-3 py-2 text-xs rounded-lg border border-outline-variant/40 bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
          />
          <button
            type="submit"
            disabled={!urlInput.trim()}
            className="px-3.5 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary-container disabled:opacity-50 transition-colors cursor-pointer shrink-0"
          >
            + Add
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-on-surface-variant font-medium shrink-0">Sample Presets:</span>
          {curatedPresets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleAddPreset(preset.url, preset.label)}
              className="px-2 py-0.5 rounded bg-surface hover:bg-surface-container text-on-surface text-[10px] font-semibold border border-outline-variant/30 shrink-0 cursor-pointer"
            >
              + {preset.label}
            </button>
          ))}
        </div>
      </form>

      {/* Photos Grid */}
      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-semibold">
            Gallery Photos ({data.photos?.length || 0})
          </span>
          {data.photos && data.photos.length > 0 && (
            <span className="text-[11px] text-on-surface-variant">Click photo to set as cover</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-space-sm">
          {(data.photos || []).map((photo: EventPhoto, idx: number) => {
            const isCover = idx === 0 || photo.isCover;
            return (
              <div
                key={photo.id}
                className={`relative bg-surface rounded-xl overflow-hidden p-1.5 shadow-sm group border transition-all ${
                  isCover ? 'ring-2 ring-primary border-primary' : 'border-surface-container hover:border-outline-variant'
                }`}
              >
                <div className="relative h-28 w-full rounded-lg overflow-hidden bg-slate-100">
                  <img
                    className="w-full h-full object-cover"
                    src={photo.url}
                    alt={photo.caption || 'Event photo'}
                  />
                  {isCover ? (
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-primary text-on-primary text-[10px] font-bold rounded-md uppercase tracking-wider shadow">
                      ★ Cover
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetCover(photo.id)}
                      className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-black/70 hover:bg-black text-white text-[10px] font-bold rounded-md uppercase tracking-wider shadow opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      Set Cover
                    </button>
                  )}
                  <button
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                    type="button"
                    title="Remove image"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
                <div className="flex items-center justify-between pt-1 px-1">
                  <span className="font-caption text-caption text-on-surface truncate max-w-[120px]">
                    {photo.caption || `Photo ${idx + 1}`}
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-mono">#{idx + 1}</span>
                </div>
              </div>
            );
          })}

          <div
            onClick={() => fileInputRef.current?.click()}
            className="h-28 rounded-xl bg-surface-container-low flex flex-col items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container cursor-pointer transition-colors border-2 border-dashed border-outline-variant/40"
          >
            <span className="material-symbols-outlined text-[24px]">add_photo_alternate</span>
            <span className="font-caption text-caption mt-1 font-semibold">Upload More</span>
          </div>
        </div>
      </div>
    </div>
  );
};
