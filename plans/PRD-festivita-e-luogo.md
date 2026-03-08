# PRD: Festività e Luogo Eventi

**Prodotto:** Calendario Condiviso  
**Versione:** 1.0  
**Data:** 8 marzo 2025  
**Autore:** Product Requirements Document

---

## 1. Panoramica

Questo PRD definisce due nuove funzionalità per il Calendario Condiviso:

1. **Festività (Italia e Germania)** — Visualizzazione delle festività nazionali direttamente nelle celle del calendario, con UI dedicata (non come eventi).
2. **Luogo evento** — Campo opzionale per associare un indirizzo/luogo agli eventi, con link a Google Maps.

---

## 2. Obiettivi

| Obiettivo | Descrizione |
|-----------|-------------|
| **Contesto visivo** | Permettere agli utenti di vedere subito quali giorni sono festivi (IT/DE) senza creare eventi dedicati |
| **Navigazione** | Facilitare la pianificazione con la possibilità di aprire la posizione dell'evento su Google Maps |
| **Coerenza UX** | Mantenere l'esperienza attuale: festività come sfondo visivo, non come eventi cliccabili |

---

## 3. Requisiti Funzionali

### 3.1 Festività (Italia e Germania)

#### 3.1.1 Comportamento

- Le festività **non** sono eventi: non compaiono nella lista eventi, non sono modificabili/eliminabili.
- Le celle dei giorni festivi hanno una **UI diversa** rispetto ai giorni normali.
- Supporto per **Italia** e **Germania** (entrambe le liste sempre visibili, o selezione paese in impostazioni — vedi decisione architetturale).

#### 3.1.2 UI della cella giorno

| Elemento | Giorno normale | Giorno festivo |
|----------|----------------|----------------|
| Sfondo cella | `bg-card` (o default) | Sfondo distintivo (es. `bg-amber-50/80` light, `bg-amber-950/20` dark) |
| Numero giorno | `font-medium text-foreground` | Stesso stile o leggermente attenuato |
| Indicatore festività | — | Icona piccola (es. `PartyPopper`, `Gift`) + tooltip con nome festività |
| Bordi/evidenzia | Bordi standard | Opzionale: bordo sottile colorato o badge minimale |

**Esempio wireframe cella festiva:**
```
┌─────────────────────┐
│ 25  🎉              │  ← numero + icona
│                     │
│ [EventBlock 1]      │
│ [EventBlock 2]      │  ← eventi utente sopra lo sfondo festivo
└─────────────────────┘
Tooltip: "Natale"
```

#### 3.1.3 Elenco festività

**Italia (fisse + mobili):**
- Capodanno (1 gen), Epifania (6 gen), Liberazione (25 apr), Festa del Lavoro (1 mag), Festa della Repubblica (2 giu), Ferragosto (15 ago), Ognissanti (1 nov), Immacolata (8 dic), Natale (25 dic), S. Stefano (26 dic)
- Pasqua e Lunedì dell'Angelo (calcolo mobile)

**Germania (fisse + mobili):**
- Neujahr (1 gen), Heilige Drei Könige (6 gen), Karfreitag, Ostermontag, Christi Himmelfahrt, Pfingstmontag (mobili), Tag der Arbeit (1 mag), Tag der Deutschen Einheit (3 ott), Reformationstag (31 ott, alcuni Länder), Allerheiligen (1 nov, alcuni Länder), Weihnachten (25-26 dic)
- Nota: alcune festività sono solo in certi Länder; per MVP si può usare un set "nazionale" semplificato.

#### 3.1.4 Implementazione dati

- **Opzione A (consigliata):** Lista statica in codice (JSON/TS) con date fisse e funzione per Pasqua (algoritmo Gauss o libreria `date-fns`/`@date/holidays`).
- **Opzione B:** API esterna (es. date.nager.at) — introduce dipendenza e latenza.
- **Opzione C:** Tabella DB `festivita` — overkill per dati statici.

**Raccomandazione:** Opzione A con modulo `src/lib/holidays.ts` che espone `getHolidaysForDate(date: Date, country: 'IT' | 'DE'): { name: string; nameDe?: string }[]`.

#### 3.1.5 Selezione paese

- **MVP:** Mostrare sempre IT + DE (entrambe le festività nella stessa cella se coincidono).
- **Fase 2:** Impostazione utente o famiglia per scegliere quali paesi mostrare (IT, DE, entrambi).

---

### 3.2 Luogo evento

#### 3.2.1 Comportamento

- Campo **opzionale** "Luogo" negli eventi.
- L'utente inserisce un indirizzo o nome luogo (es. "Piazza Duomo, Milano" o "Palestra Comunale").
- In visualizzazione (dettaglio evento, eventuale anteprima in EventBlock) il luogo è **cliccabile** e apre Google Maps.

#### 3.2.2 Formato e validazione

- **Tipo:** stringa libera (max 500 caratteri).
- **Validazione:** nessun formato obbligatorio; l'utente può inserire indirizzo, nome luogo o coordinate.
- **Google Maps URL:** `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(luogo)}` — funziona con indirizzi, nomi e coordinate.

#### 3.2.3 UI

| Dove | Comportamento |
|------|---------------|
| **EventForm** | Campo input "Luogo (opzionale)" con placeholder "Es. Via Roma 1, Milano" |
| **EventDetailSheet** | Sezione "Luogo" con link esterno (icona MapPin) che apre Google Maps in nuova scheda |
| **EventBlock** (griglia) | Opzionale: icona MapPin piccola se `luogo` presente (fase 2) |

**Accessibilità:** Link con `aria-label="Apri posizione su Google Maps"` e `target="_blank" rel="noopener noreferrer"`.

---

## 4. Modifiche Tecniche

### 4.1 Festività

| Area | Modifica |
|------|----------|
| **Nuovo modulo** | `src/lib/holidays.ts` — funzioni `getHolidaysForDate`, `getHolidaysForMonth`, lista festività IT/DE |
| **monthly-grid.tsx** | Per ogni cella: chiamare `getHolidaysForDate(date)` e applicare classi/icona se `holidays.length > 0` |
| **weekly-grid.tsx** | Stessa logica per le celle della settimana |
| **calendar-utils.ts** | Eventualmente `isHoliday(dateKey, country)` per coerenza |
| **Tailwind** | Classi per sfondo festivo (es. `holiday-cell`) |

### 4.2 Luogo evento

| Area | Modifica |
|------|----------|
| **DB schema** | Aggiungere colonna `luogo text("luogo")` a `eventi` |
| **Migration** | `drizzle-kit generate` + `drizzle-kit migrate` |
| **Validazione** | `createEventSchema` e `eventFormSchema`: campo `luogo` opzionale, `z.string().max(500).optional()` |
| **API** | Route `events`: includere `luogo` in GET/POST/PATCH |
| **EventForm** | Nuovo `FormField` per `luogo` |
| **EventDetailSheet** | Sezione Luogo con link a Google Maps |
| **EventRecord / calendar-utils** | Estendere tipo con `luogo?: string` |
| **eventFormToApiPayload** | Mappare `luogo` nel payload |

---

## 5. Criteri di Accettazione

### Festività

- [ ] Le celle dei giorni festivi italiani hanno UI diversa (sfondo + icona)
- [ ] Le celle dei giorni festivi tedeschi hanno UI diversa (o combinata con IT)
- [ ] Tooltip mostra il nome della festività al passaggio del mouse
- [ ] Pasqua e festività mobili sono calcolate correttamente
- [ ] I giorni fuori mese (griglia mensile) non mostrano festività o le mostrano con stile coerente
- [ ] Nessun impatto sulle performance (calcolo festività in memo o pre-calcolato per il mese)

### Luogo evento

- [ ] Il form di creazione/modifica evento include il campo "Luogo"
- [ ] Il dettaglio evento mostra il luogo e un link che apre Google Maps
- [ ] Il link apre Google Maps in nuova scheda con query corretta
- [ ] Eventi senza luogo non mostrano la sezione Luogo
- [ ] Migrazione DB applicata senza perdita dati

---

## 6. Design e UX

### 6.1 Festività — Proposta visiva

- **Light mode:** Sfondo `amber-50` o `rose-50` per le celle festive
- **Dark mode:** Sfondo `amber-950/20` o `rose-950/20`
- **Icona:** `PartyPopper` (lucide-react) 14px, posizionata accanto al numero del giorno
- **Tooltip:** Nome festività in italiano o tedesco a seconda del paese

### 6.2 Luogo — Proposta visiva

- **Dettaglio:** Riga "Luogo" con icona `MapPin`, testo del luogo come link sottolineato al hover
- **Colore link:** `text-primary` con `hover:underline`

---

## 7. Fasi di Implementazione

| Fase | Scope | Stimata |
|------|-------|---------|
| **1** | Modulo holidays + UI celle (IT+DE) | 1–2 giorni |
| **2** | Campo luogo: schema, API, form, dettaglio | 1 giorno |
| **3** | (Opzionale) Icona luogo in EventBlock | 0.5 giorni |
| **4** | (Opzionale) Impostazione paese festività | 0.5 giorni |

---

## 8. Rischi e Mitigazioni

| Rischio | Mitigazione |
|---------|-------------|
| Festività regionali (DE) | MVP con solo festività nazionali; documentare estensione futura |
| Indirizzo non trovato su Maps | Google Maps gestisce query libere; l'utente può correggere |
| Conflitto festività IT+DE stesso giorno | Mostrare entrambi i nomi nel tooltip, separati da " / " |

---

## 9. Riferimenti

- [date-fns](https://date-fns.org/) — già in uso per date
- [Google Maps URL](https://developers.google.com/maps/documentation/urls/get-started) — `search` URL
- [Nager.Date API](https://date.nager.at/) — eventuale fonte esterna festività (non obbligatoria)
- Calendario civile Italia: [Wikipedia](https://it.wikipedia.org/wiki/Festivit%C3%A0_in_Italia)
- Feiertage Deutschland: [Wikipedia](https://de.wikipedia.org/wiki/Gesetzliche_Feiertage_in_Deutschland)

---

## 10. Appendice — Struttura file holidays

```ts
// src/lib/holidays.ts (struttura proposta)

export type HolidayCountry = 'IT' | 'DE';

export interface Holiday {
  name: string;      // IT: "Natale", DE: "Weihnachten"
  nameDe?: string;   // per IT: eventuale nome tedesco se utile
}

export function getEasterSunday(year: number): Date;
export function getHolidaysForDate(date: Date, countries?: HolidayCountry[]): Holiday[];
export function getHolidaysForMonth(year: number, month: number, countries?: HolidayCountry[]): Map<string, Holiday[]>;
```

---

*Fine PRD*
