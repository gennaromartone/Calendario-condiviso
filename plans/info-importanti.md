# Plan: Info Importanti

> Source PRD: [plans/PRD-info-importanti.md](PRD-info-importanti.md)

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: `/info-importanti` — pagina dedicata; form crea/modifica in Sheet laterale
- **API**: `/api/info-importanti` (GET, POST), `/api/info-importanti/[id]` (PATCH, DELETE), `/api/info-importanti/[id]/pin` (PATCH)
- **Schema**: Tabella `info_importanti` con `id`, `titolo`, `tipo` (enum: scuola, medico, altro), `valore` (JSON), `pinned`, `pinnedAt`, `creatoDa`, `creatoIl`, `modificatoIl`
- **Auth**: `requireSession` come per eventi; tutti gli utenti autenticati vedono e modificano le stesse info
- **Pattern**: Repository + use case (coerente con eventi); validazione Zod lato client e server
- **Sicurezza**: Rate limiting, validazione input rigorosa, sanitizzazione link — vedi sezione Sicurezza

---

## Sicurezza

Requisiti di sicurezza che si applicano a tutte le fasi. Ogni API e ogni layer di input deve rispettarli.

### Rate limiting

- Aggiungere `"info-importanti"` a `RateLimitPrefix` in `rate-limit.ts` (es. 30 req/2 min come events)
- Applicare `checkRateLimit` a tutte le route: GET, POST, PATCH, DELETE, PATCH pin
- Usare `getClientIp` e `shouldBypassRateLimit` come per events

### Validazione input (Zod)

| Campo | Regole |
|------|--------|
| `titolo` | `z.string().min(1).max(200).transform(s => s.trim())` |
| `tipo` | `z.enum(["scuola", "medico", "altro"])` — whitelist stretta |
| `valore.telefono` | `z.string().max(50).regex(/^[\d\s\+\-\(\)\.]+$/)` — solo caratteri ammessi per tel |
| `valore.indirizzo` | `z.string().max(500).transform(s => s.trim())` |
| `valore.contenuto` | `z.string().max(1000).transform(s => s.trim())` |
| `id` (param) | `z.string().uuid()` prima di query DB |

### Sanitizzazione e output

- **React**: Non usare `dangerouslySetInnerHTML` per contenuti utente; React escapa di default
- **Link `tel:`**: Costruire solo da `valore.telefono` validato; usare `encodeURI` per caratteri speciali ammessi
- **Link Google Maps**: `encodeURIComponent(indirizzo)` nel query param; max length ragionevole (500)
- **JSON `valore`**: Validare struttura con Zod prima di salvare; rifiutare chiavi non attese

### Autorizzazione

- Tutte le route richiedono `requireSession`; 401 se non autenticato
- Nessun controllo ownership: tutti i genitori autenticati possono creare/modificare/eliminare (come da PRD)

### Altri controlli

- **Content-Type**: Verificare `Content-Type: application/json` per POST/PATCH (o accettare solo se body JSON)
- **ID non trovato**: 404 senza rivelare se l’id esiste; messaggio generico "Info non trovata"
- **Payload size**: Limitare dimensione body (Next.js default ~1MB; per info basta molto meno)

### Acceptance criteria sicurezza (per tutte le fasi)

- [x] Rate limiting applicato a tutte le API info-importanti
- [x] Schema Zod con limiti, trim e regex per telefono
- [x] Param `[id]` validato come UUID prima di usarlo
- [x] Nessun `dangerouslySetInnerHTML` su contenuti utente
- [x] Link `tel:` e Maps costruiti solo da campi validati

---

## Phase 1: Foundation — Schema, API GET, Pagina e Entry Point

**User stories**: REQ-1.1, REQ-1.2, REQ-1.3, REQ-2.1 (empty state), REQ-5.1

### What to build

Slice end-to-end minimale: schema DB, migration, API GET che restituisce la lista (ordinata: pinnate prima), pagina `/info-importanti` protetta da AuthGuard con empty state, e icona "Info importanti" nell'header del calendario che naviga alla pagina. Al termine si può cliccare l'icona e vedere la pagina vuota con messaggio "Nessuna info aggiunta".

### Acceptance criteria

- [ ] Tabella `info_importanti` creata con colonne definite nel PRD
- [ ] Migration applicata senza errori
- [ ] GET `/api/info-importanti` restituisce array (vuoto o con dati), ordinato: pinnate per `pinnedAt` DESC, poi per `creatoIl` DESC
- [ ] Rate limiting applicato a GET (vedi sezione Sicurezza)
- [ ] Pagina `/info-importanti` con AuthGuard, titolo "Info importanti", empty state quando lista vuota
- [ ] Icona nell'header calendario (tra titolo e menu azioni) con `aria-label`, touch target ≥44px, `focus-visible`
- [ ] Clic sull'icona naviga a `/info-importanti`

---

## Phase 2: Creazione — POST e Form Aggiungi

**User stories**: REQ-3.1, REQ-3.2, REQ-2.3 (form), REQ-3.5 (toast)

### What to build

API POST per creare una info, form in Sheet con campi titolo, tipo (select: Scuola, Medico, Altro), e campi dinamici per valore (telefono per Scuola; telefono + indirizzo per Medico; contenuto per Altro). Pulsante "Aggiungi info" nella pagina che apre lo Sheet. Validazione client e server. Toast di successo/errore.

### Acceptance criteria

- [ ] POST `/api/info-importanti` accetta body validato (schema Zod con sanitizzazione) e crea record con `creatoDa` dalla session
- [ ] Validazione server: titolo trim/max, tipo enum, telefono regex, indirizzo/contenuto max — vedi sezione Sicurezza
- [ ] Form con labels, `autocomplete` appropriato (`tel`, `street-address`), placeholder con `…`
- [ ] Pulsante "Aggiungi info" apre Sheet con form vuoto
- [ ] Submit crea l'info, chiude Sheet, aggiorna lista, mostra toast
- [ ] Errori inline sui campi; submit disabilitato durante richiesta

---

## Phase 3: Modifica e Eliminazione — PATCH, DELETE, Conferma

**User stories**: REQ-3.3, REQ-3.4, REQ-3.5

### What to build

API PATCH e DELETE per singola info. Lista mostra ogni info come card con azioni "Modifica" e "Elimina". Modifica apre Sheet con form precompilato. Elimina apre AlertDialog di conferma; solo dopo conferma si chiama DELETE. Toast per feedback.

### Acceptance criteria

- [ ] PATCH `/api/info-importanti/[id]` aggiorna titolo, tipo, valore (stessa validazione POST)
- [ ] Param `[id]` validato come UUID; 404 se non trovato
- [ ] DELETE `/api/info-importanti/[id]` elimina la info
- [ ] Azione "Modifica" apre Sheet con dati precompilati; submit chiama PATCH
- [ ] Azione "Elimina" apre AlertDialog "Sei sicuro di voler eliminare questa info?"; conferma → DELETE
- [ ] Toast dopo modifica ed eliminazione

---

## Phase 4: Pin e Link — Toggle Pin, Ordinamento, tel/Maps

**User stories**: REQ-2.2, REQ-2.4, REQ-4.1, REQ-4.2, REQ-4.3

### What to build

API PATCH `/api/info-importanti/[id]/pin` per toggle pin. Pulsante pin su ogni card con `aria-pressed`; info pinnate in cima. Link `tel:` per numeri di telefono e link Google Maps per indirizzi (apertura in nuova scheda con `rel="noopener noreferrer"`).

### Acceptance criteria

- [ ] PATCH `/api/info-importanti/[id]/pin` inverte stato `pinned`, aggiorna `pinnedAt`
- [ ] Pulsante pin su ogni info con `aria-label` e stato visibile (pinnato/non pinnato)
- [ ] Lista ordinata: pinnate prima, poi non pinnate
- [ ] Numeri di telefono cliccabili → `tel:` (solo da valore validato; `encodeURI` per caratteri ammessi)
- [ ] Indirizzi cliccabili → Google Maps `search/?api=1&query=...` con `encodeURIComponent`; `rel="noopener noreferrer"`

---
