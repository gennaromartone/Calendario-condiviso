import { drizzle } from "drizzle-orm/libsql";

// Placeholder for build when env is not loaded; runtime requires TURSO_DATABASE_URL
const url = process.env.TURSO_DATABASE_URL || "libsql://localhost";
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = drizzle({
  connection: { url, authToken: authToken || undefined },
});
