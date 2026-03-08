# Phase 2: Auth Module + Login Flow

> Source: [plans/calendario-condiviso.md](calendario-condiviso.md) | PRD: [calendar-prd.md](../calendar-prd.md)

## Subagent & Skills

- **Subagent**: `generalPurpose` (auth logic, session handling)
- **Skills**: better-auth-best-practices, web-design-guidelines

## What to Build

Modulo di autenticazione basato su parola d'ordine. L'admin imposta la password (hash sicuro), i genitori accedono inserendola. Sessione/cookie mantengono l'accesso. Pagina login con form, redirect al calendario se autenticati.

## Acceptance Criteria

- [ ] Pagina login: campo password, pulsante "Accedi"
- [ ] Parola d'ordine hashata (bcrypt/argon2)
- [ ] Sessione/cookie dopo verifica corretta
- [ ] Messaggio errore se password errata
- [ ] Redirect a `/calendar` se autenticato
- [ ] Route protette: accesso a `/calendar` richiede sessione valida

## Implementation Steps

### 1. Add auth dependencies

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
# Or: npm install argon2 (native, no types needed)
```

### 2. Database schema for password

- Add table `config` or `settings` with single row: `password_hash`
- Migration: create table if not exists
- Admin setup (Phase 6) will populate; for Phase 2, seed manually or via migration

### 3. Session management

- Use `iron-session` or Next.js cookies with encrypted payload
- Session payload: `{ authenticated: true }` or similar
- Cookie: `calendario_session`, httpOnly, secure (prod), sameSite: lax
- Helper: `lib/auth.ts` with `getSession()`, `setSession()`, `destroySession()`, `verifyPassword()`

### 4. Login page (`app/page.tsx`)

- Form: password input (type="password"), "Accedi" button
- Server Action: verify password against hash, set session on success
- On success: `redirect('/calendar')`
- On failure: return error message, display inline (aria-live for accessibility)
- Label on password field, autocomplete="current-password"
- Error message with `aria-invalid` on input when invalid

### 5. Protected routes

- Middleware (`middleware.ts`): check session for `/calendar` and `/admin`
- If no session: redirect to `/`
- Allow `/` and `/api/auth/*` (if any) without session

### 6. Redirect if already authenticated

- On `/`, if session valid: redirect to `/calendar`

## Dependencies

- Phase 1 (project setup, Drizzle, routes)

## Deliverables Checklist

- [ ] `lib/auth.ts` (session + password verify)
- [ ] `app/page.tsx` (login form)
- [ ] `middleware.ts` (route protection)
- [ ] DB migration for password storage (or config table)
