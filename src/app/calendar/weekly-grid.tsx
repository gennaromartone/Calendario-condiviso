"use client";

import { useMemo } from "react";
import { EventBlock } from "./event-block";
import {
  getWeekDates,
  getEventDateKeys,
  toDateKey,
  type EventRecord,
} from "./calendar-utils";
import { cn } from "@/lib/utils";

interface WeeklyGridProps {
  weekStart: Date;
  events: EventRecord[];
  weekdays: readonly string[];
  loading?: boolean;
  onEventClick?: (event: EventRecord) => void;
}

export function WeeklyGrid({
  weekStart,
  events,
  weekdays,
  loading = false,
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

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <div className="min-w-[320px] sm:min-w-[375px] md:min-w-0">
        <div className="grid grid-cols-7 border-b border-border">
          {weekdays.map((day, i) => (
            <div
              key={day}
              className="flex flex-col items-center gap-0.5 border-r border-border px-1 py-2 last:border-r-0 sm:px-2 md:text-base"
            >
              <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                {day}
              </span>
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-sm font-medium",
                  "text-foreground"
                )}
              >
                {weekDates[i]?.getDate() ?? ""}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {weekDates.map((date, i) => {
            const key = toDateKey(date);
            const dayEvents = eventsByDate.get(key) ?? [];

            return (
              <div
                key={i}
                className="min-h-[120px] border-b border-r border-border p-2 last:border-r-0 sm:min-h-[160px] md:min-h-[180px] lg:min-h-[200px]"
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
