import type { ReactNode } from 'react';

/**
 * Content wrapper for inner public pages: max width 1360px, 16px side margins
 * on mobile and 48px on desktop. Header, banner and footer come from the
 * shared layout, so pages only render their own content.
 */
export default function PageContainer({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1360px] px-4 pb-14 pt-8 md:pb-24 md:pt-12 lg:px-12 ${className}`}>
      {children}
    </div>
  );
}
