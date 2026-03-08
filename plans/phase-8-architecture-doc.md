# Phase 8: ARCHITECTURE.md

> Source: [plans/calendario-condiviso.md](calendario-condiviso.md) | PRD: [calendar-prd.md](../calendar-prd.md)

## Subagent & Skills

- **Subagent**: `generalPurpose` (documentation)
- **Skills**: None

## What to Build

Documento `ARCHITECTURE.md` alla root del progetto che descrive l'architettura del sistema.

## Acceptance Criteria

- [ ] File `ARCHITECTURE.md` creato
- [ ] Descrive tech stack, route structure, auth flow, data model, API, moduli

## Implementation Steps

### 1. Create ARCHITECTURE.md

Write the following sections (adapt after implementation):

#### Tech Stack

- Next.js 15+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui (Radix + Tailwind)
- Vercel Postgres
- Drizzle ORM
- Hosting: Vercel

#### Route Structure

```
/                 → Login (redirect to /calendar if authenticated)
/calendar         → Main calendar (protected)
/admin            → Admin setup (password)
/api/events       → CRUD API (protected)
```

#### Layout Hierarchy

- Root layout: viewport, font, providers
- (auth) group: login page
- (protected) group: calendar, admin (with session check)

#### Auth Flow

- Password stored as hash (bcrypt/argon2) in config table
- Session stored in encrypted cookie (iron-session or similar)
- Middleware checks session for /calendar, /admin
- Login: verify password → set session → redirect

#### Data Model

- `eventi`: id, titolo, descrizione, data_inizio, data_fine, tipo (enum), creato_da, creato_il, modificato_il
- `config` (or similar): password_hash for admin

#### API Surface

- GET /api/events?start=&end=
- POST /api/events (body: event payload)
- PATCH /api/events/[id]
- DELETE /api/events/[id]

All require valid session.

#### Module Boundaries

- **Auth**: lib/auth.ts, middleware, login page
- **Calendar**: app/calendar, monthly/weekly views, event blocks
- **Events**: API routes, form, CRUD logic
- **Admin**: app/admin, password setup

### 2. Include diagrams (optional)

- Mermaid diagram for auth flow
- Mermaid diagram for data flow (login → calendar → API)

## Dependencies

- All phases implemented (to document actual structure)

## Deliverables Checklist

- [ ] `ARCHITECTURE.md` at project root
- [ ] All sections complete and accurate
