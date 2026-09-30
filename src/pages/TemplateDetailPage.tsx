import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { getTemplateDefinition } from '@/templates/registry';
import { TemplateRenderer } from '@/templates/components/TemplateRenderer';

export const TemplateDetailPage: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const template = getTemplateDefinition(templateId || '');

  if (!template) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-space-xl">
        <Navbar />
        <div className="pt-24 text-center">
          <h2 className="font-headline-lg text-on-surface mb-space-xs">Template Not Found</h2>
          <p className="font-body-md text-on-surface-variant mb-space-lg">
            We couldn't find the template "{templateId}".
          </p>
          <Link
            to="/templates"
            className="inline-flex items-center font-label-md bg-primary text-on-primary px-space-lg py-space-sm rounded-lg"
          >
            Back to Templates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Navbar />

      <main className="w-full pt-[68px] min-h-screen bg-surface flex-1">
        {/* Sub-header Bar */}
        <div className="w-full bg-surface-container-low px-margin md:px-margin-desktop py-space-sm border-b border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <Link
              to="/templates"
              className="inline-flex items-center gap-1 font-label-md text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>All Templates</span>
            </Link>
            <span className="text-outline-variant">•</span>
            <span className="font-label-md text-on-surface font-semibold">{template.name}</span>
          </div>

          <div className="flex items-center gap-2">
            {template.id === 'enrolldesk-01' && <Link to="/plans?product=pro-interactive" className="inline-flex items-center gap-space-xs font-label-md border border-primary text-primary hover:bg-primary/5 px-space-lg py-space-xs rounded-lg">Unlock Pro Interactive · ₹499</Link>}
            <button
              onClick={() => navigate(`/create/${template.id}`)}
              className="inline-flex items-center gap-space-xs font-label-md bg-primary-container text-on-primary hover:bg-primary px-space-lg py-space-xs rounded-lg shadow-sm"
            >
              <span>Use this template</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Live Template Preview Container */}
        <div className="w-full bg-surface">
          <TemplateRenderer
            templateId={template.id}
            data={template.defaultData}
            isLivePreview={false}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};
