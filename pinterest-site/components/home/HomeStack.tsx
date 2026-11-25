import type { ReactNode } from "react";

/** Vertical rhythm between home sections: 56px on mobile, 96px on desktop. */
export function HomeStack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-14 pb-14 pt-6 lg:gap-24 lg:pb-24 lg:pt-16">{children}</div>;
}
