import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireSession } from "@/lib/session";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getClientIp, shouldBypassRateLimit } from "@/lib/request-utils";
import { userRepository } from "@/lib/repositories";
import { AFFIDAMENTO_PALETTE } from "@/lib/affidamento-colors";
import { db } from "@/lib/db";
import { utenti } from "@/db/schema";
import { and, eq, ne } from "drizzle-orm";

const VALID_HEX_SET = new Set(AFFIDAMENTO_PALETTE.map((c) => c.hex));

async function isColorUsedByOtherUser(hex: string, excludeUserId: string) {
  const [row] = await db
    .select({ id: utenti.id })
    .from(utenti)
    .where(
      and(
        eq(utenti.affidamentoColore, hex),
        ne(utenti.id, excludeUserId),
        ne(utenti.id, "migrated-legacy")
      )
    )
    .limit(1);
  return row != null;
}

function isSuperAdmin(nome: string | null): boolean {
  return nome?.trim() === "Gennaro";
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  if (!shouldBypassRateLimit(ip)) {
    const { allowed, retryAfter } = checkRateLimit(ip, "admin-users");
    if (!allowed) return rateLimitResponse(retryAfter);
  }
  const sessionResult = await requireSession();
  if (sessionResult instanceof Response) return sessionResult;

  const currentUser = await userRepository.findById(sessionResult.userId!);
  if (!currentUser || !isSuperAdmin(currentUser.nome)) {
    return NextResponse.json(
      { error: "Solo il super admin può modificare gli utenti" },
      { status: 403 }
    );
  }

  const { id } = await params;

  const body = await request.json();
  const password = typeof body?.password === "string" ? body.password : "";
  const hasAffidamentoColore = "affidamentoColore" in (body || {});
  const affidamentoColore = hasAffidamentoColore
    ? body.affidamentoColore == null || body.affidamentoColore === ""
      ? null
      : typeof body.affidamentoColore === "string"
        ? body.affidamentoColore.trim()
        : null
    : undefined;

  const hasPassword = password.trim().length > 0;
  if (!hasPassword && !hasAffidamentoColore) {
    return NextResponse.json(
      { error: "Fornisci parola d'ordine o colore affidamento da aggiornare" },
      { status: 400 }
    );
  }

  const existing = await userRepository.findById(id);

  if (!existing) {
    return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  }

  if (id === "migrated-legacy") {
    return NextResponse.json(
      { error: "Non è possibile modificare l'utente legacy" },
      { status: 400 }
    );
  }

  const trimmedPassword = password.trim();
  if (trimmedPassword) {
    if (trimmedPassword.length < 6) {
      return NextResponse.json(
        { error: "La parola d'ordine deve avere almeno 6 caratteri" },
        { status: 400 }
      );
    }
    const passwordHash = await bcrypt.hash(trimmedPassword, 10);
    await userRepository.updatePassword(id, passwordHash);
  }

  if (hasAffidamentoColore) {
    if (affidamentoColore === null || affidamentoColore === "") {
      await userRepository.updateAffidamentoColore(id, null);
    } else if (!VALID_HEX_SET.has(affidamentoColore)) {
      return NextResponse.json(
        { error: "Colore non valido. Scegli dalla palette disponibile." },
        { status: 400 }
      );
    } else {
      const usedByOther = await isColorUsedByOtherUser(affidamentoColore, id);
      if (usedByOther) {
        return NextResponse.json(
          {
            error:
              "Questo colore è già assegnato a un altro genitore. Scegline un altro.",
          },
          { status: 400 }
        );
      }
      await userRepository.updateAffidamentoColore(id, affidamentoColore);
    }
  }

  return NextResponse.json({
    message: "Aggiornamento completato con successo",
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(_request);
  if (!shouldBypassRateLimit(ip)) {
    const { allowed, retryAfter } = checkRateLimit(ip, "admin-users");
    if (!allowed) return rateLimitResponse(retryAfter);
  }
  const sessionResult = await requireSession();
  if (sessionResult instanceof Response) return sessionResult;

  const { id } = await params;

  const currentUser = await userRepository.findById(sessionResult.userId!);
  if (!currentUser || !isSuperAdmin(currentUser.nome)) {
    return NextResponse.json(
      { error: "Solo il super admin può eliminare utenti" },
      { status: 403 }
    );
  }

  if (id === sessionResult.userId) {
    return NextResponse.json(
      { error: "Non puoi eliminare il tuo account" },
      { status: 400 }
    );
  }

  if (id === "migrated-legacy") {
    return NextResponse.json(
      { error: "Non è possibile eliminare l'utente legacy" },
      { status: 400 }
    );
  }

  const existing = await userRepository.findById(id);
  if (!existing) {
    return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  }

  await userRepository.deleteUser(id);

  return NextResponse.json({
    message: "Utente eliminato con successo",
  });
}
