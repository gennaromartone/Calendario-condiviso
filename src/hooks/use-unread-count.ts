"use client";

import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "@/lib/api";

export function useUnreadCount(options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: ["notifiche", "count"],
    queryFn: async () => {
      const res = await getUnreadCount();
      return res.count;
    },
    refetchInterval: options?.refetchInterval,
  });
}
