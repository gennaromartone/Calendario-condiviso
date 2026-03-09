import type {
  InfoImportante,
  CreateInfoImportanteData,
  UpdateInfoImportanteData,
} from "./types";

/**
 * Port for info importanti persistence.
 */
export interface IInfoImportantiRepository {
  findAll(): Promise<InfoImportante[]>;
  create(data: CreateInfoImportanteData): Promise<InfoImportante>;
  findById(id: string): Promise<InfoImportante | null>;
  update(id: string, data: UpdateInfoImportanteData): Promise<InfoImportante | null>;
  delete(id: string): Promise<boolean>;
  togglePin(id: string): Promise<InfoImportante | null>;
}
