"use client";

import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  exportBackup,
  downloadBackup,
  importBackup,
} from "@/lib/api";
import { toast } from "sonner";

export function useBackupActions() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(async () => {
    try {
      const blob = await exportBackup();
      downloadBackup(blob);
      toast.success("Backup esportato con successo");
    } catch {
      toast.error("Errore durante l'esportazione del backup");
    }
  }, []);

  const handleImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const { eventsCount, configImported } = await importBackup(
          file,
          "replace"
        );
        toast.success(
          `Importati ${eventsCount} eventi${configImported ? " e configurazione" : ""}`
        );
        queryClient.invalidateQueries({ queryKey: ["events"] });
      } catch (err) {
        toast.error(
          "Errore durante l'import: " +
            (err instanceof Error ? err.message : "Unknown")
        );
      }
      e.target.value = "";
    },
    [queryClient]
  );

  const triggerImport = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return { handleExport, handleImport, triggerImport, inputRef };
}
