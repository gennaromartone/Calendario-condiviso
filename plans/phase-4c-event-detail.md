# Phase 4c: Dettaglio Evento

> Source: [plans/calendario-condiviso.md](calendario-condiviso.md) | PRD: [calendar-prd.md](../calendar-prd.md)

## Subagent & Skills

- **Subagent**: `generalPurpose` (UI interaction)
- **Skills**: shadcn, web-design-guidelines

## What to Build

Click su evento apre pannello/dettaglio con informazioni complete. Preparazione per modifica (Phase 5).

## Acceptance Criteria

- [ ] Click su evento apre dettaglio
- [ ] Dettaglio mostra titolo, data, ora, tipo, descrizione
- [ ] Pulsante/azione per passare alla modifica (Phase 5)

## Implementation Steps

### 1. Detail panel component

- Use shadcn `Sheet` (drawer) or `Dialog` (modal)
- Mobile: Sheet from bottom or side
- Desktop: Dialog centered or Sheet from right

### 2. State for selected event

- `selectedEventId: string | null` in calendar page
- Click on event block: set `selectedEventId` to event id
- Panel opens when `selectedEventId` is set

### 3. Detail content

- Fetch full event by id (or use event from list if already loaded)
- Display: titolo, data (formatted), ora (from data_inizio/data_fine), tipo, descrizione
- Use Card or simple div structure

### 4. Edit button

- "Modifica" button in detail panel
- For now: can open edit modal (Phase 5) or just placeholder
- Ensure button has clear label, min 44×44px touch target

### 5. Close behavior

- Close button (X) and click outside to close
- `onOpenChange` to clear `selectedEventId`

### 6. Accessibility

- Sheet/Dialog: `DialogTitle`, `DialogDescription` or `SheetTitle`, `SheetDescription`
- Focus trap when open
- `aria-label` on close button if icon-only

## Dependencies

- Phase 4a, 4b (event blocks, calendar)

## Deliverables Checklist

- [ ] Event detail Sheet/Dialog
- [ ] Click on event opens detail
- [ ] All fields displayed
- [ ] "Modifica" button (wired in Phase 5)
