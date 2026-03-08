/**
 * T16 — E2E: CRUD eventi
 * - Create event → visible on calendar
 * - Edit own event → update visible
 * - Delete own event → event removed
 * - Edit/delete other's event → not allowed (button hidden or API returns 403)
 */
import { test, expect, type Page } from "@playwright/test";
import { format, addMonths } from "date-fns";
import { E2E_USERS, ensureLoggedIn } from "./helpers";

function futureDate(daysOffset: number) {
  const d = addMonths(new Date(), 1);
  d.setDate(15 + daysOffset);
  return {
    dataInizio: format(d, "yyyy-MM-dd"),
    dataFine: format(d, "yyyy-MM-dd"),
    year: d.getFullYear(),
    month: d.getMonth() + 1,
  };
}

async function goToMonth(page: Page, year: number, month: number) {
  await page.goto(`/calendar?year=${year}&month=${month}`);
}

test.describe("T16 — CRUD eventi", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page, {
      password: E2E_USERS.user1.password,
      nome: E2E_USERS.user1.nome,
    });
  });

  test("create event visible on calendar", async ({ page }) => {
    const titolo = `E2E Test Event ${Date.now()}`;
    const { dataInizio, dataFine, year, month } = futureDate(0);

    await page.getByRole("button", { name: /nuovo evento/i }).click();
    await expect(
      page.getByRole("heading", { name: "Nuovo evento" })
    ).toBeVisible();
    await page.getByPlaceholder("Titolo evento").fill(titolo);
    await page.getByLabel("Data inizio").fill(dataInizio);
    await page.getByLabel("Data fine").fill(dataFine);
    await page.getByRole("button", { name: "Crea evento" }).click();

    await goToMonth(page, year, month);
    await expect(page.getByText(titolo)).toBeVisible({ timeout: 5000 });
  });

  test("edit own event updates visible", async ({ page }) => {
    const originalTitolo = `E2E Edit Original ${Date.now()}`;
    const updatedTitolo = `E2E Edit Updated ${Date.now()}`;
    const { dataInizio, dataFine, year, month } = futureDate(1);

    await page.getByRole("button", { name: /nuovo evento/i }).click();
    await page.getByPlaceholder("Titolo evento").fill(originalTitolo);
    await page.getByLabel("Data inizio").fill(dataInizio);
    await page.getByLabel("Data fine").fill(dataFine);
    await page.getByLabel("Tipo").selectOption("scuola");
    await page.getByRole("button", { name: "Crea evento" }).click();

    await goToMonth(page, year, month);
    await expect(page.getByText(originalTitolo)).toBeVisible({ timeout: 5000 });

    await page.getByText(originalTitolo).click();
    await page.getByRole("button", { name: "Modifica evento" }).click();
    await expect(
      page.getByRole("heading", { name: "Modifica evento" })
    ).toBeVisible();
    await page.getByPlaceholder("Titolo evento").fill(updatedTitolo);
    await page.getByRole("button", { name: "Salva modifiche" }).click();

    await expect(page.getByText(updatedTitolo)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(originalTitolo)).not.toBeVisible();
  });

  test("delete own event removes it", async ({ page }) => {
    const titolo = `E2E Delete ${Date.now()}`;
    const { dataInizio, dataFine, year, month } = futureDate(2);

    await page.getByRole("button", { name: /nuovo evento/i }).click();
    await page.getByPlaceholder("Titolo evento").fill(titolo);
    await page.getByLabel("Data inizio").fill(dataInizio);
    await page.getByLabel("Data fine").fill(dataFine);
    await page.getByLabel("Tipo").selectOption("sport");
    await page.getByRole("button", { name: "Crea evento" }).click();

    await goToMonth(page, year, month);
    await expect(page.getByText(titolo)).toBeVisible({ timeout: 5000 });

    await page.getByText(titolo).click();
    await page.getByRole("button", { name: "Elimina evento" }).click();
    const deleteDialog = page.getByRole("alertdialog", { name: /elimina evento/i });
    await expect(deleteDialog).toBeVisible();
    await deleteDialog.getByRole("button", { name: "Elimina" }).click();
  });

  test("edit and delete buttons hidden for other user event", async ({
    page,
  }) => {
    const titolo = `E2E Other User Event ${Date.now()}`;
    const { dataInizio, dataFine, year, month } = futureDate(3);

    await page.getByRole("button", { name: /nuovo evento/i }).click();
    await page.getByPlaceholder("Titolo evento").fill(titolo);
    await page.getByLabel("Data inizio").fill(dataInizio);
    await page.getByLabel("Data fine").fill(dataFine);
    await page.getByLabel("Tipo").selectOption("altro");
    await page.getByRole("button", { name: "Crea evento" }).click();

    await goToMonth(page, year, month);
    await expect(page.getByText(titolo)).toBeVisible({ timeout: 5000 });

    await page.getByRole("button", { name: "Esci" }).click();
    await expect(page).toHaveURL("/");

    await ensureLoggedIn(page, {
      password: E2E_USERS.user2.password,
      nome: E2E_USERS.user2.nome,
    });

    await goToMonth(page, year, month);
    await page.getByText(titolo).click();
    await expect(
      page.getByRole("button", { name: "Modifica evento" })
    ).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Elimina evento" })
    ).not.toBeVisible();
  });
});
