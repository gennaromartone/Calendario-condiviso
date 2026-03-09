import type { IEventRepository } from "@/lib/repositories";
import type { CreateEventData, EventWithCreator } from "@/lib/repositories";

export type CreateEventInput = CreateEventData;

export class CreateEventUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(input: CreateEventInput): Promise<EventWithCreator> {
    return this.eventRepository.create(input);
  }
}
