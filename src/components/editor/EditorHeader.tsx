import React from 'react';
import { Link } from 'react-router-dom';

interface EditorHeaderProps {
  templateName: string;
  isSaving?: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
  isPublished?: boolean;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  templateName,
  isSaving = false,
  onSaveDraft,
  onPublish,
  isPublished = false,
}) => {
  return (
    <div className="w-full bg-surface-container-low px-margin md:px-margin-desktop py-space-sm shadow-sm flex flex-wrap items-center justify-between gap-space-md border-b border-surface-container">
      <div className="flex items-center gap-space-md">
        <Link
          to="/templates"
          className="inline-flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to templates</span>
        </Link>
        <span className="h-4 w-px bg-surface-container-highest" />
        <div className="inline-flex items-center gap-space-xs px-space-sm py-1 bg-surface rounded-full shadow-sm">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            Editing: <strong className="text-on-surface font-semibold">{templateName}</strong>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-space-md">
        <div className="inline-flex items-center gap-space-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px] text-secondary">
            {isSaving ? 'sync' : 'check_circle'}
          </span>
          <span className="font-caption text-caption text-on-surface-variant/80">
            {isSaving ? 'Saving...' : 'Saved just now'}
          </span>
        </div>

        <button
          onClick={onSaveDraft}
          type="button"
          className="px-space-md py-space-xs bg-surface hover:bg-surface-container text-on-surface font-label-md text-label-md rounded-lg shadow-sm transition-colors cursor-pointer border border-outline-variant/40"
        >
          Save draft
        </button>

        <button
          onClick={onPublish}
          type="button"
          id="publishBtn"
          className="inline-flex items-center gap-space-xs px-space-lg py-space-xs bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md rounded-lg shadow-sm tracking-wide transition-all active:scale-[0.98] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isPublished ? 'check' : 'send'}
          </span>
          <span>{isPublished ? 'Published' : 'Publish'}</span>
        </button>
      </div>
    </div>
  );
};
