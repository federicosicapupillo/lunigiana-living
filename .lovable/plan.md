# Audit tecnico SEO / AEO / GEO — Furia Immobiliare (sola lettura)

Nessun file modificato. Sotto: cosa è già corretto, cosa va migliorato, con gravità, file e modifica consigliata.

## Già corretto (OK)

- **robots.txt** — `User-agent: *` + `Allow: /` + `Sitemap:` sul dominio canonico. Nessun `Disallow: /`, quindi OAI-SearchBot, PerplexityBot, Bingbot, Google-Extended non sono bloccati. (`public/robots.txt`)
- **llms.txt presente** con descrizione dell'agenzia e indice di pagine. (`public/llms.txt`)
- **sitemap dinamica SSR** con hub comuni, hub tipologie, pagine editoriali, `/valuta-casa`, `/off-market` e tutte le schede immobile pubblicate. (`src/routes/sitemap[.]xml.ts`)
- **SSR/crawlability**: TanStack Start con render server-side; contenuti e JSON-LD emessi in `head()` lato server.
- **Canonical assoluti** su tutte le pagine pubbliche (home, immobili, hub comuni/tipologie, editoriali, servizi, contatti, chi siamo, off-market, valuta-casa) tramite `siteUrl()`. (`src/lib/site-url.ts`)
- **Legacy .asp**: 301 per `/index.asp`, `/chi_siamo.asp`, `/contattaci.asp`, `/vendite2.asp`, `/affitti.asp`; `annuncio.asp?ID_immobile=` con mapping ID→slug, 410 per rimossi, 404 per sospesi; validazione anti open-redirect. (`src/lib/legacy-redirects.ts`)
- **URL immobili slug-based** con 301 dagli ID vecchi. (`src/lib/property-url.ts`, `src/routes/immobili.$id.tsx`)
- **JSON-LD**: `RealEstateAgent` + `WebSite` + `WebPage` in home, `CollectionPage` + `ItemList` sugli elenchi (omesso quando ci sono filtri attivi), `RealEstateListing` + `Accommodation` + `Offer` (solo vendita, solo prezzo numerico) + `BreadcrumbList` sulle schede. `@id` coerenti = una sola entità agenzia. (`src/lib/structured-data.ts`)
- **NAP verificato e coerente** (Via Pirandello 7, Pontremoli 54027 MS, +39 0187 830229, email), `areaServed`, `memberOf: FIAIP`.
- **Nessun `og:image:width/height` falso**; immagine OG di brand su dominio canonico; nessuna signed URL con token nel markup.
- **Aree admin** con `noindex,nofollow` su login, richieste, impostazioni, immobili (index/nuovo/$id), assistente.
- **Pagine editoriali conversazionali** già presenti: `/vivere-a-pontremoli`, `/vivere-in-lunigiana`, hub comuni/tipologie con FAQ HTML.

## Da migliorare

| # | Problema | Gravità | File | Modifica consigliata |
|---|---|---|---|---|
| 1 | `<html lang="en">` hardcoded nello shell SSR: tutto il sito italiano viene dichiarato inglese ai crawler e ai motori AI (la correzione via `document.documentElement.lang` avviene solo dopo l'hydration). | **Critica** | `src/routes/__root.tsx` | Impostare `lang="it"` nello shell. |
| 2 | Multilingua senza URL dedicate: IT/EN condividono la stessa URL e il cambio lingua è solo client-side. La versione EN non è indicizzabile né citabile, e non esistono `hreflang` né `og:locale`. | **Alta** | `src/lib/i18n/*`, route pubbliche | Decidere: (a) prefisso `/en/` con canonical+hreflang reciproci, oppure (b) dichiarare esplicitamente il sito monolingua IT e trattare EN come comodità UI. Senza (a) non c'è visibilità EN. |
| 3 | Nessuna dichiarazione esplicita per i crawler AI in robots.txt. L'accesso è già consentito dal wildcard, ma blocchi espliciti riducono il rischio di regressioni future e rendono l'intento verificabile. | Bassa | `public/robots.txt` | Aggiungere blocchi espliciti `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Google-Extended`, `ClaudeBot`, `Bingbot` con `Allow: /`. |
| 4 | `llms.txt` non aggiornato: mancano `/off-market`, `/valuta-casa`, `/vivere-a-pontremoli`, `/vivere-in-lunigiana` — proprio le pagine più utili alle query conversazionali. | Media | `public/llms.txt` | Aggiungere le voci mancanti e una riga NAP (indirizzo, telefono, email) per il grounding dei motori AI. |
| 5 | Nessun `FAQPage` JSON-LD, per scelta documentata, benché le FAQ HTML esistano su hub comuni ed editoriali. Le risposte non sono estraibili come dato strutturato. | Media | `src/lib/seo-editorial.ts`, hub e pagine editoriali | Emettere `FAQPage` solo dove le domande/risposte sono già visibili in pagina, con testo identico al DOM. |
| 6 | `sameAs` contiene solo Instagram: consolidamento entità debole per i motori AI (nessun Google Business Profile, Facebook, FIAIP, pagina portali). | Media | `src/lib/social-links.ts` | Aggiungere solo profili realmente esistenti e verificati dall'agenzia. |
| 7 | Alcune route admin senza `noindex`: dati-live, idealista, anteprima immobile, dashboard admin index. | Media | `src/routes/_admin.admin.dati-live.tsx`, `_admin.admin.idealista.tsx`, `_admin.admin.immobili.$id.anteprima.tsx`, `_admin.admin.index.tsx` | Aggiungere `robots: noindex,nofollow` (idealmente nel layout `_admin.admin.tsx`) + `Disallow: /admin` in robots.txt. |
| 8 | Endpoint tecnici crawlabili: feed Idealista pubblico e route immagini OG. Rischio di indicizzazione di URL non-pagina e di contenuto duplicato dei dati immobili. | Media | `public/robots.txt`, `src/routes/api/public/idealista/feed[.]xml.ts`, `src/routes/media/og/immobili/$.ts` | `Disallow: /api/`, `Disallow: /media/og/` in robots.txt e header `X-Robots-Tag: noindex` sul feed. |
| 9 | Nessun consolidamento www/non-www a livello applicativo: `furiaimmobiliare.it`, `www.furiaimmobiliare.it`, `furia.cap-ann-one.life` e i domini `lovable.app` possono servire lo stesso contenuto. I canonical assoluti mitigano ma non eliminano il duplicato. | **Alta** | livello hosting/dominio | Impostare un 301 host-level verso l'host canonico e verificare che i domini alternativi redirigano invece di servire copie. |
| 10 | `/immobili` con query string è raggiungibile e linkata (es. redirect `/affitti.asp` → `/immobili?contract=affitto`): il canonical punta alla versione pulita, corretto, ma sono URL indicizzabili senza contenuto proprio. | Bassa | `src/routes/immobili.index.tsx` | Valutare `noindex,follow` sulle varianti con filtri attivi, mantenendo il canonical. |
| 11 | Sitemap senza `lastmod`: nessuna segnalazione di freschezza sulle schede immobile. | Bassa | `src/routes/sitemap[.]xml.ts` | Aggiungere `lastmod` solo da un timestamp reale per riga (es. `updated_at`); mai la data di generazione. |
| 12 | Prezzi delle locazioni assenti dai dati strutturati (scelta corretta) ma nessun segnale alternativo di disponibilità/contatto per gli affitti. | Bassa | `src/lib/structured-data.ts` | Valutare `Offer` senza `price` con `availability` + `seller`, oppure lasciare invariato. |

## Priorità di intervento suggerita

1. `lang="it"` nello shell SSR (#1).
2. Consolidamento host canonico (#9).
3. Decisione strategica sul multilingua EN (#2).
4. Igiene crawl: admin/api/media + robots AI + llms.txt (#3, #4, #7, #8).
5. Rafforzamento entità e FAQ strutturate (#5, #6).

## Note tecniche

Verificato per lettura diretta di: `public/robots.txt`, `public/llms.txt`, `src/routes/sitemap[.]xml.ts`, `src/lib/site-url.ts`, `src/lib/structured-data.ts`, `src/lib/social-links.ts`, `src/lib/legacy-redirects.ts`, `src/routes/__root.tsx`, `src/hooks/use-localized-head.ts`, `src/server.ts` e tutte le route pubbliche e admin (grep su `canonical`, `robots`, `hreflang`, `FAQPage`). Nessun dato esterno usato: il comportamento reale di www/non-www e dei domini alternativi va confermato con una verifica live, non deducibile dal codice.
