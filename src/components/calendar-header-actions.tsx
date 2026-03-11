"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Download,
  Upload,
  Settings,
  LogOut,
  PartyPopper,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useBackupActions } from "@/hooks/use-backup-actions";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { NotificationBell } from "@/components/notification-bell";
import { NotificationPanel } from "@/components/notification-panel";
import { useHolidayCountriesContext } from "@/contexts/holiday-countries-context";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

export function CalendarHeaderActions() {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { userName, logout } = useAuth();
  const { handleExport, handleImport, triggerImport, inputRef } =
    useBackupActions();
  const { data: unreadCount = 0 } = useUnreadCount({ refetchInterval: 60000 });
  const [, setHolidayPreference, holidayPreference] =
    useHolidayCountriesContext();

  const displayName = userName?.trim() || "Utente";

  return (
    <nav
      className="flex items-center justify-end gap-3"
      aria-label="Azioni calendario"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
        aria-hidden
      />
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
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "inline-flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium outline-none transition-all duration-200",
            "hover:bg-muted hover:text-foreground hover:border-muted-foreground/20",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "aria-expanded:bg-muted aria-expanded:text-foreground"
          )}
          aria-label="Menu azioni"
          aria-haspopup="menu"
        >
          <span
            className={cn(
              "truncate max-w-[120px] sm:max-w-[180px]",
              "text-foreground"
            )}
            aria-hidden
          >
            {displayName}
          </span>
          <ChevronDown
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleExport}>
            <Download className="size-4" aria-hidden />
            Esporta backup
          </DropdownMenuItem>
          <DropdownMenuItem onClick={triggerImport}>
            <Upload className="size-4" aria-hidden />
            Carica backup
          </DropdownMenuItem>
          <DropdownMenuLinkItem href="/admin">
            <Settings className="size-4" aria-hidden />
            Admin
          </DropdownMenuLinkItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <PartyPopper className="size-4" aria-hidden />
              Festività
              <ChevronRight className="ml-auto size-4" aria-hidden />
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => setHolidayPreference("both")}
                className={cn(holidayPreference === "both" && "bg-muted")}
              >
                IT + DE
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setHolidayPreference("IT")}
                className={cn(holidayPreference === "IT" && "bg-muted")}
              >
                Italia
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setHolidayPreference("DE")}
                className={cn(holidayPreference === "DE" && "bg-muted")}
              >
                Germania
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()}>
            <LogOut className="size-4" aria-hidden />
            Esci
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
