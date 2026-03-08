import Link from "next/link";
import { Suspense } from "react";
import { CalendarView } from "./calendar-view";
import { buttonVariants } from "@/lib/button-variants";
import { getWeekStart } from "./calendar-utils";
import { AuthGuard } from "@/components/auth-guard";
import { CalendarHeaderActions } from "@/components/calendar-header-actions";

const ITALIAN_MONTHS = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
] as const;

const ITALIAN_WEEKDAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"] as const;

function CalendarSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="h-7 w-40 animate-pulse rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px rounded-lg border border-border bg-muted/30 p-2">
        {Array.from({ length: 42 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded bg-muted/50 sm:h-24" />
        ))}
      </div>
    </div>
  );
}

type ViewMode = "month" | "week";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    month?: string;
    view?: string;
    weekStart?: string;
  }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const initialYear = params.year ? parseInt(params.year, 10) : now.getFullYear();
  const initialMonth = params.month
    ? Math.max(1, Math.min(12, parseInt(params.month, 10)))
    : now.getMonth() + 1;
  const initialView: ViewMode =
    params.view === "week" ? "week" : "month";

  let initialWeekStartStr: string;
  if (params.weekStart) {
    const parsed = new Date(params.weekStart);
    const ws = isNaN(parsed.getTime())
      ? getWeekStart(now)
      : getWeekStart(parsed);
    initialWeekStartStr = ws.toISOString().slice(0, 10);
  } else {
    const ws = getWeekStart(
      new Date(initialYear, initialMonth - 1, 15)
    );
    initialWeekStartStr = ws.toISOString().slice(0, 10);
  }

  return (
    <AuthGuard>
      <div id="main-content" className="flex min-h-screen flex-col p-4 sm:p-6 md:p-8 lg:p-10">
        <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl md:text-3xl">
              Calendario
            </h1>
            <p className="mt-1 text-muted-foreground">
              Vista mensile, settimanale e dettaglio evento
            </p>
          </div>
          <CalendarHeaderActions />
        </header>

        <main>
        <Suspense fallback={<CalendarSkeleton />}>
          <CalendarView
          initialYear={Number.isNaN(initialYear) ? now.getFullYear() : initialYear}
          initialMonth={Number.isNaN(initialMonth) ? now.getMonth() + 1 : initialMonth}
          initialView={initialView}
          initialWeekStart={initialWeekStartStr}
          monthNames={ITALIAN_MONTHS}
          weekdays={ITALIAN_WEEKDAYS}
        />
        </Suspense>
        </main>
      </div>
    </AuthGuard>
  );
}
