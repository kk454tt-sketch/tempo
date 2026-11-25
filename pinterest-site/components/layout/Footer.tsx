import Link from "next/link";
import { Container } from "@/components/ui/Container";

const LINKS = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-surface py-8 lg:py-10">
      <Container className="flex flex-col items-center gap-5 text-center lg:flex-row lg:justify-between lg:gap-8 lg:text-left">
        <Link href="/" className="text-headline-sm font-bold text-primary">
          AffHub
        </Link>
        <nav aria-label="Footer" className="flex items-center gap-6">
          {LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="rounded-[8px] text-label-md font-medium text-on-surface-variant transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {label}
            </Link>
          ))}
        </nav>
        <p className="max-w-xs text-label-sm text-on-surface-variant lg:text-right">
          As an Amazon Associate, we may earn from qualifying purchases.
        </p>
      </Container>
    </footer>
  );
}
