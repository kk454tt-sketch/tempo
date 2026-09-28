import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EventWebsite } from '@/types';

interface WebsiteCardProps {
  website: EventWebsite;
  onShare: (website: EventWebsite) => void;
  onQrCode: (website: EventWebsite) => void;
  onDuplicate: (website: EventWebsite) => void;
  onDelete: (website: EventWebsite) => void;
}

export const WebsiteCard: React.FC<WebsiteCardProps> = ({
  website,
  onShare,
  onQrCode,
  onDuplicate,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const coverUrl =
    website.eventData?.photos && website.eventData.photos.length > 0
      ? website.eventData.photos[0].url
      : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAbM9xqfg8IeSoPnnzoohoLtwjBjL0LzSxcHq3zA2HqkdoNmCw31LJPODRNaKfcXk4aEE_BfLwVRaawwpxLqGNH48ABqNULnMp6CSaQYntE3kILXJXmZxlqFKWuSW6nF-GB9ZhqzC1cvhVUTd47SyA733MSJ9NgbSnWMrSc--VEbhKbLHEbyn_2rUxvv_pfZS3BdFWhJMFD8CvHTQw0en7Xc-L42x9GniriMJgr4aLKZyJvO1fzx0Ocw';

  return (
    <article className="group bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden border border-surface-container">
      {/* Visual Preview Frame */}
      <div className="relative bg-surface-container-low aspect-[16/10] overflow-hidden">
        <img
          alt={website.title}
          className="w-full h-full object-cover object-top group-hover:scale-[1.015] transition-transform duration-500 ease-out"
          src={coverUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

        {/* Badges Floating Overlay */}
        <div className="absolute top-space-md left-space-md right-space-md flex items-center justify-between gap-space-sm">
          {website.status === 'published' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md shadow-sm font-label-sm text-label-sm text-on-surface">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Published
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest/90 text-on-surface-variant backdrop-blur-md shadow-sm font-label-sm text-label-sm">
              <span className="w-2 h-2 rounded-full bg-outline" />
              Draft
            </span>
          )}

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm text-on-surface font-label-sm text-label-sm shadow-sm">
            <span className="material-symbols-outlined text-[14px] text-primary">bookmark</span>
            {website.eventType || 'Event'}
          </span>
        </div>

        {/* Bottom quick overlay bar on hover */}
        {website.status === 'published' && (
          <div className="absolute bottom-space-md right-space-md flex items-center gap-space-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Link
              to={`/e/${website.slug}`}
              target="_blank"
              className="px-space-md py-1.5 rounded-lg bg-surface-container-lowest/95 backdrop-blur-md hover:bg-surface-container-lowest text-on-surface font-label-md text-label-md flex items-center gap-1 shadow-md"
              title="Open public preview"
            >
              <span>Live Site</span>
              <span className="material-symbols-outlined text-[15px]">arrow_outward</span>
            </Link>
          </div>
        )}
      </div>

      {/* Content & Information */}
      <div className="p-space-lg flex flex-col flex-1 justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center justify-between gap-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
              {website.eventType} · {website.eventData?.date || 'Upcoming'}
            </span>
            <div className="relative">
              <button
                aria-label={`More options for ${website.title}`}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span className="material-symbols-outlined text-[20px]">more_horiz</span>
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 bottom-full mb-2 w-48 bg-surface-container-lowest rounded-xl shadow-xl py-space-xs z-30 font-body-sm text-body-sm border border-surface-container">
                    <button
                      className="w-full px-space-md py-2 text-left hover:bg-surface-container flex items-center gap-2 text-on-surface cursor-pointer"
                      onClick={() => {
                        setMenuOpen(false);
                        onShare(website);
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">share</span>
                      Share site
                    </button>
                    <button
                      className="w-full px-space-md py-2 text-left hover:bg-surface-container flex items-center gap-2 text-on-surface cursor-pointer"
                      onClick={() => {
                        setMenuOpen(false);
                        onQrCode(website);
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                      Get QR Code
                    </button>
                    <button
                      className="w-full px-space-md py-2 text-left hover:bg-surface-container flex items-center gap-2 text-on-surface cursor-pointer"
                      onClick={() => {
                        setMenuOpen(false);
                        onDuplicate(website);
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">content_copy</span>
                      Duplicate
                    </button>
                    <button
                      className="w-full px-space-md py-2 text-left hover:bg-surface-container flex items-center gap-2 text-error font-medium cursor-pointer"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(website);
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      Delete site
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <h2 className="font-headline-md text-headline-md text-on-surface font-headline-md">
            {website.title}
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-outline">link</span>
            <span>tempo.moments/{website.slug}</span>
          </p>
        </div>

        {/* Quick Metrics Banner */}
        {website.status === 'published' ? (
          <div className="bg-surface-container-low rounded-lg p-space-md flex items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-lg">
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm font-headline-sm text-primary">
                  {website.metrics?.rsvpsCount || 0}
                </span>
                <span className="font-caption text-caption text-on-surface-variant">RSVPs received</span>
              </div>
              <div className="h-8 w-[1px] bg-outline-variant/40" />
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm font-headline-sm text-on-surface">
                  {website.metrics?.viewsCount || 0}
                </span>
                <span className="font-caption text-caption text-on-surface-variant">Unique views</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-secondary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px]">celebration</span>
              <span>RSVP Active</span>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-lg p-space-md flex items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[20px] text-tertiary">edit_note</span>
              <span>Draft mode (Ready to customize)</span>
            </div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary font-semibold">
              Draft
            </span>
          </div>
        )}

        {/* Primary Actions */}
        <div className="flex items-center gap-space-sm pt-space-xs">
          {website.status === 'published' ? (
            <>
              <Link
                to={`/e/${website.slug}`}
                target="_blank"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-space-md rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md text-center"
              >
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                <span>View site</span>
              </Link>
              <Link
                to={`/dashboard/websites/${website.id}/edit`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-space-md rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors font-label-md text-label-md text-center shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">edit_document</span>
                <span>Edit site</span>
              </Link>
            </>
          ) : (
            <Link
              to={`/dashboard/websites/${website.id}/edit`}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-space-md rounded-lg bg-surface-container-highest hover:bg-surface-container text-on-surface transition-colors font-label-md text-label-md text-center shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              <span>Continue editing</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};
