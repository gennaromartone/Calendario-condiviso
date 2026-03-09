# PRD: Sistema Notifiche

**Prodotto:** Calendario Condiviso  
**Versione:** 1.0  
**Data:** 9 marzo 2025  
**Autore:** Product Requirements Document

---

## 1. Panoramica

Questo PRD definisce una nuova funzionalità per il Calendario Condiviso:

**Sistema Notifiche** — Una campanellina nell’header con badge numerico che indica le notifiche non lette. Al clic si apre un pannello laterale destro (Sheet) con l’elenco delle notifiche nuove e non lette. Le notifiche riguardano le modifiche condivise al calendario: aggiunta, modifica e cancellazione di eventi, e aggiunta, modifica ed eliminazione di info importanti. Ogni genitore riceve notifiche quando un altro genitore effettua modifiche.

---

## 2. Obiettivi

| Obiettivo | Descrizione |
|-----------|-------------|
| **Consapevolezza** | Tenere i genitori informati sulle modifiche apportate da altri al calendario e alle info importanti |
| **Trasparenza** | Evidenziare chi ha fatto cosa e quando, senza dover controllare manualmente |
| **Accesso rapido** | Badge con conteggio e pannello laterale per consultare le notifiche senza lasciare la pagina corrente |
| **Coerenza UX** | Pattern familiare (campanellina + Sheet) allineato a web-design-guidelines e building-components |

---

## 3. Requisiti Funzionali

### 3.1 Entry Point — Campanellina nell’Header

| Requisito | Descrizione | Skill UX/UI |
|-----------|-------------|-------------|
| **REQ-1.1** | Icona campanella (`Bell` da lucide-react) visibile nell’header delle pagine principali (calendario, info importanti) | **web-design-guidelines**: Touch targets min 44×44px; `aria-label` per icon-only button; `focus-visible:ring-*` |
| **REQ-1.2** | Badge numerico sovrapposto all’icona che mostra il numero di notifiche non lette (0 = badge nascosto) | **web-design-guidelines**: Contrasto sufficiente; `aria-live="polite"` per aggiornamenti; `font-variant-numeric: tabular-nums` |
| **REQ-1.3** | Clic/tap sulla campanella apre un Sheet laterale destro con l’elenco delle notifiche | **building-components**: Sheet pattern; focus trap; chiusura con Escape o overlay |
| **REQ-1.4** | La campanellina è accessibile da tastiera (Tab, Enter/Space) | **web-design-guidelines**: `focus-visible`; `aria-expanded` per stato aperto/chiuso |

**Skill applicabili:** `web-design-guidelines`, `building-components` (accessibility.mdx)

---

### 3.2 Pannello Notifiche — Sheet Laterale Destro

| Requisito | Descrizione | Skill UX/UI |
|-----------|-------------|-------------|
| **REQ-2.1** | Sheet che scorre da destra (`side="right"`), larghezza adeguata (es. `max-w-sm` / `sm:max-w-md`) | **building-components**: Coerente con `EventDetailSheet`, `InfoImportanteFormSheet` |
| **REQ-2.2** | Titolo "Notifiche" e pulsante chiudi; lista scrollabile di notifiche | **web-design-guidelines**: `min-w-0` su flex children; scroll gestito |
| **REQ-2.3** | Ogni notifica mostra: tipo (evento/info), azione (aggiunto/modificato/eliminato), titolo o descrizione breve, autore, data/ora relativa | **web-design-guidelines**: `truncate`/`line-clamp`; `tabular-nums` per date |
| **REQ-2.4** | Notifiche non lette evidenziate visivamente (es. sfondo più scuro, pallino) | **web-design-guidelines**: Contrasto e leggibilità |
| **REQ-2.5** | Empty state quando non ci sono notifiche: messaggio "Nessuna notifica" | **web-design-guidelines**: Content Handling — empty state gestito |
| **REQ-2.6** | Clic su una notifica la marca come letta e, se applicabile, naviga alla risorsa (evento o info) | **building-components**: Link o button con `onClick`; gestione stato lettura |

**Skill applicabili:** `web-design-guidelines`, `building-components` (accessibility.mdx)

---

### 3.3 Tipi di Notifica

| Requisito | Descrizione |
|-----------|-------------|
| **REQ-3.1** | **Eventi**: "Evento aggiunto", "Evento modificato", "Evento eliminato" — con titolo evento e nome autore |
| **REQ-3.2** | **Info importanti**: "Info aggiunta", "Info modificata", "Info eliminata" — con titolo info e nome autore |
| **REQ-3.3** | Le notifiche sono generate automaticamente quando un utente diverso dal destinatario esegue l’azione (es. Genitore A crea evento → Genitore B riceve notifica) |
| **REQ-3.4** | Non si generano notifiche per le proprie azioni |

---

### 3.4 Marcatura come Letta

| Requisito | Descrizione |
|-----------|-------------|
| **REQ-4.1** | Apertura del pannello notifiche non marca automaticamente tutte come lette (per permettere lettura graduale) |
| **REQ-4.2** | Clic su una singola notifica la marca come letta e aggiorna il badge |
| **REQ-4.3** | Opzione "Segna tutte come lette" nel pannello (pulsante o link) che marca tutte le notifiche dell’utente come lette |
| **REQ-4.4** | Il badge si aggiorna in tempo reale dopo marcatura (o dopo refresh/polling) |

---

### 3.5 Permessi e Destinatari

| Requisito | Descrizione |
|-----------|-------------|
| **REQ-5.1** | Solo utenti autenticati vedono la campanellina e le notifiche |
| **REQ-5.2** | Ogni utente vede solo le proprie notifiche (filtrate per `utenteId` destinatario) |
| **REQ-5.3** | Le notifiche vengono create per tutti gli altri utenti autenticati quando un utente effettua un’azione su eventi o info importanti |

---

## 4. Modifiche Tecniche

### 4.1 Schema Database

| Tabella | Colonne |
|---------|---------|
| **notifiche** | `id`, `utenteId` (FK utenti — destinatario), `tipo` (enum), `entityType` (evento \| info_importante), `entityId`, `titolo` (breve descrizione), `autoreId` (FK utenti — chi ha fatto l’azione), `letta` (boolean, default false), `creatoIl` (ISO datetime) |

**Enum `tipo`:**  
`evento_aggiunto` | `evento_modificato` | `evento_eliminato` | `info_aggiunta` | `info_modificata` | `info_eliminata`

**Note:**
- `entityId` può essere null per eliminazioni (se l’entità non esiste più)
- `titolo` contiene il titolo dell’evento/info al momento della creazione della notifica (per eliminazioni: titolo prima della cancellazione)

### 4.2 API

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/notifiche` | GET | Lista notifiche dell’utente corrente, ordinate per `creatoIl` DESC; query param `?unreadOnly=true` opzionale |
| `/api/notifiche/count` | GET | Conteggio notifiche non lette (per badge) |
| `/api/notifiche/[id]/read` | PATCH | Marca singola notifica come letta |
| `/api/notifiche/read-all` | PATCH | Marca tutte le notifiche dell’utente come lette |

### 4.3 Generazione Notifiche (Server-Side)

Le notifiche vanno create nei seguenti punti:

| Punto | Azione | Destinatari |
|------|--------|-------------|
| `POST /api/events` | evento_aggiunto | Tutti gli utenti tranne `creatoDa` |
| `PATCH /api/events/[id]` | evento_modificato | Tutti gli utenti tranne chi modifica |
| `DELETE /api/events/[id]` | evento_eliminato | Tutti gli utenti tranne chi elimina |
| `POST /api/info-importanti` | info_aggiunta | Tutti gli utenti tranne `creatoDa` |
| `PATCH /api/info-importanti/[id]` | info_modificata | Tutti gli utenti tranne chi modifica |
| `DELETE /api/info-importanti/[id]` | info_eliminata | Tutti gli utenti tranne chi elimina |

**Pattern:** Use case o helper `createNotificationsForOtherUsers(autoreId, tipo, entityType, entityId, titolo)` che inserisce una riga in `notifiche` per ogni utente diverso da `autoreId`.

### 4.4 Componenti e File

| Area | Modifica |
|------|----------|
| **Header** | Aggiungere `NotificationBell` in `CalendarHeaderActions` e nell’header di `/info-importanti` (o in un layout condiviso) |
| **Nuovi componenti** | `NotificationBell`, `NotificationPanel` (Sheet con lista), `NotificationItem` |
| **API client** | `src/lib/api/notifiche-api.ts` — getNotifiche, getUnreadCount, markAsRead, markAllAsRead |
| **Hooks** | `useNotifications`, `useUnreadCount` — con polling opzionale (es. ogni 60s) o invalidation dopo mutazioni |
| **Schema/Repository** | `db/schema.ts` — tabella `notifiche`; `NotificationRepository`; use case `CreateNotificationsUseCase` |

---

## 5. Criteri di Accettazione

### Entry Point
- [ ] Campanellina visibile nell’header calendario e info importanti
- [ ] Badge con numero notifiche non lette (nascosto se 0)
- [ ] Icona accessibile (aria-label, focus visibile, touch target ≥44px)
- [ ] Clic apre Sheet laterale destro

### Pannello
- [ ] Sheet da destra con lista notifiche
- [ ] Ogni notifica mostra tipo, azione, titolo, autore, data
- [ ] Notifiche non lette evidenziate
- [ ] Empty state "Nessuna notifica"
- [ ] Clic su notifica → marca come letta, aggiorna badge
- [ ] Pulsante "Segna tutte come lette"

### Logica
- [ ] Notifiche generate su create/update/delete di eventi e info (solo per altri utenti)
- [ ] Ogni utente vede solo le proprie notifiche
- [ ] API protette da sessione; rate limiting applicato

---

## 6. Design e UX

### 6.1 Posizionamento Campanellina

- **Opzione A:** Tra "Info importanti" e il menu azioni (nome utente) nell’header calendario
- **Opzione B:** Dentro il dropdown menu azioni come prima voce
- **Raccomandazione:** Opzione A — visibilità immediata, pattern comune (Gmail, Slack, ecc.)

### 6.2 Badge

- Posizione: angolo superiore destro dell’icona campanella
- Stile: cerchio con numero, colore di accento (es. `bg-primary text-primary-foreground` o rosso per "nuovo")
- Numero: se >99 mostrare "99+"
- Animazione opzionale: leggero pulse per nuove notifiche (rispettare `prefers-reduced-motion`)

### 6.3 Sheet Notifiche

- Larghezza: `max-w-sm` mobile, `sm:max-w-md` desktop
- Lista: scroll verticale; ogni item cliccabile
- Navigazione: clic su notifica evento → chiudi Sheet, naviga a calendario (eventualmente con focus sull’evento); clic su notifica info → naviga a `/info-importanti`

### 6.4 Aggiornamento Badge

- **Polling:** GET `/api/notifiche/count` ogni 60 secondi quando la pagina è attiva
- **Invalidation:** Dopo mutazioni eventi/info, invalidare conteggio (React Query o SWR)
- **Real-time (futuro):** WebSocket o Server-Sent Events — fuori scope MVP

### 6.5 Accessibilità (da Web Interface Guidelines)

- Icon-only button: `aria-label="Notifiche"` o `aria-label="Notifiche, X non lette"`
- Badge: `aria-live="polite"` per annunciare cambiamenti
- Sheet: focus trap, chiusura con Escape
- Lista: `role="list"`, ogni item `role="listitem"`; link/button con `aria-label` descrittivo
- `prefers-reduced-motion`: evitare animazioni non essenziali

### 6.6 Skill di Riferimento

| Requisito | Skill |
|-----------|-------|
| Icone, bottoni, touch targets, badge | **web-design-guidelines** |
| Sheet, focus trap, lista | **building-components** (accessibility.mdx) |
| Empty state, contrasto | **web-design-guidelines** |
| Architettura API, use case, repository | **architecture-design** |

---

## 7. Fasi di Implementazione

| Fase | Scope | Stimata |
|------|-------|---------|
| **1** | Schema DB `notifiche`, migration, repository, use case creazione | 0.5 giorni |
| **2** | Integrazione creazione notifiche in API eventi e info-importanti | 0.5 giorni |
| **3** | API GET notifiche, GET count, PATCH read, PATCH read-all | 0.5 giorni |
| **4** | Componente `NotificationBell` + `NotificationPanel` (Sheet), hook `useNotifications` | 1 giorno |
| **5** | Inserimento campanellina negli header, polling count, navigazione da notifica | 0.5 giorni |

---

## 8. Rischi e Mitigazioni

| Rischio | Mitigazione |
|---------|-------------|
| Troppe notifiche | MVP senza filtri; in futuro: raggruppamento, "notifiche di oggi", paginazione |
| Performance con molti utenti | Con 2–4 genitori il volume è trascurabile; indici su `utenteId` e `letta` |
| Notifiche per eliminazioni | Salvare `titolo` prima della delete; `entityId` può essere null |
| Conflitto con altre Sheet | Gestire stato aperto/chiuso; una sola Sheet aperta alla volta |

---

## 9. Riferimenti Skill

- **web-design-guidelines** — Vercel Web Interface Guidelines (accessibility, touch, focus, content)
- **building-components** — Accessibility (ARIA, keyboard, focus trap), Sheet/Dialog pattern
- **architecture-design** — Repository, use case, separazione livelli
- **prd-to-plan** — Per trasformare questo PRD in piano di implementazione con fasi verticali

---

*Fine PRD*
