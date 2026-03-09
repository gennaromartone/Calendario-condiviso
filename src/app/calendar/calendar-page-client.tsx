"use client";

import { Suspense } from "react";
import Link from "next/link";
import { BookmarkCheck } from "lucide-react";
import { CalendarView } from "./calendar-view";
import { CalendarHeaderActions } from "@/components/calendar-header-actions";
import { HolidayCountriesProvider } from "@/contexts/holiday-countries-context";
import { cn } from "@/lib/utils";

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
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-2xl md:text-3xl">
            Calendario
          </h1>
          <Link
            href="/info-importanti"
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground outline-none transition-colors",
              "hover:bg-muted hover:text-foreground",
              "focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2",
              "min-h-[44px] min-w-[44px] sm:min-w-0"
            )}
            aria-label="Info importanti"
          >
            <BookmarkCheck className="size-4 shrink-0 sm:size-5" aria-hidden />
            <span className="hidden sm:inline">Info importanti</span>
          </Link>
        </div>
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
