"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEvent, updateEvent, deleteEvent } from "@/lib/api";
import type { CreateEventInput } from "@/lib/validations/events";
import { toast } from "sonner";

export function useEventMutations(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const invalidateEvents = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["events"] }),
    [queryClient]
  );

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      invalidateEvents();
      onSuccess?.();
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
      onSuccess?.();
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
      toast.success("Evento eliminato");
      onSuccess?.();
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Errore di rete");
    },
  });

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    isLoading,
  };
}
