"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  getAdminStatus,
  createUser,
  getAdminUsers,
  updateUserPassword,
  updateUserAffidamentoColore,
  deleteUser,
  getColorsAvailable,
} from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BackupControls } from "@/components/backup-controls";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import type { AdminUser } from "@/lib/api";

type Status = "loading" | "denied" | "ready" | "success" | "error";

function AdminUserList() {
  const queryClient = useQueryClient();
  const { userId, userName } = useAuth();
  const isSuperAdmin = userName?.trim() === "Gennaro";
  const { data: users = [], isPending } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: getAdminUsers,
  });

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">Utenti esistenti</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Caricamento…</p>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-medium">Utenti esistenti</h2>
        <p className="text-sm text-muted-foreground">
          Lista genitori. Puoi modificare la parola d&apos;ordine e il colore
          Affidamento per ciascuno.
        </p>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-4">
          {users.map((user) => (
            <AdminUserRow
              key={user.id}
              user={user}
              currentUserId={userId}
              isSuperAdmin={isSuperAdmin}
              onUpdated={() => {
                queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
                queryClient.invalidateQueries({ queryKey: ["admin", "status"] });
                queryClient.invalidateQueries({ queryKey: ["colors-available"] });
              }}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function AdminUserRow({
  user,
  currentUserId,
  isSuperAdmin,
  onUpdated,
}: {
  user: AdminUser;
  currentUserId?: string;
  isSuperAdmin: boolean;
  onUpdated: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [colorError, setColorError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: availableColors = [] } = useQuery({
    queryKey: ["colors-available", "admin", user.id],
    queryFn: () => getColorsAvailable(user.id),
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (pwd: string) => updateUserPassword(user.id, pwd),
    onSuccess: () => {
      setPassword("");
      setError(null);
      setEditing(false);
      onUpdated();
    },
    onError: (e) => {
      setError(e instanceof Error ? e.message : "Errore durante il salvataggio");
    },
  });

  const updateColorMutation = useMutation({
    mutationFn: (hex: string | null) =>
      updateUserAffidamentoColore(user.id, hex),
    onSuccess: () => {
      setColorError(null);
      onUpdated();
    },
    onError: (e) => {
      setColorError(e instanceof Error ? e.message : "Errore durante l'aggiornamento del colore");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteUser(user.id),
    onSuccess: () => {
      setDeleteOpen(false);
      onUpdated();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = password.trim();
    if (!trimmed) {
      setError("Inserisci la parola d'ordine");
      return;
    }
    if (trimmed.length < 6) {
      setError("La parola d'ordine deve avere almeno 6 caratteri");
      return;
    }
    updatePasswordMutation.mutate(trimmed);
  };

  const formattedDate = (() => {
    try {
      return format(parseISO(user.creatoIl), "d MMM yyyy", { locale: it });
    } catch {
      return user.creatoIl;
    }
  })();

  const canDelete =
    isSuperAdmin &&
    currentUserId != null &&
    user.id !== currentUserId;

  return (
    <li className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium">{user.nome || "Senza nome"}</p>
          <p className="text-sm text-muted-foreground">
            Creato il {formattedDate}
          </p>
          {user.affidamentoColore && (
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Colore Affidamento:
              </span>
              <span
                className="inline-block h-4 w-4 rounded border border-border"
                style={{ backgroundColor: user.affidamentoColore }}
                aria-hidden
              />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {!editing ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-[44px] min-w-[44px] shrink-0"
              onClick={() => setEditing(true)}
            >
              Modifica password
            </Button>
          ) : null}
          {canDelete && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="min-h-[44px] min-w-[44px] shrink-0"
              onClick={() => setDeleteOpen(true)}
            >
              Elimina utente
            </Button>
          )}
        </div>
      </div>

      {availableColors.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-2 border-t border-border">
          <span className="text-xs font-medium text-muted-foreground">
            Colore Affidamento
          </span>
          {colorError && (
            <p
              role="alert"
              className="text-sm text-destructive"
              aria-live="polite"
            >
              {colorError}
            </p>
          )}
          <div
            role="group"
            aria-label="Colori disponibili"
            className="flex flex-wrap gap-2"
          >
            {availableColors.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => updateColorMutation.mutate(c.hex)}
                disabled={updateColorMutation.isPending}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  user.affidamentoColore === c.hex
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-transparent hover:border-muted-foreground/30"
                )}
                style={{ backgroundColor: c.hex }}
                aria-pressed={user.affidamentoColore === c.hex}
                aria-label={`Imposta colore ${c.name}`}
              />
            ))}
          </div>
          {user.affidamentoColore && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-fit text-xs"
              onClick={() => updateColorMutation.mutate(null)}
              disabled={updateColorMutation.isPending}
            >
              Rimuovi colore
            </Button>
          )}
        </div>
      )}

      {editing && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 pt-2 border-t border-border">
          <div className="flex flex-col gap-1">
            <Label htmlFor={`password-${user.id}`}>
              Nuova parola d&apos;ordine
            </Label>
            <Input
              id={`password-${user.id}`}
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Almeno 6 caratteri"
              className="min-h-[44px]"
              minLength={6}
              aria-invalid={!!error}
              aria-describedby={error ? `password-error-${user.id}` : undefined}
            />
          </div>
          {error && (
            <p
              id={`password-error-${user.id}`}
              role="alert"
              className="text-sm text-destructive"
              aria-live="polite"
            >
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={updatePasswordMutation.isPending}
              className="min-h-[44px] min-w-[44px]"
            >
              {updatePasswordMutation.isPending ? "Salvataggio…" : "Salva"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-[44px] min-w-[44px]"
              onClick={() => {
                setEditing(false);
                setPassword("");
                setError(null);
              }}
              disabled={updatePasswordMutation.isPending}
            >
              Annulla
            </Button>
          </div>
        </form>
      )}

      {canDelete && (
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Elimina utente</AlertDialogTitle>
              <AlertDialogDescription>
                Stai per eliminare {user.nome || "questo utente"}. Questo
                eliminerà anche tutti i suoi eventi e le info importanti create.
                L&apos;operazione non può essere annullata.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "min-h-[44px] min-w-[44px]"
                )}
              >
                Annulla
              </AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="min-h-[44px] min-w-[44px]"
              >
                {deleteMutation.isPending ? "Eliminazione…" : "Elimina"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </li>
  );
}

function AdminContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { authenticated, authReady } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [password, setPasswordValue] = useState("");

  const { data: status, isPending, isError } = useQuery({
    queryKey: ["admin", "status"],
    queryFn: getAdminStatus,
  });

  const createUserMutation = useMutation({
    mutationFn: (pwd: string) => createUser(pwd),
    onSuccess: (data) => {
      setSuccessMessage(data?.message ?? "Genitore aggiunto.");
      setPasswordValue("");
      queryClient.invalidateQueries({ queryKey: ["admin", "status"] });
    },
    onError: (e) => {
      setError(e instanceof Error ? e.message : "Errore durante il salvataggio");
    },
  });

  const resolvedStatus: Status = successMessage
    ? "success"
    : isPending
      ? "loading"
      : isError
        ? "error"
        : status && !status.canAccess
          ? "denied"
          : "ready";

  useEffect(() => {
    if (authReady && resolvedStatus === "denied") {
      router.replace("/");
    }
  }, [authReady, resolvedStatus, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = password.trim();
    if (!trimmed) {
      setError("Inserisci la parola d'ordine");
      return;
    }
    if (trimmed.length < 6) {
      setError("La parola d'ordine deve avere almeno 6 caratteri");
      return;
    }

    createUserMutation.mutate(trimmed);
  };

  if (resolvedStatus === "loading") {
    return (
      <div id="main-content" className="flex min-h-screen flex-col items-center justify-center p-4">
        <p className="text-muted-foreground">Caricamento…</p>
      </div>
    );
  }

  if (resolvedStatus === "error") {
    return (
      <div id="main-content" className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-muted-foreground">Errore di connessione.</p>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Torna alla home
        </Link>
      </div>
    );
  }

  if (resolvedStatus === "denied") {
    return null;
  }

  if (resolvedStatus === "success") {
    return (
      <div id="main-content" className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h1 className="text-xl font-semibold">Genitore aggiunto</h1>
            <p className="text-sm text-muted-foreground">{successMessage}</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              onClick={() => {
                setSuccessMessage(null);
              }}
              className="min-h-[44px] min-w-[44px] w-full"
            >
              Aggiungi un altro genitore
            </Button>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "min-h-[44px] min-w-[44px] w-full text-center"
              )}
            >
              Vai al login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main id="main-content" className="flex min-h-screen flex-col p-4 sm:p-6 md:p-8 lg:p-10">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-xl font-semibold sm:text-2xl md:text-3xl">
          Admin
        </h1>
        <p className="mt-1 text-muted-foreground">
          {status?.hasUsers
            ? "Aggiungi un nuovo genitore al calendario"
            : "Configura il primo genitore per accedere al calendario"}
        </p>
      </header>

      <Card className="max-w-md">
        <CardHeader>
          <h2 className="text-lg font-medium">Aggiungi genitore</h2>
          <p className="text-sm text-muted-foreground">
            Inserisci la parola d&apos;ordine personale per questo genitore (almeno 6 caratteri)
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Parola d&apos;ordine</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPasswordValue(e.target.value)}
                placeholder="Inserisci la parola d'ordine"
                className="min-h-[44px]"
                required
                minLength={6}
                aria-invalid={!!error}
                aria-describedby={error ? "password-error" : undefined}
              />
            </div>
            {error && (
              <p
                id="password-error"
                role="alert"
                className="text-sm text-destructive"
                aria-live="polite"
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="min-h-[44px] min-w-[44px]"
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? "Salvataggio…" : "Aggiungi genitore"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {status?.hasUsers && (
        <div className="mt-6 flex flex-col gap-6">
          <AdminUserList />
          <BackupControls />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/calendar"
              className={cn(buttonVariants(), "min-h-[44px] min-w-[44px]")}
            >
              Vai al calendario
            </Link>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "min-h-[44px] min-w-[44px]"
              )}
            >
              Torna alla home
            </Link>
          </div>
        </div>
      )}

      {!status?.hasUsers && (
        <Link
          href="/"
          className={cn(
            "mt-6 inline-flex min-h-[44px] min-w-[44px] items-center",
            buttonVariants({ variant: "ghost" })
          )}
        >
          Torna alla home
        </Link>
      )}
    </main>
  );
}

export default function AdminPage() {
  return <AdminContent />;
}
