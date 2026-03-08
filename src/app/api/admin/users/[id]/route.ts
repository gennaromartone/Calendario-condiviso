import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { utenti } from "@/db/schema";
import { requireSession } from "@/lib/session";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionResult = await requireSession();
  if (sessionResult instanceof Response) return sessionResult;

  const { id } = await params;

  const body = await _request.json();
  const password = typeof body?.password === "string" ? body.password : "";

  if (!password.trim()) {
    return NextResponse.json(
      { error: "Inserisci la parola d'ordine" },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "La parola d'ordine deve avere almeno 6 caratteri" },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select({ id: utenti.id })
    .from(utenti)
    .where(eq(utenti.id, id));

  if (!existing) {
    return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  }

  if (id === "migrated-legacy") {
    return NextResponse.json(
      { error: "Non è possibile modificare l'utente legacy" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password.trim(), 10);
  const now = new Date().toISOString();

  await db
    .update(utenti)
    .set({ passwordHash, modificatoIl: now })
    .where(eq(utenti.id, id));

  return NextResponse.json({
    message: "Parola d'ordine aggiornata con successo",
  });
}
