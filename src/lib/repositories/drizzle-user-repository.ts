import { and, count, eq, ne, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { eventi, infoImportanti, notifiche, utenti } from "@/db/schema";
import type { IUserRepository } from "./user-repository";
import type { UserWithPasswordHash, UserWithProfile } from "./types";

export class DrizzleUserRepository implements IUserRepository {
  async findAllIds(): Promise<string[]> {
    const rows = await db
      .select({ id: utenti.id })
      .from(utenti)
      .where(ne(utenti.id, "migrated-legacy"));
    return rows.map((r) => r.id);
  }

  async findAllWithPasswordHash() {
    const rows = await db
      .select({
        id: utenti.id,
        passwordHash: utenti.passwordHash,
        nome: utenti.nome,
        affidamentoColore: utenti.affidamentoColore,
        creatoIl: utenti.creatoIl,
      })
      .from(utenti)
      .where(ne(utenti.id, "migrated-legacy"))
      .orderBy(utenti.creatoIl);
    return rows.map((r) => ({
      id: r.id,
      passwordHash: r.passwordHash,
      nome: r.nome,
      affidamentoColore: r.affidamentoColore,
      creatoIl: r.creatoIl,
    }));
  }

  async findByLoginIdentifier(identifier: string) {
    const [row] = await db
      .select({
        id: utenti.id,
        passwordHash: utenti.passwordHash,
        nome: utenti.nome,
        affidamentoColore: utenti.affidamentoColore,
      })
      .from(utenti)
      .where(
        and(
          eq(utenti.loginIdentifier, identifier),
          ne(utenti.id, "migrated-legacy")
        )
      )
      .limit(1);
    if (!row) return null;
    return {
      id: row.id,
      passwordHash: row.passwordHash,
      nome: row.nome,
      affidamentoColore: row.affidamentoColore,
    };
  }

  async findById(id: string): Promise<UserWithProfile | null> {
    const [row] = await db
      .select({
        id: utenti.id,
        nome: utenti.nome,
        affidamentoColore: utenti.affidamentoColore,
      })
      .from(utenti)
      .where(eq(utenti.id, id))
      .limit(1);
    return row ?? null;
  }

  async countExcludingLegacy(): Promise<number> {
    const [{ value }] = await db
      .select({ value: count() })
      .from(utenti)
      .where(ne(utenti.id, "migrated-legacy"));
    return value ?? 0;
  }

  async create(data: {
    passwordHash: string;
    loginIdentifier?: string | null;
  }): Promise<{ id: string }> {
    const now = new Date().toISOString();
    const [inserted] = await db
      .insert(utenti)
      .values({
        passwordHash: data.passwordHash,
        loginIdentifier: data.loginIdentifier ?? null,
        creatoIl: now,
        modificatoIl: now,
      })
      .returning({ id: utenti.id });
    if (!inserted) throw new Error("Failed to create user");
    return { id: inserted.id };
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await db
      .update(utenti)
      .set({ passwordHash, modificatoIl: new Date().toISOString() })
      .where(eq(utenti.id, id));
  }

  async updateAffidamentoColore(
    id: string,
    affidamentoColore: string | null
  ): Promise<void> {
    await db
      .update(utenti)
      .set({ affidamentoColore, modificatoIl: new Date().toISOString() })
      .where(eq(utenti.id, id));
  }

  async deleteUser(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx
        .delete(notifiche)
        .where(or(eq(notifiche.utenteId, id), eq(notifiche.autoreId, id)));
      await tx.delete(eventi).where(eq(eventi.creatoDa, id));
      await tx.delete(infoImportanti).where(eq(infoImportanti.creatoDa, id));
      await tx.delete(utenti).where(eq(utenti.id, id));
    });
  }
}
