/**
 * Client-side API for admin operations.
 */

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
