"use client";

import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { EventForm } from "./event-form";
import { DeleteAlertDialog } from "./delete-confirm-dialog";
import { AffidamentoColorModal } from "./affidamento-color-modal";
import type { EventRecord } from "./calendar-utils";
import type { CreateEventInput } from "@/lib/validations/events";
import { toast } from "sonner";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getColorsAvailable,
  completeProfile,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
interface EventFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: EventRecord | null;
  mode: "create" | "edit";
  currentUserId?: string;
}

export function EventFormSheet({
  open,
  onOpenChange,
  event,
  mode,
  currentUserId,
}: EventFormSheetProps) {
  const queryClient = useQueryClient();
  const { needsAffidamentoColor, refreshSession } = useAuth();
  const isOwner =
    mode === "create" ||
    !event ||
    !currentUserId ||
    !event.creatoDa ||
    event.creatoDa === currentUserId;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [pendingCreateValues, setPendingCreateValues] =
    useState<CreateEventInput | null>(null);

  const invalidateEvents = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["events"] }),
    [queryClient]
  );

  const { data: availableColors = [] } = useQuery({
    queryKey: ["colors-available"],
    queryFn: getColorsAvailable,
    enabled: open && mode === "create" && !!needsAffidamentoColor,
  });

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      invalidateEvents();
      onOpenChange(false);
      toast.success("Evento creato con successo");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Errore di rete");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<CreateEventInput>;
    }) => updateEvent(id, input),
    onSuccess: (updated) => {
      if (!updated) {
        toast.error("Evento non trovato");
        return;
      }
      invalidateEvents();
      onOpenChange(false);
      toast.success("Evento modificato con successo");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Errore di rete");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: (deleted) => {
      if (!deleted) {
        toast.error("Evento non trovato");
        return;
      }
      invalidateEvents();
      setDeleteDialogOpen(false);
      onOpenChange(false);
      toast.success("Evento eliminato");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Errore di rete");
    },
  });

  const handleColorConfirm = useCallback(
    async (hex: string) => {
      if (!pendingCreateValues) return;
      try {
        await completeProfile({ affidamentoColore: hex });
        await refreshSession();
        await createMutation.mutateAsync(pendingCreateValues);
        setPendingCreateValues(null);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Errore di rete");
      }
    },
    [pendingCreateValues, refreshSession, createMutation]
  );

  const handleSubmit = async (values: CreateEventInput) => {
    if (mode === "create") {
      if (values.tipo === "affidamento" && needsAffidamentoColor) {
        setPendingCreateValues(values);
        setColorModalOpen(true);
        return;
      }
      await createMutation.mutateAsync(values);
    } else if (event) {
      await updateMutation.mutateAsync({ id: event.id, input: values });
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    await deleteMutation.mutateAsync(event.id);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const isLoading =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const title = mode === "create" ? "Nuovo evento" : "Modifica evento";
  const description =
    mode === "create"
      ? "Compila i campi per creare un nuovo evento"
      : "Modifica i dettagli dell'evento";

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="flex w-full flex-col sm:max-w-md"
          showCloseButton
        >
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {!isOwner ? (
              <p className="text-sm text-muted-foreground">
                Non puoi modificare questo evento perché non sei il creatore.
              </p>
            ) : (
              <EventForm
                event={mode === "edit" ? event : undefined}
                onSubmit={handleSubmit}
                onDelete={mode === "edit" ? handleDeleteClick : undefined}
                isLoading={isLoading}
                isEdit={mode === "edit"}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <DeleteAlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isLoading={isLoading}
      />

      <AffidamentoColorModal
        open={colorModalOpen}
        onOpenChange={(o) => {
          setColorModalOpen(o);
          if (!o) setPendingCreateValues(null);
        }}
        availableColors={availableColors}
        onConfirm={handleColorConfirm}
        isLoading={createMutation.isPending}
      />
    </>
  );
}

