/**
 * Seed script for E2E tests (v2 multi-user).
 * Creates 3 users with known passwords for Playwright tests.
 *
 * Usage: npx tsx scripts/seed-e2e.ts
 *
 * Run after: pnpm db:migrate (or db:push)
 * Requires: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env.local (or env)
 *
 * Users created:
 * - e2e-user1: password "e2e-user1", nome "Genitore1", affidamentoColore #2563EB
 * - e2e-user2: password "e2e-user2", nome "Genitore2", no affidamentoColore
 * - e2e-user3: password "e2e-user3", no nome (for scegli-nome flow)
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/libsql";
import { utenti, eventi } from "../db/schema";
import { eq, inArray } from "drizzle-orm";

const E2E_USER_IDS = ["e2e-user1", "e2e-user2", "e2e-user3"] as const;

async function seed() {
  const db = drizzle({
    connection: {
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    },
  });

  const now = new Date().toISOString();

  // Remove existing E2E users and their events (idempotent)
  await db.delete(eventi).where(inArray(eventi.creatoDa, E2E_USER_IDS));
  for (const id of E2E_USER_IDS) {
    await db.delete(utenti).where(eq(utenti.id, id));
  }

  const hash1 = await bcrypt.hash("e2e-user1", 10);
  const hash2 = await bcrypt.hash("e2e-user2", 10);
  const hash3 = await bcrypt.hash("e2e-user3", 10);

  await db.insert(utenti).values([
    {
      id: "e2e-user1",
      passwordHash: hash1,
      nome: "Genitore1",
      affidamentoColore: "#2563EB",
      creatoIl: now,
      modificatoIl: now,
    },
    {
      id: "e2e-user2",
      passwordHash: hash2,
      nome: "Genitore2",
      affidamentoColore: null,
      creatoIl: now,
      modificatoIl: now,
    },
    {
      id: "e2e-user3",
      passwordHash: hash3,
      nome: null,
      affidamentoColore: null,
      creatoIl: now,
      modificatoIl: now,
    },
  ]);

  console.log("E2E users created:");
  console.log("  - e2e-user1 / e2e-user1 (Genitore1, colore #2563EB)");
  console.log("  - e2e-user2 / e2e-user2 (Genitore2, no colore)");
  console.log("  - e2e-user3 / e2e-user3 (no nome, for scegli-nome flow)");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
