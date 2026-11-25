import type { ReactNode } from "react";

export function SettingsCard({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.05)]"
    >
      <h2 id={id} className="text-headline-sm font-bold text-primary">
        {title}
      </h2>
      {description && <p className="mt-1 text-body-md text-on-surface-variant">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}
