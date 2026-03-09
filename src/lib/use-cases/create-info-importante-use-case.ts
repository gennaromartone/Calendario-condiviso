import type { IInfoImportantiRepository } from "@/lib/repositories";
import type { InfoImportante, CreateInfoImportanteData } from "@/lib/repositories";

export class CreateInfoImportanteUseCase {
  constructor(
    private readonly infoImportantiRepository: IInfoImportantiRepository
  ) {}

  async execute(input: CreateInfoImportanteData): Promise<InfoImportante> {
    return this.infoImportantiRepository.create(input);
  }
}
