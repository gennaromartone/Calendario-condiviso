import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { infoImportanti } from "@/db/schema";
import type { IInfoImportantiRepository } from "./info-importanti-repository";
import type {
  InfoImportante,
  InfoImportanteValore,
  CreateInfoImportanteData,
  UpdateInfoImportanteData,
} from "./types";

function mapRowToInfo(r: {
  id: string;
  titolo: string;
  tipo: "scuola" | "medico" | "altro";
  valore: string | null;
  pinned: boolean;
  pinnedAt: string | null;
  creatoDa: string;
  creatoIl: string;
  modificatoIl: string;
}): InfoImportante {
  let valore: InfoImportanteValore | null = null;
  if (r.valore) {
    try {
      const parsed = JSON.parse(r.valore) as unknown;
      valore =
        typeof parsed === "object" && parsed !== null
          ? (parsed as InfoImportanteValore)
          : null;
    } catch {
      valore = null;
    }
  }
  return {
    id: r.id,
    titolo: r.titolo,
    tipo: r.tipo,
    valore,
    pinned: r.pinned,
    pinnedAt: r.pinnedAt,
    creatoDa: r.creatoDa,
    creatoIl: r.creatoIl,
    modificatoIl: r.modificatoIl,
  };
}

export class DrizzleInfoImportantiRepository implements IInfoImportantiRepository {
  async create(data: CreateInfoImportanteData): Promise<InfoImportante> {
    const valoreJson =
      data.valore != null && Object.keys(data.valore).length > 0
        ? JSON.stringify(data.valore)
        : null;
    const [inserted] = await db
      .insert(infoImportanti)
      .values({
        titolo: data.titolo,
        tipo: data.tipo,
        valore: valoreJson,
        pinned: false,
        creatoDa: data.creatoDa,
      })
      .returning();
    if (!inserted) throw new Error("Failed to create info importante");
    const [row] = await db
      .select()
      .from(infoImportanti)
      .where(eq(infoImportanti.id, inserted.id))
      .limit(1);
    if (!row) throw new Error("Created info importante not found");
    return mapRowToInfo(row);
  }

  async findAll(): Promise<InfoImportante[]> {
    const rows = await db
      .select()
      .from(infoImportanti)
      .orderBy(
        desc(infoImportanti.pinned),
        desc(
          sql`CASE WHEN ${infoImportanti.pinned} = 1 THEN ${infoImportanti.pinnedAt} ELSE ${infoImportanti.creatoIl} END`
        ),
        desc(infoImportanti.creatoIl)
      );
    return rows.map(mapRowToInfo);
  }

  async findById(id: string): Promise<InfoImportante | null> {
    const [row] = await db
      .select()
      .from(infoImportanti)
      .where(eq(infoImportanti.id, id))
      .limit(1);
    return row ? mapRowToInfo(row) : null;
  }

  async update(
    id: string,
    data: UpdateInfoImportanteData
  ): Promise<InfoImportante | null> {
    const valoreJson =
      data.valore != null && Object.keys(data.valore).length > 0
        ? JSON.stringify(data.valore)
        : null;
    const [updated] = await db
      .update(infoImportanti)
      .set({
        titolo: data.titolo,
        tipo: data.tipo,
        valore: valoreJson,
        modificatoIl: new Date().toISOString(),
      })
      .where(eq(infoImportanti.id, id))
      .returning();
    if (!updated) return null;
    return mapRowToInfo(updated);
  }

  async delete(id: string): Promise<boolean> {
    const [deleted] = await db
      .delete(infoImportanti)
      .where(eq(infoImportanti.id, id))
      .returning({ id: infoImportanti.id });
    return deleted != null;
  }

  async togglePin(id: string): Promise<InfoImportante | null> {
    const [row] = await db
      .select()
      .from(infoImportanti)
      .where(eq(infoImportanti.id, id))
      .limit(1);
    if (!row) return null;

    const newPinned = !row.pinned;
    const [updated] = await db
      .update(infoImportanti)
      .set({
        pinned: newPinned,
        pinnedAt: newPinned ? new Date().toISOString() : null,
        modificatoIl: new Date().toISOString(),
      })
      .where(eq(infoImportanti.id, id))
      .returning();
    if (!updated) return null;
    return mapRowToInfo(updated);
  }
}
