import Image from "next/image";
import { Icon } from "@/components/ui/Icon";

/**
 * Fills its (relative, overflow-hidden) parent. Never renders a broken image:
 * with no image_url it shows a neutral block with an image icon.
 * Place it inside a `group` element to get the desktop hover zoom.
 */
export function ProductImage({
  src,
  alt,
  sizes,
  priority = false,
  dimmed = false,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  dimmed?: boolean;
}) {
  if (!src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-surface-container text-on-surface-variant">
        <Icon name="image" className="text-[40px]" />
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover transition-[transform,opacity] duration-300 motion-reduce:transition-none lg:group-hover:scale-105 ${
        dimmed ? "opacity-[0.55]" : ""
      }`}
    />
  );
}
