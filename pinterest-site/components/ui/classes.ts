/**
 * Shared class strings for admin screens (login, dialogs, buttons).
 * Hex values come from the design prompts: amber #F59E0B, navy #0F172A,
 * slate #64748B, border #E2E8F0, hover #F1F5F9. If DESIGN.md uses different
 * values, change them here once.
 */
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] focus-visible:ring-offset-2";

const btnBase = `inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-6 text-body-md font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;

export const ui = {
  focusRing,
  card: "rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)]",
  label: "mb-1.5 block text-body-sm font-semibold text-[#0F172A]",
  input:
    "h-12 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-body-md text-[#0F172A] placeholder:text-[#94A3B8] transition focus:border-[#F59E0B] focus:outline-none focus:ring-2 focus:ring-[rgba(245,158,11,0.35)] aria-[invalid=true]:border-[#DC2626]",
  btnPrimary: `${btnBase} bg-[#F59E0B] text-[#0F172A] hover:shadow-[0_8px_24px_rgba(245,158,11,0.35)] disabled:hover:shadow-none`,
  btnGhost: `${btnBase} border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F1F5F9]`,
  btnDanger: `${btnBase} bg-[#DC2626] text-white hover:bg-[#B91C1C]`,
} as const;
