import type { IInfoImportantiRepository } from "@/lib/repositories";

export class DeleteInfoImportanteUseCase {
  constructor(
    private readonly infoImportantiRepository: IInfoImportantiRepository
  ) {}

  async execute(id: string): Promise<boolean> {
    return this.infoImportantiRepository.delete(id);
  }
}
