/**
 * Client-side API for calendar events.
 */

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
  creatoDa: string;
  creatoIl: string;
  modificatoIl: string;
  creatore?: { nome: string | null; affidamentoColore: string | null } | null;
};

export type CreateEventInput = {
  titolo: string;
  descrizione?: string;
  dataInizio: string;
  dataFine: string;
  tipo: EventRecord["tipo"];
  luogo?: string;
  note?: EventNotes | null;
};

const defaultOptions: RequestInit = {
  credentials: "include",
  headers: { "Content-Type": "application/json" },
};

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...defaultOptions, ...options });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      (data as { error?: string })?.error ?? `Errore ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

export async function getEvents(
  start?: string,
  end?: string
): Promise<EventRecord[]> {
  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  const qs = params.toString();
  return apiFetch<EventRecord[]>(`/api/events${qs ? `?${qs}` : ""}`);
}

export async function createEvent(input: CreateEventInput): Promise<EventRecord> {
  return apiFetch<EventRecord>("/api/events", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateEvent(
  id: string,
  input: Partial<CreateEventInput>
): Promise<EventRecord | null> {
  const res = await fetch(`/api/events/${id}`, {
    ...defaultOptions,
    method: "PATCH",
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error ?? `Errore ${res.status}`);
  }

  return data as EventRecord;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const res = await fetch(`/api/events/${id}`, {
    ...defaultOptions,
    method: "DELETE",
  });

  if (res.status === 404) return false;
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string })?.error ?? `Errore ${res.status}`);
  }

  return true;
}
