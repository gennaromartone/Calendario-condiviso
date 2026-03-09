# PRD: Info Importanti

**Prodotto:** Calendario Condiviso  
**Versione:** 1.0  
**Data:** 9 marzo 2025  
**Autore:** Product Requirements Document

---

## 1. Panoramica

Questo PRD definisce una nuova funzionalità per il Calendario Condiviso:

**Info Importanti** — Una sezione dedicata per condividere informazioni essenziali tra i genitori (es. numero di telefono della scuola, medico di base con numero e indirizzo). Accessibile tramite un'icona sulla home page (pagina calendario), con supporto completo per creare, modificare, eliminare e pinnare le informazioni.

---

## 2. Obiettivi

| Obiettivo | Descrizione |
|-----------|-------------|
| **Centralizzazione** | Un unico punto dove trovare i contatti e le info critiche per la gestione familiare |
| **Condivisione** | Tutti i genitori autenticati vedono e possono aggiornare le stesse informazioni |
| **Priorità visiva** | Le info pinnate appaiono sempre in cima per accesso rapido |
| **Semplicità** | UX minimale e intuitiva, coerente con il resto dell'app |

---

## 3. Requisiti Funzionali

### 3.1 Entry Point — Icona sulla Home

| Requisito | Descrizione | Skill UX/UI |
|-----------|-------------|-------------|
| **REQ-1.1** | Icona "Info importanti" visibile nell'header della pagina calendario, accanto o integrata con le azioni esistenti | **web-design-guidelines**: Touch targets min 44×44px; `aria-label` per icon-only button; `focus-visible:ring-*` per focus visibile |
| **REQ-1.2** | Clic/tap sull'icona apre la vista Info Importanti (Sheet o pagina dedicata) | **building-components**: Usare `Link` o `button` con `onClick`; keyboard handlers (`Enter`/`Space`); `touch-action: manipulation` |
| **REQ-1.3** | Icona visivamente riconoscibile (es. `Info`, `FileText`, `Phone` o `Bookmark` da lucide-react) | **web-design-guidelines**: Hover state per feedback visivo; contrasto sufficiente per icone |

**Skill applicabili:** `web-design-guidelines`, `building-components` (accessibility.mdx)

---

### 3.2 Vista Info Importanti — Lista e Contenuto

| Requisito | Descrizione | Skill UX/UI |
|-----------|-------------|-------------|
| **REQ-2.1** | Elenco di info con titolo, tipo (es. Scuola, Medico, Altro), valore (es. numero, indirizzo) e opzione di pin | **web-design-guidelines**: Empty state gestito; `truncate`/`line-clamp` per contenuti lunghi; `min-w-0` su flex children |
| **REQ-2.2** | Info pinnate mostrate in cima, ordinate per data di pinning o creazione | **web-design-guidelines**: `font-variant-numeric: tabular-nums` per numeri se presenti |
| **REQ-2.3** | Tipo "Scuola": numero di telefono; tipo "Medico": numero e indirizzo; tipo "Altro": titolo + valore libero | **building-components**: Form controls con `label`/`aria-label`; `autocomplete` appropriato (`tel`, `street-address`) |
| **REQ-2.4** | Link cliccabile per numeri di telefono (`tel:`) e indirizzi (Google Maps) | **web-design-guidelines**: Link con `target="_blank" rel="noopener noreferrer"` per link esterni; `aria-label` descrittivo |

**Skill applicabili:** `web-design-guidelines`, `building-components` (accessibility.mdx, forms)

---

### 3.3 CRUD — Aggiungere, Modificare, Eliminare

| Requisito | Descrizione | Skill UX/UI |
|-----------|-------------|-------------|
| **REQ-3.1** | Pulsante "Aggiungi info" (FAB o inline) che apre form di creazione | **web-design-guidelines**: `aria-label`; `min-h-[44px] min-w-[44px]` per touch; `focus-visible` |
| **REQ-3.2** | Form con campi: titolo, tipo (select), valore/i (input/textarea). Validazione lato client e server | **web-design-guidelines**: Labels con `htmlFor`; `autocomplete`; errori inline; placeholder con `…`; submit button abilitato fino a richiesta; spinner durante salvataggio |
| **REQ-3.3** | Azione "Modifica" su ogni info → apre form precompilato | **building-components**: Controlled vs uncontrolled; `aria-describedby` per messaggi errore |
| **REQ-3.4** | Azione "Elimina" → conferma con modal/dialog prima dell'eliminazione | **web-design-guidelines**: "Destructive actions need confirmation modal—never immediate" |
| **REQ-3.5** | Toast di successo/errore dopo ogni operazione | **web-design-guidelines**: `aria-live="polite"` per annunci async |

**Skill applicabili:** `web-design-guidelines`, `building-components` (accessibility.mdx, forms, state.mdx)

---

### 3.4 Pinnare / Spinnare

| Requisito | Descrizione | Skill UX/UI |
|-----------|-------------|-------------|
| **REQ-4.1** | Icona pin (es. `Pin`) su ogni info; stato pinnato vs non pinnato | **web-design-guidelines**: Icon-only button con `aria-label`; `aria-pressed` o `aria-checked` per stato toggle |
| **REQ-4.2** | Clic su pin inverte lo stato; info pinnate sempre in cima | **building-components**: Toggle pattern; feedback visivo immediato |
| **REQ-4.3** | Ordinamento: pinnate per `pinnedAt` DESC, poi non pinnate per `creatoIl` DESC | — |

**Skill applicabili:** `web-design-guidelines`, `building-components` (accessibility.mdx)

---

### 3.5 Permessi e Condivisione

| Requisito | Descrizione | Skill UX/UI |
|-----------|-------------|-------------|
| **REQ-5.1** | Solo utenti autenticati possono vedere e modificare le info | Coerente con `AuthGuard` esistente |
| **REQ-5.2** | Tutti i genitori (utenti) vedono le stesse info; modifiche visibili a tutti | — |

---

## 4. Modifiche Tecniche

### 4.1 Schema Database

| Tabella | Colonne |
|---------|---------|
| **info_importanti** | `id`, `titolo`, `tipo` (enum: scuola, medico, altro), `valore` (JSON o colonne dedicate), `pinned` (boolean), `pinnedAt` (text ISO), `creatoDa` (FK utenti), `creatoIl`, `modificatoIl` |

**Struttura proposta `valore`:**
- **scuola:** `{ telefono: string }`
- **medico:** `{ telefono: string, indirizzo: string }`
- **altro:** `{ contenuto: string }` (o `valore` singolo)

### 4.2 API

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/info-importanti` | GET | Lista info (ordinate: pinnate prima) |
| `/api/info-importanti` | POST | Crea info |
| `/api/info-importanti/[id]` | PATCH | Modifica info |
| `/api/info-importanti/[id]` | DELETE | Elimina info |
| `/api/info-importanti/[id]/pin` | PATCH | Toggle pin |

### 4.3 Componenti e File

| Area | Modifica |
|------|----------|
| **Header calendario** | Aggiungere icona Info Importanti (link o button) in `CalendarHeaderActions` o come elemento separato |
| **Nuova route** | `/info-importanti` (pagina) oppure Sheet laterale (come `EventFormSheet`) |
| **Componenti** | `InfoImportantiList`, `InfoImportantiForm`, `InfoImportantiItem`, `PinButton` |
| **API client** | `src/lib/api/info-importanti-api.ts` |
| **Validazione** | `src/lib/validations/info-importanti.ts` |

---

## 5. Criteri di Accettazione

### Entry Point
- [ ] Icona Info Importanti visibile nell'header della pagina calendario
- [ ] Icona accessibile (aria-label, focus visibile, touch target ≥44px)
- [ ] Clic apre la vista Info Importanti

### Vista e Lista
- [ ] Lista info con titolo, tipo, valore
- [ ] Info pinnate in cima
- [ ] Empty state quando non ci sono info
- [ ] Link `tel:` per numeri e link Google Maps per indirizzi

### CRUD
- [ ] Creazione info con form validato
- [ ] Modifica info con form precompilato
- [ ] Eliminazione con conferma modal
- [ ] Toast di feedback per ogni operazione

### Pin
- [ ] Toggle pin su ogni info
- [ ] Ordinamento corretto (pinnate prima)

---

## 6. Design e UX

### 6.1 Posizionamento Icona

- **Opzione A:** Icona standalone nell'header, tra titolo "Calendario" e menu azioni (nome utente)
- **Opzione B:** Dentro il dropdown menu azioni come voce "Info importanti"
- **Raccomandazione:** Opzione A per visibilità immediata; icona `Info` o `FileText` con badge opzionale se ci sono info pinnate

### 6.2 Vista Info — Sheet vs Pagina

- **Sheet:** Coerente con `EventFormSheet`; apertura laterale senza lasciare il calendario
- **Pagina:** `/info-importanti` — URL dedicato, deep-linkabile, migliore per contenuti lunghi
- **Raccomandazione:** Pagina dedicata per leggibilità e spazio; Sheet per form aggiungi/modifica

### 6.3 Tipi Info — UI

| Tipo | Campi form | Visualizzazione |
|------|------------|-----------------|
| Scuola | Titolo, Telefono | Card con icona; tap su numero → `tel:` |
| Medico | Titolo, Telefono, Indirizzo | Card con icona; tap su numero → `tel:`; tap su indirizzo → Google Maps |
| Altro | Titolo, Contenuto | Card con testo libero; link se URL rilevato |

### 6.4 Accessibilità (da Web Interface Guidelines)

- Icon-only buttons: `aria-label` obbligatorio
- Form: `autocomplete`, `name`, `type` corretti; labels associati
- Focus: `focus-visible:ring-*`, mai `outline-none` senza sostituto
- Animazioni: `prefers-reduced-motion` rispettato
- Contenuti lunghi: `truncate`, `line-clamp`, `break-words`
- Conferma eliminazione: modal obbligatorio

### 6.5 Skill di Riferimento per UX/UI

| Requisito | Skill |
|-----------|-------|
| Icone, bottoni, touch targets | **web-design-guidelines** |
| Form, validazione, labels | **web-design-guidelines**, **building-components** (accessibility.mdx) |
| Modal, Sheet, focus trap | **building-components** (accessibility.mdx — Modal/Dialog pattern) |
| Empty state, liste | **web-design-guidelines** (Content Handling) |
| Link esterni, tel | **web-design-guidelines** |
| Conferma azioni distruttive | **web-design-guidelines** (Navigation & State) |

---

## 7. Fasi di Implementazione

| Fase | Scope | Stimata |
|------|-------|---------|
| **1** | Schema DB, migration, API CRUD base | 1 giorno |
| **2** | Icona entry point + pagina/Sheet lista info | 1 giorno |
| **3** | Form crea/modifica, validazione, integrazione API | 1 giorno |
| **4** | Pin toggle, ordinamento, eliminazione con conferma | 0.5 giorni |
| **5** | Link tel/Maps, empty state, polish UX | 0.5 giorni |

---

## 8. Rischi e Mitigazioni

| Rischio | Mitigazione |
|---------|-------------|
| Troppi tipi di info | MVP con 3 tipi (Scuola, Medico, Altro); estensibile in futuro |
| Indirizzo non valido per Maps | Google Maps accetta query libere; validazione minima |
| Conflitti di modifica simultanea | Last-write-wins; eventuale `modificatoIl` per conflict detection |

---

## 9. Riferimenti Skill

- **web-design-guidelines** — Vercel Web Interface Guidelines (accessibility, forms, touch, focus, content)
- **building-components** — Accessibility (ARIA, keyboard, focus trap), Forms, State
- **architecture-design** — Per struttura API, repository, use cases (opzionale)

---

*Fine PRD*
