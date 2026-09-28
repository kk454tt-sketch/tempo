import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '@/config/site';

interface BrandLogoProps {
  className?: string;
  showTagline?: boolean;
  linkTo?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  showTagline = true,
  linkTo = '/',
  size = 'md',
}) => {
  const [imageError, setImageError] = useState(false);

  const iconSizes = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-8 h-8 md:w-9 md:h-9 text-base',
    lg: 'w-10 h-10 md:w-11 md:h-11 text-lg',
  };

  const textSizes = {
    sm: 'text-[18px]',
    md: 'text-[20px] md:text-[22px]',
    lg: 'text-[24px] md:text-[26px]',
  };

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon: Vector SVG Logo with Terracotta Gradient */}
      {!imageError && siteConfig.logoUrl && !siteConfig.logoUrl.includes('googleusercontent') ? (
        <img
          src={siteConfig.logoUrl}
          alt="Tempo Logo"
          onError={() => setImageError(true)}
          className={`${iconSizes[size]} object-contain rounded-xl`}
        />
      ) : (
        <div
          className={`${iconSizes[size]} rounded-xl bg-gradient-to-br from-[#712618] via-[#8f3c2c] to-[#3f1108] text-white flex items-center justify-center shadow-sm ring-1 ring-black/5 flex-shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform duration-200`}
        >
          {/* Subtle geometric architectural arc behind letter T */}
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full p-1.5"
          >
            <circle cx="16" cy="16" r="13" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            <path
              d="M10 11H22M16 11V23"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="21.5" cy="11.5" r="1.5" fill="#F6C28F" />
          </svg>
        </div>
      )}

      {/* Brand Typography */}
      <div className="flex flex-col justify-center">
        <span
          className={`font-sans font-bold text-[#712618] tracking-tight leading-none ${textSizes[size]}`}
          style={{ letterSpacing: '-0.03em' }}
        >
          Tempo
        </span>
      </div>

      {showTagline && (
        <span className="hidden lg:inline-block font-sans text-[11px] font-medium text-slate-500 tracking-tight border-l border-slate-300 pl-2 ml-0.5 whitespace-nowrap">
          {siteConfig.tagline}
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="flex items-center group select-none">
        {content}
      </Link>
    );
  }

  return content;
};
