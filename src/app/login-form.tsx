"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SETUP_REQUIRED_MSG =
  "Nessun genitore configurato. Vai su /admin per aggiungerne uno.";

export function LoginForm() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const hasError = !!error;
  const needsSetup = error === SETUP_REQUIRED_MSG;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const password = formData.get("password");

    if (typeof password !== "string" || !password.trim()) {
      setError("Inserisci la parola d'ordine");
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(password);
      if (result.error) {
        setError(result.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Parola d&apos;ordine</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={hasError}
          aria-describedby={hasError ? "password-error password-hint" : "password-hint"}
          className="min-h-[44px] w-full"
          placeholder="Inserisci la parola d'ordine"
          disabled={isLoading}
        />
        <p id="password-hint" className="sr-only">
          Inserisci la tua parola d&apos;ordine personale
        </p>
      </div>
      <Button
        type="submit"
        className="min-h-[44px] min-w-[44px] w-full"
        disabled={isLoading}
      >
        Accedi
      </Button>
      <div
        id="password-error"
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        className={hasError ? "min-h-6 text-sm text-muted-foreground" : "sr-only"}
      >
        {hasError ? (
          needsSetup ? (
            <>
              Parola d&apos;ordine non configurata.{" "}
              <Link
                href="/admin"
                className="underline underline-offset-2 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded min-h-[44px] min-w-[44px] inline-flex items-center"
              >
                Aggiungi genitore
              </Link>
            </>
          ) : (
            error
          )
        ) : (
          "\u00A0"
        )}
      </div>
    </form>
  );
}
