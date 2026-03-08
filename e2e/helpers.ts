import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

/** E2E users from scripts/seed-e2e.ts */
export const E2E_USERS = {
  /** Has nome and affidamentoColore */
  user1: { password: "e2e-user1", nome: "Genitore1" },
  /** Has nome, no affidamentoColore (will pick on first Affidamento event) */
  user2: { password: "e2e-user2", nome: "Genitore2" },
  /** No nome (redirects to scegli-nome) */
  user3: { password: "e2e-user3" },
} as const;

/**
 * Logs in with the given password. Handles redirect to scegli-nome if needed.
 * Does NOT complete scegli-nome - use loginAndCompleteNome for that.
 */
export async function loginAs(
  page: Page,
  password: string
): Promise<{ redirectedToScegliNome: boolean }> {
  await page.goto("/");
  // Wait for login form to be ready (auth context loaded)
  const accediBtn = page.getByRole("button", { name: "Accedi" });
  await expect(accediBtn).toBeEnabled({ timeout: 10000 });
  await page.getByLabel(/parola d'ordine/i).fill(password);
  await accediBtn.click();

  // Wait for redirect; if we stay on /, check for error message
  try {
    await expect(page).toHaveURL(/\/(calendar|scegli-nome)/, { timeout: 10000 });
  } catch {
    const alertText =
      (await page.locator("#password-error").textContent()) || "";
    throw new Error(
      `Login failed: expected redirect to /calendar or /scegli-nome but stayed on ${page.url()}. ` +
        (alertText ? `Form error: "${alertText.trim()}"` : "No error message visible.")
    );
  }
  const url = page.url();
  const redirectedToScegliNome = url.includes("/scegli-nome");
  return { redirectedToScegliNome };
}

/**
 * Logs in and ensures we end up on calendar.
 * If user has no nome, completes scegli-nome flow with the given name.
 */
export async function ensureLoggedIn(
  page: Page,
  options?: { password?: string; nome?: string }
): Promise<void> {
  const password = options?.password ?? E2E_USERS.user1.password;
  const nome = options?.nome ?? "Genitore1";

  const { redirectedToScegliNome } = await loginAs(page, password);

  if (redirectedToScegliNome) {
    await expect(page).toHaveURL(/\/scegli-nome/);
    await page.getByLabel("Nome").fill(nome);
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page).toHaveURL(/\/calendar/, { timeout: 5000 });
  } else {
    await expect(page).toHaveURL(/\/calendar/, { timeout: 5000 });
  }

  await expect(page.getByRole("heading", { name: "Calendario" })).toBeVisible();
  await expect(page.getByRole("button", { name: /nuovo evento/i })).toBeVisible();
}

/**
 * Logs out by opening the user menu and clicking Esci.
 */
export async function logout(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Menu azioni" }).click();
  await page.getByRole("menuitem", { name: "Esci" }).click();
  await expect(page).toHaveURL("/");
}
