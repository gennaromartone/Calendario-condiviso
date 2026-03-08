/**
 * Client-side API for calendar operations.
 * All requests use credentials to send session cookies.
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

export async function isPasswordSet(): Promise<boolean> {
  const data = await apiFetch<{ isPasswordSet: boolean }>(
    "/api/config/password-set"
  );
  return data.isPasswordSet;
}

export type LoginResult = {
  error?: string;
  redirectTo?: "/scegli-nome" | "/calendar";
};

export async function login(password: string): Promise<LoginResult> {
  try {
    const data = await apiFetch<{
      userId: string;
      needsName: boolean;
      needsAffidamentoColor: boolean;
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    if (data.needsName) {
      return { redirectTo: "/scegli-nome" };
    }
    return { redirectTo: "/calendar" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Errore di rete" };
  }
}

export async function logout(): Promise<void> {
  await apiFetch("/api/auth/logout", { method: "POST" });
}

export async function getSession(): Promise<{
  authenticated: boolean;
  userId?: string;
  needsName?: boolean;
  needsAffidamentoColor?: boolean;
}> {
  return apiFetch("/api/auth/session");
}

export type ColorOption = { hex: string; name: string };

export async function getColorsAvailable(): Promise<ColorOption[]> {
  return apiFetch<ColorOption[]>("/api/users/colors-available");
}

export async function completeProfile(data: {
  nome?: string;
  affidamentoColore?: string;
}): Promise<void> {
  await apiFetch("/api/auth/complete-profile", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAdminStatus(): Promise<{
  hasUsers: boolean;
  canAccess: boolean;
  authenticated: boolean;
}> {
  return apiFetch("/api/admin/status");
}

export async function createUser(
  password: string
): Promise<{ id: string; message?: string }> {
  return apiFetch<{ id: string; message?: string }>("/api/admin/users", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export type AdminUser = {
  id: string;
  nome: string | null;
  creatoIl: string;
};

export async function getAdminUsers(): Promise<AdminUser[]> {
  return apiFetch<AdminUser[]>("/api/admin/users");
}

export async function updateUserPassword(
  userId: string,
  password: string
): Promise<{ message?: string }> {
  return apiFetch<{ message?: string }>(`/api/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ password }),
  });
}

export async function exportBackup(): Promise<Blob> {
  const res = await fetch("/api/backup", { credentials: "include" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string })?.error ?? "Errore export");
  }
  const json = await res.json();
  return new Blob([JSON.stringify(json, null, 2)], {
    type: "application/json",
  });
}

export function downloadBackup(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `calendario-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importBackup(
  file: File,
  mode: "replace" | "merge" = "replace"
): Promise<{ eventsCount: number; configImported: boolean }> {
  const text = await file.text();
  const parsed = JSON.parse(text) as { events?: unknown[]; config?: unknown };

  if (!parsed?.events || !Array.isArray(parsed.events)) {
    throw new Error("Formato backup non valido");
  }

  const res = await fetch("/api/backup", {
    ...defaultOptions,
    method: "POST",
    body: JSON.stringify({ ...parsed, mode }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string })?.error ?? "Errore import");
  }

  return res.json();
}
