"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "@/app/login-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { authenticated, authReady, needsName } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authReady) return;
    if (authenticated) {
      router.replace(needsName ? "/scegli-nome" : "/calendar");
    }
  }, [authReady, authenticated, needsName, router]);

  if (!authReady || authenticated) {
    return (
      <div id="main-content" className="flex min-h-screen flex-col items-center justify-center p-4">
        <p className="text-muted-foreground">Caricamento…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <main id="main-content" className="flex w-full max-w-md flex-col items-center gap-6">
        <h1 className="text-2xl font-semibold sm:text-3xl md:text-4xl">
          Calendario Condiviso
        </h1>
        <Card className="w-full">
          <CardHeader>
            <h2 className="text-lg font-medium">Accedi con la parola d&apos;ordine</h2>
            <p className="text-sm text-muted-foreground">
              Inserisci la tua parola d&apos;ordine personale per accedere al calendario
            </p>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
        <p className="text-sm text-muted-foreground">
          Prima configurazione?{" "}
          <Link
            href="/admin"
            className="underline underline-offset-2 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
          >
            Aggiungi il primo genitore
          </Link>
        </p>
      </main>
    </div>
  );
}
