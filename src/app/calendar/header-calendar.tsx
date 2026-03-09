"use client";

import { useCallback, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EventDetailSheet } from "./event-detail-sheet";
import { EventFormSheet } from "./event-form-sheet";
import type { EventRecord } from "./calendar-utils";

type ViewMode = "month" | "week";

export interface CalendarModalActions {
  openDetail: (eventId: string) => void;
  openForm: () => void;
}

interface HeaderCalendarProps {
  label: string;
  viewMode: ViewMode;
  events: EventRecord[];
  userId?: string;
  onViewChange: (mode: ViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  children: (modalActions: CalendarModalActions) => React.ReactNode;
}

export function HeaderCalendar({
  label,
  viewMode,
  events,
  userId,
  onViewChange,
  onPrev,
  onNext,
  children,
}: HeaderCalendarProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [formSheetOpen, setFormSheetOpen] = useState(false);
  const [formSheetMode, setFormSheetMode] = useState<"create" | "edit">("create");
  const [formSheetEvent, setFormSheetEvent] = useState<EventRecord | null>(null);

  const modalActions = useMemo<CalendarModalActions>(
    () => ({
      openDetail: (eventId: string) => setSelectedEventId(eventId),
      openForm: () => {
        setFormSheetMode("create");
        setFormSheetEvent(null);
        setFormSheetOpen(true);
      },
    }),
    []
  );

  const selectedEvent = useMemo(
    () =>
      selectedEventId
        ? events.find((e) => e.id === selectedEventId) ?? null
        : null,
    [events, selectedEventId]
  );

  const handleDetailOpenChange = useCallback((open: boolean) => {
    if (!open) setSelectedEventId(null);
  }, []);

  const handleModifyEvent = useCallback((event: EventRecord) => {
    setSelectedEventId(null);
    setFormSheetMode("edit");
    setFormSheetEvent(event);
    setFormSheetOpen(true);
  }, []);

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">
            {label}
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              onClick={() => modalActions.openForm()}
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
                onClick={() => onViewChange("month")}
                aria-pressed={viewMode === "month"}
                aria-label="Vista mensile"
                className={cn(
                  "min-w-[44px] rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  viewMode === "month"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                Mese
              </button>
              <button
                type="button"
                onClick={() => onViewChange("week")}
                aria-pressed={viewMode === "week"}
                aria-label="Vista settimanale"
                className={cn(
                  "min-w-[44px] rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  viewMode === "week"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                Weekly
              </button>
            </div>

            {viewMode === "month" ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPrev}
                  aria-label="Mese precedente"
                  className="min-h-[44px] min-w-[44px] transition-colors hover:bg-muted"
                >
                  <ChevronLeft className="size-4" data-icon="inline-start" />
                  Precedente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNext}
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
                  onClick={onPrev}
                  aria-label="Settimana precedente"
                  className="min-h-[44px] min-w-[44px] transition-colors hover:bg-muted"
                >
                  <ChevronLeft className="size-4" data-icon="inline-start" />
                  Precedente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNext}
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

        {children(modalActions)}
      </div>

      <EventDetailSheet
        event={selectedEvent}
        open={!!selectedEventId}
        onOpenChange={handleDetailOpenChange}
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
    </>
  );
}
