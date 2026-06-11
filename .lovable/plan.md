## Obiettivo
Aggiungere supporto bilingue IT/EN al sito Furia Immobiliare senza rompere layout, backend, URL o logica esistente.

## Approccio
Sistema i18n leggero **client-side** basato su React Context + localStorage. Nessuna modifica alle rotte. Italiano = default e fallback.

## 1. Infrastruttura i18n (nuova)
- `src/lib/i18n/LanguageContext.tsx` — Provider con `language` ("it" | "en"), `setLanguage`, `t(key)`. Persistenza in `localStorage` (`furia.lang`). Default `it`.
- `src/lib/i18n/translations.ts` — Dizionario piatto con tutte le chiavi (header, footer, home, chi-siamo, territori, servizi, contatti, immobili, ricerca, form lead, filtri, messaggi). Helper `t(key, lang)` che cade su IT se manca EN.
- Provider montato in `src/routes/__root.tsx` attorno a `QueryClientProvider`.

## 2. Selettore lingua
- Nuovo componente `src/components/language-switcher.tsx`: stile minimale "IT | EN" con separatore, attivo in `terracotta`. 
- Aggiunto in `site-header.tsx` (desktop accanto al menu, mobile dentro il drawer).

## 3. Traduzione testi statici
File da aggiornare per usare `useT()`:
- `site-header.tsx`, `site-footer.tsx`
- `routes/index.tsx`, `chi-siamo.tsx`, `territori.tsx`, `servizi.tsx`, `contatti.tsx`
- `routes/immobili.index.tsx`, `immobili.$id.tsx`, `immobili.tsx`
- `components/lead-form.tsx`, `property-search-bar.tsx`, `property-search.tsx`, `property-card.tsx`, `whatsapp-float.tsx`
- Meta title/description tradotti via stesso dizionario (rimangono in italiano lato SSR perché head() non vede lo stato client — accettabile e dichiarato non rischioso; titolo `document.title` aggiornato lato client con `useEffect` per UX).

## 4. Campi inglesi immobili (backend)
Migrazione DB: aggiunge a `public.properties` colonne **opzionali**:
- `title_en text`
- `subtitle_en text`
- `summary_en text`
- `location_description_en text`

E a `public.property_descriptions`:
- `description_en text`

Nessun campo italiano toccato. Nessun NOT NULL. Frontend mostra `_en` se valorizzato e lingua = EN, altrimenti fallback IT.

## 5. Admin
- `_admin.admin.immobili.nuovo.tsx` + `_admin.admin.immobili.$id.tsx`: aggiungere sezione "Versione inglese (opzionale)" con input per i 4-5 campi `_en`. Nessuna validazione obbligatoria.

## 6. Fuori scope (per sicurezza)
- Nessuna modifica a URL/rotte (no `/en/...`).
- Nessun `hreflang` (richiederebbe URL distinti).
- Nessuna modifica a prezzi, filtri logici, query, immagini, dati.
- Nessun cambio grafico.

## File toccati (stima)
~15 file frontend modificati + 3 nuovi file i18n + 1 migrazione DB + 2 file admin.

## Verifica finale
- Switch IT/EN aggiorna tutti i testi e persiste su reload.
- Form lead invia correttamente (source_page invariato).
- Ricerca/filtri immobili funzionano in entrambe le lingue.
- Immobili senza `_en` mostrano testo italiano.
- Admin salva i nuovi campi opzionali senza rompere quelli esistenti.
