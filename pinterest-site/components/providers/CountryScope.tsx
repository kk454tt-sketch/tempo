import type { ReactNode } from "react";
import { CountryProvider } from "@/components/providers/CountryProvider";
import { getCountryState } from "@/lib/country-state";

/** Server wrapper for app/layout.tsx: reads the cookies once and hands them to the provider. */
export async function CountryScope({ children }: { children: ReactNode }) {
  const state = await getCountryState();
  return (
    <CountryProvider
      initialCountry={state.country}
      initialDetected={state.detected}
      initialChosen={state.hasChosen}
      initialBannerDismissed={state.bannerDismissed}
    >
      {children}
    </CountryProvider>
  );
}
