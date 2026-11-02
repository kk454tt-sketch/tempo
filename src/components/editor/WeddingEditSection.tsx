import React, { useState } from 'react';
import { ScheduleItem, EventPhoto, WeddingData } from '@/types';
import { LocationMapData, LocationMapPicker } from './LocationMapPicker';
import { CategoryPhotoUploader } from './CategoryPhotoUploader';

interface WeddingEditSectionProps {
  // Main
  title: string;
  tagline: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  note: string;
  photos: EventPhoto[];
  schedule: ScheduleItem[];
  weddingData?: WeddingData;
  locationMap: LocationMapData;
  musicUrl?: string;
  rsvpDeadline?: string;
  allowMealSelection?: boolean;
  allowDietary?: boolean;
  allowPlusOnes?: boolean;
  onChangeTitle: (title: string) => void;
  onChangeTagline: (tagline: string) => void;
  onChangeDate: (date: string) => void;
  onChangeTime: (time: string) => void;
  onChangeVenue: (venue: string) => void;
  onChangeAddress: (address: string) => void;
  onChangeNote: (note: string) => void;
  onChangePhotos: (photos: EventPhoto[]) => void;
  onChangeSchedule: (schedule: ScheduleItem[]) => void;
  onChangeWeddingData: (data: WeddingData) => void;
  onChangeLocationMap: (map: LocationMapData) => void;
  onChangeMusicUrl?: (url: string) => void;
  onChangeRsvpDeadline?: (deadline: string) => void;
  onChangeAllowMealSelection?: (allow: boolean) => void;
  onChangeAllowDietary?: (allow: boolean) => void;
  onChangeAllowPlusOnes?: (allow: boolean) => void;
  onToast: (msg: string) => void;
}

export const WeddingEditSection: React.FC<WeddingEditSectionProps> = ({
  title,
  tagline,
  date,
  time,
  venue,
  address,
  note,
  photos,
  schedule,
  weddingData,
  locationMap,
  musicUrl,
  rsvpDeadline,
  allowMealSelection = true,
  allowDietary = true,
  allowPlusOnes = true,
  onChangeTitle,
  onChangeTagline,
  onChangeDate,
  onChangeTime,
  onChangeVenue,
  onChangeAddress,
  onChangeNote,
  onChangePhotos,
  onChangeSchedule,
  onChangeWeddingData,
  onChangeLocationMap,
  onChangeMusicUrl,
  onChangeRsvpDeadline,
  onChangeAllowMealSelection,
  onChangeAllowDietary,
  onChangeAllowPlusOnes,
  onToast,
}) => {
  const [weddingTab, setWeddingTab] = useState<'ceremony' | 'story' | 'media' | 'rsvp'>('ceremony');

  const partner1 = weddingData?.partner1 || title.split('&')[0]?.trim() || 'Elena';
  const partner2 = weddingData?.partner2 || title.split('&')[1]?.split('—')[0]?.trim() || 'Marcus';

  const updateWeddingField = <K extends keyof WeddingData>(field: K, value: WeddingData[K]) => {
    const updated: WeddingData = {
      partner1,
      partner2,
      ...weddingData,
      [field]: value,
    };
    onChangeWeddingData(updated);
  };

  const handlePartnerChange = (p1: string, p2: string) => {
    updateWeddingField('partner1', p1);
    updateWeddingField('partner2', p2);
    onChangeTitle(`${p1} & ${p2} — Wedding Celebration`);
  };

  const handleAddScheduleItem = () => {
    const newItem: ScheduleItem = {
      id: `s-${Date.now()}`,
      time: '6:00 PM',
      title: 'Reception & Dinner',
      description: 'Dinner, toasts, and dancing under the stars',
    };
    onChangeSchedule([...schedule, newItem]);
    onToast('Added schedule event');
  };

  const handleRemoveScheduleItem = (id: string) => {
    onChangeSchedule(schedule.filter((s) => s.id !== id));
    onToast('Removed schedule item');
  };

  const handleUpdateScheduleItem = (id: string, field: keyof ScheduleItem, val: string) => {
    const updated = schedule.map((s) => (s.id === id ? { ...s, [field]: val } : s));
    onChangeSchedule(updated);
  };

  return (
    <div className="space-y-4">
      {/* Sub Tabs */}
      <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-surface-container-high/60 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setWeddingTab('ceremony')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            weddingTab === 'ceremony'
              ? 'bg-white text-primary shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          1. Couple &amp; Ceremony
        </button>
        <button
          type="button"
          onClick={() => setWeddingTab('story')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            weddingTab === 'story'
              ? 'bg-white text-primary shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          2. Love Story &amp; Itinerary
        </button>
        <button
          type="button"
          onClick={() => setWeddingTab('media')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            weddingTab === 'media'
              ? 'bg-white text-primary shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          3. Imagery &amp; Music
        </button>
        <button
          type="button"
          onClick={() => setWeddingTab('rsvp')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            weddingTab === 'rsvp'
              ? 'bg-white text-primary shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          4. RSVP &amp; Registry
        </button>
      </div>

      {/* TAB 1: Couple & Ceremony */}
      {weddingTab === 'ceremony' && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">favorite</span>
              <span>The Couple</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Partner 1</label>
                <input
                  type="text"
                  value={partner1}
                  onChange={(e) => handlePartnerChange(e.target.value, partner2)}
                  className="w-full h-9 px-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
                  placeholder="e.g. Elena"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Partner 2</label>
                <input
                  type="text"
                  value={partner2}
                  onChange={(e) => handlePartnerChange(partner1, e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
                  placeholder="e.g. Marcus"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Wedding Tagline / Invitation Subtitle</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => onChangeTagline(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
                placeholder="e.g. A celebration of love, light & gathered family"
              />
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">church</span>
              <span>Ceremony &amp; Venue Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Wedding Date</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => onChangeDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
                  placeholder="e.g. Saturday, October 18, 2025"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Ceremony Time</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => onChangeTime(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
                  placeholder="e.g. 4:30 PM Sunset Ceremony"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Venue Name</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => onChangeVenue(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
                  placeholder="e.g. Villa Bellissima"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Location &amp; Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => onChangeAddress(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
                  placeholder="e.g. Val d’Orcia, Tuscany, Italy"
                />
              </div>
            </div>

            <LocationMapPicker
              venue={venue}
              address={address}
              locationMap={locationMap}
              onChangeVenue={onChangeVenue}
              onChangeAddress={onChangeAddress}
              onChangeLocationMap={onChangeLocationMap}
            />
          </div>
        </div>
      )}

      {/* TAB 2: Love Story & Itinerary */}
      {weddingTab === 'story' && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high space-y-3">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">auto_stories</span>
              <span>Our Love Story &amp; Welcome Message</span>
            </h2>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => onChangeNote(e.target.value)}
              className="w-full p-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
              placeholder="Share the story of how you met, your journey, and what this celebration means to you..."
            />
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
                <span>Weekend Schedule / Program of Events</span>
              </h2>
              <button
                type="button"
                onClick={handleAddScheduleItem}
                className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">add</span>
                <span>Add Event</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {schedule.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                >
                  <input
                    type="text"
                    value={item.time}
                    onChange={(e) => handleUpdateScheduleItem(item.id, 'time', e.target.value)}
                    placeholder="Time"
                    className="sm:w-28 h-8 px-2.5 rounded-lg bg-white border border-surface-container-high text-xs font-mono font-medium"
                  />
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleUpdateScheduleItem(item.id, 'title', e.target.value)}
                    placeholder="Title"
                    className="sm:w-44 h-8 px-2.5 rounded-lg bg-white border border-surface-container-high text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleUpdateScheduleItem(item.id, 'description', e.target.value)}
                    placeholder="Description"
                    className="flex-1 h-8 px-2.5 rounded-lg bg-white border border-surface-container-high text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveScheduleItem(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer self-end sm:self-center"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Imagery & Music */}
      {weddingTab === 'media' && (
        <div className="space-y-4">
          <CategoryPhotoUploader
            category="wedding"
            photos={photos}
            onChangePhotos={onChangePhotos}
            onToast={onToast}
            title="Wedding Gallery &amp; Couple Photos"
            subtitle="Curate cover photos, engagement moments, and celebration visuals."
          />

          {onChangeMusicUrl && (
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high space-y-3">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">music_note</span>
                <span>Background Song / Wedding Audio</span>
              </h2>
              <input
                type="text"
                value={musicUrl || ''}
                onChange={(e) => onChangeMusicUrl(e.target.value)}
                placeholder="Audio URL (e.g. /music/wedding-theme.mp3 or web mp3 stream)..."
                className="w-full h-9 px-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
              />
              <p className="text-[11px] text-gray-500">
                Guests can play this song while browsing your wedding website. Leave empty to disable background audio.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: RSVP & Registry */}
      {weddingTab === 'rsvp' && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">how_to_reg</span>
              <span>RSVP Preferences</span>
            </h2>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">RSVP Reply Deadline</label>
              <input
                type="text"
                value={rsvpDeadline || ''}
                onChange={(e) => onChangeRsvpDeadline?.(e.target.value)}
                placeholder="e.g. September 1, 2025"
                className="w-full h-9 px-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-surface-container-high/60">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowMealSelection}
                  onChange={(e) => onChangeAllowMealSelection?.(e.target.checked)}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
                <span>Allow Meal Selection (e.g. Harvest Meat, Atlantic Salmon, Vegan)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDietary}
                  onChange={(e) => onChangeAllowDietary?.(e.target.checked)}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
                <span>Allow Dietary Allergies &amp; Notes</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowPlusOnes}
                  onChange={(e) => onChangeAllowPlusOnes?.(e.target.checked)}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
                <span>Allow Plus-Ones (+1 Guest Attendance)</span>
              </label>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high space-y-3">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">card_giftcard</span>
              <span>Gift Registry</span>
            </h2>
            <input
              type="url"
              value={weddingData?.registryUrl || ''}
              onChange={(e) => updateWeddingField('registryUrl', e.target.value)}
              placeholder="Registry Link (e.g. https://zola.com/registry/your-name)..."
              className="w-full h-9 px-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      )}
    </div>
  );
};
