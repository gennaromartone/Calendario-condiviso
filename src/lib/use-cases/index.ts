export { LoginUseCase } from "./login-use-case";
export { GetEventsUseCase } from "./get-events-use-case";
export { CreateEventUseCase } from "./create-event-use-case";

import { userRepository } from "@/lib/repositories";
import { eventRepository } from "@/lib/repositories";
import { LoginUseCase } from "./login-use-case";
import { GetEventsUseCase } from "./get-events-use-case";
import { CreateEventUseCase } from "./create-event-use-case";

export const loginUseCase = new LoginUseCase(userRepository);
export const getEventsUseCase = new GetEventsUseCase(eventRepository);
export const createEventUseCase = new CreateEventUseCase(eventRepository);
