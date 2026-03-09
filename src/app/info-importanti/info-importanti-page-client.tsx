"use client";

import { useState } from "react";
import Link from "next/link";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { NotificationBell } from "@/components/notification-bell";
import { NotificationPanel } from "@/components/notification-panel";
import { useQuery } from "@tanstack/react-query";
import { getInfoImportanti } from "@/lib/api";
import type { InfoImportanteRecord } from "@/lib/api";
import { InfoImportanteFormSheet } from "./info-importante-form-sheet";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Loader2, Pin } from "lucide-react";
import { useInfoImportantiMutations } from "@/hooks/use-info-importanti-mutations";
import { safeTelUrl, safeMapsUrl } from "@/lib/info-importanti-links";

const TIPO_LABELS: Record<string, string> = {
  scuola: "Scuola",
  medico: "Medico",
  altro: "Altro",
};

function InfoImportanteCard({
  item,
  onEdit,
  onDelete,
  onTogglePin,
  isPinning,
}: {
  item: InfoImportanteRecord;
  onEdit: (item: InfoImportanteRecord) => void;
  onDelete: (item: InfoImportanteRecord) => void;
  onTogglePin: (item: InfoImportanteRecord) => void;
  isPinning: boolean;
}) {
  const v = item.valore ?? {};
  const telUrl = safeTelUrl(v.telefono);
  const mapsUrl = safeMapsUrl(v.indirizzo);

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{item.titolo}</p>
        <p className="text-sm text-muted-foreground">
          {TIPO_LABELS[item.tipo] ?? item.tipo}
        </p>
        {(v.telefono || v.indirizzo || v.contenuto) && (
          <div className="mt-2 flex flex-col gap-1 text-sm">
            {v.telefono &&
              (telUrl ? (
                <a
                  href={telUrl}
                  className="text-primary underline underline-offset-2 hover:no-underline"
                >
                  {v.telefono}
                </a>
              ) : (
                <span>{v.telefono}</span>
              ))}
            {v.indirizzo &&
              (mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 hover:no-underline"
                >
                  {v.indirizzo}
                </a>
              ) : (
                <span>{v.indirizzo}</span>
              ))}
            {v.contenuto && (
              <span className="whitespace-pre-wrap">{v.contenuto}</span>
            )}
          </div>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          variant={item.pinned ? "secondary" : "outline"}
          size="sm"
          onClick={() => onTogglePin(item)}
          disabled={isPinning}
          className="min-h-[44px] min-w-[44px]"
          aria-label={item.pinned ? "Rimuovi pin" : "Aggiungi pin"}
          aria-pressed={item.pinned}
        >
          <Pin
            className={`size-4 ${item.pinned ? "fill-current" : ""}`}
            aria-hidden
          />
          {item.pinned ? "Pinnato" : "Pin"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(item)}
          className="min-h-[44px] min-w-[44px]"
          aria-label="Modifica"
        >
          <Pencil className="size-4" aria-hidden />
          Modifica
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(item)}
          className="min-h-[44px] min-w-[44px] text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label="Elimina"
        >
          <Trash2 className="size-4" aria-hidden />
          Elimina
        </Button>
      </div>
    </li>
  );
}

export function InfoImportantiPageClient() {
  const [formSheetOpen, setFormSheetOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadCount({ refetchInterval: 60000 });
  const [editingInfo, setEditingInfo] = useState<InfoImportanteRecord | null>(
    null
  );
  const [deletingInfo, setDeletingInfo] =
    useState<InfoImportanteRecord | null>(null);

  const { data: items = [], isPending } = useQuery({
    queryKey: ["info-importanti"],
    queryFn: getInfoImportanti,
  });

  const { deleteMutation, pinMutation } = useInfoImportantiMutations(() =>
    setDeletingInfo(null)
  );

  const handleOpenAdd = () => {
    setEditingInfo(null);
    setFormSheetOpen(true);
  };

  const handleOpenEdit = (item: InfoImportanteRecord) => {
    setEditingInfo(item);
    setFormSheetOpen(true);
  };

  const handleFormSheetOpenChange = (open: boolean) => {
    setFormSheetOpen(open);
    if (!open) setEditingInfo(null);
  };

  const handleOpenDelete = (item: InfoImportanteRecord) => {
    setDeletingInfo(item);
  };

  const handleConfirmDelete = async () => {
    if (!deletingInfo) return;
    await deleteMutation.mutateAsync(deletingInfo.id);
    setDeletingInfo(null);
  };

  const handleTogglePin = (item: InfoImportanteRecord) => {
    pinMutation.mutate(item.id);
  };

  return (
    <main>
      <header className="mb-6 flex flex-col gap-4 sm:mb-8">
        <nav
          className="flex items-center gap-1 text-sm text-muted-foreground"
          aria-label="Breadcrumb"
        >
          <Link
            href="/calendar"
            className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Torna al calendario"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </Link>
          <Link
            href="/calendar"
            className="rounded-lg px-2 py-1.5 outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Calendario
          </Link>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" aria-hidden />
          <span className="font-medium text-foreground" aria-current="page">
            Info importanti
          </span>
        </nav>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight sm:text-2xl md:text-3xl">
            Info importanti
          </h1>
          <div className="flex items-center gap-2">
            <NotificationBell
              onClick={() => setNotificationOpen(true)}
              unreadCount={unreadCount}
              aria-label={
                unreadCount > 0
                  ? `Notifiche, ${unreadCount} non lette`
                  : "Notifiche"
              }
            />
            <NotificationPanel
              open={notificationOpen}
              onOpenChange={setNotificationOpen}
            />
            <Button
              onClick={handleOpenAdd}
              className="min-h-[44px] min-w-[44px] shrink-0"
              aria-label="Aggiungi info"
            >
              <Plus className="size-5" aria-hidden />
              Aggiungi info
            </Button>
          </div>
        </div>
      </header>

      {isPending ? (
        <p className="text-muted-foreground">Caricamento…</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">Nessuna info aggiunta.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <InfoImportanteCard
              key={item.id}
              item={item}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onTogglePin={handleTogglePin}
              isPinning={pinMutation.isPending}
            />
          ))}
        </ul>
      )}

      <InfoImportanteFormSheet
        open={formSheetOpen}
        onOpenChange={handleFormSheetOpenChange}
        editingInfo={editingInfo}
      />

      <AlertDialog
        open={!!deletingInfo}
        onOpenChange={(open) => !open && setDeletingInfo(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina info</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questa info?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingInfo(null)}
              disabled={deleteMutation.isPending}
              className="min-h-[44px] min-w-[44px]"
            >
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="min-h-[44px] min-w-[44px]"
            >
              {deleteMutation.isPending && (
                <Loader2
                  className="size-4 animate-spin"
                  data-icon="inline-start"
                />
              )}
              Elimina
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
