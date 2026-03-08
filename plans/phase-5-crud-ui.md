# Phase 5: Event Creation/Editing UI

> Source: [plans/calendario-condiviso.md](calendario-condiviso.md) | PRD: [calendar-prd.md](../calendar-prd.md)

## Subagent & Skills

- **Subagent**: `generalPurpose` (forms, CRUD integration)
- **Skills**: shadcn, building-components

## What to Build

Modal/drawer per creare e modificare eventi. Form con titolo, data, ora, tipo, descrizione. Eliminazione con conferma. Integrazione con API CRUD.

## Acceptance Criteria

- [ ] Modal/drawer per creare evento
- [ ] Modal/drawer per modificare evento (da click su evento)
- [ ] Form: titolo, data, ora, tipo, descrizione
- [ ] Conferma prima di eliminare
- [ ] CRUD completo end-to-end funzionante

## Implementation Steps

### 1. Event form component

- Reusable form: titolo (Input), descrizione (Textarea), data (DatePicker or date+time inputs), tipo (Select: affidamento, scuola, sport, altro)
- Use shadcn Form + react-hook-form + zod for validation
- Same form for create and edit (prefill in edit mode)

### 2. Create modal/drawer

- "Nuovo evento" button in calendar header
- Opens Sheet/Dialog with empty form
- On submit: POST /api/events, then refetch events, close modal

### 3. Edit modal/drawer

- From Phase 4c "Modifica" button: open same form with event data
- On submit: PATCH /api/events/[id], refetch, close

### 4. Delete with confirmation

- "Elimina" button in edit form or detail panel
- Use AlertDialog: "Sei sicuro di voler eliminare questo evento?"
- On confirm: DELETE /api/events/[id], refetch, close

### 5. Form validation

- Client-side: Zod schema matching API validation
- Required: titolo, data_inizio, data_fine, tipo
- data_fine >= data_inizio

### 6. Loading and error states

- Disable submit while loading
- Show error message on API failure (toast or inline)

## Dependencies

- Phase 3 (API)
- Phase 4a, 4b, 4c (calendar, detail panel)

## Deliverables Checklist

- [ ] EventForm component
- [ ] Create modal + POST integration
- [ ] Edit modal + PATCH integration
- [ ] Delete + AlertDialog + DELETE integration
- [ ] Full CRUD flow working
