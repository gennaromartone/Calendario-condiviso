import { desc, eq, and, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { notifiche, utenti } from "@/db/schema";
import type { INotificationRepository } from "./notification-repository";
import type { Notifica, NotificaWithAutore, CreateNotificaData } from "./types";

function mapRowToNotifica(r: {
  id: string;
  utenteId: string;
  tipo: string;
  entityType: string;
  entityId: string | null;
  titolo: string;
  autoreId: string;
  letta: boolean;
  creatoIl: string;
  autoreNome: string | null;
}): Notifica & { autoreNome: string | null } {
  return {
    id: r.id,
    utenteId: r.utenteId,
    tipo: r.tipo as Notifica["tipo"],
    entityType: r.entityType as Notifica["entityType"],
    entityId: r.entityId,
    titolo: r.titolo,
    autoreId: r.autoreId,
    letta: r.letta,
    creatoIl: r.creatoIl,
    autoreNome: r.autoreNome,
  };
}

export class DrizzleNotificationRepository implements INotificationRepository {
  async create(data: CreateNotificaData): Promise<Notifica> {
    const [inserted] = await db
      .insert(notifiche)
      .values({
        utenteId: data.utenteId,
        tipo: data.tipo,
        entityType: data.entityType,
        entityId: data.entityId,
        titolo: data.titolo,
        autoreId: data.autoreId,
      })
      .returning();
    if (!inserted) throw new Error("Failed to create notification");
    return {
      id: inserted.id,
      utenteId: inserted.utenteId,
      tipo: inserted.tipo as Notifica["tipo"],
      entityType: inserted.entityType as Notifica["entityType"],
      entityId: inserted.entityId,
      titolo: inserted.titolo,
      autoreId: inserted.autoreId,
      letta: inserted.letta,
      creatoIl: inserted.creatoIl,
    };
  }

  async createMany(data: CreateNotificaData[]): Promise<void> {
    if (data.length === 0) return;
    await db.insert(notifiche).values(
      data.map((d) => ({
        utenteId: d.utenteId,
        tipo: d.tipo,
        entityType: d.entityType,
        entityId: d.entityId,
        titolo: d.titolo,
        autoreId: d.autoreId,
      }))
    );
  }

  async findByUserId(
    utenteId: string,
    options?: { unreadOnly?: boolean }
  ): Promise<NotificaWithAutore[]> {
    const conditions = [eq(notifiche.utenteId, utenteId)];
    if (options?.unreadOnly) {
      conditions.push(eq(notifiche.letta, false));
    }
    const rows = await db
      .select({
        id: notifiche.id,
        utenteId: notifiche.utenteId,
        tipo: notifiche.tipo,
        entityType: notifiche.entityType,
        entityId: notifiche.entityId,
        titolo: notifiche.titolo,
        autoreId: notifiche.autoreId,
        letta: notifiche.letta,
        creatoIl: notifiche.creatoIl,
        autoreNome: utenti.nome,
      })
      .from(notifiche)
      .leftJoin(utenti, eq(notifiche.autoreId, utenti.id))
      .where(and(...conditions))
      .orderBy(desc(notifiche.creatoIl));
    return rows.map(mapRowToNotifica);
  }

  async countUnread(utenteId: string): Promise<number> {
    const [row] = await db
      .select({ value: count() })
      .from(notifiche)
      .where(and(eq(notifiche.utenteId, utenteId), eq(notifiche.letta, false)));
    return row?.value ?? 0;
  }

  async markAsRead(id: string, utenteId: string): Promise<boolean> {
    const [updated] = await db
      .update(notifiche)
      .set({ letta: true })
      .where(and(eq(notifiche.id, id), eq(notifiche.utenteId, utenteId)))
      .returning({ id: notifiche.id });
    return updated != null;
  }

  async markAllAsRead(utenteId: string): Promise<void> {
    await db
      .update(notifiche)
      .set({ letta: true })
      .where(eq(notifiche.utenteId, utenteId));
  }
}
