import { defineConfig, devices } from "@playwright/test";

/**
 * E2E tests for Calendario Condiviso v2.
 * Run dev server first: pnpm dev
 * Or use webServer to auto-start.
 *
 * Seed E2E users: pnpm db:seed-e2e
 * Creates: e2e-user1, e2e-user2, e2e-user3 (passwords = usernames)
 */
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Avoid login rate limit when many tests log in
  reporter: "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
