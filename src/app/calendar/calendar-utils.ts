export type EventNotes = {
  general?: string;
  byDay?: Record<string, string>;
};

export type EventRecord = {
  id: string;
  titolo: string;
  descrizione: string | null;
  dataInizio: string;
  dataFine: string;
  tipo: "affidamento" | "scuola" | "sport" | "altro";
  luogo?: string;
  note?: EventNotes | null;
  creatoDa?: string;
  creatore?: { nome: string | null; affidamentoColore: string | null } | null;
};

export function hasNotesForDate(
  event: EventRecord,
  dateKey: string
): boolean {
  const n = event.note;
  if (!n) return false;
  if (n.general?.trim()) return true;
  return !!(n.byDay?.[dateKey]?.trim());
}

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Get Monday of the week containing the given date (ISO week, Mon–Sun) */
export function getWeekStart(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday = 1, Sunday = 0 -> -6
  date.setDate(date.getDate() + diff);
  return date;
}

/** Get array of 7 dates (Mon–Sun) for the week containing the given date */
export function getWeekDates(weekStart: Date): Date[] {
  const dates: Date[] = [];
  const d = new Date(weekStart);
  for (let i = 0; i < 7; i++) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

/** Returns all date keys (YYYY-MM-DD) an event spans, from dataInizio to dataFine inclusive */
export function getEventDateKeys(event: {
  dataInizio: string;
  dataFine: string;
}): string[] {
  const start = new Date(event.dataInizio);
  const end = new Date(event.dataFine);
  const keys: string[] = [];
  const d = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (d <= endDate) {
    keys.push(toDateKey(d));
    d.setDate(d.getDate() + 1);
  }
  return keys;
}

export function getMonthGrid(
  year: number,
  month: number
): { date: Date; isCurrentMonth: boolean }[] {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const startDow = (first.getDay() + 6) % 7;
  const startDate = new Date(first);
  startDate.setDate(startDate.getDate() - startDow);

  const cells: { date: Date; isCurrentMonth: boolean }[] = [];
  let d = new Date(startDate);
  const totalCells = 42;

  for (let i = 0; i < totalCells; i++) {
    cells.push({
      date: new Date(d),
      isCurrentMonth: d.getMonth() === month - 1,
    });
    d.setDate(d.getDate() + 1);
  }

  return cells;
}
