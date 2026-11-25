import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Discovery chip (DESIGN.md): pill, white with a 1px border when idle,
 * navy fill with white text when selected. Rendered as a link so filtering
 * works without client JavaScript and every state has a shareable URL.
 */
export default function Chip({
  href,
  selected,
  children,
}: {
  href: string;
  selected: boolean;
  children: ReactNode;
}) {
  const state = selected
    ? 'border-primary bg-primary text-on-primary'
    : 'border-[#E2E8F0] bg-white text-primary hover:border-primary/40';

  return (
    <Link
      href={href}
      scroll={false}
      aria-current={selected ? 'true' : undefined}
      className={`inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full border px-5 text-body-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 ${state}`}
    >
      {children}
    </Link>
  );
}
