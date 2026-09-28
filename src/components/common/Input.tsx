import React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: string;
  rightIcon?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-space-xs w-full">
        {label && (
          <label htmlFor={inputId} className="font-body-sm text-body-sm font-semibold text-on-surface">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="material-symbols-outlined absolute left-3 text-outline/70 text-[20px] pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full h-11 px-space-md rounded bg-surface-container-lowest text-on-surface placeholder:text-outline/60 font-body-md text-body-md shadow-sm border border-outline-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-error focus:border-error focus:ring-error/20',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="material-symbols-outlined absolute right-3 text-outline/70 text-[20px] pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <span className="font-caption text-caption text-error">{error}</span>}
        {helperText && !error && (
          <span className="font-caption text-caption text-on-surface-variant/70">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
