"use client";

import { ChevronDown, Download, Upload, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useBackupActions } from "@/hooks/use-backup-actions";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function CalendarHeaderActions() {
  const { userName, logout } = useAuth();
  const { handleExport, handleImport, triggerImport, inputRef } =
    useBackupActions();

  const displayName = userName?.trim() || "Utente";

  return (
    <nav
      className="flex items-center justify-end"
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
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "inline-flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium outline-none transition-colors",
            "hover:bg-muted hover:text-foreground",
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
