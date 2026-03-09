import type {
  CreateEventData,
  EventWithCreator,
  UpdateEventData,
} from "./types";

/**
 * Port for event persistence.
 */
export interface IEventRepository {
  findInRange(start?: string, end?: string): Promise<EventWithCreator[]>;
  findAll(): Promise<EventWithCreator[]>;
  findById(id: string): Promise<{ creatoDa: string } | null>;
  create(data: CreateEventData): Promise<EventWithCreator>;
  update(id: string, data: UpdateEventData): Promise<EventWithCreator | null>;
  delete(id: string): Promise<void>;
}
