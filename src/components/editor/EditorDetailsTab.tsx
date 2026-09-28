import React from 'react';
import { EventData } from '@/types';

interface EditorDetailsTabProps {
  data: EventData;
  onChange: (updates: Partial<EventData>) => void;
}

export const EditorDetailsTab: React.FC<EditorDetailsTabProps> = ({ data, onChange }) => {
  return (
    <div className="tab-panel flex flex-col gap-space-md">
      <div>
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary">
          Content Master
        </span>
        <h2 className="font-headline-md text-headline-md text-on-surface mt-space-xs">
          Event Details
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Update primary names, milestones, and registry essentials.
        </p>
      </div>

      <div className="space-y-space-md">
        <div className="flex flex-col gap-space-xs">
          <label className="font-body-sm text-body-sm text-on-surface font-semibold">
            Couple / Event Names
          </label>
          <input
            className="w-full h-11 px-space-md bg-surface-container-low rounded-lg text-body-md text-on-surface outline-none focus:bg-surface focus:shadow-[0_0_0_2px_rgba(143,60,44,0.15)] transition-all border border-outline-variant/30"
            id="input-names"
            type="text"
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-space-xs">
          <label className="font-body-sm text-body-sm text-on-surface font-semibold">
            Event Title / Tagline
          </label>
          <input
            className="w-full h-11 px-space-md bg-surface-container-low rounded-lg text-body-md text-on-surface outline-none focus:bg-surface focus:shadow-[0_0_0_2px_rgba(143,60,44,0.15)] transition-all border border-outline-variant/30"
            id="input-tagline"
            type="text"
            value={data.tagline}
            onChange={(e) => onChange({ tagline: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <div className="flex flex-col gap-space-xs">
            <label className="font-body-sm text-body-sm text-on-surface font-semibold">
              Event Date
            </label>
            <input
              className="w-full h-11 px-space-md bg-surface-container-low rounded-lg text-body-md text-on-surface outline-none focus:bg-surface transition-all border border-outline-variant/30"
              id="input-date"
              type="text"
              value={data.date}
              onChange={(e) => onChange({ date: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-space-xs">
            <label className="font-body-sm text-body-sm text-on-surface font-semibold">
              Ceremony / Event Time
            </label>
            <input
              className="w-full h-11 px-space-md bg-surface-container-low rounded-lg text-body-md text-on-surface outline-none focus:bg-surface transition-all border border-outline-variant/30"
              id="input-time"
              type="text"
              value={data.time}
              onChange={(e) => onChange({ time: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-space-xs">
          <label className="font-body-sm text-body-sm text-on-surface font-semibold">
            Venue Name
          </label>
          <input
            className="w-full h-11 px-space-md bg-surface-container-low rounded-lg text-body-md text-on-surface outline-none focus:bg-surface transition-all border border-outline-variant/30"
            id="input-venue"
            type="text"
            value={data.venue}
            onChange={(e) => onChange({ venue: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-space-xs">
          <label className="font-body-sm text-body-sm text-on-surface font-semibold">
            Location Address
          </label>
          <input
            className="w-full h-11 px-space-md bg-surface-container-low rounded-lg text-body-md text-on-surface outline-none focus:bg-surface transition-all border border-outline-variant/30"
            id="input-address"
            type="text"
            value={data.address}
            onChange={(e) => onChange({ address: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-space-xs">
          <label className="font-body-sm text-body-sm text-on-surface font-semibold">
            Welcome Invitation Note
          </label>
          <textarea
            className="w-full p-space-md bg-surface-container-low rounded-lg text-body-md text-on-surface outline-none focus:bg-surface transition-all resize-none border border-outline-variant/30"
            id="input-note"
            rows={3}
            value={data.note}
            onChange={(e) => onChange({ note: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};
