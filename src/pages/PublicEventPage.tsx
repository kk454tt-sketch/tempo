import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventService } from '@/services/eventService';
import { TemplateRenderer } from '@/templates/components/TemplateRenderer';
import { EventWebsite } from '@/types';

export const PublicEventPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [website, setWebsite] = useState<EventWebsite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSite = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
      const site = await eventService.getWebsiteBySlug(slug);
      setWebsite(site);
      setLoading(false);
    };
    loadSite();
  }, [slug]);

  const handleRsvpSubmit = async (rsvpData: Record<string, unknown>) => {
    if (slug) {
      await eventService.recordRsvp(slug, rsvpData);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!website) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-space-xl text-center">
        <span className="material-symbols-outlined text-[64px] text-primary mb-space-sm">
          drafts
        </span>
        <h1 className="font-display-xl text-display-lg md:text-display-xl text-on-surface mb-space-xs">
          Event Not Found
        </h1>
        <p className="font-body-md text-on-surface-variant max-w-md mb-space-lg">
          The event website <code className="text-primary font-mono font-semibold">"/e/{slug}"</code> could not be found or has not yet been published.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center font-label-md bg-primary text-on-primary px-space-xl py-space-sm rounded-lg shadow-sm"
        >
          Go to Tempo Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <TemplateRenderer
        templateId={website.templateId}
        data={{ ...website.eventData, slug: website.slug }}
        isLivePreview={false}
        onRsvpSubmit={handleRsvpSubmit}
      />
    </div>
  );
};
