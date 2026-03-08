import type { LucideIcon } from "lucide-react";
import { Home, School, Dumbbell, MoreHorizontal } from "lucide-react";

export type EventTipo = "affidamento" | "scuola" | "sport" | "altro";

export const EVENT_TIPO_CONFIG: Record<
  EventTipo,
  {
    color: string;
    borderColor: string;
    bgColor: string;
    icon: LucideIcon;
    label: string;
  }
> = {
  affidamento: {
    color: "text-blue-700 dark:text-blue-400",
    borderColor: "border-l-blue-500",
    bgColor: "bg-blue-500/10 hover:bg-blue-500/15",
    icon: Home,
    label: "Affidamento",
  },
  scuola: {
    color: "text-green-700 dark:text-green-400",
    borderColor: "border-l-green-500",
    bgColor: "bg-green-500/10 hover:bg-green-500/15",
    icon: School,
    label: "Scuola",
  },
  sport: {
    color: "text-orange-700 dark:text-orange-400",
    borderColor: "border-l-orange-500",
    bgColor: "bg-orange-500/10 hover:bg-orange-500/15",
    icon: Dumbbell,
    label: "Sport",
  },
  altro: {
    color: "text-muted-foreground",
    borderColor: "border-l-muted-foreground/50",
    bgColor: "bg-muted/50 hover:bg-muted",
    icon: MoreHorizontal,
    label: "Altro",
  },
};
