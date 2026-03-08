/**
 * T14 — E2E: Login e flusso nome
 * - Wrong password → message "Parola d'ordine non riconosciuta"
 * - Correct password without nome → redirect to scegli-nome
 * - Enter name → save → redirect to calendar
 * - Correct password with nome → direct redirect to calendar
 */
import { test, expect } from "@playwright/test";
import { execSync } from "child_process";
import path from "path";
import { config as loadEnv } from "dotenv";
import { E2E_USERS, loginAs } from "./helpers";

test.describe("T14 — Login e flusso nome", () => {
  test.beforeAll(() => {
    // Reseed so user3 has no nome (other specs may have set it via ensureLoggedIn)
    const projectRoot = path.resolve(__dirname, "..");
    const env = { ...process.env };
    const result = loadEnv({ path: path.join(projectRoot, ".env.local") });
    if (result.parsed) Object.assign(env, result.parsed);
    execSync("pnpm db:seed-e2e", {
      cwd: projectRoot,
      env,
      stdio: "pipe",
    });
  });

  test("wrong password shows error message", async ({ page }) => {
    await page.goto("/");
    const accediBtn = page.getByRole("button", { name: "Accedi" });
    await expect(accediBtn).toBeEnabled({ timeout: 10000 });
    await page.getByLabel(/parola d'ordine/i).fill("wrong-password");
    await accediBtn.click();

    await expect(page.locator("#password-error")).toHaveText(
      /parola d'ordine non riconosciuta/i,
      { timeout: 5000 }
    );
    await expect(page).toHaveURL("/");
  });

  test("correct password without nome redirects to scegli-nome", async ({
    page,
  }) => {
    const { redirectedToScegliNome } = await loginAs(
      page,
      E2E_USERS.user3.password
    );

    expect(redirectedToScegliNome).toBe(true);
    await expect(page).toHaveURL(/\/scegli-nome/);
    await expect(
      page.getByRole("heading", { name: /scegli il tuo nome/i })
    ).toBeVisible();
    await expect(page.getByLabel("Nome")).toBeVisible();
  });

  test("enter name and save redirects to calendar", async ({ page }) => {
    await loginAs(page, E2E_USERS.user3.password);
    await expect(page).toHaveURL(/\/scegli-nome/);

    await page.getByLabel("Nome").fill("TestGenitore");
    await page.getByRole("button", { name: "Continua" }).click();

    await expect(page).toHaveURL(/\/calendar/, { timeout: 5000 });
    await expect(page.getByRole("heading", { name: "Calendario" })).toBeVisible();
  });

  test("correct password with nome redirects directly to calendar", async ({
    page,
  }) => {
    const { redirectedToScegliNome } = await loginAs(
      page,
      E2E_USERS.user1.password
    );

    expect(redirectedToScegliNome).toBe(false);
    await expect(page).toHaveURL(/\/calendar/, { timeout: 5000 });
    await expect(page.getByRole("heading", { name: "Calendario" })).toBeVisible();
    await expect(page.getByRole("button", { name: /nuovo evento/i })).toBeVisible();
  });
});
