import { queryOptions } from "@tanstack/react-query";
import { getEvents } from "./api";

export const eventsKey = (start?: string, end?: string) =>
  ["events", start, end] as const;

export const eventsQuery = (start: string, end: string) =>
  queryOptions({
    queryKey: eventsKey(start, end),
    queryFn: () => getEvents(start, end),
  });
