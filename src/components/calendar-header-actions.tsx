"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { BackupControls } from "./backup-controls";

export function CalendarHeaderActions() {
  const { logout } = useAuth();

  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="Azioni calendario">
      <BackupControls />
      <Link
        href="/admin"
        className={cn(buttonVariants({ variant: "outline" }), "min-h-[44px] min-w-[44px] inline-flex items-center justify-center")}
      >
        Admin
      </Link>
      <button
        type="button"
        onClick={() => logout()}
        className={cn(buttonVariants({ variant: "outline" }), "min-h-[44px] min-w-[44px]")}
      >
        Esci
      </button>
    </nav>
  );
}
