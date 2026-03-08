/**
 * T17 — E2E: Visualizzazione calendario e colori
 * - Events from all users visible
 * - Affidamento colors correct per creator
 * - Monthly and weekly views work
 */
import { test, expect } from "@playwright/test";
import { format, addMonths } from "date-fns";
import { E2E_USERS, ensureLoggedIn } from "./helpers";

test.describe("T17 — Visualizzazione calendario e colori", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page, {
      password: E2E_USERS.user1.password,
      nome: E2E_USERS.user1.nome,
    });
  });

  test("events from all users visible", async ({ page }) => {
    const targetDate = addMonths(new Date(), 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;
    const day = 15;
    const dataInizio = format(
      new Date(year, month - 1, day, 9, 0),
      "yyyy-MM-dd"
    );
    const dataFine = format(
      new Date(year, month - 1, day, 10, 0),
      "yyyy-MM-dd"
    );
    const titolo = `E2E Multi-User ${Date.now()}`;

    await page.getByRole("button", { name: /nuovo evento/i }).click();
    await page.getByPlaceholder("Titolo evento").fill(titolo);
    await page.getByLabel("Data inizio").fill(dataInizio);
    await page.getByLabel("Data fine").fill(dataFine);
    await page.getByLabel("Tipo").selectOption("affidamento");
    await page.getByRole("button", { name: "Crea evento" }).click();

    await page.goto(`/calendar?year=${year}&month=${month}`);
    await expect(page.getByText(titolo)).toBeVisible({ timeout: 5000 });

    await page.getByRole("button", { name: "Esci" }).click();
    await ensureLoggedIn(page, {
      password: E2E_USERS.user2.password,
      nome: E2E_USERS.user2.nome,
    });

    await page.goto(`/calendar?year=${year}&month=${month}`);
    await expect(page.getByText(titolo)).toBeVisible({ timeout: 5000 });
  });

  test("affidamento colors correct per creator", async ({ page }) => {
    const targetDate = addMonths(new Date(), 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;
    const day = 16;
    const dataInizio = format(
      new Date(year, month - 1, day, 9, 0),
      "yyyy-MM-dd"
    );
    const dataFine = format(
      new Date(year, month - 1, day, 10, 0),
      "yyyy-MM-dd"
    );
    const titolo = `E2E Affidamento Color ${Date.now()}`;

    await page.getByRole("button", { name: /nuovo evento/i }).click();
    await page.getByPlaceholder("Titolo evento").fill(titolo);
    await page.getByLabel("Data inizio").fill(dataInizio);
    await page.getByLabel("Data fine").fill(dataFine);
    await page.getByLabel("Tipo").selectOption("affidamento");
    await page.getByRole("button", { name: "Crea evento" }).click();

    await page.goto(`/calendar?year=${year}&month=${month}`);
    const eventBtn = page.getByRole("button", { name: new RegExp(titolo) });
    await expect(eventBtn).toBeVisible({ timeout: 5000 });
    const borderColor = await eventBtn.evaluate(
      (el) => window.getComputedStyle(el).borderLeftColor
    );
    expect(borderColor).toMatch(/rgb\(37,\s*99,\s*235\)|#2563eb/i);
  });

  test("monthly view works", async ({ page }) => {
    const monthNames = [
      "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
      "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
    ];
    const now = new Date();
    const currentMonthName = monthNames[now.getMonth()];
    const currentYear = now.getFullYear();

    await expect(
      page.getByRole("heading", { level: 2 }).filter({
        hasText: new RegExp(`${currentMonthName}.*${currentYear}`),
      })
    ).toBeVisible();

    await page.getByRole("button", { name: "Successivo" }).click();
    const nextMonth = addMonths(now, 1);
    const nextMonthName = monthNames[nextMonth.getMonth()];
    const nextYear = nextMonth.getFullYear();

    await expect(
      page.getByRole("heading", { level: 2 }).filter({
        hasText: new RegExp(`${nextMonthName}.*${nextYear}`),
      })
    ).toBeVisible();
  });

  test("weekly view works", async ({ page }) => {
    await page.getByRole("button", { name: "Settimana" }).click();

    await expect(
      page.getByRole("heading", { level: 2 })
    ).toBeVisible();

    await page.getByRole("button", { name: "Settimana successiva" }).click();
    await expect(
      page.getByRole("heading", { level: 2 })
    ).toBeVisible();
  });
});
