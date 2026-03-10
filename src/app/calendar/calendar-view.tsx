"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeaderCalendar } from "./header-calendar";
import { useHolidayCountriesContext } from "@/contexts/holiday-countries-context";
import { MonthlyGrid } from "./monthly-grid";
import { WeeklyGrid } from "./weekly-grid";
import {
  type EventRecord,
  toDateKey,
  getWeekDates,
} from "./calendar-utils";
import { eventsQuery } from "@/lib/queries";

type ViewMode = "month" | "week";

interface CalendarViewProps {
  initialYear: number;
  initialMonth: number;
  initialView?: ViewMode;
  initialWeekStart: string;
  monthNames: readonly string[];
  weekdays: readonly string[];
}

export function CalendarView({
  initialYear,
  initialMonth,
  initialView = "month",
  initialWeekStart,
  monthNames,
  weekdays,
}: CalendarViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId } = useAuth();
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const d = new Date(initialWeekStart);
    return isNaN(d.getTime()) ? new Date() : d;
  });
  const [holidayCountries] = useHolidayCountriesContext();

  const updateUrl = useCallback(
    (params: {
      year?: number;
      month?: number;
      view?: ViewMode;
      weekStart?: Date;
    }) => {
      const next = new URLSearchParams(searchParams.toString());
      if (params.year != null) next.set("year", String(params.year));
      if (params.month != null) next.set("month", String(params.month));
      if (params.view != null) next.set("view", params.view);
      if (params.weekStart != null)
        next.set("weekStart", params.weekStart.toISOString().slice(0, 10));
      router.replace(`/calendar?${next.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return end;
  }, [weekStart]);

  const goPrevMonth = useCallback(() => {
    let nextMonth = month - 1;
    let nextYear = year;
    if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    }
    setMonth(nextMonth);
    setYear(nextYear);
    updateUrl({ year: nextYear, month: nextMonth });
  }, [month, year, updateUrl]);

  const goNextMonth = useCallback(() => {
    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    setMonth(nextMonth);
    setYear(nextYear);
    updateUrl({ year: nextYear, month: nextMonth });
  }, [month, year, updateUrl]);

  const goPrevWeek = useCallback(() => {
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    setWeekStart(prevWeekStart);
    setYear(prevWeekStart.getFullYear());
    setMonth(prevWeekStart.getMonth() + 1);
    updateUrl({
      weekStart: prevWeekStart,
      year: prevWeekStart.getFullYear(),
      month: prevWeekStart.getMonth() + 1,
    });
  }, [weekStart, updateUrl]);

  const goNextWeek = useCallback(() => {
    const nextWeekStart = new Date(weekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    setWeekStart(nextWeekStart);
    setYear(nextWeekStart.getFullYear());
    setMonth(nextWeekStart.getMonth() + 1);
    updateUrl({
      weekStart: nextWeekStart,
      year: nextWeekStart.getFullYear(),
      month: nextWeekStart.getMonth() + 1,
    });
  }, [weekStart, updateUrl]);

  const handleViewChange = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode);
      if (mode === "week") {
        const refDate = new Date(year, month - 1, 15);
        const ws = new Date(refDate);
        const day = ws.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        ws.setDate(ws.getDate() + diff);
        setWeekStart(ws);
        updateUrl({ view: mode, weekStart: ws });
      } else {
        updateUrl({ view: mode });
      }
    },
    [year, month, updateUrl]
  );

  const [prevInitial, setPrevInitial] = useState({
    initialYear,
    initialMonth,
    initialView,
    initialWeekStart,
  });
  if (
    prevInitial.initialYear !== initialYear ||
    prevInitial.initialMonth !== initialMonth ||
    prevInitial.initialView !== initialView ||
    prevInitial.initialWeekStart !== initialWeekStart
  ) {
    setPrevInitial({
      initialYear,
      initialMonth,
      initialView,
      initialWeekStart,
    });
    setYear(initialYear);
    setMonth(initialMonth);
    setViewMode(initialView);
    const d = new Date(initialWeekStart);
    if (!isNaN(d.getTime())) setWeekStart(d);
  }

  const start = useMemo(
    () =>
      viewMode === "month"
        ? toDateKey(new Date(year, month - 1, 1))
        : toDateKey(weekStart),
    [viewMode, year, month, weekStart]
  );
  const end = useMemo(
    () =>
      viewMode === "month"
        ? toDateKey(new Date(year, month, 0))
        : toDateKey(weekEnd),
    [viewMode, year, month, weekEnd]
  );

  const { data: events = [], isPending: loading } = useQuery(
    eventsQuery(start, end)
  );

  const headerLabel =
    viewMode === "month"
      ? `${monthNames[month - 1]} ${year}`
      : (() => {
          const dates = getWeekDates(weekStart);
          return `${dates[0].getDate()}–${dates[6].getDate()} ${monthNames[month - 1]} ${year}`;
        })();

  return (
    <HeaderCalendar
      label={headerLabel}
      viewMode={viewMode}
      events={events}
      userId={userId}
      onViewChange={handleViewChange}
      onPrev={viewMode === "month" ? goPrevMonth : goPrevWeek}
      onNext={viewMode === "month" ? goNextMonth : goNextWeek}
    >
      {(modalActions) => (
        <>
          {viewMode === "month" ? (
            <MonthlyGrid
              year={year}
              month={month}
              events={events}
              weekdays={weekdays}
              loading={loading}
              holidayCountries={holidayCountries}
              onEventClick={(event: EventRecord) =>
                modalActions.openDetail(event.id)
              }
              onDateRangeSelect={(range) =>
                modalActions.openForm({
                  startDate: range.startDate,
                  endDate: range.endDate,
                })
              }
            />
          ) : (
            <WeeklyGrid
              weekStart={weekStart}
              events={events}
              weekdays={weekdays}
              loading={loading}
              holidayCountries={holidayCountries}
              onEventClick={(event: EventRecord) =>
                modalActions.openDetail(event.id)
              }
              onDateRangeSelect={(range) =>
                modalActions.openForm({
                  startDate: range.startDate,
                  endDate: range.endDate,
                })
              }
            />
          )}

          <Button
            size="icon"
            onClick={() => modalActions.openForm()}
            aria-label="Nuovo evento"
            className="fixed bottom-6 right-6 z-40 size-14 rounded-full shadow-lg transition-all hover:scale-105 lg:hidden"
          >
            <Plus className="size-6" aria-hidden />
          </Button>
        </>
      )}
    </HeaderCalendar>
  );
}
