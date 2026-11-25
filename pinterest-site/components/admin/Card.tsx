import type { ReactNode } from "react";
import { ui } from "@/components/ui/classes";

type CardProps = {
  title?: string;
  /** Right side of the header, e.g. a range toggle. */
  actions?: ReactNode;
  id?: string;
  className?: string;
  children: ReactNode;
};

export function Card({ title, actions, id, className = "", children }: CardProps) {
  return (
    <section id={id} className={`min-w-0 scroll-mt-20 p-6 ${ui.card} ${className}`}>
      {title || actions ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          {title ? <h2 className="text-headline-sm font-bold text-[#0F172A]">{title}</h2> : <span />}
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/** Short slate line shown when a widget has no data yet. */
export function EmptyNote({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-body-sm text-[#64748B] ${className}`}>{children}</p>;
}
