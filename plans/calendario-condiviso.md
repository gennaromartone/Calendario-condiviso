# Plan: Calendario Condiviso

> Source PRD: calendar-prd.md

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: `/` (login), `/calendar` (calendario principale), `/admin` (setup parola d'ordine)
- **Schema**: Tabella `eventi` con id, titolo, descrizione, data_inizio, data_fine, tipo (enum: affidamento | scuola | sport | altro), creato_da (opzionale), creato_il, modificato_il
- **Auth**: Parola d'ordine hash (bcrypt/argon2), sessione/cookie, nessun sistema utenti
- **Stack**: Next.js App Router, shadcn/ui, Vercel Postgres, Drizzle ORM, Vercel hosting

---

## Phase 1: Project setup + skeleton

**User stories**: (foundation)

### What to build

Inizializzare il progetto Next.js con App Router, configurare shadcn/ui, Vercel Postgres e Drizzle. Definire la struttura delle route e un layout base responsive.

### Acceptance criteria

- [ ] Progetto Next.js creato con App Router
- [ ] shadcn/ui installato e configurato
- [ ] Vercel Postgres + Drizzle configurati
- [ ] Route `/`, `/calendar`, `/admin` definite
- [ ] Layout base responsive (375px, 768px, 1024px)

---

## Phase 2: Auth module + Login flow

**User stories**: 1, 2

### What to build

Modulo di autenticazione basato su parola d'ordine. L'admin imposta la password (hash sicuro), i genitori accedono inserendola. Sessione/cookie mantengono l'accesso. Pagina login con form, redirect al calendario se autenticati.

### Acceptance criteria

- [ ] Pagina login: campo password, pulsante "Accedi"
- [ ] Parola d'ordine hashata (bcrypt/argon2)
- [ ] Sessione/cookie dopo verifica corretta
- [ ] Messaggio errore se password errata
- [ ] Redirect a `/calendar` se autenticato
- [ ] Route protette: accesso a `/calendar` richiede sessione valida

---

## Phase 3: Database schema + Events API

**User stories**: 3, 4, 5 (backend)

### What to build

Schema Drizzle per la tabella `eventi`. API routes Next.js per CRUD completo (create, read, update, delete). Tutte le API richiedono sessione valida.

### Acceptance criteria

- [ ] Schema eventi: id, titolo, descrizione, data_inizio, data_fine, tipo (enum), creato_da, creato_il, modificato_il
- [ ] API: GET /api/events (lista), POST /api/events (crea), PATCH /api/events/[id] (modifica), DELETE /api/events/[id] (elimina)
- [ ] API protette da sessione
- [ ] Validazione input

---

## Phase 4a: Vista mensile + eventi

**User stories**: 6

### What to build

Pagina calendario con vista mensile. Fetch eventi da API, rendering come blocchi nelle date corrette. Navigazione tra mesi.

### Acceptance criteria

- [ ] Vista mensile funzionante (griglia giorni del mese)
- [ ] Fetch eventi da API
- [ ] Eventi visualizzati nelle date corrette
- [ ] Navigazione tra mesi (precedente/successivo)

---

## Phase 4b: Vista settimanale

**User stories**: 6

### What to build

Vista settimanale del calendario. Stessi eventi, layout a settimana. Navigazione tra settimane.

### Acceptance criteria

- [ ] Vista settimanale funzionante
- [ ] Eventi visualizzati nelle date corrette
- [ ] Navigazione tra settimane
- [ ] Toggle o switch tra vista mensile/settimanale

---

## Phase 4c: Dettaglio evento

**User stories**: 6

### What to build

Click su evento apre pannello/dettaglio con informazioni complete. Preparazione per modifica (Phase 5).

### Acceptance criteria

- [ ] Click su evento apre dettaglio
- [ ] Dettaglio mostra titolo, data, ora, tipo, descrizione
- [ ] Pulsante/azione per passare alla modifica (Phase 5)

---

## Phase 5: Event creation/editing UI

**User stories**: 3, 4, 5 (frontend)

### What to build

Modal/drawer per creare e modificare eventi. Form con titolo, data, ora, tipo, descrizione. Eliminazione con conferma. Integrazione con API CRUD.

### Acceptance criteria

- [ ] Modal/drawer per creare evento
- [ ] Modal/drawer per modificare evento (da click su evento)
- [ ] Form: titolo, data, ora, tipo, descrizione
- [ ] Conferma prima di eliminare
- [ ] CRUD completo end-to-end funzionante

---

## Phase 6: Event types + Admin setup

**User stories**: 7, Admin (user story 1)

### What to build

Distinzione visiva dei tipi di evento (affidamento, scuola, sport, altro) con colori/icone. Pagina Admin per setup iniziale parola d'ordine (primo accesso o pagina dedicata).

### Acceptance criteria

- [ ] Tipi evento visivamente distinti (colori/icone)
- [ ] Admin: setup parola d'ordine al primo accesso
- [ ] Rate limiting su login (mitigazione brute-force)
- [ ] UX coerente con contesto famiglia/bambini

---

## Phase 7: E2E tests

**User stories**: (verifica qualità)

### What to build

Test E2E con Playwright per i percorsi critici: login (errore e successo), creazione evento, modifica evento, eliminazione evento, visualizzazione calendario.

### Acceptance criteria

- [ ] E2E: login errato → messaggio errore
- [ ] E2E: login corretto → redirect calendario
- [ ] E2E: creazione evento
- [ ] E2E: modifica evento
- [ ] E2E: eliminazione evento con conferma
- [ ] E2E: eventi visibili nelle date corrette
- [ ] Test di regressione prima di deploy
