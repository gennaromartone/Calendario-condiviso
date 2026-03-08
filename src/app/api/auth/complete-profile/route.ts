import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { utenti } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { AFFIDAMENTO_PALETTE } from "@/lib/affidamento-colors";

export async function POST(request: NextRequest) {
  const sessionResult = await requireSession();
  if (sessionResult instanceof Response) return sessionResult;

  const body = await request.json();
  const nome = typeof body?.nome === "string" ? body.nome.trim() : undefined;
  const affidamentoColore =
    typeof body?.affidamentoColore === "string"
      ? body.affidamentoColore.trim()
      : undefined;

  const hasNome = nome != null && nome.length > 0;
  const hasColore = affidamentoColore != null && affidamentoColore.length > 0;

  if (!hasNome && !hasColore) {
    return NextResponse.json(
      { error: "Inserisci nome o colore Affidamento" },
      { status: 400 }
    );
  }

  if (hasNome && nome!.length > 100) {
    return NextResponse.json(
      { error: "Il nome è troppo lungo" },
      { status: 400 }
    );
  }

  if (hasColore) {
    const validHex = AFFIDAMENTO_PALETTE.some((c) => c.hex === affidamentoColore);
    if (!validHex) {
      return NextResponse.json(
        { error: "Colore non valido" },
        { status: 400 }
      );
    }

    const [existingWithColor] = await db
      .select({ id: utenti.id })
      .from(utenti)
      .where(eq(utenti.affidamentoColore, affidamentoColore!))
      .limit(1);

    if (existingWithColor && existingWithColor.id !== sessionResult.userId) {
      return NextResponse.json(
        { error: "Questo colore è già assegnato a un altro genitore" },
        { status: 400 }
      );
    }
  }

  const updateData: Record<string, unknown> = {
    modificatoIl: new Date().toISOString(),
  };
  if (hasNome) updateData.nome = nome;
  if (hasColore) updateData.affidamentoColore = affidamentoColore;

  const [updated] = await db
    .update(utenti)
    .set(updateData as { nome?: string; affidamentoColore?: string; modificatoIl: string })
    .where(eq(utenti.id, sessionResult.userId!))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
