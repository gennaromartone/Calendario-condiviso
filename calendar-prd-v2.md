# Calendario Condiviso v2 — Product Requirements Document

## Problem Statement

I genitori separati hanno bisogno di un modo semplice e sicuro per condividere eventi relativi ai propri figli. Attualmente coordinano date di affidamento, appuntamenti scolastici, attività sportive e altri impegni tramite messaggi, email o fogli condivisi, con il rischio di perdere informazioni, conflitti di pianificazione e mancanza di visibilità centralizzata. Serve uno strumento dedicato che permetta di vedere e gestire insieme un calendario condiviso, dove ogni genitore è identificato dalla propria parola d'ordine e può distinguere visivamente i propri eventi di affidamento da quelli dell'altro genitore.

## Solution

Una webapp leggera deployata su Vercel, costruita con Next.js, che offre un calendario condiviso accessibile tramite **parola d'ordine personale**. Ogni genitore ha la propria password: inserendola, il sistema identifica l'utente. Dopo l'accesso, se l'utente non ha ancora un nome salvato, deve sceglierne uno. Sul calendario ogni genitore vede gli eventi di tutti gli utenti. Per gli eventi di tipo **Affidamento**, ogni genitore deve scegliere un colore univoco che differenzia i propri eventi da quelli dell'altro genitore; due genitori non possono avere lo stesso colore.

## Target Audience

Genitori separati che desiderano:
- Condividere date di affidamento (es. "con papà 1–15 del mese", "con mamma 16–30") con distinzione visiva chiara
- Tracciare eventi scolastici (gite, colloqui, vacanze)
- Coordinare attività extrascolastiche (sport, corsi)
- Avere una vista unica e aggiornata degli impegni del bambino, sapendo chi ha creato ogni evento

## User Stories

### Autenticazione e identità
1. *Come genitore, voglio accedere inserendo la mia parola d'ordine personale, così che il sistema sappia chi sono*
2. *Come genitore, dopo il primo accesso voglio scegliere un nome da visualizzare, così che gli altri possano identificarmi sul calendario*
3. *Come genitore, se ho già un nome salvato, voglio accedere direttamente al calendario senza passaggi aggiuntivi*

### Calendario e eventi
4. *Come genitore, voglio vedere sul calendario gli eventi di tutti gli utenti, così da avere una vista completa degli impegni*
5. *Come genitore, voglio creare eventi (titolo, data, ora, descrizione, tipo), così da condividere informazioni sul bambino*
6. *Come genitore, voglio modificare i miei eventi esistenti, così da aggiornare date o dettagli se cambiano*
7. *Come genitore, voglio eliminare i miei eventi, così da rimuovere informazioni non più valide*
8. *Come genitore, voglio visualizzare il calendario in vista mensile/settimanale, così da pianificare facilmente*
9. *Come genitore, voglio distinguere tipi di eventi (affidamento, scuola, sport, altro), così da capire rapidamente la natura dell'impegno*

### Affidamento e colori
10. *Come genitore, quando creo eventi di tipo Affidamento voglio che abbiano un colore univoco che mi identifica, così da distinguerli visivamente da quelli dell'altro genitore*
11. *Come genitore, voglio scegliere il mio colore per gli eventi Affidamento al primo utilizzo, così che non sia uguale a quello dell'altro genitore*
12. *Come genitore, voglio che il sistema impedisca di scegliere un colore già usato da un altro genitore, così da evitare confusione*

### Admin
13. *Come admin, voglio creare gli account dei genitori (parola d'ordine per ciascuno), così che possano accedere al calendario*
14. *Come admin, voglio gestire gli utenti esistenti (modifica password, ecc.) se necessario*

## Implementation Decisions

### Stack e deployment
- **Framework**: Next.js (App Router)
- **UI Components**: shadcn/ui
- **Hosting**: Vercel
- **Repository**: GitHub

### Modello dati

#### Tabella `utenti`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | text (UUID) | Chiave primaria |
| passwordHash | text | Hash bcrypt/argon2 della parola d'ordine |
| nome | text (nullable) | Nome scelto dall'utente (es. "Papà", "Mamma") |
| affidamentoColore | text (nullable) | Colore hex per eventi Affidamento (es. "#3B82F6") |
| creatoIl | text (ISO) | Data creazione |
| modificatoIl | text (ISO) | Data ultima modifica |

- **Vincolo**: `affidamentoColore` deve essere univoco tra gli utenti (due genitori non possono avere lo stesso colore).
- **Palette colori Affidamento**: insieme predefinito di colori (es. 8–12) tra cui scegliere; l'utente ne seleziona uno non ancora assegnato.

#### Tabella `eventi`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | text (UUID) | Chiave primaria |
| titolo | text | Titolo evento |
| descrizione | text | Descrizione opzionale |
| dataInizio | text (ISO) | Data/ora inizio |
| dataFine | text (ISO) | Data/ora fine |
| tipo | enum | affidamento \| scuola \| sport \| altro |
| creatoDa | text (FK → utenti.id) | **Obbligatorio**: utente che ha creato l'evento |
| creatoIl | text (ISO) | Data creazione |
| modificatoIl | text (ISO) | Data ultima modifica |

- Per eventi di tipo **Affidamento**, il colore visualizzato è `utenti.affidamentoColore` dell'utente `creatoDa`.
- Per altri tipi (scuola, sport, altro), si usano colori fissi per tipo come oggi.

#### Tabella `config` (semplificata)
- Mantenere solo per eventuali impostazioni globali (es. "primo setup completato").
- La password condivisa singola viene rimossa; l'autenticazione è per utente.

### Flusso di autenticazione

1. **Login**: utente inserisce la propria parola d'ordine.
2. **Verifica**: il sistema cerca un utente con password corrispondente.
3. **Se non trovato**: messaggio "Parola d'ordine non riconosciuta".
4. **Se trovato**:
   - **Se `nome` è null**: redirect a `/scegli-nome` (o step nel flusso di login).
   - **Se `affidamentoColore` è null** e l'utente crea il primo evento Affidamento: mostrare modale/schermata per scegliere il colore (tra quelli non ancora assegnati).
   - **Altrimenti**: redirect a `/calendar`.
5. **Sessione**: salvare `userId` (e eventualmente `nome`) in sessione/cookie.

### Flusso "Scegli nome"
- Pagina o modale con campo "Come vuoi essere chiamato?" (es. "Papà", "Mamma", "Marco").
- Salvataggio in `utenti.nome` → redirect al calendario.

### Flusso "Scegli colore Affidamento"
- Mostrato quando l'utente crea il primo evento di tipo Affidamento e non ha ancora `affidamentoColore`.
- Griglia di colori disponibili (esclusi quelli già assegnati ad altri utenti).
- Selezione obbligatoria prima di procedere con la creazione dell'evento.
- Salvataggio in `utenti.affidamentoColore` → creazione evento con quel colore.

### Moduli principali
- **Auth module**: login per password (identificazione utente), gestione sessione, flusso nome/colore
- **Users module**: CRUD utenti (admin), scelta nome, scelta colore Affidamento
- **Calendar module**: visualizzazione calendario (mensile/settimanale), rendering eventi con colori per tipo e per utente (Affidamento)
- **Events module**: CRUD eventi (create, read, update, delete), vincolo creatoDa = utente loggato per modifica/eliminazione
- **Admin module**: creazione utenti (password per ciascuno), gestione utenti

### Permessi
- **Lettura eventi**: tutti gli utenti autenticati vedono tutti gli eventi.
- **Creazione eventi**: tutti gli utenti autenticati possono creare eventi.
- **Modifica/eliminazione**: solo l'utente che ha creato l'evento (`creatoDa`) può modificarlo o eliminarlo.
- **Admin**: accesso a `/admin` per gestione utenti (protezione con password admin o primo utente).

### API e routing
- `POST /api/auth/login` — body: `{ password }` → identifica utente, ritorna `{ userId, needsName, needsAffidamentoColor }` e imposta sessione
- `POST /api/auth/complete-profile` — body: `{ nome?, affidamentoColore? }` — completa profilo utente
- `GET /api/events` — lista eventi (tutti, per tutti gli utenti)
- `POST /api/events` — crea evento (creatoDa = userId da sessione)
- `PATCH /api/events/[id]` — modifica evento (solo se creatoDa = userId)
- `DELETE /api/events/[id]` — elimina evento (solo se creatoDa = userId)
- `GET /api/users/colors-available` — colori Affidamento non ancora assegnati (per scelta colore)
- Admin: `POST /api/admin/users` — crea utente con password

### Interfacce
- **Login**: campo password, pulsante "Accedi" — nessun campo email/nome
- **Scegli nome**: campo "Come vuoi essere chiamato?", pulsante "Continua"
- **Scegli colore Affidamento**: griglia colori disponibili, pulsante "Conferma"
- **Calendario**: vista mensile/settimanale, eventi con colore per tipo; per Affidamento, colore dell'utente creatore
- **Dettaglio evento**: mostra creatore (nome) e tipo; pulsanti modifica/elimina solo se creatore
- **Form evento**: titolo, data, ora, tipo, descrizione (come oggi)

## Testing Decisions

### Criteri di buon test
- Verificare il comportamento esterno (UX, flussi utente), non l'implementazione
- Test E2E con Playwright per i percorsi critici

### Moduli da testare
- **Login**: password errata → messaggio errore; password corretta → redirect (calendario o scegli-nome)
- **Scegli nome**: inserimento nome → salvataggio → redirect al calendario
- **Scegli colore Affidamento**: primo evento Affidamento senza colore → modale scelta → colore salvato → evento creato
- **Colori univoci**: secondo utente non può scegliere il colore del primo
- **CRUD eventi**: creazione, modifica, eliminazione (solo propri eventi)
- **Visualizzazione**: eventi di tutti gli utenti visibili; colori Affidamento corretti per creatore

### Priorità
- E2E: login, scegli nome, scegli colore, CRUD eventi, visualizzazione calendario con colori

## Requisiti UX/UI

### Linee guida
- **Accessibilità**: contrasto 4.5:1, focus visibili, aria-label su pulsanti icon-only, semantic HTML, skip link
- **Form**: label su tutti i campi, messaggi di errore inline, autocomplete appropriato
- **Touch**: target minimo 44×44px, touch-action: manipulation
- **Animazioni**: rispettare prefers-reduced-motion, usare transform/opacity
- **Tipografia**: font distintivi, line-height 1.5–1.75
- **Layout**: responsive (375px, 768px, 1024px, 1440px)
- **Design**: coerente con contesto famiglia/bambini, evitare estetica generica

### Colori Affidamento
- Palette predefinita: 8–12 colori distinti e accessibili (contrasto sufficiente su sfondo chiaro/scuro)
- Esempi: blu, verde, viola, arancione, rosa, teal, indaco, ambra
- Ogni colore deve essere chiaramente distinguibile dall'altro

## Out of Scope (per questa versione)

- Registrazione utenti con email
- Notifiche push o email
- Integrazione con calendari esterni (Google, Apple)
- App mobile nativa (solo web responsive)
- Supporto multilingua
- Più di 2 genitori con colori Affidamento (MVP: 2 genitori; estensione futura possibile)
- Modifica/eliminazione eventi da parte di altri utenti (solo creatore)

## Metriche di Successo

1. **Pubblicazione**: Webapp live su dominio pubblico (Vercel)
2. **Identificazione**: Ogni genitore accede con la propria password e viene identificato
3. **Profilo**: Nome e colore Affidamento salvati e utilizzati correttamente
4. **Visibilità**: Eventi di tutti gli utenti visibili sul calendario
5. **Distinzione**: Eventi Affidamento colorati per creatore, colori univoci tra genitori
6. **Qualità**: Funzionalità principali verificate da test E2E Playwright

## Migration Notes

- **Da v1 a v2**: migrazione da `config.passwordHash` (singola) a tabella `utenti` con password per utente
- **Eventi esistenti**: `creatoDa` era opzionale; per eventi legacy assegnare a un utente "migrato" o chiedere all'admin di riassegnare
- **Admin**: definire come creare i primi utenti (pagina admin con "Aggiungi genitore" → password)

## Further Notes

- Le password vanno gestite con hash sicuro (bcrypt/argon2)
- Rate limiting sulla pagina di login per mitigare brute-force
- Per MVP: un solo calendario condiviso tra gli utenti; espansione multi-calendario possibile in futuro
- La scelta del colore Affidamento può essere modificabile in seguito (es. da impostazioni profilo), mantenendo l'univocità
