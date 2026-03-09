export { LoginUseCase } from "./login-use-case";
export { GetEventsUseCase } from "./get-events-use-case";
export { CreateEventUseCase } from "./create-event-use-case";
export { GetInfoImportantiUseCase } from "./get-info-importanti-use-case";
export { CreateInfoImportanteUseCase } from "./create-info-importante-use-case";
export { UpdateInfoImportanteUseCase } from "./update-info-importante-use-case";
export { DeleteInfoImportanteUseCase } from "./delete-info-importante-use-case";
export { TogglePinInfoImportanteUseCase } from "./toggle-pin-info-importante-use-case";

import { userRepository } from "@/lib/repositories";
import { eventRepository, infoImportantiRepository } from "@/lib/repositories";
import { LoginUseCase } from "./login-use-case";
import { GetEventsUseCase } from "./get-events-use-case";
import { CreateEventUseCase } from "./create-event-use-case";
import { GetInfoImportantiUseCase } from "./get-info-importanti-use-case";
import { CreateInfoImportanteUseCase } from "./create-info-importante-use-case";
import { UpdateInfoImportanteUseCase } from "./update-info-importante-use-case";
import { DeleteInfoImportanteUseCase } from "./delete-info-importante-use-case";
import { TogglePinInfoImportanteUseCase } from "./toggle-pin-info-importante-use-case";

export const loginUseCase = new LoginUseCase(userRepository);
export const getEventsUseCase = new GetEventsUseCase(eventRepository);
export const createEventUseCase = new CreateEventUseCase(eventRepository);
export const getInfoImportantiUseCase = new GetInfoImportantiUseCase(
  infoImportantiRepository
);
export const createInfoImportanteUseCase = new CreateInfoImportanteUseCase(
  infoImportantiRepository
);
export const updateInfoImportanteUseCase = new UpdateInfoImportanteUseCase(
  infoImportantiRepository
);
export const deleteInfoImportanteUseCase = new DeleteInfoImportanteUseCase(
  infoImportantiRepository
);
export const togglePinInfoImportanteUseCase = new TogglePinInfoImportanteUseCase(
  infoImportantiRepository
);
