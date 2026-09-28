import React from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-label-md transition-all duration-200 rounded-lg select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer';

  const variants = {
    primary:
      'bg-primary-container text-on-primary hover:bg-primary shadow-sm hover:shadow-md tracking-wide',
    secondary:
      'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low border border-outline-variant/50 shadow-sm',
    ghost:
      'bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low',
    outline:
      'bg-transparent text-primary border border-primary hover:bg-primary/5',
  };

  const sizes = {
    sm: 'px-space-md py-1 text-label-sm',
    md: 'px-space-lg py-space-sm text-label-md',
    lg: 'px-space-xl py-space-md text-body-md',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
};
