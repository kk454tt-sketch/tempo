import React from 'react';
import { EventData, ActiveSections } from '@/types';

interface EditorSectionsTabProps {
  data: EventData;
  onChange: (updates: Partial<EventData>) => void;
}

export const EditorSectionsTab: React.FC<EditorSectionsTabProps> = ({
  data,
  onChange,
}) => {
  const sections = data.activeSections || {
    hero: true,
    countdown: true,
    story: true,
    schedule: true,
    venue: true,
    gallery: true,
    rsvp: true,
    guestbook: false,
    classmatesDirectory: true,
    hobbyMatchmaker: true,
    studentEnrollment: true,
    noticesBoard: true,
    dynamicForms: true,
    memoryWall: true,
    adminDesk: true,
  };

  const toggleSection = (key: keyof ActiveSections) => {
    onChange({
      activeSections: {
        ...sections,
        [key]: !sections[key],
      },
    });
  };

  // Standard Free Blocks
  const standardBlocks: Array<{
    key: keyof ActiveSections;
    label: string;
    desc: string;
    icon: string;
    locked?: boolean;
  }> = [
    { key: 'hero', label: 'Hero Cover & Title', desc: 'Main header banner and event greeting', icon: 'image', locked: true },
    { key: 'countdown', label: 'Countdown Clock', desc: 'Live countdown timer to moment date', icon: 'timer' },
    { key: 'story', label: 'Story & Narrative Letter', desc: 'Background story and tribute milestones', icon: 'menu_book' },
    { key: 'schedule', label: 'Schedule & Timeline', desc: 'Hour-by-hour event itinerary', icon: 'schedule' },
    { key: 'venue', label: 'Venue & Directions', desc: 'Address, map teaser, and travel info', icon: 'location_on' },
    { key: 'gallery', label: 'Photo Gallery / Dropzone', desc: 'Curated photo showcase grid', icon: 'photo_library' },
    { key: 'rsvp', label: 'RSVP Form & Dietary Intake', desc: 'Instant mobile guest confirmations', icon: 'how_to_reg' },
    { key: 'guestbook', label: 'Guestbook & Well Wishes', desc: 'Interactive guest message book', icon: 'edit_note' },
  ];

  // Pro Interactive Functions (Student, Campus & Community Modules)
  const proFunctions: Array<{
    key: keyof ActiveSections;
    label: string;
    desc: string;
    icon: string;
    tier: 'pro';
  }> = [
    {
      key: 'classmatesDirectory',
      label: 'Classmate Directory & Search',
      desc: 'Roster with search bar, major filters, and social handles',
      icon: 'badge',
      tier: 'pro',
    },
    {
      key: 'hobbyMatchmaker',
      label: 'Hobby & Interest Matchmaker',
      desc: 'Algorithm matching peers by mutual interests & privacy guard',
      icon: 'interests',
      tier: 'pro',
    },
    {
      key: 'studentEnrollment',
      label: 'Self-Service Profile Intake',
      desc: 'Allows students to register photo, major, and hobbies',
      icon: 'person_add',
      tier: 'pro',
    },
    {
      key: 'noticesBoard',
      label: 'Campus Notices & Urgent Broadcasts',
      desc: 'Categorized announcement board with urgent flags',
      icon: 'campaign',
      tier: 'pro',
    },
    {
      key: 'dynamicForms',
      label: 'Dynamic Forms & Custom Polls',
      desc: 'Create custom question forms for project pairing or merch polls',
      icon: 'quiz',
      tier: 'pro',
    },
    {
      key: 'memoryWall',
      label: 'Memory Wall & Peer Shoutouts',
      desc: 'Public appreciation wall where peers post recognition notes',
      icon: 'favorite',
      tier: 'pro',
    },
    {
      key: 'adminDesk',
      label: 'Admin Desk & 1-Click WhatsApp Copy',
      desc: 'Password-locked center to manage students & copy broadcasts',
      icon: 'admin_panel_settings',
      tier: 'pro',
    },
  ];

  return (
    <div className="tab-panel flex flex-col gap-space-md">
      <div>
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
            Modular Function Studio
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#C9982F]/20 text-[#C9982F] text-[10px] font-bold uppercase border border-[#C9982F]/40">
            Add &amp; Remove Functions
          </span>
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface mt-space-xs">
          Active Template Functions
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Enable or disable built-in functions to customize your website. Free templates include standard keepsake blocks; Pro templates allow full interactive community modules.
        </p>
      </div>

      {/* Pro Interactive Functions Group */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#182449] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#C9982F]">stars</span>
            <span>Interactive Pro Modules ({proFunctions.filter((f) => sections[f.key]).length}/{proFunctions.length} Active)</span>
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {proFunctions.map((item) => {
            const isEnabled = !!sections[item.key];
            return (
              <div
                key={item.key}
                onClick={() => toggleSection(item.key)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isEnabled
                    ? 'bg-white border-[#C9982F]/60 shadow-sm'
                    : 'bg-surface-container-low/60 border-surface-container opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isEnabled ? 'bg-[#182449] text-[#C9982F]' : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        {item.label}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-[#C9982F]/15 text-[#C9982F]">
                        Pro Function
                      </span>
                    </div>
                    <p className="font-caption text-caption text-on-surface-variant mt-0.5 leading-tight">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pt-1">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => {}}
                    className="accent-primary-container h-4 w-4 rounded cursor-pointer"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Standard Keepsake Blocks Group */}
      <div className="space-y-2 pt-4 border-t border-surface-container">
        <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">widgets</span>
          <span>Standard Keepsake Blocks (Free)</span>
        </span>

        <div className="flex flex-col gap-2">
          {standardBlocks.map((item) => {
            const isEnabled = !!sections[item.key];
            return (
              <div
                key={item.key}
                onClick={() => !item.locked && toggleSection(item.key)}
                className={`p-3 rounded-xl border transition-all ${
                  item.locked ? 'cursor-default' : 'cursor-pointer'
                } flex items-start justify-between gap-3 ${
                  isEnabled
                    ? 'bg-white border-surface-container shadow-sm'
                    : 'bg-surface-container-low/60 border-surface-container opacity-60 hover:opacity-90'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        {item.label}
                      </span>
                      {item.locked && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant uppercase font-bold">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="font-caption text-caption text-on-surface-variant mt-0.5 leading-tight">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pt-1">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    disabled={item.locked}
                    onChange={() => {}}
                    className="accent-primary-container h-4 w-4 rounded cursor-pointer disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
