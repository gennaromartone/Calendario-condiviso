"use client";

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
}

export function EventStrip({ event, onClick, className }: EventStripProps) {
  const tipoConfig = EVENT_TIPO_CONFIG[event.tipo];
  const isAffidamento = event.tipo === "affidamento";
  const creatorColor = event.creatore?.affidamentoColore;
  const useCreatorColor = isAffidamento && creatorColor;
  const ariaLabel = `${event.titolo}, ${tipoConfig.label}`;

  return (
    <button
      type="button"
      onClick={() => onClick?.(event)}
      aria-label={ariaLabel}
      className={cn(
        "flex min-h-[24px] min-w-0 items-center rounded border-l-4 px-1.5 py-0.5 text-left text-[10px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 motion-reduce:transition-none",
        !useCreatorColor && tipoConfig.borderColor,
        !useCreatorColor && tipoConfig.bgColor,
        className
      )}
      style={
        useCreatorColor
          ? {
              borderLeftColor: creatorColor,
              backgroundColor: hexToRgba(creatorColor, 0.1),
            }
          : undefined
      }
    >
      <span className="truncate font-medium">{event.titolo}</span>
    </button>
  );
}
