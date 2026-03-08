"use client";

import { useMemo } from "react";
import { PartyPopper } from "lucide-react";
import { EventBlock } from "./event-block";
import {
  getMonthGrid,
  getEventDateKeys,
  toDateKey,
  type EventRecord,
} from "./calendar-utils";
import {
  getHolidaysForMonth,
  type HolidayCountry,
} from "@/lib/holidays";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MonthlyGridProps {
  year: number;
  month: number;
  events: EventRecord[];
  weekdays: readonly string[];
  loading?: boolean;
  holidayCountries?: HolidayCountry[];
  onEventClick?: (event: EventRecord) => void;
}

export function MonthlyGrid({
  year,
  month,
  events,
  weekdays,
  loading = false,
  holidayCountries = ["IT", "DE"],
  onEventClick,
}: MonthlyGridProps) {
  const grid = useMemo(() => getMonthGrid(year, month), [year, month]);

  const holidaysByDate = useMemo(
    () => getHolidaysForMonth(year, month, holidayCountries),
    [year, month, holidayCountries]
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

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <div className="min-w-[320px] sm:min-w-[375px] md:min-w-0">
        <div className="grid grid-cols-7 border-b border-border">
          {weekdays.map((day) => (
            <div
              key={day}
              className="border-border px-1 py-2 text-center text-xs font-medium text-muted-foreground sm:px-2 sm:text-sm md:text-base"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 grid-rows-[auto]">
          {grid.map(({ date, isCurrentMonth }, i) => {
            const key = toDateKey(date);
            const dayEvents = eventsByDate.get(key) ?? [];
            const holidays =
              isCurrentMonth ? holidaysByDate.get(key) ?? [] : [];

            return (
              <div
                key={i}
                className={cn(
                  "min-h-[80px] border-b border-r border-border p-1 sm:min-h-[100px] sm:p-2 md:min-h-[110px] lg:min-h-[120px]",
                  !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                  isCurrentMonth &&
                    holidays.length > 0 &&
                    "bg-amber-50 dark:bg-amber-950/20"
                )}
              >
                {holidays.length > 0 ? (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span
                          className={cn(
                            "inline-flex size-7 cursor-default items-center justify-center gap-0.5 rounded-full text-sm sm:size-8",
                            "font-medium text-foreground"
                          )}
                          aria-label={holidays.map((h) => h.name).join(", ")}
                        />
                      }
                    >
                      {date.getDate()}
                      <PartyPopper
                        className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400"
                        aria-hidden
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {holidays.map((h) => h.name).join(" · ")}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span
                    className={cn(
                      "inline-flex size-7 items-center justify-center rounded-full text-sm sm:size-8",
                      isCurrentMonth
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {date.getDate()}
                  </span>
                )}

                <div className="mt-1 flex flex-col gap-1">
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
