# Phase 7: E2E Tests

> Source: [plans/calendario-condiviso.md](calendario-condiviso.md) | PRD: [calendar-prd.md](../calendar-prd.md)

## Subagent & Skills

- **Subagent**: `generalPurpose` or `shell` (Playwright setup and execution)
- **Skills**: tdd, Playwright MCP

## What to Build

Test E2E con Playwright per i percorsi critici: login (errore e successo), creazione evento, modifica evento, eliminazione evento, visualizzazione calendario.

## Acceptance Criteria

- [ ] E2E: login errato → messaggio errore
- [ ] E2E: login corretto → redirect calendario
- [ ] E2E: creazione evento
- [ ] E2E: modifica evento
- [ ] E2E: eliminazione evento con conferma
- [ ] E2E: eventi visibili nelle date corrette
- [ ] Test di regressione prima di deploy

## Implementation Steps

### 1. Playwright setup

```bash
npm init playwright@latest
```

- Choose TypeScript, create tests folder, install browsers
- `playwright.config.ts`: baseURL to local dev server
- Add `test` script to package.json

### 2. Test fixtures / setup

- Seed test password in config (or use env var for test)
- Optional: reset DB or use test DB for isolation
- `beforeEach`: navigate to baseURL, ensure clean state if needed

### 3. Login tests

- **Login errato**: fill wrong password, click Accedi, assert error message visible
- **Login corretto**: fill correct password, click Accedi, assert redirect to `/calendar` and calendar visible

### 4. Event CRUD tests

- **Creazione**: login, click "Nuovo evento", fill form, submit, assert event appears in calendar
- **Modifica**: click event, click Modifica, change titolo, submit, assert updated titolo in calendar
- **Eliminazione**: click event, click Elimina, confirm in AlertDialog, assert event removed

### 5. Calendar display test

- Create event via API or UI with specific date
- Navigate to that month
- Assert event block visible in correct day cell

### 6. CI integration

- Add `pnpm test:e2e` or `npm run test:e2e` to run Playwright
- GitHub Actions or Vercel: run E2E before deploy (or on PR)
- Use `npx playwright install --with-deps` in CI for browsers

### 7. Test structure

- `e2e/login.spec.ts`: login flows
- `e2e/events.spec.ts`: CRUD flows
- `e2e/calendar.spec.ts`: display and navigation

## Dependencies

- All previous phases (working app)

## Deliverables Checklist

- [ ] Playwright config and deps
- [ ] login.spec.ts (error + success)
- [ ] events.spec.ts (create, edit, delete)
- [ ] calendar.spec.ts (display)
- [ ] CI script or docs for regression runs
