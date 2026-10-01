import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  className?: string;
  showStudioTag?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', showStudioTag = false }) => {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2 group transition-opacity hover:opacity-90 ${className}`}
      aria-label="tempo. Home"
    >
      <div className="flex items-center gap-2">
        <span className="font-display-hero text-[22px] md:text-[24px] font-medium text-on-surface tracking-tight leading-none select-none">
          tempo<span className="text-on-tertiary-container">.</span>
        </span>
        {showStudioTag && (
          <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-[10px] tracking-wider uppercase">
            Atelier
          </span>
        )}
      </div>
    </Link>
  );
};
