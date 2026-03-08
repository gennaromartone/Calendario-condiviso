"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EVENT_TIPO_CONFIG } from "@/lib/event-types";
import { hasNotesForDate, type EventRecord } from "./calendar-utils";
import { FileText, MapPin } from "lucide-react";

/** Hex to rgba with alpha for background */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface EventBlockProps {
  event: EventRecord;
  onClick?: (event: EventRecord) => void;
  className?: string;
  /** Chiave data (YYYY-MM-DD) per determinare se mostrare badge note */
  dateKey?: string;
  /** Mostra il tag "Inizio" (solo per eventi multi-giorno) */
  showStartTag?: boolean;
  /** Mostra il tag "Fine" (solo per eventi multi-giorno) */
  showEndTag?: boolean;
}

export function EventBlock({
  event,
  onClick,
  className,
  dateKey,
  showStartTag,
  showEndTag,
}: EventBlockProps) {
  const tipoConfig = EVENT_TIPO_CONFIG[event.tipo];
  const Icon = tipoConfig.icon;

  const showNotesBadge = dateKey ? hasNotesForDate(event, dateKey) : false;
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
        "group flex min-h-[44px] min-w-[44px] flex-col justify-center gap-0.5 rounded border-l-4 px-1.5 py-0.5 text-left text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 motion-reduce:transition-none",
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
      <div className="flex flex-wrap items-center gap-1">
        <Badge
          variant="secondary"
          className={cn(
            "w-fit text-[10px] capitalize",
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
          <Icon className="mr-0.5 size-3" aria-hidden />
          {tipoConfig.label}
        </Badge>
        {event.luogo && (
          <MapPin
            className="size-3.5 shrink-0 text-muted-foreground"
            aria-hidden
          />
        )}
        {showStartTag && (
          <Badge
            variant="secondary"
            className="border-transparent bg-green-500/10 text-[10px] text-green-700 dark:text-green-400"
          >
            Inizio
          </Badge>
        )}
        {showEndTag && (
          <Badge
            variant="secondary"
            className="border-transparent bg-red-500/10 text-[10px] text-red-700 dark:text-red-400"
          >
            Fine
          </Badge>
        )}
        {showNotesBadge && (
          <Badge
            variant="secondary"
            className="border-transparent bg-amber-500/10 text-[10px] text-amber-700 dark:text-amber-400"
            title="Ha note"
          >
            <FileText className="mr-0.5 size-3" aria-hidden />
            Note
          </Badge>
        )}
      </div>
    </button>
  );
}
