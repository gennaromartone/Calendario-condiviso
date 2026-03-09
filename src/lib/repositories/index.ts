export type { IEventRepository } from "./event-repository";
export type { IInfoImportantiRepository } from "./info-importanti-repository";
export type {
  INotificationRepository,
  NotificaTipo,
  NotificaEntityType,
} from "./notification-repository";
export type { IUserRepository } from "./user-repository";
export { DrizzleEventRepository } from "./drizzle-event-repository";
export { DrizzleInfoImportantiRepository } from "./drizzle-info-importanti-repository";
export { DrizzleNotificationRepository } from "./drizzle-notification-repository";
export { DrizzleUserRepository } from "./drizzle-user-repository";
export type {
  CreateEventData,
  CreateInfoImportanteData,
  EventWithCreator,
  InfoImportante,
  InfoImportanteValore,
  UpdateEventData,
  UpdateInfoImportanteData,
  UserWithPasswordHash,
  Notifica,
  NotificaWithAutore,
  UserWithProfile,
} from "./types";

import { DrizzleEventRepository } from "./drizzle-event-repository";
import { DrizzleInfoImportantiRepository } from "./drizzle-info-importanti-repository";
import { DrizzleNotificationRepository } from "./drizzle-notification-repository";
import { DrizzleUserRepository } from "./drizzle-user-repository";

export const userRepository = new DrizzleUserRepository();
export const eventRepository = new DrizzleEventRepository();
export const infoImportantiRepository = new DrizzleInfoImportantiRepository();
export const notificationRepository = new DrizzleNotificationRepository();
