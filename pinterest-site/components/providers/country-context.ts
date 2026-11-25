"use client";

import { createContext, useContext } from "react";
import type { CountryCode } from "@/lib/countries";

export type CountryContextValue = {
  /** Effective store country: the visitor's choice, else the detected one, else US. */
  country: CountryCode;
  /** Auto-detected country (normalised), or null when nothing was detected. */
  detected: CountryCode | null;
  bannerVisible: boolean;
  isModalOpen: boolean;
  openCountryModal: () => void;
  closeCountryModal: () => void;
  /** Saves the choice (365-day cookie), hides the banner, closes the modal, refreshes server data. */
  setCountry: (code: string) => void;
  dismissBanner: () => void;
};

export const CountryContext = createContext<CountryContextValue | null>(null);

export function useCountry(): CountryContextValue {
  const value = useContext(CountryContext);
  if (!value) throw new Error("useCountry must be used inside <CountryProvider>");
  return value;
}
