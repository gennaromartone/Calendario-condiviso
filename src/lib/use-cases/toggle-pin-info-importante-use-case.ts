import type { IInfoImportantiRepository } from "@/lib/repositories";
import type { InfoImportante } from "@/lib/repositories";

export class TogglePinInfoImportanteUseCase {
  constructor(
    private readonly infoImportantiRepository: IInfoImportantiRepository
  ) {}

  async execute(id: string): Promise<InfoImportante | null> {
    return this.infoImportantiRepository.togglePin(id);
  }
}
