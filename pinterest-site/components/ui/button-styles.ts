// Every button on the site is styled here. If DESIGN.md names tokens for the
// amber fill or the glow, change AMBER below and nothing else.
const BASE =
  "inline-flex items-center justify-center gap-2 rounded-[16px] text-label-md font-semibold " +
  "transition-[box-shadow,background-color] duration-200 motion-reduce:transition-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

const AMBER = "bg-amber-500 text-primary hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]";
const GHOST = "border border-slate-200 bg-white text-primary hover:bg-slate-50";

const SIZES = { md: "h-12 px-6", sm: "h-10 px-5" } as const;

export type ButtonVariant = "primary" | "ghost";
export type ButtonSize = keyof typeof SIZES;

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra = "",
): string {
  return `${BASE} ${SIZES[size]} ${variant === "primary" ? AMBER : GHOST} ${extra}`.trim();
}
