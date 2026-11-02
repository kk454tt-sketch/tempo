import React, { useRef, useState, useEffect } from 'react';
import { EventPhoto } from '@/types';
import { storageService, StorageBucketStatus } from '@/services/storageService';

interface CategoryPhotoUploaderProps {
  category: string;
  photos: EventPhoto[];
  onChangePhotos: (photos: EventPhoto[]) => void;
  onToast?: (msg: string) => void;
  title?: string;
  subtitle?: string;
  maxPhotos?: number;
}

export const CategoryPhotoUploader: React.FC<CategoryPhotoUploaderProps> = ({
  category,
  photos,
  onChangePhotos,
  onToast,
  title = 'Cover & Showcase Imagery',
  subtitle = 'Manage template imagery via direct URL, curated category presets, or local preview.',
  maxPhotos = 6,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');
  const [captionInput, setCaptionInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [bucketStatus, setBucketStatus] = useState<StorageBucketStatus | null>(null);

  useEffect(() => {
    storageService.checkStorageBucket().then(setBucketStatus);
  }, []);

  const presets = storageService.getCategoryPresets(category);

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
        } else if (res.noBucket) {
          // If no bucket found in Supabase storage, load as local base64 preview so it's workable
          try {
            const localPhoto = await storageService.createPhotoFromFilePreview(file);
            newPhotos.push(localPhoto);
            if (onToast) {
              onToast('No Supabase bucket found. Photo loaded into local template preview.');
            }
          } catch {
            if (onToast) onToast('Failed to load local image preview.');
          }
        } else if (res.error && onToast) {
          onToast(res.error);
        }
      }

      if (newPhotos.length > 0) {
        const updated = [...photos, ...newPhotos].slice(0, maxPhotos);
        // If first photo, mark as cover
        if (!updated.some((p) => p.isCover) && updated.length > 0) {
          updated[0].isCover = true;
        }
        onChangePhotos(updated);
        if (onToast) onToast(`Updated imagery with ${newPhotos.length} photo(s)`);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    try {
      const parsed = new URL(urlInput.trim());
      if (!['https:', 'http:', 'data:'].includes(parsed.protocol)) throw new Error('Invalid URL');
    } catch {
      if (onToast) onToast('Enter a valid image URL (https://...).');
      return;
    }

    const newPhoto = storageService.createPhotoFromUrl(
      urlInput.trim(),
      captionInput.trim() || `${category.charAt(0).toUpperCase() + category.slice(1)} Photo`
    );

    const updated = [...photos, newPhoto].slice(0, maxPhotos);
    if (!updated.some((p) => p.isCover) && updated.length > 0) {
      updated[0].isCover = true;
    }
    onChangePhotos(updated);
    setUrlInput('');
    setCaptionInput('');
    if (onToast) onToast('Image updated from URL');
  };

  const handleApplyPreset = (presetUrl: string, presetTitle: string) => {
    const newPhoto = storageService.createPhotoFromUrl(presetUrl, presetTitle);
    // Replace primary or append
    let updated: EventPhoto[];
    if (photos.length === 0) {
      newPhoto.isCover = true;
      updated = [newPhoto];
    } else {
      updated = [newPhoto, ...photos.filter((p) => p.url !== presetUrl)].slice(0, maxPhotos);
      updated[0].isCover = true;
    }
    onChangePhotos(updated);
    if (onToast) onToast(`Applied preset: ${presetTitle}`);
  };

  const handleSetCover = (id: string) => {
    const updated = photos.map((p) => ({
      ...p,
      isCover: p.id === id,
    }));
    onChangePhotos(updated);
    if (onToast) onToast('Cover photo updated');
  };

  const handleRemovePhoto = async (id: string) => {
    await storageService.deleteImage(id);
    const updated = photos.filter((p) => p.id !== id);
    if (updated.length > 0 && !updated.some((p) => p.isCover)) {
      updated[0].isCover = true;
    }
    onChangePhotos(updated);
    if (onToast) onToast('Photo removed');
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">photo_camera</span>
            <span>{title}</span>
          </h2>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>

        {/* Bucket Status Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-[11px] font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              bucketStatus?.hasBucket ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="text-gray-700">
            {bucketStatus?.hasBucket
              ? `Bucket: ${bucketStatus.bucketName}`
              : 'Bucket: None (URL & Presets Active)'}
          </span>
        </div>
      </div>

      {/* Cloud Bucket Notification if no bucket */}
      {bucketStatus && !bucketStatus.hasBucket && (
        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11.5px] text-amber-900 flex items-start gap-2">
          <span className="material-symbols-outlined text-[16px] text-amber-700 shrink-0 mt-0.5">info</span>
          <div>
            <span className="font-semibold">Storage Notice: </span>
            <span>No Supabase storage bucket is active. You can paste any image URL, select curated presets below, or choose a file for instant local preview.</span>
          </div>
        </div>
      )}

      {/* Current Photos Grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo, idx) => (
            <div
              key={photo.id || idx}
              className={`relative rounded-xl overflow-hidden border group bg-surface-container-low transition-all ${
                photo.isCover ? 'ring-2 ring-primary border-primary' : 'border-surface-container-high'
              }`}
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.caption || 'Event photo'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to placeholder if broken link
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80';
                  }}
                />
              </div>

              {photo.isCover && (
                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-primary text-on-primary text-[10px] font-bold shadow-sm">
                  Cover
                </div>
              )}

              <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 p-1 rounded-lg backdrop-blur-xs">
                {!photo.isCover && (
                  <button
                    type="button"
                    onClick={() => handleSetCover(photo.id)}
                    title="Set as main cover"
                    className="p-1 hover:text-amber-300 text-white transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">star</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(photo.id)}
                  title="Remove photo"
                  className="p-1 hover:text-red-400 text-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">delete</span>
                </button>
              </div>

              {photo.caption && (
                <div className="p-1.5 bg-surface-container-lowest text-[10px] text-gray-700 truncate font-medium">
                  {photo.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-dashed border-surface-container-high text-center text-xs text-gray-500">
          No photos added yet. Select a preset below or paste an image URL.
        </div>
      )}

      {/* URL & Upload Bar */}
      <form onSubmit={handleAddUrl} className="space-y-2 pt-2 border-t border-surface-container-high/60">
        <label className="text-xs font-bold text-gray-800 block">Add / Change Photo by URL</label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image URL (e.g. Unsplash, CDN, Web image)..."
            className="flex-1 h-9 px-3 text-xs rounded-xl bg-surface border border-surface-container-high focus:outline-none focus:border-primary text-gray-900"
          />
          <input
            type="text"
            value={captionInput}
            onChange={(e) => setCaptionInput(e.target.value)}
            placeholder="Caption (optional)"
            className="sm:w-36 h-9 px-3 text-xs rounded-xl bg-surface border border-surface-container-high focus:outline-none focus:border-primary text-gray-900"
          />
          <button
            type="submit"
            disabled={!urlInput.trim()}
            className="h-9 px-4 rounded-xl bg-primary text-on-primary text-xs font-bold disabled:opacity-40 transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">add_link</span>
            <span>Add Photo</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="h-9 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-xs font-semibold text-gray-800 transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            <span>{isUploading ? 'Uploading...' : 'Choose File'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </form>

      {/* Curated Presets For This Category */}
      {presets.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-surface-container-high/60">
          <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
            1-Click Photography Presets ({category.toUpperCase()})
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset.url, preset.title)}
                className="group relative rounded-xl overflow-hidden border border-surface-container-high hover:border-primary text-left transition-all p-1 bg-surface-container-low flex flex-col gap-1 cursor-pointer shadow-xs hover:shadow-sm"
              >
                <div className="aspect-[16/10] w-full rounded-lg overflow-hidden bg-gray-200">
                  <img
                    src={preset.preview}
                    alt={preset.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="text-[10px] font-medium text-gray-800 truncate px-1 block">
                  {preset.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
