# Calendario Condiviso — Product Requirements Document

## Problem Statement

I genitori separati hanno bisogno di un modo semplice e sicuro per condividere eventi relativi ai propri figli. Attualmente coordinano date di affidamento, appuntamenti scolastici, attività sportive e altri impegni tramite messaggi, email o fogli condivisi, con il rischio di perdere informazioni, conflitti di pianificazione e mancanza di visibilità centralizzata. Serve uno strumento dedicato che permetta di vedere e gestire insieme un calendario condiviso senza richiedere account complessi o procedure di registrazione.

## Solution

Una webapp leggera deployata su Vercel, costruita con Next.js, che offre un calendario condiviso accessibile tramite parola d'ordine scelta dall'amministratore. I genitori accedono inserendo la parola d'ordine, visualizzano il calendario e possono creare, modificare ed eliminare eventi relativi al bambino. Nessuna registrazione utente: l'accesso è basato sulla conoscenza della parola d'ordine.

## Target Audience

Genitori separati che desiderano:
- Condividere date di affidamento (es. "con papà 1–15 del mese", "con mamma 16–30")
- Tracciare eventi scolastici (gite, colloqui, vacanze)
- Coordinare attività extrascolastiche (sport, corsi)
- Avere una vista unica e aggiornata degli impegni del bambino

## User Stories

1. *Come admin, voglio impostare una parola d'ordine per il calendario, così che solo chi la conosce possa accedervi*
2. *Come genitore, voglio accedere al calendario inserendo la parola d'ordine, così da non dover creare un account*
3. *Come genitore, voglio creare eventi (titolo, data, ora, descrizione, tipo), così da condividere informazioni sul bambino*
4. *Come genitore, voglio modificare eventi esistenti, così da aggiornare date o dettagli se cambiano*
5. *Come genitore, voglio eliminare eventi, così da rimuovere informazioni non più valide*
6. *Come genitore, voglio visualizzare il calendario in vista mensile/settimanale, così da pianificare facilmente*
7. *Come genitore, voglio distinguere tipi di eventi (affidamento, scuola, sport, altro), così da capire rapidamente la natura dell'impegno*

## Implementation Decisions

### Stack e deployment
- **Framework**: Next.js (App Router)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) — libreria di componenti accessibili e personalizzabili, basata su Radix UI e Tailwind CSS
- **Hosting**: Vercel
- **Repository**: GitHub

### Autenticazione e accesso
- Accesso tramite parola d'ordine (password) scelta dall'admin
- Nessun sistema di utenti/registrazione
- La parola d'ordine è condivisa tra i genitori fuori banda (es. messaggio, verbale)
- Session/cookie per mantenere l'accesso dopo la prima verifica

### Moduli principali
- **Auth module**: verifica parola d'ordine, gestione sessione
- **Calendar module**: visualizzazione calendario (mensile/settimanale), rendering eventi
- **Events module**: CRUD eventi (create, read, update, delete)
- **Admin module**: setup iniziale parola d'ordine (primo accesso o pagina dedicata)

### Dati e persistenza
- **Database**: Vercel Postgres
- **ORM**: Drizzle
- Schema eventi: id, titolo, descrizione, data_inizio, data_fine, tipo (enum: affidamento | scuola | sport | altro), creato_da (opzionale), creato_il, modificato_il
- Nessun dato utente oltre la parola d'ordine (hash) e la sessione

### API e routing
- API routes Next.js per CRUD eventi
- Route protette: tutte le pagine del calendario richiedono sessione valida
- Pagina di login: form parola d'ordine → redirect al calendario

### Interfacce
- Pagina login: campo password, pulsante "Accedi"
- Pagina calendario: vista mensile/settimanale, eventi come blocchi, click per dettaglio/modifica
- Modal/drawer per creare/modificare evento: titolo, data, ora, tipo, descrizione
- Conferma prima di eliminare eventi

## Testing Decisions

### Criteri di buon test
- Verificare il comportamento esterno (UX, flussi utente), non l'implementazione
- Test E2E con Playwright per i percorsi critici

### Moduli da testare
- **Flusso di accesso**: inserimento parola d'ordine errata → messaggio errore; parola corretta → redirect al calendario
- **CRUD eventi**: creazione, modifica, eliminazione con conferma
- **Visualizzazione calendario**: eventi visibili nelle date corrette, navigazione tra mesi/settimane

### Priorità
- E2E: login, creazione evento, modifica evento, eliminazione evento, visualizzazione calendario
- Test di regressione prima di ogni deploy

## Requisiti UX/UI

### Linee guida (Web Interface Guidelines, ui-ux-pro-max, frontend-design)
- **Accessibilità**: contrasto 4.5:1, focus visibili, aria-label su pulsanti icon-only, semantic HTML, skip link
- **Form**: label su tutti i campi, messaggi di errore inline, autocomplete appropriato, nessun blocco paste
- **Touch**: target minimo 44×44px, touch-action: manipulation
- **Animazioni**: rispettare prefers-reduced-motion, usare transform/opacity
- **Tipografia**: font distintivi (evitare Inter, Roboto, Arial), line-height 1.5–1.75
- **Layout**: responsive (375px, 768px, 1024px, 1440px), nessuno scroll orizzontale su mobile
- **Design**: direzione estetica chiara, coerente con il contesto (famiglia, bambini), evitare estetica "AI slop"

## Out of Scope

- Registrazione utenti con email/password
- Ruoli differenziati (admin vs viewer) — tutti con parola d'ordine hanno stessi permessi
- Notifiche push o email
- Integrazione con calendari esterni (Google, Apple)
- App mobile nativa (solo web responsive)
- Supporto multilingua nella prima versione

## Metriche di Successo

1. **Pubblicazione**: Webapp live su dominio pubblico (Vercel)
2. **Raggiungibilità**: Sito accessibile e utilizzabile da browser desktop e mobile
3. **Qualità**: Funzionalità principali verificate da test E2E Playwright (login, CRUD eventi, visualizzazione calendario)

## Further Notes

- La parola d'ordine va gestita con hash sicuro (bcrypt/argon2)
- Considerare rate limiting sulla pagina di login per mitigare brute-force
- Per MVP: un solo calendario per parola d'ordine; espansione multi-calendario possibile in futuro
