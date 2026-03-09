"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useHolidayCountries } from "@/hooks/use-holiday-countries";
import type { HolidayCountry } from "@/lib/holidays";

export type HolidayCountryPreference = "IT" | "DE" | "both";

type HolidayCountriesContextValue = [
  HolidayCountry[],
  (preference: HolidayCountryPreference) => void,
  HolidayCountryPreference,
];

const HolidayCountriesContext = createContext<
  HolidayCountriesContextValue | null
>(null);

export function HolidayCountriesProvider({ children }: { children: ReactNode }) {
  const value = useHolidayCountries();
  return (
    <HolidayCountriesContext.Provider value={value}>
      {children}
    </HolidayCountriesContext.Provider>
  );
}

export function useHolidayCountriesContext(): HolidayCountriesContextValue {
  const ctx = useContext(HolidayCountriesContext);
  if (!ctx) {
    throw new Error(
      "useHolidayCountriesContext must be used within HolidayCountriesProvider"
    );
  }
  return ctx;
}
