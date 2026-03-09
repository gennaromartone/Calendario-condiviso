import type { UserWithPasswordHash, UserWithProfile } from "./types";

/**
 * Port for user persistence.
 * Enables swapping implementations (e.g. for testing).
 */
export interface IUserRepository {
  findAllWithPasswordHash(): Promise<UserWithPasswordHash[]>;
  findByLoginIdentifier(identifier: string): Promise<UserWithPasswordHash | null>;
  findById(id: string): Promise<UserWithProfile | null>;
  countExcludingLegacy(): Promise<number>;
  create(data: { passwordHash: string; loginIdentifier?: string | null }): Promise<{ id: string }>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
}
