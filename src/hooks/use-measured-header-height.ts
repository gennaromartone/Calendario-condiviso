"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Misura l'altezza della prima riga (header) di un elemento grid.
 * Usa ResizeObserver per aggiornare quando font, padding o contenuto cambiano.
 */
export function useMeasuredHeaderHeight<T extends HTMLElement>(): [
  (el: T | null) => void,
  number
] {
  const ref = useRef<T | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const [height, setHeight] = useState(0);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const firstChild = el.firstElementChild as HTMLElement | null;
    if (!firstChild) return;
    const headerHeight = firstChild.offsetHeight;
    setHeight((prev) => (prev !== headerHeight ? headerHeight : prev));
  }, []);

  const setRef = useCallback(
    (el: T | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      ref.current = el;

      if (el) {
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        observerRef.current = observer;
      }
    },
    [measure]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  return [setRef, height];
}
