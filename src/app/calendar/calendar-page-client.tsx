"use client";

import { Suspense } from "react";
import { CalendarView } from "./calendar-view";
import { getWeekStart } from "./calendar-utils";
import { CalendarHeaderActions } from "@/components/calendar-header-actions";
import { HolidayCountriesProvider } from "@/contexts/holiday-countries-context";

const ITALIAN_MONTHS = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
] as const;

const ITALIAN_WEEKDAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"] as const;

function CalendarSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="h-7 w-40 animate-pulse rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px rounded-lg border border-border bg-muted/30 p-2">
        {Array.from({ length: 42 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded bg-muted/50 sm:h-24"
          />
        ))}
      </div>
    </div>
  );
}

type ViewMode = "month" | "week";

interface CalendarPageClientProps {
  initialYear: number;
  initialMonth: number;
  initialView: ViewMode;
  initialWeekStart: string;
}

export function CalendarPageClient({
  initialYear,
  initialMonth,
  initialView,
  initialWeekStart,
}: CalendarPageClientProps) {
  return (
    <HolidayCountriesProvider>
      <header className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-2xl md:text-3xl">
          Calendario
        </h1>
        <CalendarHeaderActions />
      </header>

      <main>
        <Suspense fallback={<CalendarSkeleton />}>
          <CalendarView
            initialYear={initialYear}
            initialMonth={initialMonth}
            initialView={initialView}
            initialWeekStart={initialWeekStart}
            monthNames={ITALIAN_MONTHS}
            weekdays={ITALIAN_WEEKDAYS}
          />
        </Suspense>
      </main>
    </HolidayCountriesProvider>
  );
}
