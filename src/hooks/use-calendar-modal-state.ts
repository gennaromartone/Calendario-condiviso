"use client";

import { useCallback, useMemo, useState } from "react";
import type { EventRecord } from "@/app/calendar/calendar-utils";

export interface InitialDates {
  startDate: string;
  endDate: string;
}

export interface CalendarModalActions {
  openDetail: (eventId: string) => void;
  openForm: (initialDates?: InitialDates) => void;
}

export function useCalendarModalState(events: EventRecord[]) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [formSheetOpen, setFormSheetOpen] = useState(false);
  const [formSheetMode, setFormSheetMode] = useState<"create" | "edit">("create");
  const [formSheetEvent, setFormSheetEvent] = useState<EventRecord | null>(null);

  const [initialDates, setInitialDates] = useState<InitialDates | null>(null);

  const modalActions = useMemo<CalendarModalActions>(
    () => ({
      openDetail: (eventId: string) => setSelectedEventId(eventId),
      openForm: (dates?: InitialDates) => {
        setFormSheetMode("create");
        setFormSheetEvent(null);
        setInitialDates(dates ?? null);
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
    setInitialDates(null);
    setFormSheetOpen(true);
  }, []);

  const handleFormOpenChange = useCallback((open: boolean) => {
    setFormSheetOpen(open);
    if (!open) setInitialDates(null);
  }, []);

  return {
    selectedEvent,
    selectedEventId,
    formSheetOpen,
    setFormSheetOpen: handleFormOpenChange,
    formSheetMode,
    formSheetEvent,
    initialDates,
    modalActions,
    handleDetailOpenChange,
    handleModifyEvent,
  };
}
