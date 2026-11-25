"use client";

import { startTransition, useCallback, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CountrySelectorModal } from "@/components/layout/CountrySelectorModal";
import { CountryContext, type CountryContextValue } from "@/components/providers/country-context";
import type { CountryCode } from "@/lib/countries";
import { BANNER_DISMISSED_COOKIE, COUNTRY_COOKIE, writeCookie } from "@/lib/country-cookies";
import { normalizeCountryCode } from "@/lib/storefront";

// Existing imports of useCountry from this file keep working.
export { useCountry } from "@/components/providers/country-context";

export function CountryProvider({
  initialCountry,
  initialDetected,
  initialChosen,
  initialBannerDismissed,
  children,
}: {
  initialCountry: CountryCode;
  initialDetected: CountryCode | null;
  initialChosen: boolean;
  initialBannerDismissed: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const [country, setCountryState] = useState(initialCountry);
  const [chosen, setChosen] = useState(initialChosen);
  const [dismissed, setDismissed] = useState(initialBannerDismissed);
  const [isModalOpen, setModalOpen] = useState(false);

  // If the server sends a different country (e.g. after a refresh), follow it.
  const [seenInitial, setSeenInitial] = useState(initialCountry);
  if (seenInitial !== initialCountry) {
    setSeenInitial(initialCountry);
    setCountryState(initialCountry);
  }

  const openCountryModal = useCallback(() => setModalOpen(true), []);
  const closeCountryModal = useCallback(() => setModalOpen(false), []);

  const setCountry = useCallback(
    (code: string) => {
      const next = normalizeCountryCode(code);
      writeCookie(COUNTRY_COOKIE, next, 365);
      setCountryState(next);
      setChosen(true); // a manual choice hides the banner for good
      setModalOpen(false);
      startTransition(() => router.refresh()); // server components re-render with the new country
    },
    [router],
  );

  const dismissBanner = useCallback(() => {
    writeCookie(BANNER_DISMISSED_COOKIE, "1", 30);
    setDismissed(true);
  }, []);

  const value = useMemo<CountryContextValue>(
    () => ({
      country,
      detected: initialDetected,
      bannerVisible: initialDetected !== null && !chosen && !dismissed,
      isModalOpen,
      openCountryModal,
      closeCountryModal,
      setCountry,
      dismissBanner,
    }),
    [country, initialDetected, chosen, dismissed, isModalOpen, openCountryModal, closeCountryModal, setCountry, dismissBanner],
  );

  return (
    <CountryContext.Provider value={value}>
      {children}
      <CountrySelectorModal />
    </CountryContext.Provider>
  );
}
