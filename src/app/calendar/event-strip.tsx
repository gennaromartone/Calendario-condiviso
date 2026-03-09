"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EVENT_TIPO_CONFIG } from "@/lib/event-types";
import type { EventRecord } from "./calendar-utils";

/** Hex to rgba with alpha for background */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface EventStripProps {
  event: EventRecord;
  onClick?: (event: EventRecord) => void;
  className?: string;
  /** Primo giorno dell'evento (bordo sinistro) */
  isFirstDay?: boolean;
  /** Ultimo giorno dell'evento (bordo destro) */
  isLastDay?: boolean;
}

export function EventStrip({
  event,
  onClick,
  className,
  isFirstDay = true,
  isLastDay = true,
}: EventStripProps) {
  const tipoConfig = EVENT_TIPO_CONFIG[event.tipo];
  const isAffidamento = event.tipo === "affidamento";
  const creatorColor = event.creatore?.affidamentoColore;
  const useCreatorColor = isAffidamento && creatorColor;
  const ariaLabel = `${event.titolo}, ${tipoConfig.label}`;

  const borderClasses = (() => {
    if (isFirstDay && isLastDay) return "border-l-4 border-r-4";
    if (isFirstDay) return "border-l-4";
    if (isLastDay) return "border-r-4";
    return "";
  })();

  const borderColorClass =
    !useCreatorColor && isFirstDay ? tipoConfig.borderColor : "";
  const borderRightColorClass =
    !useCreatorColor && isLastDay
      ? tipoConfig.borderColor.replace("border-l-", "border-r-")
      : "";

  const borderStyle = useCreatorColor
    ? {
        ...(isFirstDay && { borderLeftColor: creatorColor }),
        ...(isLastDay && { borderRightColor: creatorColor }),
        backgroundColor: hexToRgba(creatorColor, 0.1),
      }
    : undefined;

  const Icon = tipoConfig.icon;
  const showIconBadge =
    event.tipo === "scuola" || event.tipo === "sport" || event.tipo === "altro";

  return (
    <button
      type="button"
      onClick={() => onClick?.(event)}
      aria-label={ariaLabel}
      className={cn(
        "flex min-h-[24px] min-w-0 items-center gap-1 rounded px-1.5 py-0.5 text-left text-[10px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 motion-reduce:transition-none",
        borderClasses,
        borderColorClass,
        borderRightColorClass,
        !useCreatorColor && tipoConfig.bgColor,
        className
      )}
      style={borderStyle}
    >
      {showIconBadge && (
        <Badge
          variant="secondary"
          className={cn(
            "h-4 w-4 shrink-0 p-0 justify-center",
            !useCreatorColor && tipoConfig.color
          )}
          style={
            useCreatorColor && creatorColor
              ? {
                  backgroundColor: hexToRgba(creatorColor, 0.2),
                  color: creatorColor,
                }
              : undefined
          }
        >
          <Icon className="size-2.5" aria-hidden />
        </Badge>
      )}
      <span className="truncate font-medium">{event.titolo}</span>
    </button>
  );
}
