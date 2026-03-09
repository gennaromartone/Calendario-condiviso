"use client";

import { useMemo } from "react";
import { PartyPopper } from "lucide-react";
import { EventBlock } from "./event-block";
import { EventStrip } from "./event-strip";
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
    [weekStart]
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

  const multiDayStrips = useMemo(() => {
    const weekKeys = weekDates.map((d) => toDateKey(d));
    const strips: {
      event: EventRecord;
      startCol: number;
      span: number;
      isFirstDay: boolean;
      isLastDay: boolean;
    }[] = [];
    const multiDayEvents = events.filter(
      (e) => getEventDateKeys(e).length > 1
    );
    for (const event of multiDayEvents) {
      const eventKeys = getEventDateKeys(event);
      const intersection = eventKeys.filter((k) => weekKeys.includes(k));
      if (intersection.length > 0) {
        const startCol = weekKeys.indexOf(intersection[0]) + 1;
        const span = intersection.length;
        const isFirstDay = intersection[0] === eventKeys[0];
        const isLastDay =
          intersection[intersection.length - 1] ===
          eventKeys[eventKeys.length - 1];
        strips.push({ event, startCol, span, isFirstDay, isLastDay });
      }
    }
    strips.sort((a, b) => a.startCol - b.startCol);
    const lanes: {
      event: EventRecord;
      startCol: number;
      span: number;
      isFirstDay: boolean;
      isLastDay: boolean;
    }[][] = [];
    for (const strip of strips) {
      const endCol = strip.startCol + strip.span - 1;
      let lane = 0;
      while (
        lanes[lane]?.some(
          (s) =>
            s.startCol + s.span - 1 >= strip.startCol && s.startCol <= endCol
        )
      ) {
        lane++;
      }
      if (!lanes[lane]) lanes[lane] = [];
      lanes[lane].push(strip);
    }
    return lanes.flatMap((laneStrips, lane) =>
      laneStrips.map((s) => ({ ...s, lane }))
    );
  }, [weekDates, events]);

  const numLanes =
    multiDayStrips.length > 0
      ? Math.max(...multiDayStrips.map((s) => s.lane)) + 1
      : 0;

  const holidayCellClasses = "bg-amber-50 dark:bg-amber-950/20";

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <div className="min-w-[320px] sm:min-w-[375px] md:min-w-0">
        <div className="block md:hidden">
          <div
            className="grid grid-cols-7"
            style={{
              gridTemplateRows:
                numLanes > 0
                  ? `auto repeat(${numLanes}, minmax(24px, auto)) auto`
                  : "auto auto",
            }}
          >
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
                    "flex flex-col items-center gap-0.5 border-r border-border px-1 py-2 last:border-r-0",
                    isHoliday && holidayCellClasses
                  )}
                  style={{ gridColumn: i + 1, gridRow: 1 }}
                >
                  <span className="text-xs font-medium text-muted-foreground">
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
            {multiDayStrips.map(
              ({ event, startCol, span, lane, isFirstDay, isLastDay }) => (
                <div
                  key={event.id}
                  className="col-span-1 flex items-center px-0.5"
                  style={{
                    gridColumn: `${startCol} / span ${span}`,
                    gridRow: 2 + lane,
                  }}
                >
                  <EventStrip
                    event={event}
                    onClick={onEventClick}
                    className="w-full"
                    isFirstDay={isFirstDay}
                    isLastDay={isLastDay}
                  />
                </div>
              )
            )}
            {weekDates.map((date, i) => {
              const key = toDateKey(date);
              const dayEvents = eventsByDate.get(key) ?? [];
              const singleDayEvents = dayEvents.filter(
                ({ event: ev }) => getEventDateKeys(ev).length === 1
              );
              const isHoliday = holidaysByDate.has(key);

              return (
                <div
                  key={i}
                  className={cn(
                    "min-h-[80px] border-b border-r border-border p-2 last:border-r-0",
                    isHoliday && holidayCellClasses
                  )}
                  style={{
                    gridColumn: i + 1,
                    gridRow: 2 + numLanes,
                  }}
                >
                  <div className="flex flex-col gap-1">
                    {loading ? (
                      <div className="h-4 animate-pulse rounded bg-muted" />
                    ) : (
                      singleDayEvents.map(
                        ({ event: ev, showStartTag, showEndTag }) => (
                          <EventBlock
                            key={ev.id}
                            event={ev}
                            onClick={onEventClick}
                            dateKey={key}
                            showStartTag={showStartTag}
                            showEndTag={showEndTag}
                            compact
                          />
                        )
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="hidden md:block">
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
                        dayEvents.map(
                          ({ event: ev, showStartTag, showEndTag }) => (
                            <EventBlock
                              key={ev.id}
                              event={ev}
                              onClick={onEventClick}
                              dateKey={key}
                              showStartTag={showStartTag}
                              showEndTag={showEndTag}
                            />
                          )
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
        </div>
      </div>
    </div>
  );
}
