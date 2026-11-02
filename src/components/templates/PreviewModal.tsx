import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TemplateMetadata } from '@/types/template';
import { UpiPaymentModal } from '@/components/common/UpiPaymentModal';
import { useAuth } from '@/context/AuthContext';
import { unlockService } from '@/services/unlockService';
import { TemplateRenderer } from '@/templates/components/TemplateRenderer';
import { getTemplateDefinition } from '@/templates/registry';

interface PreviewModalProps {
  template: TemplateMetadata | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ template, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);

  if (!isOpen || !template) return null;

  const definition = template ? getTemplateDefinition(template.id) : undefined;
  const isFree = template.isFree || template.price === 0;

  const handleCustomizeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (unlockService.isTemplateUnlocked(template.id, isFree, user?.id)) {
      onClose();
      navigate(`/create/${template.id}`);
    } else {
      setIsUpiModalOpen(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] border border-surface-container-high animate-in zoom-in-95 duration-200">
        {/* Top Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-surface flex items-center justify-between border-b border-surface-container-high/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim animate-pulse shrink-0"></span>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">
                {template.name}
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant truncate">
                {template.categoryLabel} · {template.author || 'Studio Atelier'}
              </p>
            </div>
          </div>

          {/* Viewport switcher */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  deviceMode === 'desktop'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm font-medium'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Desktop View"
              >
                <span className="material-symbols-outlined text-[18px]">desktop_windows</span>
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  deviceMode === 'mobile'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm font-medium'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Mobile View"
              >
                <span className="material-symbols-outlined text-[18px]">smartphone</span>
              </button>
            </div>

            <button
              onClick={handleCustomizeClick}
              className="px-4 py-1.5 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary-container shadow-sm transition-all cursor-pointer"
            >
              {isFree
                ? 'Use Free Template'
                : unlockService.isTemplateUnlocked(template.id, false)
                ? 'Customize (Unlocked ✓)'
                : `Customize — ${template.priceLabel || `$${template.price}`}`}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Modal Body / Sandbox Preview Frame */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-surface-container-low/40 flex items-center justify-center min-h-[400px]">
          <div
            className={`transition-all duration-300 rounded-xl overflow-hidden shadow-xl bg-surface-container-lowest border border-surface-container-high ${
              deviceMode === 'mobile' ? 'w-[375px] min-h-[600px]' : 'w-full'
            }`}
          >
            {/* Chrome Bar */}
            <div className="px-4 py-2.5 bg-surface-container flex items-center gap-2 border-b border-surface-container-high/60">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-outline-variant/60"></span>
                <span className="w-2 h-2 rounded-full bg-outline-variant/60"></span>
                <span className="w-2 h-2 rounded-full bg-outline-variant/60"></span>
              </div>
              <div className="flex-1 max-w-xs mx-auto h-6 rounded bg-surface-container-lowest px-3 flex items-center justify-between text-on-surface-variant font-mono text-[11px] shadow-inner truncate">
                <span className="truncate">{template.id}.canvas.design/live</span>
                <span className="material-symbols-outlined text-[12px] text-tertiary-fixed-dim">lock</span>
              </div>
            </div>

            {/* Actual Live Interactive Template Canvas */}
            <div className="w-full h-[70vh] min-h-[550px] overflow-y-auto bg-slate-950">
              {definition ? (
                <TemplateRenderer
                  templateId={template.id}
                  data={definition.defaultData}
                  isLivePreview={true}
                />
              ) : (
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-container">
                  <img
                    src={template.previewImage}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent flex flex-col justify-end p-6 text-on-primary">
                    <h2 className="font-headline-lg text-headline-lg font-bold tracking-tight">
                      {template.name}
                    </h2>
                    <p className="font-body-sm text-body-sm opacity-90 max-w-md mt-1">
                      {template.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 bg-surface border-t border-surface-container-high/60 flex items-center justify-between text-on-surface-variant text-body-sm text-xs">
          <span>Instant staging environment online · Retina 4K canvas</span>
          <Link to={`/templates/${template.id}`} className="font-label-sm text-on-surface hover:underline">
            View complete monograph details →
          </Link>
        </div>
      </div>

      {/* UPI Payment Gate Modal */}
      <UpiPaymentModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        onSuccess={() => {
          setIsUpiModalOpen(false);
          onClose();
          navigate(`/create/${template.id}`);
        }}
        templateId={template.id}
        templateName={template.name}
        priceLabel={template.priceLabel}
        priceAmount={template.price || 29}
        userId={user?.id}
      />
    </div>
  );
};
