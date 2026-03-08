# Calendario Condiviso v2 — Tickets con Relazioni di Blocco

Ogni ticket è identificato da un ID. I ticket "bloccati da" non possono iniziare finché tutti i blocker non sono completati.

---

## T1 — Schema database e migrazione
**Bloccato da:** nessuno

**Descrizione:** Migrare lo schema da v1 a v2:
- Creare tabella `utenti` (id, passwordHash, nome, affidamentoColore, creatoIl, modificatoIl)
- Vincolo unicità su `affidamentoColore`
- Aggiungere `creatoDa` (FK → utenti.id) obbligatorio a `eventi`
- Semplificare tabella `config` (rimuovere password condivisa singola)
- Migrare eventi esistenti: assegnare `creatoDa` a utente "migrato" o gestire legacy

**Criteri di accettazione:**
- [ ] Migrazione Drizzle eseguita senza errori
- [ ] Vincolo unicità affidamentoColore attivo
- [ ] Eventi legacy gestiti (creatoDa popolato)

---

## T2 — Admin: creazione utenti
**Bloccato da:** T1

**Descrizione:** Pagina admin per creare account genitori. Ogni genitore ha la propria parola d'ordine. Protezione admin (password admin o primo utente).

**User story:** *Come admin, voglio creare gli account dei genitori (parola d'ordine per ciascuno), così che possano accedere al calendario*

**Criteri di accettazione:**
- [ ] `POST /api/admin/users` — crea utente con password (hash bcrypt/argon2)
- [ ] UI admin: form "Aggiungi genitore" con campo password
- [ ] Accesso `/admin` protetto
- [ ] Rate limiting su login (mitigazione brute-force)

---

## T3 — Auth: login per password e sessione
**Bloccato da:** T1, T2

**Descrizione:** Login tramite parola d'ordine personale. Il sistema identifica l'utente e crea la sessione.

**User story:** *Come genitore, voglio accedere inserendo la mia parola d'ordine personale, così che il sistema sappia chi sono*

**Criteri di accettazione:**
- [ ] `POST /api/auth/login` — body `{ password }` → verifica hash, ritorna `{ userId, needsName, needsAffidamentoColor }`
- [ ] Sessione con `userId` (cookie/session)
- [ ] Messaggio "Parola d'ordine non riconosciuta" se password errata
- [ ] Redirect logic: se `nome` null → needsName; se `affidamentoColore` null → needsAffidamentoColor; altrimenti → calendario

---

## T4 — Auth: flusso redirect post-login
**Bloccato da:** T3

**Descrizione:** Dopo il login, indirizzare l'utente allo step corretto (scegli nome, scegli colore, o calendario).

**User story:** *Come genitore, se ho già un nome salvato, voglio accedere direttamente al calendario senza passaggi aggiuntivi*

**Criteri di accettazione:**
- [ ] Se `nome` null → redirect a `/scegli-nome`
- [ ] Se `affidamentoColore` null e utente crea primo evento Affidamento → modale scelta colore (vedi T9)
- [ ] Altrimenti → redirect a `/calendar`

---

## T5 — Flusso "Scegli nome"
**Bloccato da:** T3, T4

**Descrizione:** Pagina o modale per scegliere il nome da visualizzare al primo accesso.

**User story:** *Come genitore, dopo il primo accesso voglio scegliere un nome da visualizzare, così che gli altri possano identificarmi sul calendario*

**Criteri di accettazione:**
- [ ] `POST /api/auth/complete-profile` — body `{ nome }` — salva in `utenti.nome`
- [ ] UI: campo "Come vuoi essere chiamato?", pulsante "Continua"
- [ ] Salvataggio → redirect a `/calendar`
- [ ] Label, messaggi errore inline, accessibilità

---

## T6 — API Events CRUD con creatoDa
**Bloccato da:** T1, T3

**Descrizione:** API eventi con vincolo `creatoDa` = utente loggato. Solo il creatore può modificare/eliminare.

**User story:** *Come genitore, voglio creare/modificare/eliminare i miei eventi*

**Criteri di accettazione:**
- [ ] `GET /api/events` — lista eventi (tutti gli utenti autenticati vedono tutti)
- [ ] `POST /api/events` — crea evento, `creatoDa` = userId da sessione
- [ ] `PATCH /api/events/[id]` — solo se `creatoDa` = userId
- [ ] `DELETE /api/events/[id]` — solo se `creatoDa` = userId
- [ ] Validazione: titolo, dataInizio, dataFine, tipo (affidamento|scuola|sport|altro)

---

## T7 — API colori Affidamento disponibili
**Bloccato da:** T1, T3

**Descrizione:** Endpoint per ottenere i colori non ancora assegnati ad altri utenti.

**User story:** *Come genitore, voglio che il sistema impedisca di scegliere un colore già usato da un altro genitore*

**Criteri di accettazione:**
- [ ] `GET /api/users/colors-available` — ritorna colori dalla palette predefinita esclusi quelli già in `utenti.affidamentoColore`
- [ ] Palette: 8–12 colori distinti e accessibili (blu, verde, viola, arancione, rosa, teal, indaco, ambra)

---

## T8 — Flusso "Scegli colore Affidamento"
**Bloccato da:** T5, T6, T7

**Descrizione:** Quando l'utente crea il primo evento di tipo Affidamento e non ha `affidamentoColore`, mostrare modale per scegliere il colore tra quelli disponibili.

**User story:** *Come genitore, voglio scegliere il mio colore per gli eventi Affidamento al primo utilizzo, così che non sia uguale a quello dell'altro genitore*

**Criteri di accettazione:**
- [ ] Trigger: creazione primo evento Affidamento + `affidamentoColore` null
- [ ] Modale: griglia colori disponibili (da `GET /api/users/colors-available`), pulsante "Conferma"
- [ ] Salvataggio in `utenti.affidamentoColore` via `complete-profile` → creazione evento
- [ ] Colori già assegnati non selezionabili

---

## T9 — Calendario: vista mensile e settimanale
**Bloccato da:** T6

**Descrizione:** Visualizzazione calendario in vista mensile e settimanale con eventi di tutti gli utenti.

**User story:** *Come genitore, voglio visualizzare il calendario in vista mensile/settimanale, così da pianificare facilmente*

**Criteri di accettazione:**
- [ ] Vista mensile e settimanale switchabili
- [ ] Eventi caricati da `GET /api/events`
- [ ] Colori per tipo: scuola, sport, altro (fissi); Affidamento (colore utente creatore)
- [ ] Responsive: 375px, 768px, 1024px, 1440px

---

## T10 — Calendario: colori Affidamento per creatore
**Bloccato da:** T6, T8, T9

**Descrizione:** Per eventi di tipo Affidamento, usare `utenti.affidamentoColore` dell'utente `creatoDa`.

**User story:** *Come genitore, quando creo eventi di tipo Affidamento voglio che abbiano un colore univoco che mi identifica*

**Criteri di accettazione:**
- [ ] Eventi Affidamento mostrati con colore dell'utente creatore
- [ ] Colori univoci tra genitori (garantito da T7/T8)
- [ ] Altri tipi con colori fissi per tipo

---

## T11 — Form evento (create/edit)
**Bloccato da:** T6

**Descrizione:** Form per creare e modificare eventi: titolo, data, ora, tipo, descrizione.

**User story:** *Come genitore, voglio creare eventi (titolo, data, ora, descrizione, tipo), così da condividere informazioni sul bambino*

**Criteri di accettazione:**
- [ ] Campi: titolo, dataInizio, dataFine, tipo (select), descrizione (opzionale)
- [ ] Integrazione con flusso scelta colore (T8) quando applicabile
- [ ] Modifica solo per eventi propri (creatoDa = userId)
- [ ] Label, validazione, messaggi errore inline

---

## T12 — Dettaglio evento e permessi UI
**Bloccato da:** T6, T9

**Descrizione:** Dettaglio evento con creatore (nome) e tipo. Pulsanti modifica/elimina solo se utente è il creatore.

**User story:** *Come genitore, voglio modificare/eliminare i miei eventi esistenti*

**Criteri di accettazione:**
- [ ] Mostra: titolo, descrizione, date, tipo, creatore (nome)
- [ ] Pulsanti modifica/elimina visibili solo se `creatoDa` = userId
- [ ] Conferma prima di eliminare
- [ ] Accessibilità: aria-label su pulsanti icon-only

---

## T13 — Admin: gestione utenti esistenti
**Bloccato da:** T2

**Descrizione:** Modifica password e gestione utenti dalla pagina admin.

**User story:** *Come admin, voglio gestire gli utenti esistenti (modifica password, ecc.) se necessario*

**Criteri di accettazione:**
- [ ] Lista utenti con nome, data creazione
- [ ] Modifica password per utente
- [ ] Vincolo unicità affidamentoColore rispettato in modifica

---

## T14 — E2E: Login e flusso nome
**Bloccato da:** T3, T4, T5

**Descrizione:** Test E2E per login (password errata/corretta) e flusso scegli nome.

**Criteri di accettazione:**
- [ ] Password errata → messaggio "Parola d'ordine non riconosciuta"
- [ ] Password corretta senza nome → redirect a scegli-nome
- [ ] Inserimento nome → salvataggio → redirect al calendario
- [ ] Password corretta con nome → redirect diretto al calendario

---

## T15 — E2E: Scegli colore Affidamento
**Bloccato da:** T8

**Descrizione:** Test E2E per il flusso di scelta colore al primo evento Affidamento.

**Criteri di accettazione:**
- [ ] Primo evento Affidamento senza colore → modale scelta colore
- [ ] Selezione colore → salvataggio → evento creato con quel colore
- [ ] Secondo utente non può scegliere il colore del primo

---

## T16 — E2E: CRUD eventi
**Bloccato da:** T6, T11, T12

**Descrizione:** Test E2E per creazione, modifica, eliminazione eventi.

**Criteri di accettazione:**
- [ ] Creazione evento → visibile sul calendario
- [ ] Modifica evento (solo propri) → aggiornamento visibile
- [ ] Eliminazione evento (solo propri) → evento rimosso
- [ ] Tentativo modifica/eliminazione evento altrui → non consentito (UI o API)

---

## T17 — E2E: Visualizzazione calendario e colori
**Bloccato da:** T9, T10

**Descrizione:** Test E2E per visualizzazione eventi di tutti gli utenti e colori Affidamento corretti.

**Criteri di accettazione:**
- [ ] Eventi di tutti gli utenti visibili
- [ ] Colori Affidamento corretti per creatore
- [ ] Vista mensile e settimanale funzionanti

---

## T18 — Requisiti UX/UI e accessibilità
**Bloccato da:** nessuno (può essere parallelo)

**Descrizione:** Applicare linee guida UX/UI e accessibilità su tutte le interfacce.

**Criteri di accettazione:**
- [ ] Contrasto 4.5:1, focus visibili, aria-label su pulsanti icon-only
- [ ] Semantic HTML, skip link
- [ ] Label su tutti i campi, messaggi errore inline
- [ ] Target touch minimo 44×44px
- [ ] prefers-reduced-motion rispettato
- [ ] Layout responsive verificato
- [ ] Design coerente con contesto famiglia/bambini

---

## Diagramma dipendenze (testo)

```
T1 (schema)
 ├─→ T2 (admin create users)
 │    ├─→ T3 (auth login)
 │    │    ├─→ T4 (redirect flow)
 │    │    │    └─→ T5 (scegli nome)
 │    │    │         └─→ T8 (scegli colore)
 │    │    ├─→ T6 (events API)
 │    │    │    ├─→ T9 (calendar view)
 │    │    │    │    └─→ T10 (affidamento colors)
 │    │    │    ├─→ T11 (event form)
 │    │    │    ├─→ T12 (event detail)
 │    │    │    └─→ T8 (scegli colore)
 │    │    └─→ T7 (colors-available API)
 │    │         └─→ T8 (scegli colore)
 │    └─→ T13 (admin manage users)
 │
 └─→ T14 (E2E login) ← T3, T4, T5
      T15 (E2E colore) ← T8
      T16 (E2E CRUD) ← T6, T11, T12
      T17 (E2E display) ← T9, T10

T18 (UX/accessibility) — parallelo
```

---

## Ordine suggerito di implementazione

1. **T1** — Schema
2. **T2** — Admin create users
3. **T3** — Auth login
4. **T4** — Redirect flow
5. **T5** — Scegli nome
6. **T6, T7** — Events API + colors-available (paralleli)
7. **T8** — Scegli colore Affidamento
8. **T9** — Calendar view
9. **T10** — Affidamento colors display
10. **T11, T12** — Event form + detail (paralleli)
11. **T13** — Admin manage users
12. **T14, T15, T16, T17** — E2E tests (dopo che le feature sono pronte)
13. **T18** — UX/accessibility (in parallelo durante lo sviluppo)
