import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  title: string;
  /** Optional buttons shown on the right (e.g. "Add product"). */
  actions?: ReactNode;
};

export function AdminPageHeader({ title, actions }: AdminPageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-headline-md font-bold text-[#0F172A]">{title}</h1>
      {actions}
    </div>
  );
}
