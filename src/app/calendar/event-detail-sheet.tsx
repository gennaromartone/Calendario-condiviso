"use client";

import { useMemo, useEffect, useState } from "react";
import { format, parseISO, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EVENT_TIPO_CONFIG } from "@/lib/event-types";
import type { EventRecord } from "./calendar-utils";
import { Pencil, Trash2 } from "lucide-react";
import { DeleteAlertDialog } from "./delete-confirm-dialog";
import { deleteEvent } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

interface EventDetailSheetProps {
  event: EventRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onModify?: (event: EventRecord) => void;
  onDeleted?: () => void;
  currentUserId?: string;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setIsMobile(mq.matches);
    const handler = () => setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

function formatTimeRange(dataInizio: string, dataFine: string): string {
  try {
    const start = parseISO(dataInizio);
    const end = parseISO(dataFine);
    const startTime = format(start, "HH:mm");
    const endTime = format(end, "HH:mm");
    return `${startTime} – ${endTime}`;
  } catch {
    return "";
  }
}

function formatDateRange(dataInizio: string, dataFine: string): string {
  try {
    const start = parseISO(dataInizio);
    const end = parseISO(dataFine);
    if (isSameDay(start, end)) {
      return format(start, "EEEE d MMMM yyyy", { locale: it });
    }
    const sameYear = start.getFullYear() === end.getFullYear();
    const startFmt = sameYear
      ? format(start, "d MMMM", { locale: it })
      : format(start, "d MMMM yyyy", { locale: it });
    const endFmt = format(end, "d MMMM yyyy", { locale: it });
    return `${startFmt} – ${endFmt}`;
  } catch {
    return "";
  }
}

export function EventDetailSheet({
  event,
  open,
  onOpenChange,
  onModify,
  onDeleted,
  currentUserId: currentUserIdProp,
}: EventDetailSheetProps) {
  const { userId: authUserId } = useAuth();
  const currentUserId = currentUserIdProp ?? authUserId;
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";
  const tipoCfg = event ? EVENT_TIPO_CONFIG[event.tipo] : null;
  const canModify =
    !!event &&
    !!currentUserId &&
    !!event.creatoDa &&
    event.creatoDa === currentUserId;

  const invalidateEvents = useMemo(
    () => () => queryClient.invalidateQueries({ queryKey: ["events"] }),
    [queryClient]
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: (deleted) => {
      if (!deleted) {
        toast.error("Evento non trovato");
        return;
      }
      invalidateEvents();
      setDeleteDialogOpen(false);
      onOpenChange(false);
      onDeleted?.();
      toast.success("Evento eliminato");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Errore di rete");
    },
  });

  const handleDeleteConfirm = async () => {
    if (!event) return;
    await deleteMutation.mutateAsync(event.id);
  };

  const formattedDate = useMemo(
    () => (event ? formatDateRange(event.dataInizio, event.dataFine) : ""),
    [event]
  );
  const timeRange = useMemo(
    () =>
      event ? formatTimeRange(event.dataInizio, event.dataFine) : "",
    [event]
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onOpenChange(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side={sheetSide}
        className={cn(
          "flex w-full flex-col",
          sheetSide === "right" && "sm:max-w-md",
          sheetSide === "bottom" && "max-h-[85vh]"
        )}
        showCloseButton={true}
      >
        {event ? (
          <>
            <SheetHeader className="pr-12">
              <SheetTitle id="event-detail-title">
                {event.titolo}
              </SheetTitle>
              <SheetDescription id="event-detail-description">
                Dettaglio evento del calendario
              </SheetDescription>
            </SheetHeader>

            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Data
                </p>
                <p className="text-sm">{formattedDate}</p>
              </div>

              {timeRange && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Ora
                  </p>
                  <p className="text-sm">{timeRange}</p>
                </div>
              )}

              {tipoCfg && (
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Tipo
                  </p>
                  <Badge
                    variant="secondary"
                    className={cn("w-fit capitalize", tipoCfg.color)}
                  >
                    <tipoCfg.icon
                      className="mr-1 size-3.5 shrink-0"
                      aria-hidden
                    />
                    {tipoCfg.label}
                  </Badge>
                </div>
              )}

              {event.descrizione && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Descrizione
                  </p>
                  <p className="text-sm leading-relaxed">
                    {event.descrizione}
                  </p>
                </div>
              )}

              {event.note &&
                (event.note.general?.trim() ||
                  (event.note.byDay &&
                    Object.keys(event.note.byDay).length > 0)) && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                      Note
                    </p>
                    <div className="space-y-2">
                      {event.note.general?.trim() && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Note generali
                          </p>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {event.note.general.trim()}
                          </p>
                        </div>
                      )}
                      {event.note.byDay &&
                        Object.keys(event.note.byDay).length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">
                              Note per giorno
                            </p>
                            <ul className="space-y-2">
                              {Object.entries(event.note.byDay)
                                .filter(([, v]) => v?.trim())
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([dateKey, noteText]) => {
                                  const d = new Date(dateKey + "T12:00:00");
                                  const label = format(d, "EEEE d MMMM", {
                                    locale: it,
                                  });
                                  return (
                                    <li
                                      key={dateKey}
                                      className="rounded-md border border-border bg-muted/30 px-3 py-2"
                                    >
                                      <p className="text-xs font-medium capitalize text-muted-foreground">
                                        {label}
                                      </p>
                                      <p className="text-sm leading-relaxed whitespace-pre-wrap mt-1">
                                        {noteText.trim()}
                                      </p>
                                    </li>
                                  );
                                })}
                            </ul>
                          </div>
                        )}
                    </div>
                  </div>
                )}

              {event.creatore && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Creato da
                  </p>
                  <p className="text-sm">
                    {event.creatore.nome || "Senza nome"}
                  </p>
                </div>
              )}
            </div>

            <SheetFooter className="flex-row gap-2 border-t border-border pt-4">
              {canModify && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="min-h-11 min-w-11"
                    aria-label="Modifica evento"
                    onClick={() => event && onModify?.(event)}
                  >
                    <Pencil className="size-4" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="min-h-11 min-w-11"
                    aria-label="Elimina evento"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </>
              )}
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-4">
            <p className="text-sm text-muted-foreground">
              Evento non trovato
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>

    <DeleteAlertDialog
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
      onConfirm={handleDeleteConfirm}
      isLoading={deleteMutation.isPending}
    />
    </>
  );
}
