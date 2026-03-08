import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { utenti } from "@/db/schema";
import { eq, ne } from "drizzle-orm";

export type UserWithProfile = {
  id: string;
  nome: string | null;
  affidamentoColore: string | null;
};

export async function findUserByPassword(
  password: string
): Promise<UserWithProfile | null> {
  const users = await db
    .select({
      id: utenti.id,
      passwordHash: utenti.passwordHash,
      nome: utenti.nome,
      affidamentoColore: utenti.affidamentoColore,
    })
    .from(utenti)
    .where(ne(utenti.id, "migrated-legacy"));

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
  const [row] = await db
    .select({
      id: utenti.id,
      nome: utenti.nome,
      affidamentoColore: utenti.affidamentoColore,
    })
    .from(utenti)
    .where(eq(utenti.id, id))
    .limit(1);

  return row ?? null;
}
