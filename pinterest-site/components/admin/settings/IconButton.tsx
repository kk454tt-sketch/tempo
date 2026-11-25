import { Icon } from "@/components/ui/Icon";

export function IconButton({
  label,
  icon,
  onClick,
  disabled = false,
  type = "button",
}: {
  label: string;
  icon: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-40"
    >
      <Icon name={icon} className="text-[20px]" />
    </button>
  );
}
