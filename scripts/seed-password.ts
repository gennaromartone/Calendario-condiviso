/**
 * One-time script to create the first user (v2).
 * Usage: npx tsx scripts/seed-password.ts "your-password"
 *
 * Run after: pnpm db:migrate (or db:push)
 * Requires: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env.local (or env)
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/libsql";
import { utenti } from "../db/schema";

const password = process.argv[2];
if (!password || password.length < 6) {
  console.error("Usage: npx tsx scripts/seed-password.ts \"your-password\"");
  console.error("Password must be at least 6 characters.");
  process.exit(1);
}

async function seed() {
  const db = drizzle({
    connection: {
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    },
  });

  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();

  await db.insert(utenti).values({
    passwordHash,
    creatoIl: now,
    modificatoIl: now,
  });

  console.log("User created successfully. You can now log in with this password.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
