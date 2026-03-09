"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";
import { markAllNotificationsAsRead } from "@/lib/api";
import { NotificationItem } from "./notification-item";

interface NotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationPanel({ open, onOpenChange }: NotificationPanelProps) {
  const queryClient = useQueryClient();
  const { data: items = [], isPending } = useNotifications();

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifiche"] });
      queryClient.invalidateQueries({ queryKey: ["notifiche", "count"] });
    },
  });

  const hasUnread = items.some((i) => !i.letta);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0">
        <SheetHeader className="flex flex-row items-center justify-between gap-4 border-b p-4">
          <SheetTitle>Notifiche</SheetTitle>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="shrink-0 text-sm"
            >
              Segna tutte come lette
            </Button>
          )}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          {isPending ? (
            <p className="text-sm text-muted-foreground">Caricamento…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessuna notifica</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <NotificationItem
                  key={item.id}
                  item={item}
                  onOpenChange={onOpenChange}
                />
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
