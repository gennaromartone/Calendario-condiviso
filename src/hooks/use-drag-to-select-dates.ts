"use client";

import { useCallback, useRef, useState } from "react";

const CELL_SELECTOR = "[data-date]";
const DRAG_THRESHOLD_PX = 5;
/** Durata minima del touch per attivare la creazione evento su mobile (ms) */
const LONG_PRESS_MS = 500;

export interface DateRangeSelected {
  startDate: string;
  endDate: string;
}

export function useDragToSelectDates(
  onDateRangeSelected: (range: DateRangeSelected) => void
) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDateKeys, setSelectedDateKeys] = useState<string[]>([]);

  const startDateKeyRef = useRef<string | null>(null);
  const endDateKeyRef = useRef<string | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const hasMovedRef = useRef(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getDateKeyFromElement = useCallback((el: Element | null): string | null => {
    if (!el) return null;
    const cell = el.closest(CELL_SELECTOR);
    return cell?.getAttribute("data-date") ?? null;
  }, []);

  const getDateKeysInRange = useCallback(
    (start: string, end: string): string[] => {
      const [a, b] = [start, end].sort();
      const [sy, sm, sd] = a.split("-").map(Number);
      const [ey, em, ed] = b.split("-").map(Number);
      const keys: string[] = [];
      const d = new Date(sy, sm - 1, sd);
      const endDate = new Date(ey, em - 1, ed);
      while (d <= endDate) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        keys.push(`${y}-${m}-${day}`);
        d.setDate(d.getDate() + 1);
      }
      return keys;
    },
    []
  );

  const finishDrag = useCallback(
    (clientX: number, clientY: number) => {
      const start = startDateKeyRef.current;
      const end = endDateKeyRef.current ?? start;

      startDateKeyRef.current = null;
      endDateKeyRef.current = null;
      startPosRef.current = null;
      hasMovedRef.current = false;
      setIsDragging(false);
      setSelectedDateKeys([]);

      if (start && end) {
        const [startDate, endDate] = [start, end].sort();
        onDateRangeSelected({ startDate, endDate });
      }
    },
    [onDateRangeSelected]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!startDateKeyRef.current) return;

      const dx = Math.abs(e.clientX - (startPosRef.current?.x ?? 0));
      const dy = Math.abs(e.clientY - (startPosRef.current?.y ?? 0));
      if (dx > DRAG_THRESHOLD_PX || dy > DRAG_THRESHOLD_PX) {
        hasMovedRef.current = true;
      }

      const el = document.elementFromPoint(e.clientX, e.clientY);
      const dateKey = getDateKeyFromElement(el);
      if (dateKey) {
        endDateKeyRef.current = dateKey;
        const start = startDateKeyRef.current;
        const keys = getDateKeysInRange(start, dateKey);
        setSelectedDateKeys(keys);
      }
    },
    [getDateKeyFromElement, getDateKeysInRange]
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (!startDateKeyRef.current) return;
      finishDrag(e.clientX, e.clientY);
    },
    [finishDrag]
  );

  const activateDragMode = useCallback(
    (dateKey: string, clientX: number, clientY: number) => {
      startDateKeyRef.current = dateKey;
      endDateKeyRef.current = dateKey;
      startPosRef.current = { x: clientX, y: clientY };
      hasMovedRef.current = false;
      setIsDragging(true);
      setSelectedDateKeys([dateKey]);

      const onMove = (ev: PointerEvent) => handlePointerMove(ev);
      const onUp = (ev: PointerEvent) => {
        handlePointerUp(ev);
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        document.removeEventListener("pointercancel", onUp);
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
      document.addEventListener("pointercancel", onUp);
    },
    [handlePointerMove, handlePointerUp]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      if ((e.target as Element).closest("[data-event-id]")) return;

      const dateKey = getDateKeyFromElement(e.target as Element);
      if (!dateKey) return;

      const isTouch = e.pointerType === "touch";
      const startX = e.clientX;
      const startY = e.clientY;

      if (isTouch) {
        // Su mobile: touch prolungato (long-press) per creare evento
        const cancelLongPress = () => {
          if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
          }
          document.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerup", onUp);
          document.removeEventListener("pointercancel", onUp);
        };

        const onMove = (ev: PointerEvent) => {
          const dx = Math.abs(ev.clientX - startX);
          const dy = Math.abs(ev.clientY - startY);
          if (dx > DRAG_THRESHOLD_PX || dy > DRAG_THRESHOLD_PX) {
            cancelLongPress();
          }
        };

        const onUp = () => {
          cancelLongPress();
        };

        longPressTimerRef.current = setTimeout(() => {
          longPressTimerRef.current = null;
          document.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerup", onUp);
          document.removeEventListener("pointercancel", onUp);
          activateDragMode(dateKey, startX, startY);
        }, LONG_PRESS_MS);

        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", onUp);
        document.addEventListener("pointercancel", onUp);
      } else {
        // Desktop: click/drag immediato
        activateDragMode(dateKey, startX, startY);
      }
    },
    [getDateKeyFromElement, activateDragMode]
  );

  return {
    isDragging,
    selectedDateKeys,
    onPointerDown: handlePointerDown,
  };
}
