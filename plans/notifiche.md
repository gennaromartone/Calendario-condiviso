# Plan: Sistema Notifiche

> Source PRD: [plans/PRD-notifiche.md](PRD-notifiche.md)

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: `/api/notifiche` (GET lista), `/api/notifiche/count` (GET conteggio), `/api/notifiche/[id]/read` (PATCH), `/api/notifiche/read-all` (PATCH)
- **Schema**: Tabella `notifiche` con `id`, `utenteId` (FK utenti), `tipo` (enum: evento_aggiunto | evento_modificato | evento_eliminato | info_aggiunta | info_modificata | info_eliminata), `entityType` (evento | info_importante), `entityId` (nullable), `titolo`, `autoreId` (FK utenti), `letta` (boolean default false), `creatoIl`
- **Auth**: `requireSession` come per eventi e info-importanti; ogni utente vede solo le proprie notifiche
- **Pattern**: Repository + use case per creazione; API client + hooks per client; generazione notifiche nelle API esistenti (eventi, info-importanti)
- **Destinatari**: Per ogni azione su eventi/info, si crea una notifica per tutti gli utenti tranne l’autore

---

## Sicurezza

### Rate limiting

- Aggiungere `"notifiche"` a `RateLimitPrefix` (es. 60 req/2 min)
- Applicare `checkRateLimit` a GET, GET count, PATCH read, PATCH read-all
- Usare `getClientIp` e `shouldBypassRateLimit` come per eventi

### Autorizzazione

- Tutte le route richiedono `requireSession`; 401 se non autenticato
- GET e PATCH filtrano sempre per `utenteId` dalla sessione
- Param `[id]` validato come UUID prima di query DB

---

## Phase 1: Foundation — Schema, API GET, Campanellina e Sheet vuoto

**User stories**: REQ-1.1, REQ-1.3, REQ-2.1, REQ-2.2, REQ-2.5, REQ-5.1

### What to build

Slice end-to-end minimale: schema DB `notifiche`, migration, repository, API GET lista e GET count, API client, campanellina nell’header calendario che apre uno Sheet laterale destro. Lo Sheet mostra titolo "Notifiche", pulsante chiudi e empty state "Nessuna notifica". Al termine si può cliccare la campanella e vedere il pannello vuoto. Badge non ancora visibile (o sempre 0).

### Acceptance criteria

- [ ] Tabella `notifiche` creata con colonne definite nel PRD; migration applicata
- [ ] Repository per notifiche (insert, findByUserId, countUnread)
- [ ] GET `/api/notifiche` restituisce array (vuoto) ordinato per `creatoIl` DESC; query param `?unreadOnly=true` opzionale
- [ ] GET `/api/notifiche/count` restituisce `{ count: number }` per notifiche non lette
- [ ] Rate limiting e `requireSession` su entrambe le route
- [ ] API client `getNotifiche`, `getUnreadCount`; hook `useNotifications`, `useUnreadCount`
- [ ] Componente `NotificationBell` con icona Bell, `aria-label`, touch target ≥44px, `focus-visible`
- [ ] Componente `NotificationPanel` (Sheet `side="right"`) con titolo, chiudi, lista scrollabile, empty state "Nessuna notifica"
- [ ] Campanellina inserita in `CalendarHeaderActions` tra "Info importanti" e menu utente; clic apre Sheet

---

## Phase 2: Generazione notifiche eventi + Badge

**User stories**: REQ-1.2, REQ-3.1, REQ-3.3, REQ-3.4, REQ-5.2, REQ-5.3

### What to build

Use case `createNotificationsForOtherUsers` che inserisce una notifica per ogni utente diverso dall’autore. Integrazione nelle API eventi: POST (evento_aggiunto), PATCH (evento_modificato), DELETE (evento_eliminato). Badge sulla campanella con conteggio non lette (nascosto se 0). Lista notifiche popolata con dati reali.

### Acceptance criteria

- [ ] Use case o helper che riceve `autoreId`, `tipo`, `entityType`, `entityId`, `titolo` e crea righe in `notifiche` per tutti gli utenti tranne `autoreId`
- [ ] POST `/api/events` → crea notifiche `evento_aggiunto` per altri utenti
- [ ] PATCH `/api/events/[id]` → crea notifiche `evento_modificato` per altri utenti
- [ ] DELETE `/api/events/[id]` → crea notifiche `evento_eliminato` per altri utenti (salvare `titolo` prima della delete; `entityId` può essere null)
- [ ] Badge con numero non lette sovrapposto all’icona; nascosto se count = 0
- [ ] Ogni notifica mostra: tipo (evento), azione (aggiunto/modificato/eliminato), titolo, autore, data
- [ ] Notifiche non lette evidenziate visivamente (es. pallino o sfondo)

---

## Phase 3: Generazione notifiche info importanti

**User stories**: REQ-3.2, REQ-5.3

### What to build

Integrazione del use case in POST, PATCH, DELETE `/api/info-importanti`. Quando un utente aggiunge, modifica o elimina info importanti, gli altri utenti ricevono la notifica corrispondente.

### Acceptance criteria

- [ ] POST `/api/info-importanti` → crea notifiche `info_aggiunta` per altri utenti
- [ ] PATCH `/api/info-importanti/[id]` → crea notifiche `info_modificata` per altri utenti
- [ ] DELETE `/api/info-importanti/[id]` → crea notifiche `info_eliminata` per altri utenti (salvare `titolo` prima della delete)
- [ ] Le notifiche info mostrano tipo (info), azione, titolo, autore, data

---

## Phase 4: Marcatura come letta e "Segna tutte come lette"

**User stories**: REQ-2.6, REQ-4.1, REQ-4.2, REQ-4.3, REQ-4.4

### What to build

API PATCH `/api/notifiche/[id]/read` e PATCH `/api/notifiche/read-all`. Clic su una notifica la marca come letta e aggiorna il badge. Pulsante "Segna tutte come lette" nel pannello. Invalidazione/conteggio aggiornato dopo le mutazioni.

### Acceptance criteria

- [ ] PATCH `/api/notifiche/[id]/read` marca la notifica come letta; 404 se non trovata o non appartiene all’utente
- [ ] PATCH `/api/notifiche/read-all` marca tutte le notifiche dell’utente come lette
- [ ] Rate limiting e `requireSession` su entrambe
- [ ] Clic su singola notifica → chiama PATCH read, aggiorna lista e badge
- [ ] Pulsante "Segna tutte come lette" nel pannello → chiama PATCH read-all, aggiorna lista e badge
- [ ] Badge si aggiorna dopo marcatura (invalidation o refetch)

---

## Phase 5: Navigazione e campanellina in info-importanti

**User stories**: REQ-2.6 (navigazione), REQ-1.1 (header info-importanti)

### What to build

Clic su notifica evento → chiudi Sheet, naviga a `/calendar` (eventualmente con focus sull’evento se possibile). Clic su notifica info → naviga a `/info-importanti`. Campanellina nell’header della pagina info-importanti. Polling opzionale per conteggio (es. ogni 60s) quando la pagina è attiva.

### Acceptance criteria

- [ ] Clic su notifica evento → chiudi Sheet, `router.push` a `/calendar`
- [ ] Clic su notifica info → chiudi Sheet, `router.push` a `/info-importanti`
- [ ] Campanellina visibile nell’header di `/info-importanti` (stessa posizione logica: tra breadcrumb/titolo e azioni)
- [ ] Polling GET `/api/notifiche/count` ogni 60 secondi quando la pagina è visibile (es. `refetchInterval` o `useEffect` con `document.visibilityState`)
- [ ] `aria-label` dinamico: "Notifiche" o "Notifiche, X non lette" quando count > 0
