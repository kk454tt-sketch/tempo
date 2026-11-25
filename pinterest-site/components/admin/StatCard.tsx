import Link from "next/link";
import { ui } from "@/components/ui/classes";

type StatCardProps = {
  label: string;
  value: string;
  /** Small slate line under the value, e.g. "Last 7 days". */
  hint?: string;
  /** Makes the whole card a link. */
  href?: string;
};

export function StatCard({ label, value, hint, href }: StatCardProps) {
  const content = (
    <>
      <p className="text-label-sm font-semibold uppercase tracking-wide text-[#64748B]">{label}</p>
      <p className="mt-2 break-words text-headline-lg font-bold text-[#0F172A]">{value}</p>
      {hint ? <p className="mt-1 text-body-sm text-[#64748B]">{hint}</p> : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`block min-w-0 p-6 transition hover:shadow-[0_4px_16px_rgba(15,23,42,0.08)] ${ui.card} ${ui.focusRing}`}
      >
        {content}
      </Link>
    );
  }
  return <div className={`min-w-0 p-6 ${ui.card}`}>{content}</div>;
}
