import { cn } from "@/lib/format";

export type IconProps = {
  /** Material Symbols ligature name, e.g. "shopping_bag" or "person". */
  name: string;
  filled?: boolean;
  className?: string;
  /** Provide only when the icon carries meaning on its own; otherwise it is hidden from screen readers. */
  label?: string;
};

export function Icon({ name, filled = false, className = "", label }: IconProps) {
  return (
    <span
      className={cn("material-symbols-outlined select-none", className)}
      style={filled ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      {name}
    </span>
  );
}
