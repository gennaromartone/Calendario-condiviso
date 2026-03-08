# Phase 4a: Vista Mensile + Eventi

> Source: [plans/calendario-condiviso.md](calendario-condiviso.md) | PRD: [calendar-prd.md](../calendar-prd.md)

## Subagent & Skills

- **Subagent**: `generalPurpose` (calendar UI, data binding)
- **Skills**: shadcn, vercel-react-best-practices

## What to Build

Pagina calendario con vista mensile. Fetch eventi da API, rendering come blocchi nelle date corrette. Navigazione tra mesi.

## Acceptance Criteria

- [ ] Vista mensile funzionante (griglia giorni del mese)
- [ ] Fetch eventi da API
- [ ] Eventi visualizzati nelle date corrette
- [ ] Navigazione tra mesi (precedente/successivo)

## Implementation Steps

### 1. Calendar page structure

- `app/calendar/page.tsx`: client or server component
- State: current month (year, month)
- Use `useState` for month navigation, or URL params (`/calendar?year=2025&month=3`)

### 2. Monthly grid layout

- 7 columns (days of week: Lun–Dom or Dom–Sab)
- Rows: weeks in month (4–6 rows)
- Each cell: day number + events for that day
- Use CSS Grid: `grid-cols-7`, `grid-rows-auto`

### 3. Fetch events

- Call `GET /api/events?start=YYYY-MM-DD&end=YYYY-MM-DD` for first/last day of visible month
- Use `fetch` or `use` in RSC; if client, use `useEffect` + `useState` or SWR
- Avoid waterfall: fetch early, pass to calendar component

### 4. Render events in cells

- Group events by date (data_inizio date part)
- Each event: small block/card with titolo (and optionally tipo badge)
- Click handler: prepare for Phase 4c (detail panel)

### 5. Month navigation

- Buttons: "Precedente" (previous month), "Successivo" (next month)
- Update state/URL, refetch events for new month
- Display current month name + year in header

### 6. Empty states

- Empty day cells: minimal styling
- Days outside current month: muted/grayed (if showing adjacent days)

## Dependencies

- Phase 1 (layout, routes)
- Phase 2 (protected route, session)
- Phase 3 (API, event schema)

## Deliverables Checklist

- [ ] `app/calendar/page.tsx` with monthly grid
- [ ] Event fetch and display
- [ ] Month navigation (prev/next)
- [ ] Responsive grid (mobile: smaller cells or scroll)
