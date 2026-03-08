# E2E Testing with Playwright (v2)

## Prerequisites

1. **Database migrations** (ensure schema is up to date):

   ```bash
   pnpm db:migrate
   # or: pnpm db:push
   ```

2. **Seed E2E users** (required for v2 multi-user tests):

   ```bash
   pnpm db:seed-e2e
   ```

   This creates 3 users:
   - `e2e-user1` / `e2e-user1` (Genitore1, colore #2563EB)
   - `e2e-user2` / `e2e-user2` (Genitore2, no colore)
   - `e2e-user3` / `e2e-user3` (no nome, for scegli-nome flow)

## Running Tests

```bash
pnpm test:e2e
```

This will:

- Start the dev server automatically (`pnpm dev`) if not already running
- Run all E2E tests in `e2e/`
- Use Chromium by default

## CI / Regression Runs

Before deploy or on PR, run:

```bash
pnpm test:e2e
```

For CI environments:

1. Run `npx playwright install --with-deps` to install browsers (or `npx playwright install chromium`)
2. Ensure DB is seeded: `pnpm db:seed-e2e`
3. Set `CI=true` for Playwright to use single worker and retries

Example GitHub Actions:

```yaml
- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium
- name: Seed E2E users
  run: pnpm db:seed-e2e
  env:
    TURSO_DATABASE_URL: ${{ secrets.TURSO_DATABASE_URL }}
    TURSO_AUTH_TOKEN: ${{ secrets.TURSO_AUTH_TOKEN }}
- name: Run E2E tests
  run: pnpm test:e2e
  env:
    CI: true
```

## Test Structure (T14–T17)

| File                       | Coverage                                      |
|----------------------------|------------------------------------------------|
| `e2e/login.spec.ts`       | T14: Login, wrong password, scegli-nome flow   |
| `e2e/affidamento-color.spec.ts` | T15: Affidamento color modal, second user |
| `e2e/events.spec.ts`      | T16: CRUD eventi, edit/delete own vs other     |
| `e2e/calendar.spec.ts`   | T17: Multi-user visibility, colors, views      |

## Manual Run with Existing Server

If the dev server is already running on port 3000:

```bash
pnpm test:e2e
```

Playwright will reuse it (`reuseExistingServer: true` when not in CI).
