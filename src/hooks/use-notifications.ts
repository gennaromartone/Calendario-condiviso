"use client";

import { useQuery } from "@tanstack/react-query";
import { getNotifiche } from "@/lib/api";

export function useNotifications(options?: { unreadOnly?: boolean }) {
  return useQuery({
    queryKey: ["notifiche", options?.unreadOnly ?? false],
    queryFn: () => getNotifiche(options),
  });
}
