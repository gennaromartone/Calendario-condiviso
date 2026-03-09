export type { IEventRepository } from "./event-repository";
export type { IInfoImportantiRepository } from "./info-importanti-repository";
export type { IUserRepository } from "./user-repository";
export { DrizzleEventRepository } from "./drizzle-event-repository";
export { DrizzleInfoImportantiRepository } from "./drizzle-info-importanti-repository";
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
  UserWithProfile,
} from "./types";

import { DrizzleEventRepository } from "./drizzle-event-repository";
import { DrizzleInfoImportantiRepository } from "./drizzle-info-importanti-repository";
import { DrizzleUserRepository } from "./drizzle-user-repository";

export const userRepository = new DrizzleUserRepository();
export const eventRepository = new DrizzleEventRepository();
export const infoImportantiRepository = new DrizzleInfoImportantiRepository();
