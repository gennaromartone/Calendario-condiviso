"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectToLogin?: boolean;
}

/**
 * Protects routes that require authentication.
 * When requireAuth is true and user is not authenticated, redirects to /.
 */
export function AuthGuard({
  children,
  requireAuth = true,
  redirectToLogin = true,
}: AuthGuardProps) {
  const { authenticated, authReady, needsName } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authReady) return;
    if (requireAuth && !authenticated && redirectToLogin) {
      router.replace("/");
      return;
    }
    if (authenticated && needsName && pathname !== "/scegli-nome") {
      router.replace("/scegli-nome");
    }
  }, [authReady, authenticated, needsName, pathname, requireAuth, redirectToLogin, router]);

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Caricamento…</p>
      </div>
    );
  }

  if (requireAuth && !authenticated) {
    return null;
  }

  return <>{children}</>;
}
