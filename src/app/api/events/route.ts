import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eventi, utenti } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { createEventSchema } from "@/lib/validations/events";
import { and, eq, gte, lte, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const sessionResult = await requireSession();
  if (sessionResult instanceof Response) return sessionResult;

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const whereClause =
    start && end
      ? and(
          lte(eventi.dataInizio, end),
          gte(eventi.dataFine, start)
        )
      : sql`1=1`;

  const rows = await db
    .select({
      id: eventi.id,
      titolo: eventi.titolo,
      descrizione: eventi.descrizione,
      dataInizio: eventi.dataInizio,
      dataFine: eventi.dataFine,
      tipo: eventi.tipo,
      note: eventi.note,
      creatoDa: eventi.creatoDa,
      creatoIl: eventi.creatoIl,
      modificatoIl: eventi.modificatoIl,
      creatoreNome: utenti.nome,
      creatoreAffidamentoColore: utenti.affidamentoColore,
      creatoreId: utenti.id,
    })
    .from(eventi)
    .leftJoin(utenti, eq(eventi.creatoDa, utenti.id))
    .where(whereClause)
    .orderBy(eventi.dataInizio);

  return NextResponse.json(
    rows.map((r) => {
      let note: { general?: string; byDay?: Record<string, string> } | null = null;
      if (r.note) {
        try {
          note = typeof r.note === "string" ? JSON.parse(r.note) : r.note;
        } catch {
          note = null;
        }
      }
      return {
        id: r.id,
        titolo: r.titolo,
        descrizione: r.descrizione,
        dataInizio: r.dataInizio,
        dataFine: r.dataFine,
        tipo: r.tipo,
        note,
        creatoDa: r.creatoDa,
        creatoIl: r.creatoIl,
        modificatoIl: r.modificatoIl,
        creatore:
          r.creatoreId != null
            ? {
                nome: r.creatoreNome ?? null,
                affidamentoColore: r.creatoreAffidamentoColore ?? null,
              }
            : null,
      };
    })
  );
}

export async function POST(request: NextRequest) {
  const sessionResult = await requireSession();
  if (sessionResult instanceof Response) return sessionResult;

  const body = await request.json();
  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const noteJson =
    parsed.data.note != null &&
    typeof parsed.data.note === "object" &&
    Object.keys(parsed.data.note).length > 0
      ? JSON.stringify(parsed.data.note)
      : null;

  const [inserted] = await db
    .insert(eventi)
    .values({
      titolo: parsed.data.titolo,
      descrizione: parsed.data.descrizione ?? null,
      dataInizio: parsed.data.dataInizio,
      dataFine: parsed.data.dataFine,
      tipo: parsed.data.tipo,
      note: noteJson,
      creatoDa: sessionResult.userId!,
    })
    .returning();

  const result = inserted
    ? {
        ...inserted,
        note:
          inserted.note && typeof inserted.note === "string"
            ? (JSON.parse(inserted.note) as { general?: string; byDay?: Record<string, string> })
            : inserted.note,
      }
    : inserted;

  return NextResponse.json(result);
}
