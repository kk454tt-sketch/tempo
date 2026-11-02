import React from 'react';
import { ScheduleItem } from '@/types';

interface BirthdayDefaultInfoSectionProps {
  title: string;
  tagline: string;
  milestoneAge: string;
  welcomeNote: string;
  schedule: ScheduleItem[];
  rsvpEnabled: boolean;
  rsvpDeadline: string;
  requireMobile: boolean;
  allowPlusOnes: boolean;
  allowDietary: boolean;
  accentPalette: string;
  fontPairing: string;
  templateDefaultTitle?: string;
  templateDefaultTagline?: string;
  templateDefaultNote?: string;
  onChangeTitle: (val: string) => void;
  onChangeTagline: (val: string) => void;
  onChangeMilestoneAge: (val: string) => void;
  onChangeWelcomeNote: (val: string) => void;
  onChangeSchedule: (items: ScheduleItem[]) => void;
  onChangeRsvpEnabled: (val: boolean) => void;
  onChangeRsvpDeadline: (val: string) => void;
  onChangeRequireMobile: (val: boolean) => void;
  onChangeAllowPlusOnes: (val: boolean) => void;
  onChangeAllowDietary: (val: boolean) => void;
  onChangeAccentPalette: (val: any) => void;
  onChangeFontPairing: (val: any) => void;
  onResetDefaults: () => void;
  onToast: (msg: string) => void;
}

export const BirthdayDefaultInfoSection: React.FC<BirthdayDefaultInfoSectionProps> = ({
  title,
  tagline,
  milestoneAge,
  welcomeNote,
  schedule,
  rsvpEnabled,
  rsvpDeadline,
  requireMobile,
  allowPlusOnes,
  allowDietary,
  accentPalette,
  fontPairing,
  onChangeTitle,
  onChangeTagline,
  onChangeMilestoneAge,
  onChangeWelcomeNote,
  onChangeSchedule,
  onChangeRsvpEnabled,
  onChangeRsvpDeadline,
  onChangeRequireMobile,
  onChangeAllowPlusOnes,
  onChangeAllowDietary,
  onChangeAccentPalette,
  onChangeFontPairing,
  onResetDefaults,
  onToast,
}) => {
  const handleAddScheduleItem = () => {
    const newItem: ScheduleItem = {
      id: `sched-${Date.now()}`,
      time: '6:00 PM',
      title: 'Cake Cutting & Wishes',
      description: 'Gather around the dessert table for birthday candles and treats.',
    };
    onChangeSchedule([...schedule, newItem]);
    onToast('Added schedule timeline item!');
  };

  const handleUpdateScheduleItem = (index: number, updates: Partial<ScheduleItem>) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], ...updates };
    onChangeSchedule(updated);
  };

  const handleRemoveScheduleItem = (id: string) => {
    onChangeSchedule(schedule.filter((s) => s.id !== id));
    onToast('Schedule item removed.');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <div className="bg-surface-container-lowest rounded-2xl p-3.5 sm:p-5 shadow-sm border border-surface-container-high space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-surface-container">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              <span className="material-symbols-outlined text-[19px]">article</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                Section 2: Site Default Info
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-500 truncate">
                Customizable titles, story text, schedule, and RSVP settings.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onResetDefaults}
            className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-gray-200 shrink-0"
            title="Restore original template text"
          >
            <span className="material-symbols-outlined text-[15px]">restart_alt</span>
            <span className="hidden sm:inline">Reset to Template Defaults</span>
            <span className="sm:hidden">Reset Defaults</span>
          </button>
        </div>

        {/* Celebrant Title & Subtitle */}
        <div className="space-y-3 pt-1">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Event Title / Celebrant Headline <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => onChangeTitle(e.target.value)}
              placeholder="e.g. Emma's 25th Birthday Soirée (or Leo's 5th Birthday Quest!)"
              className="w-full h-10 px-3.5 bg-surface-container-low text-xs font-semibold rounded-xl border border-surface-container-high focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Tagline / Subtitle Greeting
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => onChangeTagline(e.target.value)}
                placeholder="e.g. you're invited to celebrate"
                className="w-full h-10 px-3.5 bg-surface-container-low text-xs rounded-xl border border-surface-container-high focus:bg-white focus:outline-none text-gray-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Milestone Age / Chapter
              </label>
              <input
                type="text"
                value={milestoneAge}
                onChange={(e) => onChangeMilestoneAge(e.target.value)}
                placeholder="e.g. 25, 5th, 30"
                className="w-full h-10 px-3.5 bg-surface-container-low text-xs font-bold text-primary rounded-xl border border-surface-container-high focus:bg-white focus:outline-none"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                Controls wax seal / badge numbers
              </span>
            </div>
          </div>

          {/* Welcome Letter / Personal Note */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Welcome Invitation Letter / Personal Story
            </label>
            <textarea
              rows={3}
              value={welcomeNote}
              onChange={(e) => onChangeWelcomeNote(e.target.value)}
              placeholder="e.g. Join us for champagne, treats, cake cutting at sunset, and secret treasure games!"
              className="w-full p-3 bg-surface-container-low text-xs rounded-xl border border-surface-container-high focus:bg-white focus:outline-none text-gray-900 resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Itinerary & Timeline Schedule */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">schedule</span>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
              Celebration Itinerary &amp; Timeline ({schedule.length} Events)
            </h3>
          </div>

          <button
            type="button"
            onClick={handleAddScheduleItem}
            className="px-3 py-1 bg-primary text-on-primary hover:bg-primary-container text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            <span>Add Event</span>
          </button>
        </div>

        {schedule.length === 0 ? (
          <div className="p-4 rounded-xl bg-surface-container-low text-center text-xs text-gray-500">
            No custom schedule items. Click &quot;Add Event&quot; to show an hour-by-hour itinerary on your site.
          </div>
        ) : (
          <div className="space-y-2.5">
            {schedule.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3 bg-surface-container-low rounded-xl border border-surface-container flex flex-col sm:flex-row items-start sm:items-center gap-2.5"
              >
                <div className="w-full sm:w-28 shrink-0">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">Time</label>
                  <input
                    type="text"
                    value={item.time}
                    onChange={(e) => handleUpdateScheduleItem(idx, { time: e.target.value })}
                    placeholder="e.g. 5:30 PM"
                    className="w-full h-8 px-2 text-xs font-semibold bg-white rounded-lg border border-gray-200 text-gray-900 focus:outline-none"
                  />
                </div>

                <div className="flex-1 w-full">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">Title &amp; Note</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdateScheduleItem(idx, { title: e.target.value })}
                      placeholder="e.g. Champagne Toast & Cake Cutting"
                      className="flex-1 h-8 px-2 text-xs font-semibold bg-white rounded-lg border border-gray-200 text-gray-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveScheduleItem(item.id)}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-rose-50 text-gray-400 hover:text-rose-600 border border-gray-200 flex items-center justify-center cursor-pointer shrink-0"
                      title="Remove event"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RSVP Configuration */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-surface-container">
          <span className="material-symbols-outlined text-[20px] text-primary">how_to_reg</span>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
            RSVP Intake &amp; Mobile Settings
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-container">
            <div>
              <p className="text-xs font-bold text-gray-900">Enable Guest RSVP Form</p>
              <p className="text-[11px] text-gray-500">Allow guests to submit attendance directly on the site</p>
            </div>
            <input
              type="checkbox"
              checked={rsvpEnabled}
              onChange={(e) => onChangeRsvpEnabled(e.target.checked)}
              className="w-5 h-5 text-primary rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-container">
            <div>
              <p className="text-xs font-bold text-gray-900">Ask for Mobile Phone / WhatsApp Number</p>
              <p className="text-[11px] text-gray-500">Collect guest numbers for direct celebration reminders and updates</p>
            </div>
            <input
              type="checkbox"
              checked={requireMobile}
              onChange={(e) => onChangeRequireMobile(e.target.checked)}
              className="w-5 h-5 text-primary rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-container">
            <div>
              <p className="text-xs font-bold text-gray-900">Allow Plus-Ones &amp; Little Adventurers Count</p>
              <p className="text-[11px] text-gray-500">Guests select headcount (1 to 8 attendees)</p>
            </div>
            <input
              type="checkbox"
              checked={allowPlusOnes}
              onChange={(e) => onChangeAllowPlusOnes(e.target.checked)}
              className="w-5 h-5 text-primary rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-container">
            <div>
              <p className="text-xs font-bold text-gray-900">Dietary Restrictions &amp; Birthday Wishes Field</p>
              <p className="text-[11px] text-gray-500">Note area for allergies (e.g. nut-free, vegan) and well wishes</p>
            </div>
            <input
              type="checkbox"
              checked={allowDietary}
              onChange={(e) => onChangeAllowDietary(e.target.checked)}
              className="w-5 h-5 text-primary rounded cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">RSVP Deadline Date</label>
            <input
              type="text"
              value={rsvpDeadline}
              onChange={(e) => onChangeRsvpDeadline(e.target.value)}
              placeholder="e.g. May 25, 2025 (or September 15, 2025)"
              className="w-full h-10 px-3.5 bg-surface-container-low text-xs rounded-xl border border-surface-container-high focus:bg-white focus:outline-none text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Theme Appearance & Fonts */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-surface-container">
          <span className="material-symbols-outlined text-[20px] text-primary">palette</span>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
            Theme Palette &amp; Font Typography
          </h3>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-700 block">Accent Color Palette</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'terracotta', name: 'Coral Terracotta', hex: '#ff5a5f' },
              { id: 'warm-beige', name: 'Warm Sunshine', hex: '#ffd84d' },
              { id: 'botanical-sage', name: 'Botanical Sage', hex: '#879576' },
              { id: 'monolith-zinc', name: 'Deep Midnight', hex: '#14305A' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeAccentPalette(item.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  accentPalette === item.id
                    ? 'ring-2 ring-primary border-primary bg-primary/5'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div
                  className="w-full h-8 rounded-lg mb-1.5 shadow-xs"
                  style={{ backgroundColor: item.hex }}
                />
                <span className="text-xs font-bold text-gray-800 block truncate">{item.name}</span>
              </button>
            ))}
          </div>

          <label className="text-xs font-bold text-gray-700 block pt-2">Font Typography</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChangeFontPairing('sans')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                fontPairing === 'sans' ? 'ring-2 ring-primary border-primary bg-primary/5' : 'border-gray-200'
              }`}
            >
              <p className="text-xs font-bold text-gray-900">Playful Sans (Nunito / Fredoka)</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Clean, modern, and cheerful</p>
            </button>
            <button
              type="button"
              onClick={() => onChangeFontPairing('serif')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                fontPairing === 'serif' ? 'ring-2 ring-primary border-primary bg-primary/5' : 'border-gray-200'
              }`}
            >
              <p className="text-xs font-bold font-serif text-gray-900">Vintage Fraunces &amp; Script</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Tactile paper keepsake style</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
