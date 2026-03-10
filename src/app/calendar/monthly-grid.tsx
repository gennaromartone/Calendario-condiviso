"use client";

import { useCallback, useMemo } from "react";
import { format } from "date-fns";
import { PartyPopper } from "lucide-react";
import { EventBlock } from "./event-block";
import { EventStrip } from "./event-strip";
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
import { useDragToSelectDates } from "@/hooks/use-drag-to-select-dates";

interface MonthlyGridProps {
  year: number;
  month: number;
  events: EventRecord[];
  weekdays: readonly string[];
  loading?: boolean;
  holidayCountries?: HolidayCountry[];
  onEventClick?: (event: EventRecord) => void;
  onDateRangeSelect?: (range: { startDate: string; endDate: string }) => void;
}

export function MonthlyGrid({
  year,
  month,
  events,
  weekdays,
  loading = false,
  holidayCountries = ["IT", "DE"],
  onEventClick,
  onDateRangeSelect,
}: MonthlyGridProps) {
  const handleDateRangeSelected = useCallback(
    (range: { startDate: string; endDate: string }) => {
      onDateRangeSelect?.(range);
    },
    [onDateRangeSelect]
  );

  const { isDragging, selectedDateKeys, onPointerDown } =
    useDragToSelectDates(handleDateRangeSelected);

  const todayKey = format(new Date(), "yyyy-MM-dd");
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

  const multiDayStripsByWeek = useMemo(() => {
    const result: {
      event: EventRecord;
      startCol: number;
      span: number;
      lane: number;
      isFirstDay: boolean;
      isLastDay: boolean;
    }[][] = [];
    for (let w = 0; w < 6; w++) {
      const weekCells = grid.slice(w * 7, w * 7 + 7);
      const weekKeys = weekCells.map((c) => toDateKey(c.date));
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
              s.startCol + s.span - 1 >= strip.startCol &&
              s.startCol <= endCol
          )
        ) {
          lane++;
        }
        if (!lanes[lane]) lanes[lane] = [];
        lanes[lane].push(strip);
      }
      result.push(
        lanes.flatMap((laneStrips, lane) =>
          laneStrips.map((s) => ({ ...s, lane }))
        )
      );
    }
    return result;
  }, [grid, events]);

  /** Altezza header + altezza strip per calcolo posizionamento mobile (monthly) */
  const MOBILE_HEADER_H = 40;
  const MOBILE_STRIP_H = 28;

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border border-border bg-card",
        isDragging && "touch-none select-none"
      )}
      onPointerDown={onPointerDown}
    >
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

        <div className="block md:hidden">
          <div className="flex flex-col">
            {[0, 1, 2, 3, 4, 5].map((w) => {
              const weekCells = grid.slice(w * 7, w * 7 + 7);
              const weekStrips = multiDayStripsByWeek[w];
              const numLanes =
                weekStrips.length > 0
                  ? Math.max(...weekStrips.map((s) => s.lane)) + 1
                  : 0;

              return (
                <div key={w} className="relative border-b border-border last:border-b-0">
                  <div
                    className="grid grid-cols-7"
                    style={{
                      gridTemplateRows: "auto auto",
                    }}
                  >
                  {weekCells.map(({ date, isCurrentMonth }, col) => {
                    const key = toDateKey(date);
                    const holidays =
                      isCurrentMonth ? holidaysByDate.get(key) ?? [] : [];
                    return (
                      <div
                        key={col}
                        data-date={key}
                        className={cn(
                          "flex flex-col items-center justify-center border-r border-border p-1 last:border-r-0",
                          !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                          isCurrentMonth &&
                            holidays.length > 0 &&
                            "bg-amber-50 dark:bg-amber-950/20",
                          key === todayKey && "bg-primary/10 ring-1 ring-primary/50",
                          isDragging &&
                            selectedDateKeys.includes(key) &&
                            "bg-primary/20 ring-1 ring-primary/40"
                        )}
                        style={{ gridColumn: col + 1, gridRow: 1 }}
                      >
                        {holidays.length > 0 ? (
                          <Tooltip>
                            <TooltipTrigger
                              render={
                          <span
                            className={cn(
                              "inline-flex size-7 cursor-default items-center justify-center gap-0.5 rounded-full text-sm",
                              "font-medium text-foreground",
                              key === todayKey &&
                                "bg-primary text-primary-foreground"
                            )}
                                  aria-label={holidays
                                    .map((h) => h.name)
                                    .join(", ")}
                                >
                                  {date.getDate()}
                                  <PartyPopper
                                    className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400"
                                    aria-hidden
                                  />
                                </span>
                              }
                            />
                            <TooltipContent>
                              <p>
                                {holidays.map((h) => h.name).join(" · ")}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span
                            className={cn(
                              "inline-flex size-7 items-center justify-center rounded-full text-sm",
                              isCurrentMonth
                                ? "font-medium text-foreground"
                                : "text-muted-foreground",
                              key === todayKey &&
                                "bg-primary text-primary-foreground"
                            )}
                          >
                            {date.getDate()}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {weekCells.map(({ date, isCurrentMonth }, col) => {
                    const key = toDateKey(date);
                    const dayEvents = eventsByDate.get(key) ?? [];
                    const singleDayEvents = dayEvents.filter(
                      ({ event: ev }) => getEventDateKeys(ev).length === 1
                    );
                    const holidays =
                      isCurrentMonth ? holidaysByDate.get(key) ?? [] : [];
                    return (
                      <div
                        key={`cell-${col}`}
                        data-date={key}
                        className={cn(
                          "min-h-[60px] border-r border-border p-1 last:border-r-0",
                          !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                          isCurrentMonth &&
                            holidays.length > 0 &&
                            "bg-amber-50 dark:bg-amber-950/20",
                          key === todayKey && "bg-primary/10 ring-1 ring-primary/50",
                          isDragging &&
                            selectedDateKeys.includes(key) &&
                            "bg-primary/20 ring-1 ring-primary/40"
                        )}
                        style={{
                          gridColumn: col + 1,
                          gridRow: 2,
                          paddingTop: numLanes * MOBILE_STRIP_H,
                        }}
                      >
                        <div className="mt-0.5 flex flex-col gap-1">
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

                  {/* Mobile: eventi multi-giorno in posizione assoluta con width calcolata */}
                  {numLanes > 0 && (
                    <div
                      className="absolute left-0 right-0"
                      style={{
                        top: MOBILE_HEADER_H,
                        height: numLanes * MOBILE_STRIP_H,
                        width: "100%",
                      }}
                    >
                      {weekStrips.map(
                        ({
                          event,
                          startCol,
                          span,
                          lane,
                          isFirstDay,
                          isLastDay,
                        }) => (
                          <div
                            key={event.id}
                            className="absolute flex items-center px-0.5"
                            style={{
                              left: `${((startCol - 1) / 7) * 100}%`,
                              width: `${(span / 7) * 100}%`,
                              top: lane * MOBILE_STRIP_H,
                              height: MOBILE_STRIP_H - 4,
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="hidden md:block">
          <div className="grid grid-cols-7 grid-rows-[auto]">
            {grid.map(({ date, isCurrentMonth }, i) => {
              const key = toDateKey(date);
              const dayEvents = eventsByDate.get(key) ?? [];
              const holidays =
                isCurrentMonth ? holidaysByDate.get(key) ?? [] : [];

              return (
                <div
                  key={i}
                  data-date={key}
                  className={cn(
                    "min-h-[80px] border-b border-r border-border p-1 sm:min-h-[100px] sm:p-2 md:min-h-[110px] lg:min-h-[120px]",
                    !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                    isCurrentMonth &&
                      holidays.length > 0 &&
                      "bg-amber-50 dark:bg-amber-950/20",
                    key === todayKey && "bg-primary/10 ring-1 ring-primary/50",
                    isDragging &&
                      selectedDateKeys.includes(key) &&
                      "bg-primary/20 ring-1 ring-primary/40"
                  )}
                >
                  {holidays.length > 0 ? (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span
                            className={cn(
                              "inline-flex size-7 cursor-default items-center justify-center gap-0.5 rounded-full text-sm sm:size-8",
                              "font-medium text-foreground",
                              key === todayKey &&
                                "bg-primary text-primary-foreground"
                            )}
                            aria-label={holidays.map((h) => h.name).join(", ")}
                          >
                            {date.getDate()}
                            <PartyPopper
                              className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400"
                              aria-hidden
                            />
                          </span>
                        }
                      />
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
                          : "text-muted-foreground",
                        key === todayKey &&
                          "bg-primary text-primary-foreground"
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
    </div>
  );
}
