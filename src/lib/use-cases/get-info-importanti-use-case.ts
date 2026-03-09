import type { IInfoImportantiRepository } from "@/lib/repositories";
import type { InfoImportante } from "@/lib/repositories";

export class GetInfoImportantiUseCase {
  constructor(
    private readonly infoImportantiRepository: IInfoImportantiRepository
  ) {}

  async execute(): Promise<InfoImportante[]> {
    return this.infoImportantiRepository.findAll();
  }
}
