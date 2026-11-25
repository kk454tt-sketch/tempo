/**
 * The only place with shared admin class strings.
 * Token names follow the Stitch Tailwind config (primary = navy, on-surface / on-surface-variant,
 * surface-container, text-headline-* / body-* / label-sm). Amber and borders are the hex values from DESIGN.md.
 */
const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/50';
const inputBase =
  'rounded-[12px] border border-[#E2E8F0] bg-white px-3 text-body-md text-on-surface placeholder:text-on-surface-variant/60 transition-colors focus:border-[#F59E0B] aria-[invalid=true]:border-[#DC2626] disabled:opacity-60 ' +
  focusRing;

export const ui = {
  card: 'rounded-[16px] border border-[#E2E8F0] bg-white',
  input: `h-11 w-full ${inputBase}`,
  textarea: `w-full min-h-[104px] py-3 ${inputBase}`,
  inputGroup:
    'flex h-11 w-full items-center rounded-[12px] border border-[#E2E8F0] bg-white transition-colors focus-within:border-[#F59E0B] focus-within:ring-2 focus-within:ring-[#F59E0B]/40',
  inputInner:
    'h-full min-w-0 flex-1 bg-transparent px-2 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/60',
  btn: `inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[16px] px-5 text-body-md font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`,
  btnPrimary: 'bg-[#F59E0B] text-primary hover:shadow-[0_0_18px_rgba(245,158,11,0.45)]',
  btnGhost: 'border border-[#E2E8F0] bg-white text-primary hover:bg-[#F1F5F9]',
  btnDanger: 'border border-[#FCA5A5] bg-white text-[#DC2626] hover:bg-[#FEF2F2]',
  iconButton: `inline-flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-[#F1F5F9] hover:text-primary ${focusRing}`,
  error: 'text-body-sm text-[#DC2626]',
  muted: 'text-body-sm text-on-surface-variant',
  focusRing,
} as const;
