# Collegamento CRM → Jack (n8n / Telegram)

## Risposte rapide

- **Scheda lead nell'admin:** oggi non esiste un URL per un singolo lead. `/admin/richieste` mostra solo un elenco, senza parametri. Proposta: aggiungere a quella pagina un parametro facoltativo `?lead=<id>` che evidenzia e apre il lead indicato. È una piccola aggiunta solo nell'area admin. Quindi `link_crm = https://furiaimmobiliare.it/admin/richieste?lead=<lead_id>`. Se non vuoi toccare l'admin, `link_crm` punta all'elenco `/admin/richieste`.
- **Valori di `status`** (ammessi dal database: new, contacted, in_progress, closed):
  - contattato → `contacted` + `contacted_at` (solo se vuoto)
  - appuntamento → `in_progress` + `appointment_at` (solo se vuoto); se `contacted_at` è vuoto lo imposta il trigger già esistente
  - non_interessato → `closed` + `outcome = "non_interessato"`
  - Uno stato non torna mai indietro: per esempio "contattato" non sovrascrive un lead già `closed`.
- **Traffico di test:** nel progetto non c'è nessuna regola. Propongo di escludere dai KPI gli eventi con `utm_medium = "qa"` oppure `utm_source` che inizia con `jarvis_` o con `test`, come nei test di produzione già fatti.
- **Condivisioni:** l'evento si chiama `property_share`.

## Cosa va adattato (importante)

Lead ed eventi oggi vengono salvati **direttamente dal browser**, senza passare dal server del sito. Quindi un punto in cui inviare l'avviso "dopo il salvataggio" non c'è ancora. Ecco come lo risolvo senza toccare form, flussi esistenti o regole di accesso:

- **Trigger nel database con `pg_net`**: dopo l'inserimento in `leads` e in `site_events` (solo per i 6 clic indicati), chiama in modo asincrono un endpoint interno del sito: `POST /api/public/jarvis-notify` con `{ tipo, id }`. `pg_net` lavora in coda, quindi l'inserimento non viene mai bloccato né rallentato.
- L'endpoint interno è protetto da una chiave interna. La chiave è salvata nel vault del database e come secret del sito, `JARVIS_INTERNAL_KEY`, generato con lo strumento dei secret (non è uno dei tuoi tre). L'endpoint rilegge la riga lato server, costruisce il corpo senza dati personali e fa il POST a `JARVIS_N8N_URL` con `X-Jack-Key`, con timeout di 5 s ed errori solo nei log. Se mancano i secret non invia nulla.
- **Alternativa senza modifiche al database:** dopo il salvataggio, il browser chiama una funzione del server. È meno affidabile e falsificabile, quindi la sconsiglio.

Serve la tua conferma: **è accettabile una migration che aggiunge solo i trigger e l'estensione `pg_net`** (nessuna modifica a tabelle, colonne o RLS)?

## Dove va ogni pezzo

```text
src/lib/jarvis.server.ts                  costruzione payload senza dati personali, invio a n8n, verifica chiavi a tempo costante, filtro test
src/routes/api/public/jarvis-notify.ts    riceve dai trigger del database → inoltra a n8n
src/routes/api/public/jarvis-lead-stato.ts POST, X-Jarvis-Key, zod {lead_id uuid, azione}, risposta {ok, stato}
src/routes/api/public/jarvis-furia-kpi.ts  GET, X-Jarvis-Key, solo aggregati
supabase migration                        pg_net + 2 trigger AFTER INSERT (leads, site_events filtrato)
src/routes/_admin.admin.richieste.tsx     solo ?lead=<id> facoltativo (se approvato)
```

## Dettagli

- **Payload:** `tipo`, `evento` (per i lead: `lead_<source>`), `quando` (created_at), `lead_id` solo per i lead, `immobile_codice`/`immobile_titolo` letti da `properties` tramite `property_id`, `canale` (`utm_source/utm_medium` oppure "diretto"), `pagina` (`source_page` per i lead, `page_path` per i clic), `lingua`, `link_crm`. Nessun campo personale viene mai letto: le query chiedono solo le colonne permesse.
- **KPI:** query con accesso privilegiato solo lato server e solo dopo la verifica della chiave. Contiene:
  - `contatti_da_ricontattare`: lead con contacted_at vuoto creati tra 24 h e 30 giorni fa, con ore trascorse
  - `settimana` e `mese`: sessioni distinte, visite schede, nuovi lead, clic WhatsApp e telefono, divisi per canale
  - top 10 immobili per sessioni con `property_detail_view`, con contatti (sessioni con i clic oppure lead) e `property_share`
  - `stato_crm`: lead per status, contattati e con appuntamento
- **Esclusioni:** nessuna modifica a interfaccia pubblica, design, testi, SEO, analytics o form. Non creo né genero `JARVIS_N8N_URL`, `JARVIS_N8N_KEY` e `JARVIS_FURIA_KEY`. Nessuna pubblicazione.
- **Verifica:** typecheck; chiamate senza chiave → 401; con chiave → risposte corrette; nessun dato personale nelle risposte e nei corpi inviati.
