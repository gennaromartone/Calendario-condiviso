"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  getSession,
  login as apiLogin,
  logout as apiLogout,
  isPasswordSet,
} from "@/lib/api";

interface AuthContextValue {
  authenticated: boolean;
  userId?: string;
  userName?: string | null;
  needsName?: boolean;
  needsAffidamentoColor?: boolean;
  authReady: boolean;
  login: (password: string) => Promise<{ error?: string }>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  isPasswordSet: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();
  const [userName, setUserName] = useState<string | null | undefined>();
  const [needsName, setNeedsName] = useState<boolean | undefined>();
  const [needsAffidamentoColor, setNeedsAffidamentoColor] = useState<
    boolean | undefined
  >();
  const [authReady, setAuthReady] = useState(false);

  const refreshSession = useCallback(async () => {
    try {
      const data = await getSession();
      setAuthenticated(data.authenticated);
      setUserId(data.userId);
      setUserName(data.nome ?? null);
      setNeedsName(data.needsName);
      setNeedsAffidamentoColor(data.needsAffidamentoColor);
    } catch {
      setAuthenticated(false);
      setUserId(undefined);
      setUserName(undefined);
      setNeedsName(undefined);
      setNeedsAffidamentoColor(undefined);
    }
  }, []);

  useEffect(() => {
    refreshSession().finally(() => setAuthReady(true));
  }, [refreshSession]);

  const login = useCallback(
    async (password: string): Promise<{ error?: string }> => {
      if (!password.trim()) {
        return { error: "Inserisci la parola d'ordine" };
      }

      const passwordExists = await isPasswordSet();
      if (!passwordExists) {
        return {
          error: "Nessun genitore configurato. Vai su /admin per aggiungerne uno.",
        };
      }

      const result = await apiLogin(password.trim());
      if (result.error) return { error: result.error };

      await refreshSession();
      router.push(result.redirectTo ?? "/calendar");
      return {};
    },
    [router, refreshSession]
  );

  const logout = useCallback(async () => {
    await apiLogout();
    setAuthenticated(false);
    setUserId(undefined);
    setUserName(undefined);
    setNeedsName(undefined);
    setNeedsAffidamentoColor(undefined);
    router.push("/");
  }, [router]);

  const checkPasswordSet = useCallback(() => isPasswordSet(), []);

  const value: AuthContextValue = {
    authenticated,
    userId,
    userName,
    needsName,
    needsAffidamentoColor,
    authReady,
    login,
    logout,
    refreshSession,
    isPasswordSet: checkPasswordSet,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
