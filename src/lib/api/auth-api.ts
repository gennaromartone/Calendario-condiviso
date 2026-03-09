/**
 * Client-side API for authentication.
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
  nome?: string | null;
  needsName?: boolean;
  needsAffidamentoColor?: boolean;
}> {
  return apiFetch("/api/auth/session");
}

export type ColorOption = { hex: string; name: string };

export async function getColorsAvailable(
  excludeUserId?: string
): Promise<ColorOption[]> {
  const url =
    excludeUserId != null
      ? `/api/users/colors-available?excludeUserId=${encodeURIComponent(excludeUserId)}`
      : "/api/users/colors-available";
  return apiFetch<ColorOption[]>(url);
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
