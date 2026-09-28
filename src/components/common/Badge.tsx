import React from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'olive' | 'draft' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
}) => {
  const variants = {
    default: 'bg-surface-container-high text-on-surface-variant',
    primary: 'bg-primary-container text-on-primary',
    secondary: 'bg-secondary-container text-on-secondary-container',
    olive: 'bg-[#EBF0EA] text-[#3E4A3D]',
    draft: 'bg-surface-container-highest text-on-surface-variant',
    outline: 'bg-surface-container-lowest/90 text-on-surface border border-outline-variant/50',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm uppercase tracking-wider',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
