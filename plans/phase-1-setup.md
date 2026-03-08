# Phase 1: Project Setup + Skeleton

> Source: [plans/calendario-condiviso.md](calendario-condiviso.md) | PRD: [calendar-prd.md](../calendar-prd.md)

## Subagent & Skills

- **Subagent**: `generalPurpose` (project scaffolding, config)
- **Skills**: vercel-react-best-practices, shadcn

## What to Build

Inizializzare il progetto Next.js con App Router, configurare shadcn/ui, Vercel Postgres e Drizzle. Definire la struttura delle route e un layout base responsive.

## Acceptance Criteria

- [ ] Progetto Next.js creato con App Router
- [ ] shadcn/ui installato e configurato
- [ ] Vercel Postgres + Drizzle configurati
- [ ] Route `/`, `/calendar`, `/admin` definite
- [ ] Layout base responsive (375px, 768px, 1024px)

## Implementation Steps

### 1. Create Next.js project

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```

- Select App Router, TypeScript, Tailwind, ESLint
- Ensure `app/` directory structure

### 2. Install and configure shadcn/ui

```bash
npx shadcn@latest init
```

- Choose default style (or New York)
- Base color: slate or zinc
- Add initial components: `button`, `card`, `input`, `label` (for later phases)

### 3. Configure Vercel Postgres + Drizzle

```bash
npm install @vercel/postgres drizzle-orm
npm install -D drizzle-kit
```

- Create `drizzle.config.ts` with Vercel Postgres connection
- Add `POSTGRES_URL` to `.env.local` (from Vercel dashboard)
- Create `lib/db.ts` for Drizzle client
- Create `db/` folder for schema (empty for now; schema in Phase 3)

### 4. Define route structure

```
app/
├── layout.tsx          # Root layout
├── page.tsx            # / (login - placeholder for Phase 2)
├── admin/
│   └── page.tsx        # /admin (placeholder)
└── calendar/
    └── page.tsx        # /calendar (placeholder)
```

- Use route groups if desired: `app/(auth)/page.tsx`, `app/(protected)/calendar/page.tsx`
- Each page renders minimal placeholder content

### 5. Responsive layout

- Root layout: viewport meta, font, base styles
- Breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px` (Tailwind defaults)
- Test at 375px (mobile), 768px (tablet), 1024px (desktop)
- No horizontal scroll on mobile

## Dependencies

- None (first phase)

## Deliverables Checklist

- [ ] `package.json` with Next.js, Tailwind, Drizzle, shadcn deps
- [ ] `components.json` (shadcn config)
- [ ] `drizzle.config.ts`
- [ ] `lib/db.ts`
- [ ] `app/layout.tsx`, `app/page.tsx`, `app/admin/page.tsx`, `app/calendar/page.tsx`
