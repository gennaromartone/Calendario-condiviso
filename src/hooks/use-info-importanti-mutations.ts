"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createInfoImportante,
  updateInfoImportante,
  deleteInfoImportante,
  togglePinInfoImportante,
} from "@/lib/api";
import type { CreateInfoImportanteInput } from "@/lib/validations/info-importanti";
import { toast } from "sonner";

export function useInfoImportantiMutations(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const invalidateInfoImportanti = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["info-importanti"] }),
    [queryClient]
  );

  const createMutation = useMutation({
    mutationFn: createInfoImportante,
    onSuccess: () => {
      invalidateInfoImportanti();
      onSuccess?.();
      toast.success("Info aggiunta con successo");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Errore di rete");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateInfoImportanteInput }) =>
      updateInfoImportante(id, input),
    onSuccess: () => {
      invalidateInfoImportanti();
      onSuccess?.();
      toast.success("Info modificata con successo");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Errore di rete");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInfoImportante,
    onSuccess: () => {
      invalidateInfoImportanti();
      onSuccess?.();
      toast.success("Info eliminata con successo");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Errore di rete");
    },
  });

  const pinMutation = useMutation({
    mutationFn: togglePinInfoImportante,
    onSuccess: () => {
      invalidateInfoImportanti();
      onSuccess?.();
      toast.success("Info aggiornata");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Errore di rete");
    },
  });

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    pinMutation.isPending;

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    pinMutation,
    isLoading,
  };
}
