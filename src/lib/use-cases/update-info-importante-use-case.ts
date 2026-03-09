import type { IInfoImportantiRepository } from "@/lib/repositories";
import type {
  InfoImportante,
  UpdateInfoImportanteData,
} from "@/lib/repositories";

export class UpdateInfoImportanteUseCase {
  constructor(
    private readonly infoImportantiRepository: IInfoImportantiRepository
  ) {}

  async execute(
    id: string,
    input: UpdateInfoImportanteData
  ): Promise<InfoImportante | null> {
    return this.infoImportantiRepository.update(id, input);
  }
}
