import { BR, ID, IN, MX, US } from "country-flag-icons/react/3x2";

const FLAGS = { US, IN, BR, MX, ID } as const;

/**
 * Inline SVG flag (emoji flags show as letters on Windows). `size` is the
 * height in px; the 3:2 flag is 1.5x as wide. Unknown codes show the US flag.
 * Decorative: the country name or code is always rendered next to it.
 */
export function Flag({
  code,
  size = 20,
  className = "",
}: {
  code: string;
  size?: number;
  className?: string;
}) {
  const Svg = FLAGS[code.toUpperCase() as keyof typeof FLAGS] ?? US;
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 overflow-hidden rounded-[4px] ring-1 ring-slate-900/10 ${className}`}
      style={{ width: size * 1.5, height: size }}
    >
      <Svg className="block h-full w-full" />
    </span>
  );
}
