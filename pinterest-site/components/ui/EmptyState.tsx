import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

export type EmptyStateProps = {
  icon: string;
  title: string;
  action?: ReactNode;
  children?: ReactNode;
};

/** Centered empty area: a Material icon, one line of text, and an optional action or children. */
export function EmptyState({ icon, title, action, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center text-on-surface-variant">
      <Icon name={icon} className="text-[48px] leading-none" />
      <p className="text-headline-sm text-primary">{title}</p>
      {action}
      {children}
    </div>
  );
}

export default EmptyState;
