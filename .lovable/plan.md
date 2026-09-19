# CRM/Jarvis — Eventi first-party persistenti

Obiettivo: salvare in modo persistente e interrogabile gli eventi già tracciati nel sito, per ricostruire la catena
visita immobile → click WhatsApp/form → richiesta → appuntamento → esito.

## 1. Eventi già instrumentati (stato attuale)

`src/lib/analytics.ts` espone `trackEvent(name, payload)` e l'alias `trackClick`. Sono presenti ~115 nomi evento distinti. Payload tipici: `source`, `page_path` (aggiunto automaticamente), `language`, `comune`, `slug`, `property_id`, `property_code`, `property_type`, `budget_range`, `step`.

Eventi rilevanti per il funnel commerciale:

| Evento | File | Payload principale |
| --- | --- | --- |
| `property_detail_view` | routes/immobili.$id.tsx | property_id, property_code, comune, tipologia, prezzo |
| `property_card_click` | components/property-card.tsx | property_id, source |
| `property_filter_apply` | routes/immobili.index.tsx | filtri selezionati |
| `property_gallery_interaction` (4 punti) | routes/immobili.$id.tsx | azione, property_id |
| `property_detail_whatsapp_click` (2), `property_detail_mobile_sticky_click` (2), `contact_whatsapp_fallback_click` (3), `whatsapp_click` (2), `phone_click` (2) | scheda immobile, header, pagine SEO | source, property_id dove disponibile |
| `contact_form_view`, `property_detail_request_info_click` | routes/immobili.$id.tsx | property_id, source |
| `lead_form_submit_success` / `_error` (2+2) | lead-form.tsx, immobili.$id.tsx | source, page_path, budget_range, property_type |
| `contact_form_submit_success` / `_error` | lead-form.tsx, immobili.$id.tsx | idem |
| `lead_magnet_view`, `lead_magnet_cta_click`, `lead_magnet_submit_success` / `_error` | components/lead-magnet-block.tsx | source, interest_type, page_path |
| `guided_search_start`, `guided_search_step_complete`, `guided_search_submit_success` / `_error`, `guided_search_whatsapp_click` | routes/trova-casa-lunigiana.tsx | step, source |
| `valuation_page_view`, `valuation_form_start`, `valuation_step_complete`, `valuation_expected_price_yes`, `valuation_offmarket_interest`, `valuation_lead_submit` | routes/valuta-casa.tsx | step, source |
| `offmarket_view`, `offmarket_buyer_cta` (3), `offmarket_seller_cta` (2), `offmarket_teaser_click`, `home_offmarket_cta_click` | off-market.tsx, index.tsx | source |
| `property_share`, `language_switch`, `instagram_profile_click`, `reviews_google_click` (2), `trust_block_view` | vari componenti | source, canale |
| famiglie SEO/editoriali: `seo_area_*`, `seo_type_*`, `pz_*`, `dc_*`, `vl_*`, `vcl_*`, `qv_*`, `sc_*`, `oss_*`, `vivere_*` | pagine guida e landing | comune/slug, source |

## 2. Destinazione attuale

Confermato: **nessuna destinazione first-party persistente.** `analytics.ts` fa solo un `forward()` a provider eventualmente presenti su `window` (`lvAnalytics`, `plausible`, `gtag`, `dataLayer`, `fbq`). Se nessuno esiste, la chiamata è un no-op e l'evento è perso. In sviluppo c'è solo un `console.debug`. Nessuna tabella, nessuna richiesta di rete.

## 3. Form con evento di successo e id della richiesta

Nessun form recupera oggi l'id: tutti gli insert su `leads` sono `insert(payload)` senza `.select("id").single()`.

| Form | Evento di successo | lead_id oggi |
| --- | --- | --- |
| components/lead-form.tsx | `lead_form_submit_success`, `contact_form_submit_success` | no |
| routes/immobili.$id.tsx | `lead_form_submit_success`, `contact_form_submit_success` | no (ha però `property_id`) |
| components/lead-magnet-block.tsx | `lead_magnet_submit_success` | no |
| routes/trova-casa-lunigiana.tsx | `guided_search_submit_success` | no |
| routes/valuta-casa.tsx | `valuation_lead_submit` | no |
| components/off-market-forms.tsx | nessun evento di successo | no |

## 4. Soluzione proposta (minima, privacy-safe)

Una sola tabella `public.site_events` nel database del progetto, alimentata dal client tramite la stessa facciata `trackEvent` già usata da tutto il sito. Nessun servizio esterno, nessun endpoint non documentato.

Principi:
- nessun dato personale: la sanificazione PII già presente in `analytics.ts` viene riusata e resa obbligatoria anche per le chiavi payload arbitrarie;
- niente referrer grezzo, user-agent, IP: non vengono letti né inviati;
- `session_id` pseudonimo generato con `crypto.randomUUID()` e conservato in `sessionStorage` (nuovo per ogni sessione, non ricollegabile a una persona);
- campi strutturati: `event_name`, `page_path`, `property_id`, `property_code`, `lead_id`, UTM dalla prima campagna di sessione (`getAttribution()`), `payload` jsonb sanificato e limitato;
- timestamp generato dal server (`default now()`), nessun orologio del browser;
- accesso: inserimento pubblico consentito ma con vincoli, lettura solo admin.

Collegamento del funnel: i form, dopo l'insert, leggono l'id della richiesta e lo passano all'evento di successo. Da lì `appointment_at`, `contacted_at`, `status` e `outcome` sono già sulla tabella `leads`, quindi la catena completa si ricostruisce con una join su `lead_id` (e su `property_id` per la parte di navigazione).

## 5. Interventi necessari (da NON eseguire ora)

### Migration SQL (una sola)
1. `CREATE TABLE public.site_events` con: `id uuid pk default gen_random_uuid()`, `created_at timestamptz not null default now()`, `session_id text not null`, `event_name text not null`, `page_path text`, `language text`, `property_id uuid null references public.properties(id) on delete set null`, `property_code text`, `lead_id uuid null references public.leads(id) on delete set null`, `utm_source/utm_medium/utm_campaign/utm_content text`, `payload jsonb not null default '{}'::jsonb`.
2. `GRANT INSERT ON public.site_events TO anon, authenticated;` + `GRANT SELECT ON public.site_events TO authenticated;` + `GRANT ALL ... TO service_role;` (nessun SELECT ad `anon`).
3. `ENABLE ROW LEVEL SECURITY`.
4. Policy `site_events_public_insert` INSERT per `anon, authenticated` con CHECK: `event_name` fra 1 e 80 caratteri, `session_id` fra 8 e 64 caratteri, `page_path` max 300, `char_length(payload::text) <= 2000`. Nessuna lettura per `anon`.
5. Policy `site_events_admin_read` SELECT per `authenticated` con `has_role(auth.uid(), 'admin')`; nessuna policy UPDATE/DELETE (solo `service_role`).
6. Indici: `(created_at desc)`, `(event_name, created_at desc)`, `(session_id)`, `(property_id)`, `(lead_id)`.
7. Nessuna modifica a `leads`, `properties` o ad altre policy esistenti.

### Frontend
- `src/lib/analytics.ts`: aggiungere `getSessionId()` (sessionStorage, fallback in memoria) e uno "sink" first-party che accoda gli eventi e li scrive in batch su `site_events` (flush su timer breve, su `visibilitychange` e su `pagehide`). Estrazione dei campi strutturati dal payload (`property_id`, `property_code`, `lead_id`, `language`, `page_path`), resto in `payload`. Tutto in try/catch: un errore di rete non deve mai rompere un click o un form. Il `forward()` esistente resta invariato.
- `src/lib/attribution.ts`: riusato senza modifiche per gli UTM.
- Form: aggiungere `.select("id").single()` all'insert e passare `lead_id` all'evento di successo in `lead-form.tsx`, `immobili.$id.tsx`, `lead-magnet-block.tsx`, `trova-casa-lunigiana.tsx`, `valuta-casa.tsx`; in `off-market-forms.tsx` aggiungere l'evento `offmarket_submit_success` con `lead_id`. Se la lettura dell'id fallisce, il lead resta valido e l'evento viene inviato senza `lead_id`.
- `src/integrations/supabase/types.ts`: aggiungere la definizione di `site_events` (rigenerata dalla migration).
- Nessuna modifica a design pubblico, URL, SEO, JSON-LD, sitemap.

### Opzionale (secondo step, non incluso)
Una pagina `/admin/eventi` con conteggi per evento e imbuto per immobile. Con i dati persistiti è comunque già interrogabile dal backend.

## Rischi
- **Volume**: eventi come `property_gallery_interaction` possono essere molto frequenti. Mitigazione: batch, deduplica dei `*_view` per sessione, eventuale lista di eventi esclusi.
- **Insert pubblico**: una tabella scrivibile da anonimi può essere riempita con dati falsi. Mitigazione: vincoli stretti nel CHECK, nessuna lettura pubblica, nessun uso della tabella per logica applicativa; se serve, in seguito un limite di frequenza lato client.
- **Privacy**: rischio che uno sviluppatore passi per errore un dato personale nel payload. Mitigazione: filtro PII già esistente applicato anche al sink, valori stringa troncati.
- **Bloccanti storage/rete**: adblocker o storage disabilitato causano perdita di eventi, non errori: l'esperienza utente resta identica.
- **Foreign key su lead_id**: se una richiesta viene eliminata dal backend, l'evento resta con `lead_id` nullo (`on delete set null`), senza errori.

## Test previsti
1. Typecheck pulito.
2. Su mobile 390px: apertura scheda immobile → verifica riga `property_detail_view` con `property_id`/`property_code` e `session_id`.
3. Click WhatsApp e invio form: eventi registrati, `lead_id` presente e corrispondente alla richiesta creata.
4. Sessione con `?utm_source=meta&utm_medium=cpc&utm_campaign=...`: UTM della prima campagna presenti su tutti gli eventi successivi.
5. Con sessionStorage bloccato: form e click funzionano, nessun errore in console.
6. Verifica accessi: un utente non admin non legge la tabella; l'inserimento anonimo funziona.
7. Verifica che nessuna riga contenga nome, email, telefono, messaggio, IP o user-agent.
8. Nessuna regressione su galleria, filtri, selettore lingua, pagina richieste admin.
