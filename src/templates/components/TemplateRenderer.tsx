import React from 'react';
import { EventData } from '@/types';
import { getTemplateDefinition } from '../registry';

interface TemplateRendererProps {
  templateId: string;
  data: EventData;
  isLivePreview?: boolean;
  onRsvpSubmit?: (rsvpData: Record<string, unknown>) => void;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  templateId,
  data,
  isLivePreview = false,
  onRsvpSubmit,
}) => {
  const definition = getTemplateDefinition(templateId);

  if (!definition) {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center p-space-xl text-center bg-surface-container-low rounded-xl">
        <span className="material-symbols-outlined text-[48px] text-error mb-space-sm">error_outline</span>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-space-xs">
          Template Not Found
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
          The requested template <code className="text-primary font-mono font-semibold">"{templateId}"</code> is not registered in the system.
        </p>
      </div>
    );
  }

  const Component = definition.component;

  return (
    <Component
      data={data}
      isLivePreview={isLivePreview}
      onRsvpSubmit={onRsvpSubmit}
    />
  );
};
