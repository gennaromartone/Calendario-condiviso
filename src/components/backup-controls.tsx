"use client";

import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  exportBackup,
  downloadBackup,
  importBackup,
} from "@/lib/api";
import { toast } from "sonner";

export function BackupControls() {
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

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        className="min-h-[44px] min-w-[44px]"
      >
        <Download className="mr-2 size-4" aria-hidden />
        Esporta backup
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
        aria-hidden
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        className="min-h-[44px] min-w-[44px]"
      >
        <Upload className="mr-2 size-4" aria-hidden />
        Carica backup
      </Button>
    </div>
  );
}
