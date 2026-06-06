# Furia Immobiliare — Project Overview

## Descrizione
Sito web istituzionale e vetrina annunci dell'agenzia **Furia Immobiliare**, specializzata in compravendita e affitto di immobili in **Lunigiana** (Toscana, provincia di Massa-Carrara): Pontremoli, Bagnone, Villafranca, Zeri, Filattiera, Mulazzo.

Il sito è costruito su **TanStack Start (React 19 + Vite 7)**, con backend **Lovable Cloud (Supabase)** per gestione annunci, autenticazione admin e storage immagini. Include una funzione **Rendering / Virtual Staging** basata su AI per generare visualizzazioni alternative delle foto.

## Obiettivo
- Presentare l'agenzia e il suo posizionamento sul territorio della Lunigiana.
- Mostrare il catalogo immobili (vendita, affitto, scelti per voi) con schede ricche di dettagli.
- Permettere ai potenziali clienti di richiedere informazioni tramite il form contatti.
- Fornire all'agenzia un **backend privato** per gestire gli annunci end-to-end (creazione, modifica, foto, pubblicazione).

## Target
- **Acquirenti / affittuari**: persone interessate ad acquistare casa o affittare in Lunigiana, spesso da fuori regione o dall'estero, prevalentemente da **mobile**.
- **Venditori / proprietari**: chi vuole affidare un immobile all'agenzia.
- **Agenzia interna (admin)**: Elena Furia e collaboratori, che gestiscono il catalogo dal backend.

## Funzionalità principali
- Home page con hero al tramonto, immobili in evidenza, presentazione territori.
- Listing `/immobili` con filtri (categoria, comune, tipologia, prezzo).
- Scheda immobile `/immobili/:id` con gallery, attributi, descrizione, contatti.
- Pagine istituzionali: **Chi siamo**, **Servizi**, **Territori**, **Contatti**.
- **Backend admin** (`/admin/...`) protetto da login Supabase + ruolo `admin`:
  - lista immobili con filtri stato (bozza / pronto / pubblicato);
  - editor immobile completo (anagrafica, localizzazione, caratteristiche, gallery, descrizione AI);
  - upload immagini con watermark, cover, riordino;
  - generatore descrizione AI (Lovable AI Gateway);
  - funzione **Virtual Staging / Rendering** per generare varianti AI delle foto.
- SEO: titoli per pagina, sitemap XML, metadata mobile-first.
- Watermark automatico sulle immagini pubbliche.

## Stato attuale (giugno 2026)
- Sito **online in preview** (non ancora pubblicato su dominio custom).
- **59 annunci** importati dal vecchio sito `furiaimmobiliare.it` con 581 immagini (vedi `MIGRATION_QA.md`).
- Backend operativo, ruolo admin gestito via tabella `user_roles`.
- Layout **mobile-first** rifinito su home, listing, scheda immobile e backend.
- Tasto "Area riservata" spostato nel footer; rimosso il CTA "Parla con noi".
- Funzione Rendering / Virtual Staging operativa e ottimizzata per mobile.

## Stack tecnico (sintesi)
- Frontend: TanStack Start, React 19, Tailwind v4, shadcn/ui.
- Backend: Lovable Cloud (Supabase) — DB Postgres, Auth, Storage.
- AI: Lovable AI Gateway (descrizioni annunci, virtual staging).
- Runtime serverless: Cloudflare Workers (via TanStack Start).