"use client";

import { useMemo } from "react";
import { PartyPopper } from "lucide-react";
import { EventBlock } from "./event-block";
import {
  getWeekDates,
  getEventDateKeys,
  toDateKey,
  type EventRecord,
} from "./calendar-utils";
import {
  getHolidaysForDate,
  type HolidayCountry,
} from "@/lib/holidays";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface WeeklyGridProps {
  weekStart: Date;
  events: EventRecord[];
  weekdays: readonly string[];
  loading?: boolean;
  holidayCountries?: HolidayCountry[];
  onEventClick?: (event: EventRecord) => void;
}

export function WeeklyGrid({
  weekStart,
  events,
  weekdays,
  loading = false,
  holidayCountries = ["IT", "DE"],
  onEventClick,
}: WeeklyGridProps) {
  const weekDates = useMemo(
    () => getWeekDates(weekStart),
    [weekStart.getTime()]
  );

  const eventsByDate = useMemo(() => {
    const map = new Map<
      string,
      { event: EventRecord; showStartTag: boolean; showEndTag: boolean }[]
    >();
    for (const e of events) {
      const keys = getEventDateKeys(e);
      const isMultiDay = keys.length > 1;
      keys.forEach((key, i) => {
        const list = map.get(key) ?? [];
        list.push({
          event: e,
          showStartTag: isMultiDay && i === 0,
          showEndTag: isMultiDay && i === keys.length - 1,
        });
        map.set(key, list);
      });
    }
    return map;
  }, [events]);

  const holidaysByDate = useMemo(() => {
    const map = new Map<string, { name: string; country: string }[]>();
    for (const date of weekDates) {
      const holidays = getHolidaysForDate(date, holidayCountries);
      if (holidays.length > 0) {
        map.set(toDateKey(date), holidays);
      }
    }
    return map;
  }, [weekDates, holidayCountries]);

  const holidayCellClasses = "bg-amber-50 dark:bg-amber-950/20";

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <div className="min-w-[320px] sm:min-w-[375px] md:min-w-0">
        <div className="grid grid-cols-7 border-b border-border">
          {weekdays.map((day, i) => {
            const date = weekDates[i];
            const key = date ? toDateKey(date) : "";
            const holidays = date ? holidaysByDate.get(key) ?? [] : [];
            const isHoliday = holidays.length > 0;
            const holidayNames = holidays.map((h) => h.name).join(", ");

            return (
              <div
                key={day}
                className={cn(
                  "flex flex-col items-center gap-0.5 border-r border-border px-1 py-2 last:border-r-0 sm:px-2 md:text-base",
                  isHoliday && holidayCellClasses
                )}
              >
                <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {day}
                </span>
                {isHoliday ? (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span
                          className={cn(
                            "inline-flex size-8 cursor-default items-center justify-center gap-0.5 rounded-full text-sm font-medium",
                            "text-foreground"
                          )}
                          aria-label={holidayNames}
                        >
                          {date?.getDate() ?? ""}
                          <PartyPopper
                            className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400"
                            aria-hidden
                          />
                        </span>
                      }
                    />
                    <TooltipContent>
                      <p>{holidayNames}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full text-sm font-medium",
                      "text-foreground"
                    )}
                  >
                    {date?.getDate() ?? ""}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-7">
          {weekDates.map((date, i) => {
            const key = toDateKey(date);
            const dayEvents = eventsByDate.get(key) ?? [];
            const isHoliday = holidaysByDate.has(key);

            return (
              <div
                key={i}
                className={cn(
                  "min-h-[120px] border-b border-r border-border p-2 last:border-r-0 sm:min-h-[160px] md:min-h-[180px] lg:min-h-[200px]",
                  isHoliday && holidayCellClasses
                )}
              >
                <div className="flex flex-col gap-1">
                  {loading ? (
                    <div className="h-4 animate-pulse rounded bg-muted" />
                  ) : (
                    dayEvents.map(({ event: ev, showStartTag, showEndTag }) => (
                      <EventBlock
                        key={ev.id}
                        event={ev}
                        onClick={onEventClick}
                        dateKey={key}
                        showStartTag={showStartTag}
                        showEndTag={showEndTag}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
