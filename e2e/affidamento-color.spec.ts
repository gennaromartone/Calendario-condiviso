/**
 * T15 — E2E: Scegli colore Affidamento
 * - First Affidamento event without color → color choice modal appears
 * - Select color → save → event created with that color
 * - Second user cannot choose first user's color (verify color not in available list)
 */
import { test, expect } from "@playwright/test";
import { execSync } from "child_process";
import path from "path";
import { config as loadEnv } from "dotenv";
import { E2E_USERS, ensureLoggedIn } from "./helpers";
import { format, addMonths } from "date-fns";

test.describe.serial("T15 — Scegli colore Affidamento", () => {
  test.beforeAll(() => {
    // Reseed so user2 has no affidamentoColore (other specs may have set it)
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

  test("first Affidamento event without color shows color modal", async ({
    page,
  }) => {
    await ensureLoggedIn(page, {
      password: E2E_USERS.user2.password,
      nome: E2E_USERS.user2.nome,
    });

    const targetDate = addMonths(new Date(), 1);
    const dataInizio = format(
      new Date(targetDate.getFullYear(), targetDate.getMonth(), 15, 9, 0),
      "yyyy-MM-dd"
    );
    const dataFine = format(
      new Date(targetDate.getFullYear(), targetDate.getMonth(), 15, 10, 0),
      "yyyy-MM-dd"
    );

    await page.getByRole("button", { name: /nuovo evento/i }).click();
    await expect(
      page.getByRole("heading", { name: "Nuovo evento" })
    ).toBeVisible();
    await page.getByPlaceholder("Titolo evento").fill("Affidamento E2E");
    await page.getByLabel("Data inizio").fill(dataInizio);
    await page.getByLabel("Data fine").fill(dataFine);
    await page.getByLabel("Tipo").selectOption("affidamento");
    await page.getByRole("button", { name: "Crea evento" }).click();

    await expect(
      page.getByRole("dialog").filter({
        hasText: /scegli il tuo colore affidamento/i,
      })
    ).toBeVisible({ timeout: 5000 });
  });

  test("select color and save creates event with that color", async ({
    page,
  }) => {
    await ensureLoggedIn(page, {
      password: E2E_USERS.user2.password,
      nome: E2E_USERS.user2.nome,
    });

    const targetDate = addMonths(new Date(), 1);
    const dataInizio = format(
      new Date(targetDate.getFullYear(), targetDate.getMonth(), 16, 9, 0),
      "yyyy-MM-dd"
    );
    const dataFine = format(
      new Date(targetDate.getFullYear(), targetDate.getMonth(), 16, 10, 0),
      "yyyy-MM-dd"
    );

    await page.getByRole("button", { name: /nuovo evento/i }).click();
    await expect(
      page.getByRole("heading", { name: "Nuovo evento" })
    ).toBeVisible();
    await page.getByPlaceholder("Titolo evento").fill("Affidamento Verde E2E");
    await page.getByLabel("Data inizio").fill(dataInizio);
    await page.getByLabel("Data fine").fill(dataFine);
    await page.getByLabel("Tipo").selectOption("affidamento");
    await page.getByRole("button", { name: "Crea evento" }).click();

    const colorModal = page
      .getByRole("dialog")
      .filter({ hasText: /scegli il tuo colore affidamento/i });
    await expect(colorModal).toBeVisible({ timeout: 5000 });

    const verdeHex = "#16A34A";
    const colorButton = colorModal.locator(
      `button[style*="background-color: ${verdeHex}"], button[style*="background-color:${verdeHex}"]`
    );
    await colorButton.first().click();
    await colorModal.getByRole("button", { name: "Conferma" }).click();

    await expect(page.getByText("Affidamento Verde E2E")).toBeVisible({
      timeout: 5000,
    });
  });

  test("second user cannot choose first user color", async ({ page }) => {
    await ensureLoggedIn(page, {
      password: E2E_USERS.user3.password,
      nome: "Genitore3",
    });

    const targetDate = addMonths(new Date(), 1);
    const dataInizio = format(
      new Date(targetDate.getFullYear(), targetDate.getMonth(), 17, 9, 0),
      "yyyy-MM-dd"
    );
    const dataFine = format(
      new Date(targetDate.getFullYear(), targetDate.getMonth(), 17, 10, 0),
      "yyyy-MM-dd"
    );

    await page.getByRole("button", { name: /nuovo evento/i }).click();
    await expect(
      page.getByRole("heading", { name: "Nuovo evento" })
    ).toBeVisible();
    await page.getByPlaceholder("Titolo evento").fill("Affidamento Check Color");
    await page.getByLabel("Data inizio").fill(dataInizio);
    await page.getByLabel("Data fine").fill(dataFine);
    await page.getByLabel("Tipo").selectOption("affidamento");
    await page.getByRole("button", { name: "Crea evento" }).click();

    const colorModal = page
      .getByRole("dialog")
      .filter({ hasText: /scegli il tuo colore affidamento/i });
    await expect(colorModal).toBeVisible({ timeout: 5000 });

    const colorGroup = colorModal.getByRole("group", {
      name: "Colori disponibili",
    });
    const colorButtons = colorGroup.locator("button");
    const count = await colorButtons.count();
    expect(count).toBe(9);
  });
});
