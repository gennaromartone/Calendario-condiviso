import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ne, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { utenti } from "@/db/schema";
import { requireSession } from "@/lib/session";

export type AdminUser = {
  id: string;
  nome: string | null;
  creatoIl: string;
};

export async function GET() {
  const [{ value: realUserCount }] = await db
    .select({ value: count() })
    .from(utenti)
    .where(ne(utenti.id, "migrated-legacy"));

  const hasRealUsers = (realUserCount ?? 0) > 0;

  if (hasRealUsers) {
    const sessionResult = await requireSession();
    if (sessionResult instanceof Response) return sessionResult;
  }

  const rows = await db
    .select({
      id: utenti.id,
      nome: utenti.nome,
      creatoIl: utenti.creatoIl,
    })
    .from(utenti)
    .where(ne(utenti.id, "migrated-legacy"))
    .orderBy(utenti.creatoIl);

  const users: AdminUser[] = rows.map((r) => ({
    id: r.id,
    nome: r.nome,
    creatoIl: r.creatoIl,
  }));

  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
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

  const [{ value: realUserCount }] = await db
    .select({ value: count() })
    .from(utenti)
    .where(ne(utenti.id, "migrated-legacy"));

  const hasRealUsers = (realUserCount ?? 0) > 0;

  if (hasRealUsers) {
    const sessionResult = await requireSession();
    if (sessionResult instanceof Response) return sessionResult;
  }

  const passwordHash = await bcrypt.hash(password.trim(), 10);
  const now = new Date().toISOString();

  const [inserted] = await db
    .insert(utenti)
    .values({
      passwordHash,
      creatoIl: now,
      modificatoIl: now,
    })
    .returning();

  return NextResponse.json({
    id: inserted.id,
    message: "Genitore aggiunto. Può accedere con la propria parola d'ordine.",
  });
}
