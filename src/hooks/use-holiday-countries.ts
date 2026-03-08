"use client";

import { useCallback, useState } from "react";
import type { HolidayCountry } from "@/lib/holidays";

const STORAGE_KEY = "calendar-holiday-countries";

export type HolidayCountryPreference = "IT" | "DE" | "both";

const VALID_PREFERENCES: HolidayCountryPreference[] = ["IT", "DE", "both"];

function readStoredPreference(): HolidayCountryPreference {
  if (typeof window === "undefined") return "both";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "IT" || stored === "DE" || stored === "both") return stored;
  return "both";
}

function preferenceToCountries(preference: HolidayCountryPreference): HolidayCountry[] {
  if (preference === "both") return ["IT", "DE"];
  return [preference];
}

export function useHolidayCountries(): [
  HolidayCountry[],
  (preference: HolidayCountryPreference) => void,
  HolidayCountryPreference
] {
  const [preference, setPreferenceState] = useState<HolidayCountryPreference>(
    readStoredPreference
  );

  const setPreference = useCallback((pref: HolidayCountryPreference) => {
    if (!VALID_PREFERENCES.includes(pref)) return;
    localStorage.setItem(STORAGE_KEY, pref);
    setPreferenceState(pref);
  }, []);

  const countries = preferenceToCountries(preference);
  return [countries, setPreference, preference];
}
