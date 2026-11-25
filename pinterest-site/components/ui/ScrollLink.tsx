"use client";

import type { ReactNode } from "react";
import { scrollToId } from "@/lib/scroll";

/** Anchor that smooth-scrolls to an element on the page. Works without JS too (plain #hash). */
export function ScrollLink({
  targetId,
  className,
  children,
}: {
  targetId: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={`#${targetId}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        scrollToId(targetId);
      }}
    >
      {children}
    </a>
  );
}
