/**
 * Client-side API for notifications.
 */

export type NotificaRecord = {
  id: string;
  utenteId: string;
  tipo: string;
  entityType: string;
  entityId: string | null;
  titolo: string;
  autoreId: string;
  letta: boolean;
  creatoIl: string;
  autoreNome: string | null;
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

export async function getNotifiche(
  options?: { unreadOnly?: boolean }
): Promise<NotificaRecord[]> {
  const params = new URLSearchParams();
  if (options?.unreadOnly) params.set("unreadOnly", "true");
  const url = params.toString()
    ? `/api/notifiche?${params.toString()}`
    : "/api/notifiche";
  return apiFetch<NotificaRecord[]>(url);
}

export async function getUnreadCount(): Promise<{ count: number }> {
  return apiFetch<{ count: number }>("/api/notifiche/count");
}

export async function markNotificationAsRead(
  id: string
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/api/notifiche/${id}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const res = await fetch("/api/notifiche/read-all", {
    ...defaultOptions,
    method: "PATCH",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message =
      (data as { error?: string })?.error ?? `Errore ${res.status}`;
    throw new Error(message);
  }
}
