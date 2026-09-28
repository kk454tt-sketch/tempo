import React from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  type?: 'success' | 'info' | 'error';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  isVisible,
  type = 'success',
}) => {
  if (!isVisible) return null;

  const iconName =
    type === 'success'
      ? 'check_circle'
      : type === 'error'
      ? 'error'
      : 'info';

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 bg-inverse-surface text-inverse-on-surface px-space-lg py-space-md rounded-xl shadow-xl flex items-center gap-space-sm font-body-sm text-body-sm ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16 pointer-events-none'
      }`}
    >
      <span
        className="material-symbols-outlined text-secondary-fixed text-[20px]"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {iconName}
      </span>
      <span>{message}</span>
    </div>
  );
};
