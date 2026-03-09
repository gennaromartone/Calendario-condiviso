import bcrypt from "bcryptjs";
import { userRepository } from "@/lib/repositories";
import type { UserWithProfile } from "@/lib/repositories";

export type { UserWithProfile } from "@/lib/repositories";

/**
 * Finds user by password. When loginIdentifier is provided, uses direct lookup
 * (O(1)) instead of iterating all users. Falls back to iteration for backward compat.
 */
export async function findUserByPassword(
  password: string,
  loginIdentifier?: string | null
): Promise<UserWithProfile | null> {
  const identifier = loginIdentifier?.trim();
  if (identifier) {
    const user = await userRepository.findByLoginIdentifier(identifier);
    if (user?.passwordHash && (await bcrypt.compare(password, user.passwordHash))) {
      return {
        id: user.id,
        nome: user.nome,
        affidamentoColore: user.affidamentoColore,
      };
    }
    return null;
  }

  const users = await userRepository.findAllWithPasswordHash();
  for (const user of users) {
    if (user.passwordHash && (await bcrypt.compare(password, user.passwordHash))) {
      return {
        id: user.id,
        nome: user.nome,
        affidamentoColore: user.affidamentoColore,
      };
    }
  }

  return null;
}

export async function getUserById(id: string): Promise<UserWithProfile | null> {
  return userRepository.findById(id);
}
