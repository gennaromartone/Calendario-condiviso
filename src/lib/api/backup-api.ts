/**
 * Client-side API for backup import/export.
 */

const defaultOptions: RequestInit = {
  credentials: "include",
  headers: { "Content-Type": "application/json" },
};

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
