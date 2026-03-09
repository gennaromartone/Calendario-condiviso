"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHolidayCountriesContext } from "@/contexts/holiday-countries-context";
import { MonthlyGrid } from "./monthly-grid";
import { WeeklyGrid } from "./weekly-grid";
import { EventDetailSheet } from "./event-detail-sheet";
import { EventFormSheet } from "./event-form-sheet";
import {
  type EventRecord,
  toDateKey,
  getWeekDates,
} from "./calendar-utils";
import { cn } from "@/lib/utils";
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
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [formSheetOpen, setFormSheetOpen] = useState(false);
  const [holidayCountries] = useHolidayCountriesContext();
  const [formSheetMode, setFormSheetMode] = useState<"create" | "edit">("create");
  const [formSheetEvent, setFormSheetEvent] = useState<EventRecord | null>(null);

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

  const handleEventClick = useCallback((event: EventRecord) => {
    setSelectedEventId(event.id);
  }, []);

  const handleNewEvent = useCallback(() => {
    setFormSheetMode("create");
    setFormSheetEvent(null);
    setFormSheetOpen(true);
  }, []);

  const handleModifyEvent = useCallback((event: EventRecord) => {
    setSelectedEventId(null);
    setFormSheetMode("edit");
    setFormSheetEvent(event);
    setFormSheetOpen(true);
  }, []);

  const selectedEvent = useMemo(
    () => (selectedEventId ? events.find((e) => e.id === selectedEventId) ?? null : null),
    [events, selectedEventId]
  );

  const monthLabel = `${monthNames[month - 1]} ${year}`;

  const weekLabel = useMemo(() => {
    const dates = getWeekDates(weekStart);
    const start = dates[0];
    const end = dates[6];
    return `${start.getDate()}–${end.getDate()} ${monthNames[month - 1]} ${year}`;
  }, [weekStart, month, year, monthNames]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground sm:text-xl">
          {viewMode === "month" ? monthLabel : weekLabel}
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            onClick={handleNewEvent}
            aria-label="Nuovo evento"
            className="hidden min-h-[44px] min-w-[44px] lg:inline-flex"
          >
            <Plus data-icon="inline-start" />
            Nuovo evento
          </Button>
          <div
            role="group"
            aria-label="Vista calendario"
            className="inline-flex rounded-lg border border-input bg-muted/30 p-1"
          >
            <button
              type="button"
              onClick={() => handleViewChange("month")}
              aria-pressed={viewMode === "month"}
              aria-label="Vista mensile"
              className={cn(
                "min-h-[44px] min-w-[44px] rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                viewMode === "month"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              Mese
            </button>
            <button
              type="button"
              onClick={() => handleViewChange("week")}
              aria-pressed={viewMode === "week"}
              aria-label="Vista settimanale"
              className={cn(
                "min-h-[44px] min-w-[44px] rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                viewMode === "week"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              Settimana
            </button>
          </div>

          {viewMode === "month" ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={goPrevMonth}
                aria-label="Mese precedente"
                className="min-h-[44px] min-w-[44px] transition-colors hover:bg-muted"
              >
                <ChevronLeft className="size-4" data-icon="inline-start" />
                Precedente
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goNextMonth}
                aria-label="Mese successivo"
                className="min-h-[44px] min-w-[44px] transition-colors hover:bg-muted"
              >
                Successivo
                <ChevronRight className="size-4" data-icon="inline-end" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={goPrevWeek}
                aria-label="Settimana precedente"
                className="min-h-[44px] min-w-[44px] transition-colors hover:bg-muted"
              >
                <ChevronLeft className="size-4" data-icon="inline-start" />
                Precedente
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goNextWeek}
                aria-label="Settimana successiva"
                className="min-h-[44px] min-w-[44px] transition-colors hover:bg-muted"
              >
                Successivo
                <ChevronRight className="size-4" data-icon="inline-end" />
              </Button>
            </>
          )}
        </div>
      </div>

      {viewMode === "month" ? (
        <MonthlyGrid
          year={year}
          month={month}
          events={events}
          weekdays={weekdays}
          loading={loading}
          holidayCountries={holidayCountries}
          onEventClick={handleEventClick}
        />
      ) : (
        <WeeklyGrid
          weekStart={weekStart}
          events={events}
          weekdays={weekdays}
          loading={loading}
          holidayCountries={holidayCountries}
          onEventClick={handleEventClick}
        />
      )}

      <EventDetailSheet
        event={selectedEvent}
        open={!!selectedEventId}
        onOpenChange={(open) => open || setSelectedEventId(null)}
        onModify={handleModifyEvent}
        currentUserId={userId}
      />

      <EventFormSheet
        open={formSheetOpen}
        onOpenChange={setFormSheetOpen}
        event={formSheetEvent}
        mode={formSheetMode}
        currentUserId={userId}
      />

      <Button
        size="icon"
        onClick={handleNewEvent}
        aria-label="Nuovo evento"
        className="fixed bottom-6 right-6 z-40 size-14 rounded-full shadow-lg transition-all hover:scale-105 lg:hidden"
      >
        <Plus className="size-6" aria-hidden />
      </Button>
    </div>
  );
}
