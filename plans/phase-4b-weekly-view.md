# Phase 4b: Vista Settimanale

> Source: [plans/calendario-condiviso.md](calendario-condiviso.md) | PRD: [calendar-prd.md](../calendar-prd.md)

## Subagent & Skills

- **Subagent**: `generalPurpose` (calendar view logic)
- **Skills**: shadcn, vercel-composition-patterns

## What to Build

Vista settimanale del calendario. Stessi eventi, layout a settimana. Navigazione tra settimane.

## Acceptance Criteria

- [ ] Vista settimanale funzionante
- [ ] Eventi visualizzati nelle date corrette
- [ ] Navigazione tra settimane
- [ ] Toggle o switch tra vista mensile/settimanale

## Implementation Steps

### 1. View state

- Add `viewMode: 'month' | 'week'` to calendar state
- Toggle: Tabs (shadcn) or ToggleGroup with "Mese" / "Settimana"

### 2. Weekly grid layout

- 7 columns (days of week)
- Rows: time slots (e.g. 7:00–22:00, 30-min or 1-hour slots) or single row per day with events stacked
- Simpler approach: one row per day, events listed vertically in each column

### 3. Week navigation

- "Precedente" / "Successivo" for week
- Compute week start (e.g. Monday) from current date
- Fetch events for week range

### 4. Reuse event data

- Same `GET /api/events` with start/end for current week
- Share event list between monthly and weekly views
- Extract `CalendarGrid` and `EventBlock` as reusable components

### 5. Toggle placement

- Header of calendar page: [Mese] [Settimana] toggle
- Switching preserves approximate date (same week/month in other view)

## Dependencies

- Phase 4a (monthly view, event fetch, event blocks)

## Deliverables Checklist

- [ ] Weekly view component
- [ ] Week navigation
- [ ] View toggle (month/week)
- [ ] Events displayed correctly in weekly layout
