import type { IUserRepository } from "@/lib/repositories";
import type { UserWithProfile } from "@/lib/repositories";
import bcrypt from "bcryptjs";

export type LoginInput = {
  password: string;
  identifier?: string | null;
};

export type LoginResult =
  | { success: true; user: UserWithProfile }
  | { success: false };

export class LoginUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    const identifier = input.identifier?.trim();
    if (identifier) {
      const user = await this.userRepository.findByLoginIdentifier(identifier);
      if (
        user?.passwordHash &&
        (await bcrypt.compare(input.password, user.passwordHash))
      ) {
        return {
          success: true,
          user: {
            id: user.id,
            nome: user.nome,
            affidamentoColore: user.affidamentoColore,
          },
        };
      }
      return { success: false };
    }

    const users = await this.userRepository.findAllWithPasswordHash();
    for (const user of users) {
      if (
        user.passwordHash &&
        (await bcrypt.compare(input.password, user.passwordHash))
      ) {
        return {
          success: true,
          user: {
            id: user.id,
            nome: user.nome,
            affidamentoColore: user.affidamentoColore,
          },
        };
      }
    }
    return { success: false };
  }
}
