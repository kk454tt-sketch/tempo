"use client";

import { Icon } from "@/components/ui/Icon";
import { ui } from "@/components/ui/classes";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-24 text-center">
      <Icon name="error" className="text-[40px] text-[#64748B]" />
      <p className="text-headline-sm font-bold text-[#0F172A]">Something went wrong</p>
      <button type="button" onClick={reset} className={ui.btnPrimary}>
        Retry
      </button>
    </div>
  );
}
