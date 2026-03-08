# Phase 6: Event Types + Admin Setup

> Source: [plans/calendario-condiviso.md](calendario-condiviso.md) | PRD: [calendar-prd.md](../calendar-prd.md)

## Subagent & Skills

- **Subagent**: `generalPurpose` (admin flow, visual design)
- **Skills**: web-design-guidelines, shadcn

## What to Build

Distinzione visiva dei tipi di evento (affidamento, scuola, sport, altro) con colori/icone. Pagina Admin per setup iniziale parola d'ordine (primo accesso o pagina dedicata).

## Acceptance Criteria

- [ ] Tipi evento visivamente distinti (colori/icone)
- [ ] Admin: setup parola d'ordine al primo accesso
- [ ] Rate limiting su login (mitigazione brute-force)
- [ ] UX coerente con contesto famiglia/bambini

## Implementation Steps

### 1. Event type styling

- Map tipo to color: affidamento (blue), scuola (green), sport (orange), altro (gray)
- Use Badge or colored left border on event blocks
- Optional: Lucide icons (Home, School, Dumbbell, MoreHorizontal)

### 2. Admin page: password setup

- `/admin`: form to set password (first time only)
- Check if password already exists in DB
- If not set: show form (new password + confirm)
- Hash with bcrypt/argon2, store in config table
- If already set: show message "Parola d'ordine già configurata" or redirect

### 3. Admin route protection

- `/admin` may be accessible without session for first-time setup
- Or: require session, but allow "setup mode" when no password exists (chicken-egg: use temporary token or allow first visit)

### 4. Rate limiting on login

- Option A: Upstash Rate Limit (Redis) — `@upstash/ratelimit`
- Option B: In-memory store (simple Map with cleanup) — resets on restart
- Limit: e.g. 5 attempts per 15 minutes per IP
- Return 429 or generic "Troppi tentativi, riprova più tardi"

### 5. Family-friendly UX

- Friendly copy: "Calendario Condiviso", "Accedi con la parola d'ordine"
- Touch targets 44×44px minimum
- Calm colors, avoid harsh reds for errors
- Consider `prefers-reduced-motion` for animations

## Dependencies

- Phase 2 (auth, password storage)
- Phase 4a, 5 (event display, form)

## Deliverables Checklist

- [ ] Event type colors/icons in calendar and detail
- [ ] Admin password setup flow
- [ ] Rate limiting on login
- [ ] UX polish for family context
