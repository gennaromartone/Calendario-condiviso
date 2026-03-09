/**
 * Client-side API for info importanti.
 */

import type { CreateInfoImportanteInput } from "@/lib/validations/info-importanti";

export type InfoImportanteRecord = {
  id: string;
  titolo: string;
  tipo: string;
  valore: Record<string, string> | null;
  pinned: boolean;
  pinnedAt: string | null;
  creatoIl: string;
  modificatoIl: string;
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

export async function getInfoImportanti(): Promise<InfoImportanteRecord[]> {
  return apiFetch<InfoImportanteRecord[]>("/api/info-importanti");
}

export async function createInfoImportante(
  input: CreateInfoImportanteInput
): Promise<InfoImportanteRecord> {
  return apiFetch<InfoImportanteRecord>("/api/info-importanti", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateInfoImportante(
  id: string,
  input: CreateInfoImportanteInput
): Promise<InfoImportanteRecord> {
  return apiFetch<InfoImportanteRecord>(`/api/info-importanti/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteInfoImportante(id: string): Promise<void> {
  return apiFetch<void>(`/api/info-importanti/${id}`, {
    method: "DELETE",
  });
}

export async function togglePinInfoImportante(
  id: string
): Promise<InfoImportanteRecord> {
  return apiFetch<InfoImportanteRecord>(
    `/api/info-importanti/${id}/pin`,
    { method: "PATCH" }
  );
}
