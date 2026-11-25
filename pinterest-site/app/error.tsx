"use client";

import { startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PublicShell } from "@/components/layout/PublicShell";
import { CountryProvider } from "@/components/providers/CountryProvider";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/button-styles";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <CountryProvider initialCountry="US" initialDetected={null} initialChosen={true} initialBannerDismissed={true}>
      <PublicShell>
        <Container role="alert" className="flex flex-col items-center gap-4 py-24 text-center">
          <Icon name="error" className="text-[48px] text-on-surface-variant" />
          <p className="text-headline-sm font-bold text-primary">Something went wrong</p>
          <button
            type="button"
            className={buttonClass("primary")}
            onClick={() =>
              // Refetch server data first, then re-render the segment.
              startTransition(() => {
                router.refresh();
                reset();
              })
            }
          >
            Retry
          </button>
        </Container>
      </PublicShell>
    </CountryProvider>
  );
}
