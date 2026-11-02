import React, { useRef, useState } from 'react';
import { EventPhoto } from '@/types';
import { LocationMapPicker, LocationMapData } from './LocationMapPicker';
import { storageService } from '@/services/storageService';

export interface DressCodeData {
  title?: string;
  description: string;
  colors?: string[];
}

interface BirthdayMainInfoSectionProps {
  date: string;
  time: string;
  venue: string;
  address: string;
  dressCode?: string | DressCodeData;
  locationMap?: LocationMapData;
  photos: EventPhoto[];
  onChangeDate: (val: string) => void;
  onChangeTime: (val: string) => void;
  onChangeVenue: (val: string) => void;
  onChangeAddress: (val: string) => void;
  onChangeDressCode: (val: DressCodeData) => void;
  onChangeLocationMap: (val: LocationMapData) => void;
  onChangePhotos: (photos: EventPhoto[]) => void;
  onToast: (msg: string) => void;
}

const PRESET_DRESS_COLORS = [
  { name: 'Blush Pink', hex: '#EBC1C6' },
  { name: 'Sage Green', hex: '#B7C4A5' },
  { name: 'Buttercream Ivory', hex: '#FBF1DC' },
  { name: 'Rose Terracotta', hex: '#C97B84' },
  { name: 'Sunshine Gold', hex: '#FFD84D' },
  { name: 'Ocean Cyan', hex: '#3EC9E0' },
  { name: 'Deep Midnight', hex: '#14305A' },
  { name: 'Lavender Mist', hex: '#D8B4E2' },
];

export const BirthdayMainInfoSection: React.FC<BirthdayMainInfoSectionProps> = ({
  date,
  time,
  venue,
  address,
  dressCode,
  locationMap,
  photos,
  onChangeDate,
  onChangeTime,
  onChangeVenue,
  onChangeAddress,
  onChangeDressCode,
  onChangeLocationMap,
  onChangePhotos,
  onToast,
}) => {
  // Normalize dress code
  const dressCodeObj: DressCodeData =
    typeof dressCode === 'string'
      ? { description: dressCode, colors: ['#EBC1C6', '#B7C4A5', '#FBF1DC', '#C97B84'] }
      : dressCode || {
          title: 'Garden Elegance & Pastels',
          description: 'Soft pastels, garden elegance & dancing shoes 🌸',
          colors: ['#EBC1C6', '#B7C4A5', '#FBF1DC', '#C97B84'],
        };

  // Image upload handling
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageCaptionInput, setImageCaptionInput] = useState('');
  const [customColorInput, setCustomColorInput] = useState('#ff5a5f');

  const mainPhoto = photos.length > 0 ? photos[0] : null;

  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhoto(true);
    try {
      const file = files[0];
      const res = await storageService.uploadImage(file);
      if (res.success && res.photo) {
        // Put uploaded photo as cover photo at index 0
        const updated = [{ ...res.photo, isCover: true }, ...photos.filter((p) => p.id !== res.photo?.id)];
        onChangePhotos(updated);
        onToast('Main celebrant cover photo updated!');
      } else if (res.error) {
        onToast(res.error);
      }
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddPhotoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;

    const newPhoto: EventPhoto = {
      id: `photo-${Date.now()}`,
      url: imageUrlInput.trim(),
      caption: imageCaptionInput.trim() || 'Celebrant Photo',
      isCover: true,
    };

    const updated = [newPhoto, ...photos];
    onChangePhotos(updated);
    setImageUrlInput('');
    setImageCaptionInput('');
    onToast('Cover image updated from URL!');
  };

  const handleRemoveMainPhoto = () => {
    if (photos.length > 0) {
      onChangePhotos(photos.slice(1));
      onToast('Cover photo removed.');
    }
  };

  const toggleDressColor = (hex: string) => {
    const currentColors = dressCodeObj.colors || [];
    let nextColors: string[];
    if (currentColors.includes(hex)) {
      nextColors = currentColors.filter((c) => c !== hex);
    } else {
      nextColors = [...currentColors, hex];
    }
    onChangeDressCode({
      ...dressCodeObj,
      colors: nextColors,
    });
  };

  const handleAddCustomColor = () => {
    if (!customColorInput) return;
    const currentColors = dressCodeObj.colors || [];
    if (!currentColors.includes(customColorInput)) {
      onChangeDressCode({
        ...dressCodeObj,
        colors: [...currentColors, customColorInput],
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* =====================================================
          1. SITE MAIN INFO HEADER
          ===================================================== */}
      <div className="bg-surface-container-lowest rounded-2xl p-3.5 sm:p-5 shadow-sm border border-surface-container-high space-y-3.5">
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-surface-container">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#C97B84]/15 text-[#C97B84] flex items-center justify-center font-bold shrink-0">
              <span className="material-symbols-outlined text-[19px]">event_available</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                Section 1: Site Main Info
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-500 truncate">
                Date, time, venue, dress code and main photo.
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#C97B84]/10 text-[#C97B84] border border-[#C97B84]/20 shrink-0 whitespace-nowrap hidden sm:inline-block">
            Primary Info
          </span>
        </div>

        {/* Date and Time Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Event Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[17px] text-gray-400">
                calendar_month
              </span>
              <input
                type="text"
                value={date}
                onChange={(e) => onChangeDate(e.target.value)}
                placeholder="e.g. Saturday, June 14, 2025"
                className="w-full h-10 pl-9 pr-3 bg-surface-container-low text-xs font-semibold rounded-xl border border-surface-container-high focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10.5px] text-gray-400 shrink-0">Suggestions:</span>
              <button
                type="button"
                onClick={() => onChangeDate('Saturday, June 14, 2025')}
                className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-[10.5px] text-gray-700 font-medium whitespace-nowrap transition-colors"
              >
                June 14
              </button>
              <button
                type="button"
                onClick={() => onChangeDate('Saturday, September 20, 2025')}
                className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-[10.5px] text-gray-700 font-medium whitespace-nowrap transition-colors"
              >
                Sept 20
              </button>
              <button
                type="button"
                onClick={() => onChangeDate('Friday, December 12, 2025')}
                className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-[10.5px] text-gray-700 font-medium whitespace-nowrap transition-colors"
              >
                Dec 12
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Event Time &amp; Duration <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[17px] text-gray-400">
                schedule
              </span>
              <input
                type="text"
                value={time}
                onChange={(e) => onChangeTime(e.target.value)}
                placeholder="e.g. 4:30 PM & onwards (or 3:00 PM – 6:00 PM)"
                className="w-full h-10 pl-9 pr-3 bg-surface-container-low text-xs font-semibold rounded-xl border border-surface-container-high focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10.5px] text-gray-400 shrink-0">Presets:</span>
              <button
                type="button"
                onClick={() => onChangeTime('4:30 PM & onwards')}
                className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-[10.5px] text-gray-700 font-medium whitespace-nowrap transition-colors"
              >
                4:30 PM
              </button>
              <button
                type="button"
                onClick={() => onChangeTime('3:00 PM – 6:00 PM')}
                className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-[10.5px] text-gray-700 font-medium whitespace-nowrap transition-colors"
              >
                3:00 – 6:00 PM
              </button>
              <button
                type="button"
                onClick={() => onChangeTime('7:00 PM - Late Night')}
                className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-[10.5px] text-gray-700 font-medium whitespace-nowrap transition-colors"
              >
                7:00 PM Late
              </button>
            </div>
          </div>
        </div>

        {/* Venue and Address Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Venue Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[17px] text-gray-400">
                storefront
              </span>
              <input
                type="text"
                value={venue}
                onChange={(e) => onChangeVenue(e.target.value)}
                placeholder="e.g. The Glasshouse Botanica"
                className="w-full h-10 pl-9 pr-3 bg-surface-container-low text-xs font-semibold rounded-xl border border-surface-container-high focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Full Address &amp; Landmark <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[17px] text-gray-400">
                location_on
              </span>
              <input
                type="text"
                value={address}
                onChange={(e) => onChangeAddress(e.target.value)}
                placeholder="e.g. 42 Rosewood Lane, Hudson Valley, NY"
                className="w-full h-10 pl-9 pr-3 bg-surface-container-low text-xs font-semibold rounded-xl border border-surface-container-high focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Dress Code Section */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#C97B84]">checkroom</span>
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                Celebration Dress Code &amp; Palette
              </span>
            </div>
            <span className="text-[11px] text-gray-400">Printed on invitation card</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-gray-600 block mb-1">
                Dress Code Title
              </label>
              <input
                type="text"
                value={dressCodeObj.title || ''}
                onChange={(e) =>
                  onChangeDressCode({
                    ...dressCodeObj,
                    title: e.target.value,
                  })
                }
                placeholder="e.g. Garden Elegance & Soft Pastels"
                className="w-full h-9 px-3 text-xs bg-white rounded-lg border border-gray-200 focus:outline-none text-gray-900"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-600 block mb-1">
                Dress Code Note / Description
              </label>
              <input
                type="text"
                value={dressCodeObj.description}
                onChange={(e) =>
                  onChangeDressCode({
                    ...dressCodeObj,
                    description: e.target.value,
                  })
                }
                placeholder="e.g. Soft pastels, garden elegance and dancing shoes"
                className="w-full h-9 px-3 text-xs bg-white rounded-lg border border-gray-200 focus:outline-none text-gray-900"
              />
            </div>
          </div>

          {/* Color Palette Chips */}
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
              Attire Color Chips (click to toggle active colors on ticket):
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_DRESS_COLORS.map((color) => {
                const isActive = (dressCodeObj.colors || []).includes(color.hex);
                return (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => toggleDressColor(color.hex)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white border-primary shadow-xs ring-1 ring-primary text-gray-900'
                        : 'bg-white/80 border-gray-200 text-gray-600 hover:bg-white'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-[11px]">{color.name}</span>
                    {isActive && <span className="text-primary text-[10px] font-bold">✓</span>}
                  </button>
                );
              })}

              {/* Add Custom Color Input */}
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-full border border-gray-200 shadow-xs">
                <input
                  type="color"
                  value={customColorInput}
                  onChange={(e) => setCustomColorInput(e.target.value)}
                  className="w-6 h-6 rounded-full border-0 cursor-pointer p-0 bg-transparent"
                  title="Pick custom hex color"
                />
                <button
                  type="button"
                  onClick={handleAddCustomColor}
                  className="px-2 py-0.5 text-[10px] font-bold text-primary hover:underline cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          2. SET LOCATION VIA MAP IN EDIT PANEL
          ===================================================== */}
      <LocationMapPicker
        venue={venue}
        address={address}
        locationMap={locationMap}
        onChangeVenue={onChangeVenue}
        onChangeAddress={onChangeAddress}
        onChangeLocationMap={onChangeLocationMap}
      />

      {/* =====================================================
          3. IMAGE IN FIRST EDIT PANEL SECTION (COVER PHOTO)
          ===================================================== */}
      <div className="bg-surface-container-lowest rounded-2xl p-3.5 sm:p-5 shadow-sm border border-surface-container-high space-y-3.5">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleDeviceUpload}
          accept="image/png, image/jpeg, image/webp, image/gif"
          className="hidden"
        />

        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-surface-container">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              <span className="material-symbols-outlined text-[19px]">photo_camera</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                Main Celebrant Cover Photo
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 truncate">
                Hero photo displayed front and center on the birthday card.
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0 whitespace-nowrap hidden sm:inline-block">
            Card Photo
          </span>
        </div>

        {/* Current Cover Photo Preview Card */}
        {mainPhoto && mainPhoto.url ? (
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-surface-container">
            <div className="relative w-36 h-36 rounded-xl overflow-hidden bg-gray-100 shadow-md border-2 border-white shrink-0 group">
              <img
                src={mainPhoto.url}
                alt={mainPhoto.caption || 'Main celebrant cover'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/75 text-white text-[9.5px] font-bold">
                ★ Main Cover
              </span>
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div>
                <span className="text-xs font-bold text-gray-800 block">Current Invitation Photo</span>
                <p className="text-[11px] text-gray-500">
                  {mainPhoto.caption || 'Keepsake polaroid memory ✨'}
                </p>
                <p className="text-[10px] font-mono text-gray-400 truncate max-w-xs sm:max-w-md mt-0.5">
                  {mainPhoto.url}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[15px]">sync</span>
                  <span>Replace Photo</span>
                </button>

                <button
                  type="button"
                  onClick={handleRemoveMainPhoto}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 text-rose-600 border border-gray-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">delete</span>
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Photo Dropzone */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-6 bg-surface-container-low rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container transition-all border-2 border-dashed border-primary/30 group"
          >
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm mb-2 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[26px]">
                {isUploadingPhoto ? 'sync' : 'add_photo_alternate'}
              </span>
            </div>
            <p className="text-xs font-bold text-gray-800">
              {isUploadingPhoto ? 'Uploading Image...' : 'Click to Upload Main Celebrant Photo'}
            </p>
            <span className="text-[11px] text-gray-500 mt-0.5">
              PNG, JPG, WEBP, GIF (Automatically formatted to vintage polaroid)
            </span>
          </div>
        )}

        {/* Or Add Image via Public URL */}
        <form
          onSubmit={handleAddPhotoUrl}
          className="bg-surface-container-low p-3 rounded-xl border border-surface-container flex flex-col sm:flex-row gap-2"
        >
          <input
            type="url"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder="Or paste public image URL (https://images.unsplash.com/...)"
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none"
          />
          <input
            type="text"
            value={imageCaptionInput}
            onChange={(e) => setImageCaptionInput(e.target.value)}
            placeholder="Caption (optional)"
            className="w-full sm:w-36 px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!imageUrlInput.trim()}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold cursor-pointer hover:bg-primary-container disabled:opacity-50 shrink-0"
          >
            Set Cover Photo
          </button>
        </form>
      </div>
    </div>
  );
};

