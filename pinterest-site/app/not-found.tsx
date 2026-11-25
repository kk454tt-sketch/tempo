import Link from "next/link";
import { PublicShell } from "@/components/layout/PublicShell";
import { CountryProvider } from "@/components/providers/CountryProvider";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/button-styles";

export default function NotFound() {
  return (
    <CountryProvider initialCountry="US" initialDetected={null} initialChosen={true} initialBannerDismissed={true}>
      <PublicShell showShopBar={false}>
        <Container className="flex flex-col items-center gap-4 py-24 text-center">
          <Icon name="search_off" className="text-[48px] text-on-surface-variant" />
          <h1 className="text-headline-md font-bold text-primary">Page not found</h1>
          <p className="max-w-sm text-body-lg text-on-surface-variant">
            The page you are looking for does not exist or has moved.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Link href="/" className={buttonClass("primary")}>
              Back to home
            </Link>
            <Link href="/products" className={buttonClass("ghost")}>
              Browse products
            </Link>
          </div>
        </Container>
      </PublicShell>
    </CountryProvider>
  );
}
