# Plan: Festività e Luogo Eventi

> Source PRD: [PRD-festivita-e-luogo.md](./PRD-festivita-e-luogo.md)  
> Tickets (granular): [TICKETS-festivita-e-luogo.md](./TICKETS-festivita-e-luogo.md)

## Architectural decisions

Durable decisions that apply across all phases:

- **Schema**: Colonna `luogo` opzionale (text, max 500) nella tabella `eventi`. Nessuna tabella per festività (dati statici in codice).
- **Holidays module**: `src/lib/holidays.ts` con `getHolidaysForDate`, `getHolidaysForMonth`. Paesi: `'IT' | 'DE'`. Lista statica + calcolo Pasqua.
- **Google Maps URL**: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(luogo)}` per link esterno.
- **Festività UI**: Sfondo distintivo (amber/rose), icona PartyPopper, tooltip con nome. Non sono eventi, solo styling celle.

---

## Phase 1: Festività — Vista mensile

**User stories**: Contesto visivo — vedere subito quali giorni sono festivi (IT/DE) nella vista mensile.

### What to build

Un vertical slice completo: modulo holidays + integrazione nelle celle della griglia mensile. L’utente apre il calendario in vista mese e vede le celle dei giorni festivi con sfondo diverso, icona e tooltip. Nessun evento creato, nessuna persistenza. Festività IT e DE mostrate insieme.

### Acceptance criteria

- [ ] Modulo `holidays` espone `getHolidaysForDate` e `getHolidaysForMonth` per IT e DE
- [ ] Pasqua e festività mobili calcolate correttamente
- [ ] Celle festive in MonthlyGrid hanno sfondo distintivo (light + dark)
- [ ] Icona PartyPopper e tooltip con nome festività visibili
- [ ] Nessun impatto performance (memo o pre-calcolo per mese)
- [ ] Giorni fuori mese gestiti in modo coerente

---

## Phase 2: Festività — Vista settimanale

**User stories**: Contesto visivo — vedere festività anche nella vista settimana.

### What to build

Estendere la UI festività alla WeeklyGrid. Stessa logica di Phase 1: celle festive con sfondo, icona, tooltip. Riutilizza il modulo holidays già presente.

### Acceptance criteria

- [ ] Celle festive in WeeklyGrid hanno stessa UI di MonthlyGrid
- [ ] Tooltip mostra nome festività al passaggio del mouse

---

## Phase 3: Luogo evento — End-to-end

**User stories**: Navigazione — associare un luogo all’evento e aprirlo su Google Maps.

### What to build

Vertical slice completo: schema DB, migrazione, validazione API, form, dettaglio. L’utente può inserire un luogo (opzionale) in creazione/modifica evento, salvarlo, e nel dettaglio cliccare per aprire Google Maps in nuova scheda. Eventi senza luogo non mostrano la sezione.

### Acceptance criteria

- [ ] Colonna `luogo` in `eventi`, migrazione applicata senza perdita dati
- [ ] API GET/POST/PATCH include `luogo`; validazione `z.string().max(500).optional()`
- [ ] EventForm ha campo "Luogo (opzionale)" con placeholder appropriato
- [ ] EventDetailSheet mostra sezione Luogo con link a Google Maps solo se valorizzato
- [ ] Link apre Maps in nuova scheda con `target="_blank" rel="noopener noreferrer"`
- [ ] Accessibilità: `aria-label="Apri posizione su Google Maps"`

---

## Phase 4a: (Opzionale) Icona MapPin in EventBlock

**User stories**: Indicatore visivo in griglia — sapere che un evento ha luogo senza aprire il dettaglio.

### What to build

Nella griglia calendario, se l’evento ha `luogo`, mostrare una piccola icona MapPin accanto al badge tipo. Non modifica il flusso di click (apre sempre il dettaglio).

### Acceptance criteria

- [ ] Icona MapPin visibile in EventBlock quando `luogo` presente
- [ ] Layout esistente non compromesso

---

## Phase 4b: (Opzionale) Impostazione paese festività

**User stories**: Personalizzazione — scegliere quali paesi mostrare (IT, DE, entrambi).

### What to build

UI per selezionare paesi festività. Persistenza in config o localStorage. Le griglie leggono la preferenza e filtrano le festività mostrate.

### Acceptance criteria

- [ ] UI per selezionare IT, DE o entrambi
- [ ] Scelta persistita e applicata a MonthlyGrid e WeeklyGrid

---

## Dipendenze tra fasi

```
Phase 1 (Festività mensile) ──► Phase 2 (Festività settimana) ──► Phase 4b (opz.)
        │
        └── (indipendente)

Phase 3 (Luogo end-to-end) ──► Phase 4a (MapPin opz.)
```

Phase 1 e Phase 3 possono essere sviluppate in parallelo.
