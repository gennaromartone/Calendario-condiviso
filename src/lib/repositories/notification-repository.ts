import type { Notifica, NotificaWithAutore } from "./types";

export type NotificaTipo =
  | "evento_aggiunto"
  | "evento_modificato"
  | "evento_eliminato"
  | "info_aggiunta"
  | "info_modificata"
  | "info_eliminata";

export type NotificaEntityType = "evento" | "info_importante";

export type CreateNotificaData = {
  utenteId: string;
  tipo: NotificaTipo;
  entityType: NotificaEntityType;
  entityId: string | null;
  titolo: string;
  autoreId: string;
};

export interface INotificationRepository {
  create(data: CreateNotificaData): Promise<Notifica>;
  createMany(data: CreateNotificaData[]): Promise<void>;
  findByUserId(
    utenteId: string,
    options?: { unreadOnly?: boolean }
  ): Promise<NotificaWithAutore[]>;
  countUnread(utenteId: string): Promise<number>;
  markAsRead(id: string, utenteId: string): Promise<boolean>;
  markAllAsRead(utenteId: string): Promise<void>;
}
