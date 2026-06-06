# Furia Immobiliare — Features Map

## Sezioni pubbliche

| Sezione | Route | Stato |
|---|---|---|
| Home | `/` | ✅ completa, hero tramonto + immobili in evidenza + territori |
| Lista immobili | `/immobili` | ✅ con filtri categoria / comune / tipologia / prezzo |
| Scheda immobile | `/immobili/:id` | ✅ gallery, attributi, descrizione, CTA contatto |
| Chi siamo | `/chi-siamo` | ✅ |
| Servizi | `/servizi` | ✅ |
| Territori | `/territori` | ✅ schede per Pontremoli, Bagnone, Zeri, Villafranca, Filattiera, Mulazzo |
| Contatti | `/contatti` | ✅ form contatti |
| Sitemap XML | `/sitemap.xml` | ✅ |

## Sezioni admin (riservate, ruolo `admin`)

| Sezione | Route | Stato |
|---|---|---|
| Login admin | `/admin/login` | ✅ |
| Dashboard (redirect) | `/admin` → `/admin/immobili` | ✅ |
| Lista immobili admin | `/admin/immobili` | ✅ con filtri stato, ricerca, card responsive |
| Nuovo immobile | `/admin/immobili/nuovo` | ✅ |
| Editor immobile | `/admin/immobili/:id` | ✅ multi-sezione, sticky bar mobile |

## Funzionalità presenti

- ✅ Catalogo annunci pubblico (vendita / affitto / scelti per voi)
- ✅ Filtri ricerca lato pubblico
- ✅ Gallery immagini con watermark
- ✅ Backend gestione annunci CRUD
- ✅ Upload immagini multiple + cover + riordino
- ✅ Generazione descrizione AI (Lovable AI Gateway)
- ✅ Virtual Staging / Rendering AI su singola foto
- ✅ Auth Supabase + ruoli (`user_roles` + `has_role`)
- ✅ Mobile-first responsive (sito + backend)
- ✅ SEO base (title/meta per pagina, sitemap)
- ✅ Area riservata accessibile da footer

## Funzionalità mancanti / da valutare

- ❌ Pubblicazione su dominio custom (`furiaimmobiliare.it` o nuovo)
- ❌ Integrazione Google Maps nelle schede immobile
- ❌ Lead capture strutturato (CRM / email automatiche al contatto)
- ❌ Newsletter / iscrizione a nuovi immobili
- ❌ Versione multilingua (EN / DE / FR) — utile per clienti esteri
- ❌ Tour virtuali 360° / video YouTube embed
- ❌ Calcolatore mutuo / preventivo
- ❌ Sezione blog / news sul territorio (SEO long-tail)
- ❌ Salvataggio annunci preferiti per utente registrato
- ❌ Analytics / consenso cookie (banner GDPR)
- ❌ Statistiche admin (annunci più visti, conversioni)
- ❌ Esportazione annunci a portali esterni (Immobiliare.it, Idealista)

## Priorità future (proposta)

1. **GDPR + analytics** — banner cookie e tracking base prima del go-live.
2. **Pubblicazione su dominio custom** + redirect dal vecchio sito.
3. **Multilingua (almeno EN)** — target acquirenti esteri.
4. **Lead capture**: invio email automatica all'agenzia da form contatti + scheda immobile.
5. **Mappa nelle schede** (OpenStreetMap o Google Maps).
6. **Sezione blog/territorio** per SEO.
7. **Sync verso portali immobiliari** (long term).