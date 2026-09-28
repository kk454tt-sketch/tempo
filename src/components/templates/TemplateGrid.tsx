import React from 'react';
import { TemplateMetadata } from '@/types/template';
import { TemplateCard } from './TemplateCard';

interface TemplateGridProps {
  templates: TemplateMetadata[];
  onPreview?: (template: TemplateMetadata) => void;
}

export const TemplateGrid: React.FC<TemplateGridProps> = ({ templates, onPreview }) => {
  if (templates.length === 0) {
    return (
      <div className="w-full py-space-xl text-center bg-surface-container-low rounded-2xl border border-surface-container">
        <span className="material-symbols-outlined text-[40px] text-outline mb-2">dashboard_customize</span>
        <p className="font-body-md text-on-surface-variant">
          No templates found in this category yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter-desktop">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
};
