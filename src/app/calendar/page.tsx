import { getWeekStart } from "./calendar-utils";
import { AuthGuard } from "@/components/auth-guard";
import { CalendarPageClient } from "./calendar-page-client";

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
        <CalendarPageClient
          initialYear={Number.isNaN(initialYear) ? now.getFullYear() : initialYear}
          initialMonth={Number.isNaN(initialMonth) ? now.getMonth() + 1 : initialMonth}
          initialView={initialView}
          initialWeekStart={initialWeekStartStr}
        />
      </div>
    </AuthGuard>
  );
}
