import type { IEventRepository } from "@/lib/repositories";
import type { EventWithCreator } from "@/lib/repositories";

export type GetEventsInput = {
  start?: string;
  end?: string;
};

export class GetEventsUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(input: GetEventsInput): Promise<EventWithCreator[]> {
    return this.eventRepository.findInRange(input.start, input.end);
  }
}
