"use client";

import { useRefetchOnReconnect } from "@/hooks/use-refetch-on-reconnect";

/** Componente che invalida le query principali quando la PWA torna in foreground. */
export function RefetchOnReconnect() {
  useRefetchOnReconnect();
  return null;
}
