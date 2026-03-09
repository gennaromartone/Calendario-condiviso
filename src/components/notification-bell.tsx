"use client";

import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  onClick: () => void;
  unreadCount?: number;
  ariaLabel?: string;
  className?: string;
}

export function NotificationBell({
  onClick,
  unreadCount = 0,
  ariaLabel = "Notifiche",
  className,
}: NotificationBellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground outline-none transition-all duration-200",
        "hover:bg-muted hover:text-foreground hover:border-muted-foreground/20",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
      aria-label={ariaLabel}
    >
      <Bell className="size-5" aria-hidden />
      {unreadCount > 0 && (
        <span
          className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-xs font-medium text-destructive-foreground"
          aria-hidden
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
