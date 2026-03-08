# Phase 3: Database Schema + Events API

> Source: [plans/calendario-condiviso.md](calendario-condiviso.md) | PRD: [calendar-prd.md](../calendar-prd.md)

## Subagent & Skills

- **Subagent**: `generalPurpose` (schema design, API routes)
- **Skills**: vercel-react-best-practices

## What to Build

Schema Drizzle per la tabella `eventi`. API routes Next.js per CRUD completo (create, read, update, delete). Tutte le API richiedono sessione valida.

## Acceptance Criteria

- [ ] Schema eventi: id, titolo, descrizione, data_inizio, data_fine, tipo (enum), creato_da, creato_il, modificato_il
- [ ] API: GET /api/events (lista), POST /api/events (crea), PATCH /api/events/[id] (modifica), DELETE /api/events/[id] (elimina)
- [ ] API protette da sessione
- [ ] Validazione input

## Implementation Steps

### 1. Drizzle schema for `eventi`

```typescript
// db/schema.ts
export const eventi = pgTable('eventi', {
  id: uuid('id').defaultRandom().primaryKey(),
  titolo: varchar('titolo', { length: 255 }).notNull(),
  descrizione: text('descrizione'),
  dataInizio: timestamp('data_inizio').notNull(),
  dataFine: timestamp('data_fine').notNull(),
  tipo: varchar('tipo', { length: 50 }).notNull(), // enum: affidamento | scuola | sport | altro
  creatoDa: varchar('creato_da', { length: 255 }),
  creatoIl: timestamp('creato_il').defaultNow().notNull(),
  modificatoIl: timestamp('modificato_il').defaultNow().notNull(),
});
```

- Use `pgEnum` for `tipo` if preferred
- Run `drizzle-kit generate` and `drizzle-kit migrate`

### 2. Validation schema (Zod)

```typescript
// lib/validations/events.ts
export const createEventSchema = z.object({
  titolo: z.string().min(1).max(255),
  descrizione: z.string().optional(),
  dataInizio: z.string().datetime(),
  dataFine: z.string().datetime(),
  tipo: z.enum(['affidamento', 'scuola', 'sport', 'altro']),
});
```

### 3. API: GET /api/events

- Query params: `?start=YYYY-MM-DD&end=YYYY-MM-DD` (optional, for date range)
- Check session; 401 if not authenticated
- Return events in range, ordered by data_inizio

### 4. API: POST /api/events

- Body: JSON with titolo, descrizione, dataInizio, dataFine, tipo
- Validate with Zod
- Check session; 401 if not authenticated
- Insert into DB, return created event

### 5. API: PATCH /api/events/[id]

- Body: partial update (titolo, descrizione, dataInizio, dataFine, tipo)
- Validate with Zod (partial)
- Check session; 401 if not authenticated
- Update `modificato_il` automatically
- Return updated event

### 6. API: DELETE /api/events/[id]

- Check session; 401 if not authenticated
- Delete by id
- Return 204 or 200

### 7. Shared auth helper for API routes

- `requireSession()`: returns session or throws/returns 401

## Dependencies

- Phase 1 (Drizzle, DB)
- Phase 2 (session/auth)

## Deliverables Checklist

- [ ] `db/schema.ts` with eventi table
- [ ] Migration applied
- [ ] `app/api/events/route.ts` (GET, POST)
- [ ] `app/api/events/[id]/route.ts` (PATCH, DELETE)
- [ ] `lib/validations/events.ts`
