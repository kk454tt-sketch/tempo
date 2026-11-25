import type { ComponentPropsWithoutRef } from "react";

/** Max width 1360px, 16px side margins on mobile, 48px on desktop. */
export function Container({ className = "", ...rest }: ComponentPropsWithoutRef<"div">) {
  return <div className={`mx-auto w-full max-w-[1360px] px-4 lg:px-12 ${className}`} {...rest} />;
}
