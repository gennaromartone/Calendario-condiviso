export type { IEventRepository } from "./event-repository";
export type { IUserRepository } from "./user-repository";
export { DrizzleEventRepository } from "./drizzle-event-repository";
export { DrizzleUserRepository } from "./drizzle-user-repository";
export type {
  CreateEventData,
  EventWithCreator,
  UpdateEventData,
  UserWithPasswordHash,
  UserWithProfile,
} from "./types";

import { DrizzleEventRepository } from "./drizzle-event-repository";
import { DrizzleUserRepository } from "./drizzle-user-repository";

export const userRepository = new DrizzleUserRepository();
export const eventRepository = new DrizzleEventRepository();
