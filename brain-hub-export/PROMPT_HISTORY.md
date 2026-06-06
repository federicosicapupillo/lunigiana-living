# Furia Immobiliare — Prompt History

Storico sintetico delle modifiche fatte con Lovable (in ordine cronologico inverso).

## Decisioni di prodotto
- Il sito è **mobile-first**: prevalenza utenti da smartphone.
- Tono visivo: elegante, sobrio, "Apple-like" su tema caldo (terra, tramonto, oliveti).
- Tutti i ruoli admin gestiti via tabella `user_roles` (no flag su profilo).
- Tutte le foto pubbliche mostrano watermark dell'agenzia.
- Catalogo iniziale importato dal vecchio sito `furiaimmobiliare.it` (59 annunci, 581 immagini — vedi `MIGRATION_QA.md`).

## Modifiche principali (recenti → vecchie)

### Navigazione
- ❎ Rimosso il CTA "Parla con noi" dall'header.
- 🔁 Spostato il link "Area riservata" dall'header al **footer** sotto la sezione "Naviga".
- ✅ Aggiunta voce "Contatti" nel menu principale.

### Backend mobile
- ✅ Overhaul mobile-first del backend admin:
  - header compatto `h-14`, padding ridotto a `px-4`;
  - lista immobili: card responsive (no tabella) con cover, titolo, stato, prezzo;
  - filtri stato in row orizzontale scrollabile;
  - editor: tabs scrollabili, grid 1 colonna mobile / 2 colonne desktop;
  - sticky bottom bar mobile con azioni Salva / Pronto / Pubblica;
  - input `text-base` mobile per evitare auto-zoom iOS.

### Pulsante Area riservata (prima iterazione)
- ✅ Aggiunto pulsante "Area riservata" con icona `Lock` in header desktop e menu mobile (poi spostato in footer).

### Rendering / Virtual Staging
- ✅ Pannello Rendering reso mobile-friendly: sheet/modale responsivo, scroll funzionante, selezione foto comoda, pulsanti sempre accessibili.
- 🔒 Foto originali preservate, nessuna duplicazione o cancellazione.

### Responsive globale
- ✅ Revisione mobile-first di home, listing immobili e scheda immobile.
- ✅ Foto rese più leggere (lazy load, dimensioni responsive in `WatermarkedImage` e `PropertyCard`).
- ✅ Eliminato scroll orizzontale, sezioni e form rifiniti su mobile.
- ✅ Gallery mobile fluida.

### Home page
- ✅ Hero aggiornata con immagine `hero-tramonto-ulivi.png`.

### Setup iniziale
- ✅ Stack: TanStack Start + Supabase (Lovable Cloud) + Tailwind v4 + shadcn/ui.
- ✅ Schema DB con `properties`, `property_images`, `property_features`, `property_descriptions`, `user_roles` + RLS.
- ✅ Importazione catalogo dal vecchio sito (vedi `MIGRATION_QA.md`).

## Bug risolti
- 🐛 Pannello Rendering troppo grande su mobile → reso responsive.
- 🐛 Input admin causavano auto-zoom su iOS → forzato `text-base` (16px) su mobile.
- 🐛 Scroll orizzontale su mobile in listing/scheda immobile → corretto.
- 🐛 Immagini pesanti → ottimizzazione caricamento e rendering.

## Cose ancora da fare
- ⏳ Pubblicazione su dominio custom.
- ⏳ Banner cookie / GDPR + analytics.
- ⏳ Mappa nelle schede immobile.
- ⏳ Multilingua (EN minimo).
- ⏳ Lead capture: invio email al contatto.
- ⏳ Blog / sezione territorio per SEO.
- ⏳ Eventuale sync verso portali immobiliari (Immobiliare.it, Idealista).
- ⏳ Tour virtuali / video.
- ⏳ Statistiche admin (annunci visti, lead).