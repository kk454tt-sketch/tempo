import Link from "next/link";
import { ui } from "@/components/ui/classes";

export type RangeToggleItem = { label: string; href: string; active: boolean };

/** Segmented control: selected = white with a shadow on a #F1F5F9 track. The range lives in the URL. */
export function RangeToggle({ items, ariaLabel }: { items: readonly RangeToggleItem[]; ariaLabel: string }) {
  return (
    <div role="group" aria-label={ariaLabel} className="inline-flex rounded-xl bg-[#F1F5F9] p-1">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          scroll={false}
          aria-current={item.active ? "true" : undefined}
          className={`rounded-lg px-4 py-1.5 text-body-sm font-semibold transition ${ui.focusRing} ${
            item.active
              ? "bg-white text-[#0F172A] shadow-[0_1px_2px_rgba(15,23,42,0.12)]"
              : "text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
