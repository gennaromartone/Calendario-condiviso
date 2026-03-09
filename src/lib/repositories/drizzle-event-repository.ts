import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { eventi, utenti } from "@/db/schema";
import type { IEventRepository } from "./event-repository";
import type {
  CreateEventData,
  EventWithCreator,
  UpdateEventData,
} from "./types";

function mapRowToEvent(r: {
  id: string;
  titolo: string;
  descrizione: string | null;
  dataInizio: string;
  dataFine: string;
  tipo: "affidamento" | "scuola" | "sport" | "altro";
  note: string | null;
  luogo: string | null;
  creatoDa: string;
  creatoIl: string;
  modificatoIl: string;
  creatoreNome: string | null;
  creatoreAffidamentoColore: string | null;
  creatoreId: string | null;
}): EventWithCreator {
  let note: { general?: string; byDay?: Record<string, string> } | null = null;
  if (r.note) {
    try {
      note =
        typeof r.note === "string" ? JSON.parse(r.note) : r.note;
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
    luogo: r.luogo,
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
}

export class DrizzleEventRepository implements IEventRepository {
  async findInRange(start?: string, end?: string): Promise<EventWithCreator[]> {
    if (!start || !end) return this.findAll();
    const rows = await db
      .select({
        id: eventi.id,
        titolo: eventi.titolo,
        descrizione: eventi.descrizione,
        dataInizio: eventi.dataInizio,
        dataFine: eventi.dataFine,
        tipo: eventi.tipo,
        note: eventi.note,
        luogo: eventi.luogo,
        creatoDa: eventi.creatoDa,
        creatoIl: eventi.creatoIl,
        modificatoIl: eventi.modificatoIl,
        creatoreNome: utenti.nome,
        creatoreAffidamentoColore: utenti.affidamentoColore,
        creatoreId: utenti.id,
      })
      .from(eventi)
      .leftJoin(utenti, eq(eventi.creatoDa, utenti.id))
      .where(
        and(
          lte(eventi.dataInizio, end),
          gte(eventi.dataFine, start)
        )
      )
      .orderBy(eventi.dataInizio);
    return rows.map(mapRowToEvent);
  }

  async findAll(): Promise<EventWithCreator[]> {
    const rows = await db
      .select({
        id: eventi.id,
        titolo: eventi.titolo,
        descrizione: eventi.descrizione,
        dataInizio: eventi.dataInizio,
        dataFine: eventi.dataFine,
        tipo: eventi.tipo,
        note: eventi.note,
        luogo: eventi.luogo,
        creatoDa: eventi.creatoDa,
        creatoIl: eventi.creatoIl,
        modificatoIl: eventi.modificatoIl,
        creatoreNome: utenti.nome,
        creatoreAffidamentoColore: utenti.affidamentoColore,
        creatoreId: utenti.id,
      })
      .from(eventi)
      .leftJoin(utenti, eq(eventi.creatoDa, utenti.id))
      .orderBy(eventi.dataInizio);
    return rows.map(mapRowToEvent);
  }

  async findById(id: string): Promise<{ creatoDa: string } | null> {
    const [row] = await db
      .select({ creatoDa: eventi.creatoDa })
      .from(eventi)
      .where(eq(eventi.id, id))
      .limit(1);
    return row ?? null;
  }

  async create(data: CreateEventData): Promise<EventWithCreator> {
    const [inserted] = await db
      .insert(eventi)
      .values({
        titolo: data.titolo,
        descrizione: data.descrizione ?? null,
        dataInizio: data.dataInizio,
        dataFine: data.dataFine,
        tipo: data.tipo,
        note: data.note ?? null,
        luogo: data.luogo ?? null,
        creatoDa: data.creatoDa,
      })
      .returning();
    if (!inserted) throw new Error("Failed to create event");
    const [row] = await db
      .select({
        id: eventi.id,
        titolo: eventi.titolo,
        descrizione: eventi.descrizione,
        dataInizio: eventi.dataInizio,
        dataFine: eventi.dataFine,
        tipo: eventi.tipo,
        note: eventi.note,
        luogo: eventi.luogo,
        creatoDa: eventi.creatoDa,
        creatoIl: eventi.creatoIl,
        modificatoIl: eventi.modificatoIl,
        creatoreNome: utenti.nome,
        creatoreAffidamentoColore: utenti.affidamentoColore,
        creatoreId: utenti.id,
      })
      .from(eventi)
      .leftJoin(utenti, eq(eventi.creatoDa, utenti.id))
      .where(eq(eventi.id, inserted.id))
      .limit(1);
    if (!row) throw new Error("Created event not found");
    return mapRowToEvent(row);
  }

  async update(id: string, data: UpdateEventData): Promise<EventWithCreator | null> {
    const updatePayload: Record<string, unknown> = {
      ...data,
      modificatoIl: new Date().toISOString(),
    };
    if ("note" in updatePayload && updatePayload.note !== undefined) {
      updatePayload.note =
        updatePayload.note !== null && typeof updatePayload.note === "object"
          ? JSON.stringify(updatePayload.note)
          : updatePayload.note;
    }
    const [updated] = await db
      .update(eventi)
      .set(updatePayload as Record<string, string | null>)
      .where(eq(eventi.id, id))
      .returning();
    if (!updated) return null;
    const [row] = await db
      .select({
        id: eventi.id,
        titolo: eventi.titolo,
        descrizione: eventi.descrizione,
        dataInizio: eventi.dataInizio,
        dataFine: eventi.dataFine,
        tipo: eventi.tipo,
        note: eventi.note,
        luogo: eventi.luogo,
        creatoDa: eventi.creatoDa,
        creatoIl: eventi.creatoIl,
        modificatoIl: eventi.modificatoIl,
        creatoreNome: utenti.nome,
        creatoreAffidamentoColore: utenti.affidamentoColore,
        creatoreId: utenti.id,
      })
      .from(eventi)
      .leftJoin(utenti, eq(eventi.creatoDa, utenti.id))
      .where(eq(eventi.id, id))
      .limit(1);
    return row ? mapRowToEvent(row) : null;
  }

  async delete(id: string): Promise<void> {
    await db.delete(eventi).where(eq(eventi.id, id));
  }
}
