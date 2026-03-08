/**
 * Playwright global setup: seeds E2E users before any test runs.
 * Ensures the database has e2e-user1, e2e-user2, e2e-user3 for login tests.
 */
import { execSync } from "child_process";
import path from "path";

export default async function globalSetup() {
  const projectRoot = path.resolve(__dirname, "..");
  const envFile = path.join(projectRoot, ".env.local");

  // Load .env.local for TURSO_DATABASE_URL and TURSO_AUTH_TOKEN
  const env = { ...process.env };
  try {
    const dotenv = await import("dotenv");
    const result = dotenv.config({ path: envFile });
    if (result.parsed) {
      Object.assign(env, result.parsed);
    }
  } catch {
    // dotenv not critical if vars already in process.env
  }

  console.log("Seeding E2E users...");
  execSync("pnpm db:seed-e2e", {
    cwd: projectRoot,
    env,
    stdio: "inherit",
  });
  console.log("E2E seed complete.");
}
