# Controllo Qualità Migrazione — Furia Immobiliare

Migrazione completa dal sito originario `furiaimmobiliare.it` (annunci `annuncio.asp?ID_immobile=...`).

## Riepilogo

- **Annunci totali importati:** 59
- **Immagini totali (cover + gallery):** 581
- **Annunci in evidenza (home slider):** 21
- **Schede incomplete (senza titolo o copertina):** 0
- **URL non accessibili:** 0
- **Annunci senza prezzo numerico (info in agenzia):** 3

## Categorie

- **vendita**: 56
- **affitto**: 3

## Distribuzione per comune

- Pontremoli: 43
- Villafranca in Lunigiana: 4
- Bagnone: 3
- Mulazzo: 3
- Filattiera: 3
- Zeri: 3

## Campi importati (copertura sul totale)

- `Tipologia`: 59/59
- `Contratto`: 59/59
- `Riferimento`: 59/59
- `Superficie`: 59/59
- `Locali`: 59/59
- `Bagni`: 59/59
- `Camere`: 59/59
- `Riscaldamento`: 59/59
- `Infissi interni`: 59/59
- `Infissi esterni`: 59/59
- `Piano`: 59/59
- `Posto auto`: 59/59
- `Stato`: 59/59
- `Arredamento`: 59/59
- `Spese condominiali`: 59/59
- `Classe energetica`: 59/59
- `Cucina`: 52/59
- `Soggiorno`: 49/59
- `Cantina`: 46/59
- `Nota riscaldamento`: 36/59
- `Terrazzo`: 28/59
- `Giardino`: 27/59
- `Box`: 16/59
- `Porta blindata`: 12/59
- `Ascensore`: 8/59

## Pipeline di importazione

1. **Crawling URL** — `index.asp`, `vendite2.asp`, `affitti.asp`, `occasioni-particolari.asp` → estrazione di tutti gli `ID_immobile` univoci.
2. **Scraping schede** — per ogni `annuncio.asp?ID_immobile=N`: titolo, riferimento, comune, prezzo, descrizione, oltre 25 attributi tecnici, copertina e gallery completa (paths `/public/upload_annunci/` e `/public/upload_gallery_annunci/`).
3. **Normalizzazione** — JSON unico con id univoco, slug, categoria (vendita / affitto / scelti-per-voi), flag `featured`.
4. **Popolamento UI** — `src/data/properties.json` consumato da `src/lib/properties.ts` e renderizzato in home, listing `/immobili` con filtri, e pagine dettaglio `/immobili/{id}`.

## Annunci senza prezzo numerico

161, 230, 398
