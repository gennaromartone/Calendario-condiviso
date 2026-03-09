"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markNotificationAsRead } from "@/lib/api";
import type { NotificaRecord } from "@/lib/api";
import { cn } from "@/lib/utils";

const TIPO_LABELS: Record<string, string> = {
  evento_aggiunto: "aggiunto",
  evento_modificato: "modificato",
  evento_eliminato: "eliminato",
  info_aggiunta: "aggiunta",
  info_modificata: "modificata",
  info_eliminata: "eliminata",
};

const ENTITY_LABELS: Record<string, string> = {
  evento: "Evento",
  info_importante: "Info",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Adesso";
  if (diffMins < 60) return `${diffMins} min fa`;
  if (diffHours < 24) return `${diffHours} h fa`;
  if (diffDays < 7) return `${diffDays} giorni fa`;
  return d.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

interface NotificationItemProps {
  item: NotificaRecord;
  onOpenChange: (open: boolean) => void;
}

export function NotificationItem({ item, onOpenChange }: NotificationItemProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const markReadMutation = useMutation({
    mutationFn: () => markNotificationAsRead(item.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifiche"] });
      queryClient.invalidateQueries({ queryKey: ["notifiche", "count"] });
    },
  });

  const azione = TIPO_LABELS[item.tipo] ?? item.tipo;
  const entityLabel = ENTITY_LABELS[item.entityType] ?? item.entityType;
  const autore = item.autoreNome?.trim() || "Utente";

  const handleClick = async () => {
    if (!item.letta) {
      await markReadMutation.mutateAsync();
    }
    onOpenChange(false);
    if (item.entityType === "evento") {
      router.push("/calendar");
    } else {
      router.push("/info-importanti");
    }
  };

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "w-full rounded-lg border p-3 text-left transition-colors",
          "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          item.letta
            ? "border-transparent bg-transparent"
            : "border-primary/20 bg-primary/5"
        )}
      >
        <div className="flex items-start gap-2">
          {!item.letta && (
            <span
              className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
              aria-hidden
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">
              {entityLabel} {azione}: {item.titolo}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {autore} · {formatDate(item.creatoIl)}
            </p>
          </div>
        </div>
      </button>
    </li>
  );
}
