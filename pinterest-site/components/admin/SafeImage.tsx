'use client';

import { useState } from 'react';
import { Icon } from './Icon';

/** Image that never shows a broken icon: missing or failing sources fall back to a neutral block. */
export function SafeImage({ src, alt, className = '' }: { src: string | null | undefined; alt: string; className?: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <div className={`flex items-center justify-center bg-surface-container text-on-surface-variant ${className}`}>
        <Icon name="image" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailedSrc(src)} className={`object-cover ${className}`} />
  );
}
