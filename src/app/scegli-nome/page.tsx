"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const defaultOptions: RequestInit = {
  credentials: "include",
  headers: { "Content-Type": "application/json" },
};

async function completeProfile(nome: string): Promise<{ error?: string }> {
  const res = await fetch("/api/auth/complete-profile", {
    ...defaultOptions,
    method: "POST",
    body: JSON.stringify({ nome }),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return {
      error: (data as { error?: string })?.error ?? "Errore durante il salvataggio",
    };
  }

  return {};
}

export default function ScegliNomePage() {
  const router = useRouter();
  const { authenticated, authReady, needsName, logout, refreshSession } = useAuth();
  const [nome, setNome] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    if (!authenticated) {
      router.replace("/");
      return;
    }
    if (!needsName) {
      router.replace("/calendar");
    }
  }, [authReady, authenticated, needsName, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = nome.trim();
    if (!trimmed) {
      setError("Inserisci come vuoi essere chiamato");
      return;
    }

    setIsLoading(true);
    try {
      const result = await completeProfile(trimmed);
      if (result.error) {
        setError(result.error);
        return;
      }
      await refreshSession();
      router.push("/calendar");
    } finally {
      setIsLoading(false);
    }
  };

  if (!authReady || !authenticated || !needsName) {
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
          Scegli il tuo nome
        </h1>
        <Card className="w-full">
          <CardHeader>
            <h2 className="text-lg font-medium">
              Come vuoi essere chiamato?
            </h2>
            <p className="text-sm text-muted-foreground">
              Scegli un nome che gli altri genitori vedranno sul calendario (es. Papà, Mamma, Marco)
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="nome">
                  Nome
                </Label>
                <Input
                  id="nome"
                  name="nome"
                  type="text"
                  autoComplete="name"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Es. Papà, Mamma, Marco"
                  className="min-h-[44px]"
                  required
                  maxLength={100}
                  aria-invalid={!!error}
                  aria-describedby={error ? "nome-error nome-hint" : "nome-hint"}
                  disabled={isLoading}
                />
                <p id="nome-hint" className="sr-only">
                  Inserisci il nome con cui vuoi essere identificato sul calendario
                </p>
              </div>
              {error && (
                <p
                  id="nome-error"
                  role="alert"
                  className="text-sm text-destructive"
                  aria-live="polite"
                >
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="min-h-[44px] min-w-[44px] w-full"
                disabled={isLoading}
              >
                {isLoading ? "Salvataggio…" : "Continua"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <button
          type="button"
          onClick={() => logout()}
          className={cn(
            "inline-flex min-h-[44px] min-w-[44px] items-center",
            buttonVariants({ variant: "ghost" })
          )}
        >
          Esci
        </button>
      </main>
    </div>
  );
}
