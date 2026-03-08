# Tickets: Festività e Luogo Eventi

**PRD di riferimento:** [PRD-festivita-e-luogo.md](./PRD-festivita-e-luogo.md)  
**Plan (vertical slices):** [festivita-e-luogo.md](./festivita-e-luogo.md)

---

## Legenda relazioni

- **Blocca:** questo ticket deve essere completato prima che altri possano procedere
- **Bloccato da:** questo ticket non può iniziare finché i ticket indicati non sono completati
- **Skills:** skill globali da usare (`npx skills add <owner/repo@skill>` se non installate)

---

## Epic A: Festività (Italia e Germania)

### T-A1 — Modulo holidays

| Campo | Valore |
|-------|--------|
| **ID** | T-A1 |
| **Titolo** | Creare modulo `src/lib/holidays.ts` con festività IT e DE |
| **Descrizione** | Implementare il modulo che espone `getEasterSunday`, `getHolidaysForDate`, `getHolidaysForMonth`. Includere tutte le festività fisse e mobili per Italia e Germania (set nazionale semplificato per DE). |
| **Blocca** | T-A2, T-A3 |
| **Bloccato da** | — |
| **Skills** | `tdd` (test per calcolo Pasqua e festività mobili) |
| **Criteri di accettazione** | [ ] `getHolidaysForDate(date, ['IT','DE'])` restituisce le festività per quella data<br>[ ] Pasqua e festività mobili calcolate correttamente<br>[ ] `getHolidaysForMonth` restituisce `Map<string, Holiday[]>` per ottimizzare il rendering |
| **Stima** | 0.5–1 giorno |

---

### T-A2 — UI festività in MonthlyGrid

| Campo | Valore |
|-------|--------|
| **ID** | T-A2 |
| **Titolo** | Applicare UI festività alle celle di MonthlyGrid |
| **Descrizione** | Per ogni cella del mese: chiamare `getHolidaysForDate` (o usare dati pre-calcolati da `getHolidaysForMonth`), applicare sfondo distintivo, icona PartyPopper, tooltip con nome festività. Gestire giorni fuori mese in modo coerente. |
| **Blocca** | T-A4 |
| **Bloccato da** | T-A1 |
| **Skills** | `shadcn` (Tooltip), `building-components`, `vercel-react-best-practices` (memo, performance), `web-design-guidelines` (accessibilità tooltip) |
| **Criteri di accettazione** | [ ] Celle festive hanno sfondo amber/rose (light + dark)<br>[ ] Icona + tooltip visibili<br>[ ] Nessun impatto performance (memo o pre-calcolo per mese)<br>[ ] Giorni fuori mese: stile coerente o nessuna festività |
| **Stima** | 0.5 giorno |

---

### T-A3 — UI festività in WeeklyGrid

| Campo | Valore |
|-------|--------|
| **ID** | T-A3 |
| **Titolo** | Applicare UI festività alle celle di WeeklyGrid |
| **Descrizione** | Stessa logica di T-A2 per la vista settimanale: sfondo, icona, tooltip per i giorni festivi. |
| **Blocca** | T-A4 |
| **Bloccato da** | T-A1 |
| **Skills** | `shadcn`, `building-components`, `vercel-react-best-practices`, `web-design-guidelines` |
| **Criteri di accettazione** | [ ] Celle festive in vista settimana hanno stessa UI di MonthlyGrid<br>[ ] Tooltip mostra nome festività |
| **Stima** | 0.25 giorno |

---

### T-A4 — (Opzionale) Impostazione paese festività

| Campo | Valore |
|-------|--------|
| **ID** | T-A4 |
| **Titolo** | Impostazione utente per scegliere paesi festività (IT, DE, entrambi) |
| **Descrizione** | Fase 2: permettere all'utente di selezionare quali paesi mostrare. Richiede persistenza (config/DB o localStorage). |
| **Blocca** | — |
| **Bloccato da** | T-A2, T-A3 |
| **Skills** | `shadcn` (Select, RadioGroup), `building-components`, `vercel-react-best-practices` |
| **Criteri di accettazione** | [ ] UI per selezionare IT, DE o entrambi<br>[ ] Scelta persistita e applicata alle griglie |
| **Stima** | 0.5 giorno |

---

## Epic B: Luogo evento

### T-B1 — Schema DB e migrazione luogo

| Campo | Valore |
|-------|--------|
| **ID** | T-B1 |
| **Titolo** | Aggiungere colonna `luogo` alla tabella `eventi` |
| **Descrizione** | Modificare `db/schema.ts`: aggiungere `luogo text("luogo")` a `eventi`. Generare e applicare migrazione Drizzle. |
| **Blocca** | T-B2, T-B3 |
| **Bloccato da** | — |
| **Skills** | `tdd` (verifica migrazione, rollback) |
| **Criteri di accettazione** | [ ] Colonna `luogo` presente nello schema<br>[ ] Migrazione applicata senza perdita dati<br>[ ] Colonna nullable/opzionale |
| **Stima** | 0.25 giorno |

---

### T-B2 — API e validazione luogo

| Campo | Valore |
|-------|--------|
| **ID** | T-B2 |
| **Titolo** | Includere `luogo` in validazione e route API events |
| **Descrizione** | Aggiornare `createEventSchema`, `updateEventSchema`, `eventFormSchema` con `luogo` opzionale (max 500). Route GET/POST/PATCH events: leggere e scrivere `luogo`. |
| **Blocca** | T-B4, T-B5, T-B6 |
| **Bloccato da** | T-B1 |
| **Skills** | `tdd` (test validazione Zod, API), `vercel-react-best-practices` (data fetching) |
| **Criteri di accettazione** | [ ] `luogo` in payload create/update<br>[ ] GET events restituisce `luogo`<br>[ ] Validazione `z.string().max(500).optional()` |
| **Stima** | 0.25 giorno |

---

### T-B3 — EventRecord e eventFormToApiPayload

| Campo | Valore |
|-------|--------|
| **ID** | T-B3 |
| **Titolo** | Estendere EventRecord e eventFormToApiPayload con `luogo` |
| **Descrizione** | Aggiungere `luogo?: string` al tipo EventRecord in `calendar-utils.ts` e in `api.ts`. Aggiornare `eventFormToApiPayload` per mappare il campo `luogo` dal form. |
| **Blocca** | T-B4, T-B5 |
| **Bloccato da** | T-B1 |
| **Skills** | `vercel-react-best-practices` (type safety, data flow) |
| **Criteri di accettazione** | [ ] EventRecord include `luogo`<br>[ ] eventFormToApiPayload mappa `luogo`<br>[ ] EventFormValues include `luogo` |
| **Stima** | 0.25 giorno |

---

### T-B4 — Campo Luogo in EventForm

| Campo | Valore |
|-------|--------|
| **ID** | T-B4 |
| **Titolo** | Aggiungere campo Luogo al form di creazione/modifica evento |
| **Descrizione** | Nuovo FormField con label "Luogo (opzionale)", placeholder "Es. Via Roma 1, Milano". Input text. |
| **Blocca** | — |
| **Bloccato da** | T-B2, T-B3 |
| **Skills** | `shadcn` (Input, Form), `building-components`, `vercel-react-best-practices` |
| **Criteri di accettazione** | [ ] Campo visibile in create e edit<br>[ ] Valore salvato e caricato correttamente<br>[ ] Opzionale, nessun errore se vuoto |
| **Stima** | 0.25 giorno |

---

### T-B5 — Luogo e link Google Maps in EventDetailSheet

| Campo | Valore |
|-------|--------|
| **ID** | T-B5 |
| **Titolo** | Mostrare luogo e link a Google Maps nel dettaglio evento |
| **Descrizione** | Sezione "Luogo" con icona MapPin. Se `luogo` presente: link cliccabile che apre `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(luogo)}` in nuova scheda. `target="_blank" rel="noopener noreferrer"`, `aria-label="Apri posizione su Google Maps"`. Se assente: non mostrare la sezione. |
| **Blocca** | T-B6 |
| **Bloccato da** | T-B2, T-B3 |
| **Skills** | `shadcn`, `building-components`, `web-design-guidelines` (accessibilità link esterni) |
| **Criteri di accettazione** | [ ] Sezione Luogo visibile solo se `luogo` valorizzato<br>[ ] Link apre Google Maps in nuova scheda<br>[ ] Accessibilità corretta |
| **Stima** | 0.25 giorno |

---

### T-B6 — (Opzionale) Icona MapPin in EventBlock

| Campo | Valore |
|-------|--------|
| **ID** | T-B6 |
| **Titolo** | Mostrare icona MapPin in EventBlock quando l'evento ha luogo |
| **Descrizione** | Fase 2: nella griglia, se l'evento ha `luogo`, mostrare una piccola icona MapPin (es. accanto al badge tipo). Opzionale: il click potrebbe aprire Maps o il dettaglio. |
| **Blocca** | — |
| **Bloccato da** | T-B5 |
| **Skills** | `shadcn`, `building-components`, `vercel-react-best-practices` |
| **Criteri di accettazione** | [ ] Icona MapPin visibile quando `luogo` presente<br>[ ] Non rompe layout esistente |
| **Stima** | 0.25 giorno |

---

## Diagramma dipendenze

```
Epic A (Festività):
  T-A1 ──┬──► T-A2 ──┐
         │           ├──► T-A4 (opzionale)
         └──► T-A3 ──┘

Epic B (Luogo):
  T-B1 ──┬──► T-B2 ──┬──► T-B4
         │           └──► T-B5 ──► T-B6 (opzionale)
         └──► T-B3 ──┬──► T-B4
                     └──► T-B5
```

---

## Ordine di esecuzione suggerito

Le due epic possono procedere in parallelo. All'interno di ogni epic:

**Epic A:** T-A1 → (T-A2 ∥ T-A3) → T-A4  
**Epic B:** T-B1 → (T-B2 ∥ T-B3) → (T-B4 ∥ T-B5) → T-B6

---

## Riepilogo ticket

| ID | Titolo | Epic | Bloccato da | Stima |
|----|--------|------|-------------|-------|
| T-A1 | Modulo holidays | Festività | — | 0.5–1 d |
| T-A2 | UI festività MonthlyGrid | Festività | T-A1 | 0.5 d |
| T-A3 | UI festività WeeklyGrid | Festività | T-A1 | 0.25 d |
| T-A4 | Impostazione paese | Festività | T-A2, T-A3 | 0.5 d |
| T-B1 | Schema DB luogo | Luogo | — | 0.25 d |
| T-B2 | API e validazione luogo | Luogo | T-B1 | 0.25 d |
| T-B3 | EventRecord + payload | Luogo | T-B1 | 0.25 d |
| T-B4 | Campo Luogo in EventForm | Luogo | T-B2, T-B3 | 0.25 d |
| T-B5 | Luogo + link Maps in DetailSheet | Luogo | T-B2, T-B3 | 0.25 d |
| T-B6 | Icona MapPin in EventBlock | Luogo | T-B5 | 0.25 d |

---

## Skills usate (installazione globale)

| Skill | Uso nei ticket |
|-------|----------------|
| `tdd` | T-A1, T-B1, T-B2 — test calcolo festività, migrazione DB, validazione API |
| `shadcn` | T-A2, T-A3, T-A4, T-B4, T-B5, T-B6 — Tooltip, Input, Form, Select |
| `building-components` | T-A2, T-A3, T-A4, T-B4, T-B5, T-B6 — componenti accessibili, composizione |
| `vercel-react-best-practices` | T-A2, T-A3, T-A4, T-B2, T-B3, T-B4, T-B6 — memo, performance, data flow |
| `web-design-guidelines` | T-A2, T-A3, T-B5 — accessibilità tooltip e link esterni |

**Installazione:** `npx skills find <nome>` per trovare il comando, oppure `npx skills add <owner/repo@skill> -g -y`  
**Verifica:** `ls ~/.agents/skills/`
