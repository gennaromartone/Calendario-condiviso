"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

/** Query keys da invalidare quando la pagina torna visible (PWA da background) */
const RECONNECT_QUERY_KEYS = [
  ["events"],
  ["info-importanti"],
  ["notifiche"],
] as const;

export function useRefetchOnReconnect() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof document === "undefined") return;

    const invalidate = () => {
      for (const queryKey of RECONNECT_QUERY_KEYS) {
        void queryClient.invalidateQueries({ queryKey });
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        invalidate();
      }
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        invalidate();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [queryClient]);
}
